const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });
const mysql = require('mysql2/promise');

async function setupMySQL() {
  console.log('🚀 Iniciando configuración de Base de Datos MySQL...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true
  };

  const dbName = process.env.DB_NAME || 'inventario_constructora';

  try {
    console.log(`🔌 Conectando a MySQL (${config.host}:${config.port}, usuario: ${config.user})...`);
    const connection = await mysql.createConnection(config);
    console.log('✅ Conexión establecida con éxito.\n');

    console.log(`📦 Creando base de datos "${dbName}" si no existe...`);
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await connection.changeUser({ database: dbName });
    console.log(`✅ Base de datos "${dbName}" lista.\n`);

    const schemaPath = path.resolve(__dirname, '..', 'database', 'schema-mysql.sql');
    if (fs.existsSync(schemaPath)) {
      console.log('📄 Ejecutando schema-mysql.sql...');
      const schemaSql = fs.readFileSync(schemaPath, 'utf8');
      await connection.query(schemaSql);
      console.log('✅ Esquema creado con éxito.\n');
    }

    const seedPath = path.resolve(__dirname, '..', 'database', 'seed-mysql.sql');
    if (fs.existsSync(seedPath)) {
      console.log('🌱 Ejecutando seed-mysql.sql (poblando datos iniciales)...');
      const seedSql = fs.readFileSync(seedPath, 'utf8');
      await connection.query(seedSql);
      console.log('✅ Datos semilla insertados con éxito.\n');
    }

    const [tables] = await connection.query('SHOW TABLES');
    console.log(`🎉 Configuración completada. Tablas creadas: ${tables.length}`);
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));

    await connection.end();
  } catch (err) {
    console.error('\n❌ Error durante la configuración de MySQL:');
    if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error(`👉 Acceso denegado para el usuario "${config.user}". Revisa la contraseña en tu archivo backend/.env`);
    } else if (err.code === 'ECONNREFUSED') {
      console.error('👉 No se pudo conectar a MySQL. Asegúrate de que el servidor MySQL (XAMPP / MySQL Server) esté iniciado.');
    } else {
      console.error(`👉 Detalle: [${err.code}] ${err.message}`);
    }
    process.exit(1);
  }
}

setupMySQL();

