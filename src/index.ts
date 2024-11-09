import { Client, Events, GatewayIntentBits } from 'discord.js';
import config from './config';
import db from './database';
import { TrackingService } from './services/tracking';
import { NotificationService } from './services/notifications';
import { handleTrack } from './handlers/track';
import { handleUntrack } from './handlers/untrack';
import { handleList } from './handlers/list';
import { handlePermission } from './handlers/permissions';
import { ResultSetHeader } from 'mysql2';

const client = new Client({
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
	]
});

const notifications = new NotificationService();
let trackingService: TrackingService;

client.once(Events.ClientReady, async () => {
	console.log(`Logged in as ${client.user?.tag}!`);

	const guilds = client.guilds.cache.map(g => g.id);
	
	console.log(`Checking ${guilds.length > 1 ? `${guilds.length} guilds` : '1 guild'} for database sync...`);
	try { 
		const [{ affectedRows }] = await db.query<ResultSetHeader>(`INSERT IGNORE INTO guilds (guild_id) VALUES ${guilds.map(() => '(?)').join(',')}`, guilds);

		affectedRows && console.log(`Synced ${guilds.length > 1 ? `${guilds.length} guilds` : '1 guild'} with database!`);
	} catch (error) { 
		console.error('Error syncing guilds with database:', error); 
	}
	
	trackingService = new TrackingService(db, client, notifications);
	
	setInterval(() => trackingService.checkTrackers().catch(error => console.error('Error in tracking interval:', error)), config.tracking.interval);
});

client.on(Events.GuildCreate, async guild => {
	try { 
		await db.execute('INSERT IGNORE INTO guilds (guild_id) VALUES (?)',[guild.id]); 
	} catch (error) { 
		console.error('Error syncing guild with database:', error); 
	}
});

client.on(Events.InteractionCreate, async interaction => {
	// Ensure it's a chat input command
	if (!interaction.isChatInputCommand()) return;

	try {
		switch (interaction.commandName) {
			case 'track':
				await handleTrack(interaction);
				break;
			case 'untrack':
				await handleUntrack(interaction);
				break;
			case 'list':
				await handleList(interaction);
				break;
			case 'permission':
				await handlePermission(interaction);
				break;
		}
	} catch (error) {
		console.error('Error handling command:', error);
		
		// Check if the interaction has been replied to
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ 
				content  : 'An error occurred while processing the command!',
				ephemeral: true
			});
		} else {
			await interaction.reply({ 
				content  : 'An error occurred while processing the command!',
				ephemeral: true
			});
		}
	}
});

// Error handling
client.on(Events.Error, error => {
	console.error('Discord client error:', error);
});

process.on('unhandledRejection', (error) => {
	console.error('Unhandled promise rejection:', error);
});

client.login(config.discord.token);