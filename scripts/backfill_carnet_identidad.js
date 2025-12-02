/*
  Script para backfill de `carnet_identidad` en la tabla usuarios.
  - Genera valores aleatorios de 11 dígitos numéricos.
  - Evita colisiones consultando la DB antes de insertar.
  - Está pensado para ejecutarse después de aplicar la migración que añade la columna
    (la migración permite NULL temporalmente).

  Uso:
    node scripts/backfill_carnet_identidad.js

  Requisitos:
  - Este repo ya tiene `helpers/database.js` que exporta la instancia de Sequelize.
  - Ejecutar con el mismo entorno/variables que tu server (DB connection config).
*/

const sequelize = require('../helpers/database');
const { QueryTypes } = require('sequelize');

function randomCarnet() {
  let s = '';
  for (let i = 0; i < 11; i++) s += Math.floor(Math.random() * 10).toString();
  return s;
}

async function generateUniqueCarnet(existingSet) {
  let attempt = 0;
  while (attempt < 1000) {
    const c = randomCarnet();
    if (!existingSet.has(c)) {
      existingSet.add(c);
      return c;
    }
    attempt++;
  }
  throw new Error('No se pudo generar un carnet único después de 1000 intentos');
}

async function backfill() {
  try {
    await sequelize.authenticate();
    console.log('Conexión con la DB OK');

    // Cargar todos los carnet existentes para evitar colisiones
    const existing = await sequelize.query(
      "SELECT carnet_identidad FROM usuarios WHERE carnet_identidad IS NOT NULL",
      { type: QueryTypes.SELECT }
    );
    const existingSet = new Set(existing.map(r => r.carnet_identidad));

    // Seleccionar usuarios sin carnet
    const users = await sequelize.query(
      "SELECT id_usuario FROM usuarios WHERE carnet_identidad IS NULL OR carnet_identidad = ''",
      { type: QueryTypes.SELECT }
    );

    console.log(`Usuarios a rellenar: ${users.length}`);

    for (const u of users) {
      const newCarnet = await generateUniqueCarnet(existingSet);
      await sequelize.query(
        "UPDATE usuarios SET carnet_identidad = :carnet WHERE id_usuario = :id",
        {
          replacements: { carnet: newCarnet, id: u.id_usuario },
          type: QueryTypes.UPDATE
        }
      );
      console.log(`Usuario ${u.id_usuario} -> ${newCarnet}`);
    }

    console.log('Backfill completado');
    process.exit(0);
  } catch (err) {
    console.error('Error en backfill:', err);
    process.exit(1);
  }
}

backfill();
