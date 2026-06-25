// Validaciones centralizadas
// Un middleware en Express es una función que actúa como intermediario en el ciclo de solicitud-respuesta (req, res, next).
// Si los datos son válidos llama a next() para continuar al controlador.
// Si no, corta la cadena respondiendo con 400 directamente.
// IMPORTANTE: después de validar, persistimos los valores limpios en req.body
// (ej: nombre.trim()) para que el controlador reciba datos ya depurados o limpios.


const RAREZAS_VALIDAS = [
    'Consumer', 'Industrial', 'Mil-Spec',
    'Restricted', 'Classified', 'Covert', 'Contraband'
];

const BANDOS_VALIDOS = ['CT', 'T', 'AM'];

// validarArma — POST /armas y PUT /armas/:id
const validarArma = (req, res, next) => {
    const { id_categoria, id_subcategoria, nombre, bando, precio, dano_base, balas_cargador } = req.body;

    const errores = [];

    if (!id_categoria || isNaN(id_categoria))
        errores.push('id_categoria es obligatorio y debe ser un número.');

    if (id_subcategoria !== undefined && id_subcategoria !== null && (isNaN(id_subcategoria) || Number(id_subcategoria) <= 0)) {
        errores.push('id_subcategoria debe ser un número entero positivo o null.');
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '')
        errores.push('nombre es obligatorio y debe ser texto.');

    if (!bando || !BANDOS_VALIDOS.includes(bando))
        errores.push(`bando es obligatorio. Valores permitidos: ${BANDOS_VALIDOS.join(', ')}.`);

    if (precio == null || isNaN(precio) || Number(precio) < 0)
        errores.push('precio es obligatorio y debe ser un número >= 0.');

    if (!dano_base || isNaN(dano_base) || Number(dano_base) <= 0)
        errores.push('dano_base es obligatorio y debe ser un entero > 0.');

    if (!balas_cargador || isNaN(balas_cargador) || Number(balas_cargador) <= 0)
        errores.push('balas_cargador es obligatorio y debe ser un entero > 0.');

    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    // Persistimos valores limpios en req.body para que el controlador
    // reciba datos ya depurados o limpios sin espacios innecesarios.
    req.body.nombre = nombre.trim();
    if (id_subcategoria !== undefined) {
        req.body.id_subcategoria = id_subcategoria === null ? null : Number(id_subcategoria);
    }

    next();
};

// validarSkin — POST /armas/:id/skins y PUT /skins/:id
const validarSkin = (req, res, next) => {
    const { nombre_skin, rareza } = req.body;

    const errores = [];

    if (!nombre_skin || typeof nombre_skin !== 'string' || nombre_skin.trim() === '')
        errores.push('nombre_skin es obligatorio y debe ser texto.');

    if (!rareza || !RAREZAS_VALIDAS.includes(rareza))
        errores.push(`rareza es obligatoria. Valores permitidos: ${RAREZAS_VALIDAS.join(', ')}.`);

    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    // Persistimos el nombre limpio
    req.body.nombre_skin = nombre_skin.trim();

    next();
};

// validarPrecio — PATCH /armas/:id/precio
const validarPrecio = (req, res, next) => {
    const { precio } = req.body;

    if (precio == null || isNaN(precio) || Number(precio) < 0) {
        return res.status(400).json({
            errores: ['precio es obligatorio y debe ser un número >= 0.']
        });
    }

    next();
};

// validarCargador — PATCH /armas/:id/cargador
const validarCargador = (req, res, next) => {
    const { balas_cargador } = req.body;

    if (!balas_cargador || isNaN(balas_cargador) || Number(balas_cargador) <= 0) {
        return res.status(400).json({
            errores: ['balas_cargador es obligatorio y debe ser un entero > 0.']
        });
    }

    next();
};

// validarCategoria — PUT /categorias/:id y POST /categorias
const validarCategoria = (req, res, next) => {
    const { nombre, descripcion} = req.body;
    const errores = [];

   if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        errores.push('nombre es obligatorio y debe ser texto.');
    }
  
    // NUEVA VALIDACIÓN: Obligamos a que la envíen la descripcion y no sea vacia 
    if (!descripcion || typeof descripcion !== 'string' || descripcion.trim() === '') {
        errores.push('descripcion es obligatoria y debe ser texto.');
    }
     
      
      if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    // Persistimos el nombre y la descripción limpios
    req.body.nombre = nombre.trim();
    req.body.descripcion = descripcion.trim();

    next();
};

// validarSubcategoria — POST /subcategorias
const validarSubcategoria = (req, res, next) => {
    const { id_categoria, nombre, descripcion } = req.body;
    const errores = [];

    if (!id_categoria || isNaN(id_categoria) || Number(id_categoria) <= 0) {
        errores.push('id_categoria es obligatorio y debe ser un número entero positivo.');
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
        errores.push('nombre es obligatorio y debe ser texto.');
    }

    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    req.body.nombre = nombre.trim();
    req.body.descripcion = descripcion ? descripcion.trim() : null;

    next();
};

// validarRarezaSkin — PATCH /skins/:id/rareza
const validarRarezaSkin = (req, res, next) => {
    const { rareza } = req.body;
    const errores = [];

    if (!rareza || !RAREZAS_VALIDAS.includes(rareza)) {
        errores.push(`rareza es obligatoria. Valores permitidos: ${RAREZAS_VALIDAS.join(', ')}.`);
    }

    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    next();
};

// validarDescripcionCategoria — PATCH /categorias/:id/descripcion
const validarDescripcionCategoria = (req, res, next) => {
    const { descripcion } = req.body;
    const errores = [];

    if (descripcion === undefined || typeof descripcion !== 'string') {
        errores.push('descripcion es obligatoria y debe ser texto.');
    }

    if (errores.length > 0) {
        return res.status(400).json({ errores });
    }

    req.body.descripcion = descripcion.trim();
    next();
};


module.exports = {
    validarArma,
    validarSkin,
    validarPrecio,
    validarCargador,
    validarCategoria,
    validarSubcategoria,
    validarRarezaSkin,
    validarDescripcionCategoria
};