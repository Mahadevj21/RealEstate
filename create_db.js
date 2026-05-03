const { Client } = require('pg');
const c = new Client({ user: 'postgres', host: 'localhost', database: 'postgres', port: 5432 });
c.connect()
  .then(() => c.query('CREATE DATABASE "RealEstate"'))
  .then(() => { console.log('DB created!'); c.end(); })
  .catch(e => { console.log(e.message); c.end(); });
