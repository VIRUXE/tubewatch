import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

for (const cfg of [
	'DISCORD_TOKEN',
	'DISCORD_CLIENT_ID',
	'YOUTUBE_API_KEY',
	'DATABASE_USER',
]) {
	if (!process.env[cfg])
		throw new Error(`Missing required environment variable: ${cfg}`);
}

export default {
	discord: {
		token   : process.env.DISCORD_TOKEN,
		clientId: process.env.DISCORD_CLIENT_ID
	},
	youtube: {
		apiKey: process.env.YOUTUBE_API_KEY
	},
	database: {
		host: process.env.DATABASE_HOST,
		user: process.env.DATABASE_USER,
		password: process.env.DATABASE_PASS || '',
		database: process.env.DATABASE_NAME
	},
	tracking: {
		interval: Number(process.env.TRACKING_INTERVAL) || 5 * 60 * 1000 // 5 minutes
	}
};