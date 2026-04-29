// Punto de entrada de la aplicación

require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globales
app.use(express.json()); // Parsea bodies JSON en todas las rutas

// Rutas
const armasRouter = require('./routes/armas');
app.use('/api', armasRouter);

// Por acá tenemos un manejador global de errores que debe ir SIEMPRE al final, después de las rutas.
// En Express, un middleware con 4 parámetros (err, req, res, next) se convierte
// automáticamente en un manejador de errores. Cualquier next(error) que se llame
// en los controladores llega aquí sin pasar por ninguna otra ruta.
app.use((err, req, res, next) => {
    // Si el error tiene un status definido (es decir, nosotros se lo definimos antes), lo usamos.
    // Si no, es un error inesperado → 500.
    const statusCode = err.status || 500;
    const mensaje = err.message || 'Error interno del servidor.';

    // Igual se podría llegar a loggear el error en un sistema externo (ej. Sentry).
    if (statusCode === 500) {
        console.error('Error no controlado:', err);
    }

    res.status(statusCode).json({
        error: mensaje,
        status: statusCode
    });
});

// Arranque del servidor
app.listen(PORT, () => {
    console.log(`CS2 Wiki API corriendo en http://localhost:${PORT}`);
    console.log(`Endpoints disponibles bajo: http://localhost:${PORT}/api`);
});

module.exports = app;