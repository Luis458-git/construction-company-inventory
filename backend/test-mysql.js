const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const mysql = require('mysql2/promise');

async function testConnection() {
  console.log('🔍 Probando conexión a MySQL con las variables de .env...\n');

  const config = {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
  };

  console.log('📋 Parámetros detectados:');
  console.log(`   - Host: ${config.host}`);
  console.log(`   - Port: ${config.port}`);
  console.log(`   - User: ${config.user}`);
  console.log(`   - Password: ${config.password ? '******' : '(vacía)'}`);
  console.log(`   - Database: ${process.env.DB_NAME || 'inventario_constructora'}\n`);

  try {
    // 1. Probar conexión básica al servidor MySQL
    console.log('⏳ Intentando conectar con el servidor MySQL...');
    const connection = await mysql.createConnection(config);
    console.log('✅ Conexión al servidor MySQL EXITOSA.\n');

    // 2. Verificar o crear la base de datos
    const dbName = process.env.DB_NAME || 'inventario_constructora';
    console.log(`⏳ Verificando si existe la base de datos "${dbName}"...`);
    const [dbs] = await connection.query(`SHOW DATABASES LIKE '${dbName}'`);

    if (dbs.length === 0) {
      console.log(`⚠️ La base de datos "${dbName}" no existe.`);
      console.log(`⏳ Creando base de datos "${dbName}"...`);
      await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
      console.log(`✅ Base de datos "${dbName}" creada exitosamente.\n`);
    } else {
      console.log(`✅ La base de datos "${dbName}" existe.\n`);
    }

    // 3. Conectar a la base de datos específica
    await connection.changeUser({ database: dbName });
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 Tablas encontradas en "${dbName}": ${tables.length}`);
    tables.forEach(t => console.log(`   - ${Object.values(t)[0]}`));

    await connection.end();
    console.log('\n🎉 ¡Todo funciona correctamente con MySQL!');
  } catch (err) {
    console.error('\n❌ Error al conectar a MySQL:');
    if (err.code === 'ECONNREFUSED') {
      console.error('👉 El servidor MySQL NO está corriendo en ese puerto (3306).');
      console.error('   Si usas XAMPP o WAMP, abre el panel de control y presiona "Start" en MySQL.');
    } else if (err.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error('👉 Usuario o contraseña incorrectos en el archivo .env.');
    } else {
      console.error(`👉 Detalle del error: [${err.code}] ${err.message}`);
    }
    process.exit(1);
  }
}

testConnection();

