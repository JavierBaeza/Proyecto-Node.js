-- Script de inicialización automática de la base de datos.
-- Docker ejecuta este archivo al crear el contenedor de PostgreSQL por
-- primera vez, gracias al volumen montado en /docker-entrypoint-initdb.d/

-- Creación de tablas
CREATE TABLE IF NOT EXISTS categorias (
    id          SERIAL          PRIMARY KEY,
    nombre      VARCHAR(50)     NOT NULL UNIQUE,
    descripcion TEXT
);


CREATE TABLE IF NOT EXISTS armas (
    id              SERIAL          PRIMARY KEY,
    id_categoria    INTEGER         NOT NULL,
    nombre          VARCHAR(100)    NOT NULL UNIQUE,
    bando           VARCHAR(2)      NOT NULL,
    precio          NUMERIC(8,2)    NOT NULL,
    dano_base       SMALLINT        NOT NULL,
    balas_cargador  SMALLINT        NOT NULL,

    CONSTRAINT fk_arma_categoria
        FOREIGN KEY (id_categoria)
        REFERENCES categorias(id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_bando
        CHECK (bando IN ('CT', 'T', 'AM')),

    CONSTRAINT chk_precio_positivo
        CHECK (precio >= 0),

    CONSTRAINT chk_dano_positivo
        CHECK (dano_base > 0),

    CONSTRAINT chk_balas_positivo
        CHECK (balas_cargador > 0)
);


CREATE TABLE IF NOT EXISTS skins (
    id          SERIAL          PRIMARY KEY,
    id_arma     INTEGER         NOT NULL,
    nombre_skin VARCHAR(150)    NOT NULL,
    rareza      VARCHAR(20)     NOT NULL,

    CONSTRAINT uq_skin_por_arma
        UNIQUE (id_arma, nombre_skin),

    CONSTRAINT fk_skin_arma
        FOREIGN KEY (id_arma)
        REFERENCES armas(id)
        ON DELETE CASCADE,

    CONSTRAINT chk_rareza
        CHECK (rareza IN (
            'Consumer', 'Industrial', 'Mil-Spec',
            'Restricted', 'Classified', 'Covert', 'Contraband'
        ))
);

-- Datos de semilla

INSERT INTO categorias (nombre, descripcion) VALUES
    ('Rifles',     'Rifles de asalto y francotiradoras. Alta potencia a media-larga distancia.'),
    ('Pistolas',   'Armas secundarias. Útiles en eco-rounds o como backup.'),
    ('Subfusiles', 'SMGs económicas con alta cadencia. Ideales en pistol rounds o force buys.')
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO armas (id_categoria, nombre, bando, precio, dano_base, balas_cargador) VALUES
    ((SELECT id FROM categorias WHERE nombre = 'Rifles'),    'AK-47',   'T',  2700.00, 36, 30),
    ((SELECT id FROM categorias WHERE nombre = 'Rifles'),    'M4A4',    'CT', 3100.00, 33, 30),
    ((SELECT id FROM categorias WHERE nombre = 'Pistolas'),  'Glock-18','T',   200.00, 28, 20)
ON CONFLICT (nombre) DO NOTHING;

INSERT INTO skins (id_arma, nombre_skin, rareza) VALUES
    ((SELECT id FROM armas WHERE nombre = 'AK-47'),    'Asiimov',         'Covert'),
    ((SELECT id FROM armas WHERE nombre = 'AK-47'),    'Redline',         'Classified'),
    ((SELECT id FROM armas WHERE nombre = 'Glock-18'), 'Water Elemental', 'Restricted')
ON CONFLICT (id_arma, nombre_skin) DO NOTHING;