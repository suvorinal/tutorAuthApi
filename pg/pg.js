const { Pool } = require('pg');
const { pg } = require('../config');

module.exports = new Pool(pg);
