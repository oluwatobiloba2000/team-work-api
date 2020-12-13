/* eslint-disable no-console */
import migrate from './migration';

import db from '../db/index';

(async () => {
  try {
    await migrate(db);
    console.log('database migrated successfully');
    process.exit();
  } catch (error) {
    console.log(error);
  }
})();
