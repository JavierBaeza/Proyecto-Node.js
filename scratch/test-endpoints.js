const app = require('../src/app');
const db = require('../src/config/db');

const PORT = 3001;
let server;

function assert(condition, message) {
    if (!condition) {
        throw new Error(`Assertion failed: ${message}`);
    }
}

async function runTests() {
    console.log('Iniciando Pruebas de Integración...');

    // Iniciar servidor en el puerto 3001 para pruebas
    server = app.listen(PORT, async () => {
        console.log(`Servidor de prueba corriendo en puerto ${PORT}`);
        try {
            const baseUrl = `http://localhost:${PORT}/api`;

            // 1. Probar GET /categorias
            console.log('\n--- Test 1: GET /categorias ---');
            const resGetCats = await fetch(`${baseUrl}/categorias`);
            assert(resGetCats.status === 200, `Status expected 200, got ${resGetCats.status}`);
            const cats = await resGetCats.json();
            console.log('Categorías obtenidas:', cats);
            assert(cats.length >= 3, 'Se esperaban al menos 3 categorías por defecto');
            const riflesCat = cats.find(c => c.nombre === 'Rifles');
            assert(riflesCat.cantidad_armas === 2, `Se esperaban 2 armas en Rifles, se obtuvo: ${riflesCat.cantidad_armas}`);

            // 2. Probar POST /categorias (Crear categoría)
            console.log('\n--- Test 2: POST /categorias ---');
            const newCat = {
                nombre: 'Granadas Especiales',
                descripcion: 'Granadas tácticas avanzadas.'
            };
            const resPostCat = await fetch(`${baseUrl}/categorias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newCat)
            });
            assert(resPostCat.status === 201, `Status expected 201, got ${resPostCat.status}`);
            const createdCat = await resPostCat.json();
            console.log('Categoría creada:', createdCat);
            assert(createdCat.id !== undefined, 'Falta ID de categoría creada');
            assert(createdCat.nombre === newCat.nombre, 'Nombre no coincide');

            // 3. Probar PUT /categorias/:id (Actualizar categoría)
            console.log('\n--- Test 3: PUT /categorias/:id ---');
            const updatedCat = {
                nombre: 'Granadas Tácticas',
                descripcion: 'Granadas tácticas de Counter-Strike 2.'
            };
            const resPutCat = await fetch(`${baseUrl}/categorias/${createdCat.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedCat)
            });
            assert(resPutCat.status === 200, `Status expected 200, got ${resPutCat.status}`);
            const replacedCat = await resPutCat.json();
            console.log('Categoría reemplazada:', replacedCat);
            assert(replacedCat.nombre === updatedCat.nombre, 'Nombre no se actualizó');
            assert(replacedCat.descripcion === updatedCat.descripcion, 'Descripción no se actualizó');

            // 4. Probar PATCH /categorias/:id/descripcion (Actualizar descripción)
            console.log('\n--- Test 4: PATCH /categorias/:id/descripcion ---');
            const patchDesc = { descripcion: 'Nueva descripción parcial.' };
            const resPatchCat = await fetch(`${baseUrl}/categorias/${createdCat.id}/descripcion`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(patchDesc)
            });
            assert(resPatchCat.status === 200, `Status expected 200, got ${resPatchCat.status}`);
            const patchedCat = await resPatchCat.json();
            console.log('Categoría parcheada:', patchedCat);
            assert(patchedCat.descripcion === patchDesc.descripcion, 'Descripción no se parcheó');

            // 5. Probar POST /subcategorias (Crear subcategoría)
            console.log('\n--- Test 5: POST /subcategorias ---');
            const newSubcat = {
                id_categoria: 2, // Pistolas
                nombre: 'Pistolas Automáticas',
                descripcion: 'Pistolas con disparo automático.'
            };
            const resPostSubcat = await fetch(`${baseUrl}/subcategorias`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newSubcat)
            });
            assert(resPostSubcat.status === 201, `Status expected 201, got ${resPostSubcat.status}`);
            const createdSubcat = await resPostSubcat.json();
            console.log('Subcategoría creada:', createdSubcat);
            assert(createdSubcat.id !== undefined, 'Falta ID de subcategoría');

            // 6. Probar POST /armas (Crear arma bajo subcategoría y categoría)
            console.log('\n--- Test 6: POST /armas ---');
            const newArma = {
                id_categoria: 2, // Pistolas
                id_subcategoria: createdSubcat.id,
                nombre: 'CZ75-Auto',
                bando: 'AM',
                precio: 500,
                dano_base: 33,
                balas_cargador: 12
            };
            const resPostArma = await fetch(`${baseUrl}/armas`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newArma)
            });
            assert(resPostArma.status === 201, `Status expected 201, got ${resPostArma.status}`);
            const createdArma = await resPostArma.json();
            console.log('Arma creada:', createdArma);
            assert(createdArma.id_subcategoria === createdSubcat.id, 'id_subcategoria no coincide');

            // 7. Probar GET /subcategorias/armas
            console.log('\n--- Test 7: GET /subcategorias/armas ---');
            const resGetSubcats = await fetch(`${baseUrl}/subcategorias/armas`);
            assert(resGetSubcats.status === 200, `Status expected 200, got ${resGetSubcats.status}`);
            const subcats = await resGetSubcats.json();
            console.log('Subcategorías con armas:', JSON.stringify(subcats, null, 2));
            const testSub = subcats.find(s => s.id === createdSubcat.id);
            assert(testSub !== undefined, 'No se encontró la subcategoría creada');
            assert(testSub.armas.length === 1, 'Se esperaba 1 arma asociada');
            assert(testSub.armas[0].nombre === 'CZ75-Auto', 'Nombre del arma no coincide');

            // 8. Probar POST /armas/:id/skins (Crear skin)
            console.log('\n--- Test 8: POST /armas/:id/skins ---');
            const resPostSkin = await fetch(`${baseUrl}/armas/${createdArma.id}/skins`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre_skin: 'Victoria', rareza: 'Classified' })
            });
            assert(resPostSkin.status === 201, `Status expected 201, got ${resPostSkin.status}`);
            const createdSkin = await resPostSkin.status === 201 ? await resPostSkin.json() : null;
            console.log('Skin creada:', createdSkin);
            assert(createdSkin.id !== undefined, 'Falta ID de skin');

            // 9. Probar PUT /skins/:id (Actualizar campos de skin)
            console.log('\n--- Test 9: PUT /skins/:id ---');
            const resPutSkin = await fetch(`${baseUrl}/skins/${createdSkin.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ nombre_skin: 'Victoria Dorada', rareza: 'Covert' })
            });
            assert(resPutSkin.status === 200, `Status expected 200, got ${resPutSkin.status}`);
            const replacedSkin = await resPutSkin.json();
            console.log('Skin reemplazada:', replacedSkin);
            assert(replacedSkin.nombre_skin === 'Victoria Dorada', 'Nombre no coincide');
            assert(replacedSkin.rareza === 'Covert', 'Rareza no coincide');

            // 10. Probar PATCH /skins/:id/rareza (Actualizar rareza)
            console.log('\n--- Test 10: PATCH /skins/:id/rareza ---');
            const resPatchSkin = await fetch(`${baseUrl}/skins/${createdSkin.id}/rareza`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ rareza: 'Classified' })
            });
            assert(resPatchSkin.status === 200, `Status expected 200, got ${resPatchSkin.status}`);
            const patchedSkin = await resPatchSkin.json();
            console.log('Skin rareza parcheada:', patchedSkin);
            assert(patchedSkin.rareza === 'Classified', 'Rareza no coincide');

            // 11. Probar DELETE /skins/:id
            console.log('\n--- Test 11: DELETE /skins/:id ---');
            const resDelSkin = await fetch(`${baseUrl}/skins/${createdSkin.id}`, { method: 'DELETE' });
            assert(resDelSkin.status === 200, `Status expected 200, got ${resDelSkin.status}`);
            console.log('Skin eliminada con éxito');

            // 12. Probar DELETE /subcategorias/:id (armas asociadas pasan a NULL)
            console.log('\n--- Test 12: DELETE /subcategorias/:id ---');
            const resDelSub = await fetch(`${baseUrl}/subcategorias/${createdSubcat.id}`, { method: 'DELETE' });
            assert(resDelSub.status === 200, `Status expected 200, got ${resDelSub.status}`);
            console.log('Subcategoría eliminada con éxito');

            // Verificar que el arma CZ75-Auto ahora tiene id_subcategoria = null
            const resGetArma = await fetch(`${baseUrl}/armas/${createdArma.id}`);
            const armaInfo = await resGetArma.json();
            console.log('Información del arma CZ75-Auto post-eliminación subcategoría:', armaInfo);
            assert(armaInfo.id_subcategoria === null, 'id_subcategoria debería ser null');

            // 13. Limpieza: eliminar arma temporal y categorías creadas
            console.log('\n--- Test 13: Limpieza ---');
            await fetch(`${baseUrl}/armas/${createdArma.id}`, { method: 'DELETE' });
            await fetch(`${baseUrl}/categorias/${createdCat.id}`, { method: 'DELETE' });
            console.log('Limpieza completada correctamente.');

            console.log('\n========================================');
            console.log('¡TODAS LAS PRUEBAS PASARON CORRECTAMENTE!');
            console.log('========================================');
            cleanupAndExit(0);

        } catch (error) {
            console.error('\n========================================');
            console.error('¡ERROR EN LAS PRUEBAS DE INTEGRACIÓN!', error);
            console.error('========================================');
            cleanupAndExit(1);
        }
    });
}

function cleanupAndExit(code) {
    if (server) {
        server.close(() => {
            console.log('Servidor de prueba cerrado.');
            db.end().then(() => {
                console.log('Pool de conexiones de base de datos cerrado.');
                process.exit(code);
            });
        });
    } else {
        process.exit(code);
    }
}

runTests();
