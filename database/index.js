import { open } from 'sqlite';
import sqlite3 from 'sqlite3';

import { DATABASE_PATH } from '../constants.js';

let db;

const init = async () => {
  try {
    db = await open({
      filename: DATABASE_PATH,
      driver: sqlite3.cached.Database,
    });

    console.log('Database connection opened successfully');
  } catch (error) {
    console.log('There was a problem opening database connection', error);
  }
}

export { db, init };
