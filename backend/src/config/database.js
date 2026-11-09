const path = require('path');
const fs = require('fs');
const { DatabaseSync } = require('node:sqlite');
require('dotenv').config({ path: path.resolve(__dirname, '..', '..', '.env') });

const DB_FILE = process.env.DB_FILE || path.join(__dirname, '..', '..', 'database', 'inventario.sqlite');
const isMemory = DB_FILE === ':memory:';

if (!isMemory) {
  const dbDir = path.dirname(path.resolve(DB_FILE));
  if (!fs.existsSync(dbDir)) {
    fs.mkdirSync(dbDir, { recursive: true });
  }
}

const db = new DatabaseSync(isMemory ? ':memory:' : path.resolve(DB_FILE));
db.exec('PRAGMA foreign_keys = ON;');

function queryAll(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.all(...params);
}

function queryOne(sql, params = []) {
  const stmt = db.prepare(sql);
  const rows = stmt.all(...params);
  return rows.length > 0 ? rows[0] : null;
}

function execute(sql, params = []) {
  const stmt = db.prepare(sql);
  return stmt.run(...params);
}

function execScript(sql) {
  return db.exec(sql);
}

function findSqlFile(filename) {
  const localPath = path.resolve(__dirname, '..', '..', 'database', filename);
  if (fs.existsSync(localPath)) return localPath;
  const rootPath = path.resolve(__dirname, '..', '..', '..', 'database', filename);
  if (fs.existsSync(rootPath)) return rootPath;
  return localPath;
}

function initDatabase() {
  const check = queryOne("SELECT name FROM sqlite_master WHERE type='table' AND name='materiales';");
  if (!check) {
    console.log('📦 Inicializando esquema de base de datos desde schema.sql...');
    const schemaPath = findSqlFile('schema.sql');
    if (fs.existsSync(schemaPath)) {
      execScript(fs.readFileSync(schemaPath, 'utf8'));
    }

    console.log('🌱 Poblando datos semilla desde seed.sql...');
    const seedPath = findSqlFile('seed.sql');
    if (fs.existsSync(seedPath)) {
      execScript(fs.readFileSync(seedPath, 'utf8'));
    }
    console.log('✅ Base de datos lista.');
  }
}

module.exports = {
  db,
  queryAll,
  queryOne,
  execute,
  execScript,
  initDatabase,
  DB_FILE
};

