const { Client } = require('pg');
const bcrypt = require('bcrypt');
const dotenv = require('dotenv');
dotenv.config();

const createClient = () => {
    return new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
};

const connectToDatabase = () => {
    const client = createClient();
    client.connect(err => {
        if (err) {
            console.error('connection error', err.stack);
            setTimeout(connectToDatabase, 5000);
        } else {
            console.log('connected');
        }
    });

    client.on('error', err => {
        console.error('Unexpected error on idle client', err);
        client.end();
        connectToDatabase();
    });

    return client;
};

async function getVisites() {
    const client = await connectToDatabase();
    let visitesMap = [];
    try {
        const res1 = await client.query('SELECT * FROM visites');
        const res2 = await client.query('SELECT * FROM visitesparutilisateur');        
        let visitesParUtilisateurMap = {};
        let visites = {};

        res1.rows.forEach(row => {
            const visites_jour = new Date(row.visites_jour).toISOString().split('T')[0];
            visitesParUtilisateurMap[visites_jour] = row.visites;
        });
        res2.rows.forEach(row => {
            const visites_jour = new Date(row.visites_jour).toISOString().split('T')[0];
            visites[visites_jour] = row.visites;
        });
        
        visitesMap.push(visitesParUtilisateurMap);
        visitesMap.push(visites);

    } catch (err) {
        console.error('Erreur lors de la récupération des visites', err);
        throw err;
    } finally {
        await client.end();
    }
        
    return visitesMap;
}

async function incrementVisites2(jour) {    
    const client = await connectToDatabase();
    try {
        const res = await client.query('UPDATE visites SET visites = visites + 1 WHERE visites_jour = $1 RETURNING *', [jour]);
        if (res.rowCount === 0) {
            await client.query('INSERT INTO visites (visites_jour, visites) VALUES ($1, 1)', [jour]);
        }
    } catch (err) {
        console.error('Erreur lors de l\'incrémentation des visites', err);
        throw err;
    } finally {
        await client.end();
    }
}

async function incrementVisites(jour) {
    const client = await connectToDatabase();
    try {
        const res2 = await client.query('UPDATE visitesparutilisateur SET visites = visites + 1 WHERE visites_jour = $1 RETURNING *', [jour]);
        if (res2.rowCount === 0) {
            await client.query('INSERT INTO visitesparutilisateur (visites_jour, visites) VALUES ($1, 1)', [jour]);
        }
    } catch (err) {
        console.error('Erreur lors de l\'incrémentation des visites', err);
        throw err;
    } finally {
        await client.end();
    }
}

async function checkCredentials(username, password) {
    const client = await connectToDatabase();
    try {
        const res = await client.query('SELECT * FROM users WHERE username = $1', [username]);
        if (res.rows.length > 0) {
            const user = res.rows[0];
            const match = await bcrypt.compare(password, user.password);
            return match;
        } else {
            return false;
        }
    } catch (err) {
        console.error('Erreur lors de la vérification des identifiants', err);
        throw err;
    } finally {
        await client.end();
    }
}

async function createUser(username, password) {
    const client = await connectToDatabase();
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        await client.query('INSERT INTO users (username, password) VALUES ($1, $2)', [username, hashedPassword]);
    } catch (err) {
        console.error('Erreur lors de la création de l\'utilisateur', err);
        throw err;
    } finally {
        await client.end();
    }
}

async function getRooms(univ) {
    const client = await connectToDatabase();
    if (!univ) {
        try {
            const res = await client.query('SELECT univ, room_name, room_url FROM rooms');
            return res.rows;
        } catch (err) {
            console.error('Erreur lors de la récupération des salles', err);
            throw err;
        } finally {
            await client.end();
        }
    }
    dbUnivs = (await getUniv()).map(u => u.univ);
    if (!dbUnivs.includes(univ)) {
        console.log('univ: ', univ);
        console.log('dbUnivs: ', dbUnivs);
        console.error('Erreur: université non trouvée');
        throw new Error('université non trouvée');
    }
    try {
        const res = await client.query('SELECT univ, room_name, room_url FROM rooms WHERE univ = $1', [univ]);
        return res.rows;
    } catch (err) {
        console.error('Erreur lors de la récupération des salles', err);
        throw err;
    } finally {
        await client.end();
    }
}

async function getUniv() {
    const client = await connectToDatabase();
    try {
        const res = await client.query('SELECT DISTINCT univ FROM rooms;');
        return res.rows;
    } catch (err) {
        console.error('Erreur lors de la récupération des universités', err);
        throw err;
    } finally {
        await client.end();
    }
}

module.exports = {
    getVisites,
    incrementVisites,
    incrementVisites2,
    createUser,
    checkCredentials,
    getRooms,
    getUniv
};