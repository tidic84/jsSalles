import { Client } from "pg";

const createClient = () => {
    return new Client({
        user: process.env.DB_USER,
        host: process.env.DB_HOST,
        database: process.env.DB_NAME,
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT,
    });
};

export const connectToDatabase = () => {
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

export async function getUniv() {
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

export async function getRooms(univ) {
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
    const dbUnivs = (await getUniv()).map(u => u.univ);
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