// Configuración y pool de conexiones a PostgreSQL
// Usamos un "Pool" en lugar de un "Client" individual.
// Porque un Pool mantiene varias conexiones abiertas y las reutiliza, lo que es mucho
// más eficiente que abrir y cerrar una conexión en cada petición HTTP.

const { Pool } = require('pg');

const pool = new Pool({
    host: process.env.PGHOST || 'localhost',
    port: process.env.PGPORT || 5432,
    database: process.env.PGDATABASE || 'cs2_wiki_db',
    user: process.env.PGUSER || 'postgres',
    password: process.env.PGPASSWORD || 'postgres',
});

// Verificación de conexión al iniciar.
// Porque si no hay BD disponible, el servidor no seguira corriendo
pool.connect((err, client, release) => {
    if (err) {
        console.error('Error conectando a PostgreSQL:', err.message);
        process.exit(1); // Detiene el servidor si la BD no está disponible
    }
    console.log('Conexión a PostgreSQL establecida correctamente.');
    release(); // Devuelve el cliente al pool
});

module.exports = pool;