import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

const databasePath = './sqlite.db';

let _db;

const _init = async () => {
  try {
    _db = await open({
      filename: databasePath,
      driver: sqlite3.cached.Database,
    });

    console.log('Database connection opened successfully');
  } catch (error) {
    console.log('There was a problem opening database connection', error);
  }
}

export const db = async () => {
  if (!_db) await _init();

  return _db;
}
