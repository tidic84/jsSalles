"use server"

import axios from 'axios';
import { getRooms } from './db.js';

// Cache pour optimiser les performances
let roomsCache = new Map();
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
const MAX_CACHE_SIZE = 1000;

// Nettoyage périodique du cache
function cleanCache() {
    const now = Date.now();
    const keysToDelete = [];
    
    for (const [key, value] of roomsCache.entries()) {
        if (now - value.timestamp > CACHE_DURATION) {
            keysToDelete.push(key);
        }
    }
    
    for (const key of keysToDelete) {
        roomsCache.delete(key);
    }
    
    // Limiter la taille du cache
    if (roomsCache.size > MAX_CACHE_SIZE) {
        const entries = Array.from(roomsCache.entries());
        entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
        const toDelete = entries.slice(0, roomsCache.size - MAX_CACHE_SIZE);
        for (const [key] of toDelete) {
            roomsCache.delete(key);
        }
    }
}

// Nettoyage automatique toutes les 10 minutes
setInterval(cleanCache, 10 * 60 * 1000);

// Pool de connexions axios avec timeout optimisé
const axiosInstance = axios.create({
    timeout: 5000, // 5 secondes maximum par requête
    maxRedirects: 3,
    headers: {
        'Accept': 'text/calendar',
        'User-Agent': 'SallesLibres/1.0'
    }
});


// Cache pour les conversions de date
const dateCache = new Map();

export async function toDate(dt) {
    if (dateCache.has(dt)) {
        return dateCache.get(dt);
    }
    
    const year = parseInt(dt.substring(0, 4));
    const month = parseInt(dt.substring(4, 6)) - 1;
    const day = parseInt(dt.substring(6, 8));
    const hour = parseInt(dt.substring(9, 11));
    const minute = parseInt(dt.substring(11, 13));
    const second = parseInt(dt.substring(13, 15));
    const eventDate = new Date(Date.UTC(year, month, day, hour, minute, second));
    
    // Limiter la taille du cache (FIFO)
    if (dateCache.size > 500) {
        const firstKey = dateCache.keys().next().value;
        dateCache.delete(firstKey);
    }
    
    dateCache.set(dt, eventDate);
    return eventDate;
}

export async function isClassFree(courses, date) {
    if (!courses || courses.length === 0) {
        return { free: true, courses: [] };
    }

    const currentTime = date.getTime();
    
    for (const course of courses) {
        const startTime = await toDate(course.dtstart);
        const endTime = await toDate(course.dtend);
        
        if (currentTime >= startTime.getTime() && currentTime <= endTime.getTime()) {
            return { free: false, courses: courses };
        }
    }
    
    return { free: true, courses: courses };
}

export async function whenWillItBeFree(courses) {
    if (!courses || courses.length === 0) {
        return "Maintenant";
    }
    
    const now = new Date();
    let nextFreeTime = null;
    
    // Conversion et tri optimisés
    const coursesWithTimes = await Promise.all(
        courses.map(async course => ({
            ...course,
            startTime: await toDate(course.dtstart),
            endTime: await toDate(course.dtend)
        }))
    );
    
    const sortedCourses = coursesWithTimes.sort((a, b) => a.startTime - b.startTime);
    
    for (const course of sortedCourses) {
        if (course.endTime > now && (!nextFreeTime || course.endTime < nextFreeTime)) {
            nextFreeTime = course.endTime;
        }
    }
    
    if (nextFreeTime) {
        return nextFreeTime.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    return "Maintenant";
}

export async function getClassCourses(url, date) {
    try {
        // Vérifier le cache d'abord
        const cacheKey = `${url}_${date.toDateString()}`;
        if (roomsCache.has(cacheKey)) {
            const cached = roomsCache.get(cacheKey);
            if (Date.now() - cached.timestamp < CACHE_DURATION) {
                return cached.data;
            }
            roomsCache.delete(cacheKey);
        }

        const response = await axiosInstance.get(url);
        const data = response.data;

        if (!data || typeof data !== 'string') {
            return [];
        }

        const events = [];
        const today = new Date(date);
        today.setHours(0, 0, 0, 0);
        
        // Parsing optimisé avec une seule regex
        const eventRegex = /BEGIN:VEVENT\s*\n((?:(?!BEGIN:VEVENT|END:VEVENT)[\s\S])*?)END:VEVENT/g;
        let match;

        while ((match = eventRegex.exec(data)) !== null) {
            const eventBlock = match[1];
            
            // Extraction rapide des champs nécessaires
            const lines = eventBlock.split('\n');
            let dtstart = null, dtend = null, summary = null;
            
            for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine.startsWith('DTSTART')) {
                    dtstart = trimmedLine.split(':')[1];
                } else if (trimmedLine.startsWith('DTEND')) {
                    dtend = trimmedLine.split(':')[1];
                } else if (trimmedLine.startsWith('SUMMARY;LANGUAGE=fr:')) {
                    summary = trimmedLine.substring('SUMMARY;LANGUAGE=fr:'.length);
                }
                
                // Arrêter dès qu'on a tout ce qu'il faut
                if (dtstart && dtend && summary) break;
            }

            if (dtstart && dtend && summary) {
                // Vérification rapide de la date avant parsing complet
                const eventDateStr = dtstart.substring(0, 8);
                const todayStr = today.getFullYear().toString() + 
                    (today.getMonth() + 1).toString().padStart(2, '0') + 
                    today.getDate().toString().padStart(2, '0');
                
                if (eventDateStr === todayStr) {
                    events.push({
                        dtstart,
                        dtend,
                        summary,
                        location: 'Non spécifié',
                        description: 'Non spécifié'
                    });
                }
            }
        }

        // Mettre en cache le résultat
        roomsCache.set(cacheKey, {
            data: events,
            timestamp: Date.now()
        });

        return events;
    } catch (error) {
        console.warn(`Erreur pour l'URL ${url}:`, error.message);
        return [];
    }
}

export async function getFreeRooms(queryDate, queryHeure, univ) {
    // Cache pour les résultats complets
    const resultCacheKey = `freeRooms_${univ}_${queryDate}_${queryHeure}`;
    if (roomsCache.has(resultCacheKey)) {
        const cached = roomsCache.get(resultCacheKey);
        if (Date.now() - cached.timestamp < CACHE_DURATION) {
            return cached.data;
        }
        roomsCache.delete(resultCacheKey);
    }

    const roomsData = await getRooms(univ);
    let date = null;
    if (!queryDate || !queryHeure) {
        date = new Date();
    } else {
        date = new Date(queryDate);
        date.setHours(queryHeure.split(':')[0], queryHeure.split(':')[1]);
    }
    
    let freeRooms = {};
    let usedRooms = {};
    let invalidRooms = {};
    
    // Traitement par lots pour éviter la surcharge
    const BATCH_SIZE = 10;
    const batches = [];
    for (let i = 0; i < roomsData.length; i += BATCH_SIZE) {
        batches.push(roomsData.slice(i, i + BATCH_SIZE));
    }
    
    for (const batch of batches) {
        const promises = batch.map(async (room) => {
            if (!room.room_url) {
                console.warn('URL non définie pour la salle:', room.room_name);
                return { room: room.room_name, status: 'invalid', url: room.room_url };
            }
            
            try {
                const courses = await getClassCourses(room.room_url, date);
                const classStatus = await isClassFree(courses, date);
                
                if (classStatus.free) {
                    return { 
                        room: room.room_name, 
                        status: 'free', 
                        data: classStatus 
                    };
                } else {
                    const willBeFree = await whenWillItBeFree(classStatus.courses);
                    return { 
                        room: room.room_name, 
                        status: 'used', 
                        data: { ...classStatus, willBeFree } 
                    };
                }
            } catch (error) {
                console.warn(`Erreur pour la salle ${room.room_name}:`, error.message);
                return { room: room.room_name, status: 'invalid', url: room.room_url };
            }
        });
        
        const results = await Promise.all(promises);
        
        // Traiter les résultats
        for (const result of results) {
            if (result.status === 'free') {
                freeRooms[result.room] = result.data;
            } else if (result.status === 'used') {
                usedRooms[result.room] = result.data;
            } else if (result.status === 'invalid') {
                invalidRooms[result.room] = result.url;
            }
        }
    }
    
    const finalResult = { freeRooms, usedRooms, invalidRooms };
    
    // Mettre en cache le résultat final
    roomsCache.set(resultCacheKey, {
        data: finalResult,
        timestamp: Date.now()
    });
    
    return finalResult;
}

// Fonction pour précharger les données en arrière-plan
export async function preloadRoomsData(univ) {
    try {
        const now = new Date();
        const today = now.toISOString().split('T')[0];
        const currentHour = now.getHours().toString().padStart(2, '0') + ':' + 
                           now.getMinutes().toString().padStart(2, '0');
        
        // Précharger pour l'heure actuelle
        getFreeRooms(today, currentHour, univ);
        
        // Précharger pour les 2 prochaines heures
        for (let i = 1; i <= 2; i++) {
            const futureTime = new Date(now.getTime() + i * 60 * 60 * 1000);
            const futureHour = futureTime.getHours().toString().padStart(2, '0') + ':' + 
                              futureTime.getMinutes().toString().padStart(2, '0');
            setTimeout(() => {
                getFreeRooms(today, futureHour, univ);
            }, i * 1000); // Décaler de quelques secondes
        }
    } catch (error) {
        console.warn('Erreur lors du préchargement:', error.message);
    }
}