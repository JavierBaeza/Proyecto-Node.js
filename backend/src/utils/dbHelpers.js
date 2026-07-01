// Helper: maneja códigos de error específicos de PostgreSQL.
const manejarErrorPg = (error, next) => {
    if (error.code === '23505') {
        const err = new Error('Ya existe un registro con ese nombre.');
        err.status = 400;
        return next(err);
    }
    if (error.code === '23503') {
        // FK inválida
        const err = new Error('La referencia (categoría, subcategoría, arma, etc.) no existe o tiene dependencias activas.');
        err.status = 400;
        return next(err);
    }
    if (error.code === '23514') {
        // Violación de CHECK constraint (bando, rareza, precio negativo, etc.)
        const err = new Error('Valor inválido para un campo restringido (bando, rareza, precio, etc.).');
        err.status = 400;
        return next(err);
    }
    next(error);
};

// Helper: valida que el parámetro :id de la URL sea un entero válido.
const validarIdParam = (id, next) => {
    if (isNaN(id) || !Number.isInteger(Number(id)) || Number(id) <= 0) {
        const err = new Error('El parámetro id debe ser un entero positivo.');
        err.status = 400;
        next(err);
        return false;
    }
    return true;
};

module.exports = {
    manejarErrorPg,
    validarIdParam
};
