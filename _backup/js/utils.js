const axios = require('axios');
const { getRooms } = require('./sql');
const fs = require('fs');
const path = require('path');
let roomsData = null;

function toDate(dt) {
    const year = dt.substring(0, 4);
    const month = dt.substring(4, 6) - 1;
    const day = dt.substring(6, 8);
    const hour = dt.substring(9, 11);
    const minute = dt.substring(11, 13);
    const second = dt.substring(13, 15);
    const eventDate = new Date(Date.UTC(year, month, day, hour, minute, second));
    return eventDate;
}

function getClassCourses(url, date) {
    let today = new Date(date);
    return axios.get(url)
        .then(response => {
            const data = response.data;

            const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
            const events = [];
            let match;

            while ((match = eventRegex.exec(data)) !== null) {
                const eventBlock = match[1];

                const dtstartMatch = eventBlock.match(/DTSTART(;VALUE=DATE)?:([^\r\n]*)/);
                const dtendMatch = eventBlock.match(/DTEND(;VALUE=DATE)?:([^\r\n]*)/);
                const summaryMatch = eventBlock.match(/SUMMARY;LANGUAGE=fr:([^\r\n]*)/);
                const locationMatch = eventBlock.match(/LOCATION;LANGUAGE=fr:([^\r\n]*)/);
                const descriptionMatch = eventBlock.match(/DESCRIPTION;LANGUAGE=fr:([^\r\n]*)/);

                const dtstart = dtstartMatch ? dtstartMatch[2].trim() : null;
                const dtend = dtendMatch ? dtendMatch[2].trim() : null;
                const summary = summaryMatch ? summaryMatch[1].trim() : null;
                const location = locationMatch ? locationMatch[1].trim() : 'Non spécifié';
                const description = descriptionMatch ? descriptionMatch[1].trim() : 'Non spécifié';

                if (dtstart && dtend && summary) {
                    const event = {
                        dtstart,
                        dtend,
                        summary,
                        location,
                        description
                    };

                    events.push(event);
                } else {
                    console.warn('Un événement n\'a pas pu être extrait correctement:', eventBlock);
                }
            }

            today.setHours(0, 0, 0, 0);

            const todayEvents = events.filter(event => {
                const year = event.dtstart.substring(0, 4);
                const month = event.dtstart.substring(4, 6) - 1;
                const day = event.dtstart.substring(6, 8);
                const hour = event.dtstart.substring(9, 11);
                const minute = event.dtstart.substring(11, 13);
                const second = event.dtstart.substring(13, 15);
                const eventDate = new Date(Date.UTC(year, month, day, hour, minute, second));

                return eventDate.getDate() == today.getDate() && eventDate.getMonth() == today.getMonth() && eventDate.getFullYear() == today.getFullYear();
            });

            return todayEvents;
        })
        .catch(error => {
            // console.log(url);
            // console.error('Erreur lors de la récupération des données:', error);
        });
}

function isClassFree(courses, now) {
    let nextCourse = null;
    let nextCourseDiff = null;
    if (courses.length === 0) { return { free: true, nextCourse: nextCourse }; }

    for (const course of courses) {
        if (!course || !course.dtstart || !course.dtend) {
            console.warn('Invalid course data:', course);
            continue;
        }

        const courseStart = toDate(course.dtstart);
        const courseEnd = toDate(course.dtend);

        if (courseStart < now && courseEnd > now) {
            return { free: false, courses: courses };

        } else if (nextCourse != null) {

            if (courseStart > now) {
                const diff = courseStart - toDate(nextCourse.dtstart);

                if (diff < nextCourseDiff) {
                    nextCourseDiff = diff;
                    nextCourse = course;
                }
            }

        } else if (nextCourse == null) {
            
            if (courseStart > now) {
                nextCourseDiff = courseStart - now;
                nextCourse = course;
            }
        }
    }
    
    return { free: true, nextCourse: nextCourse };
}



async function useGetRooms(univ) {
    if(!univ) {
        console.error('Error: univ not defined');
        return;
    }
    try {
        roomsData = await getRooms(univ);
    } catch (error) {
        roomsData = JSON.parse(fs.readFileSync(path.join(__dirname, 'rooms.json'), 'utf8'));
        console.error('Error lors de la récupération des rooms dans la db:', error.message);
    }
}

async function getFreeRooms(queryDate, queryHeure, univ) {
    await useGetRooms(univ);
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
    const promises = roomsData.map(async (room) => {
        if (room.room_url == undefined) {
            console.log(room);
            console.error('Error: URL not defined for room:', room);
            return;
        }
        try {
            const courses = await getClassCourses(room.room_url, date);
            const classStatus = isClassFree(courses, date);
            if (classStatus.free) {
                freeRooms[room.room_name] = classStatus;
            } else {
                usedRooms[room.room_name] = classStatus;
                usedRooms[room.room_name].willBeFree = whenWillItBeFree(usedRooms[room.room_name].courses);
            }
        } catch (error) {
            // console.error('Error:', error.message);
            invalidRooms[room.room_name] = room.room_url;
        }
    });

    await Promise.all(promises);
    return { freeRooms, usedRooms, invalidRooms };
}

function whenWillItBeFree(courses) {
    let willBeFree = null;
    if( courses.length == 0) {
        console.warn('Invalid usedCourse data:', course);
        return;
    }
    
    for (const course of courses) {
        if (!course || !course.dtstart || !course.dtend) {
            console.warn('Invalid course data:', course);
            continue;
        }

        const courseStart = toDate(course.dtstart);
        const courseEnd = toDate(course.dtend);
        if(courseEnd == null || courseEnd > willBeFree) willBeFree = courseEnd;
    }
    return willBeFree;
}

module.exports = {
    toDate,
    getClassCourses,
    isClassFree,
    getFreeRooms
};