import mysql from 'mysql2/promise';
import config from './config';

export default mysql.createPool({
	...config.database,
	waitForConnections: true,
	connectionLimit   : 10,
	queueLimit        : 0
});