const { REST, Routes, SlashCommandBuilder } = require('discord.js');
require('dotenv').config();

(async () => {
	try {
		console.log('Started refreshing application (/) commands.');
		await new REST().setToken(process.env.DISCORD_TOKEN).put(Routes.applicationCommands(process.env.DISCORD_CLIENT_ID), { body: [
			// /track
			new SlashCommandBuilder()
				.setName('track')
				.setDescription('Start tracking a YouTube channel or video')
				.addStringOption(option => option.setName('url').setDescription('YouTube channel or video URL').setRequired(true))
				.addChannelOption(option => option.setName('channel').setDescription('Discord channel for notifications').setRequired(true)),
		
			// /untrack
			new SlashCommandBuilder()
				.setName('untrack')
				.setDescription('Stop tracking a YouTube channel or video')
				.addStringOption(option => option.setName('url').setDescription('YouTube channel or video URL').setRequired(true)),
		
			// /list
			new SlashCommandBuilder().setName('list').setDescription('List all tracked channels and videos'),
		
			// /permission
			new SlashCommandBuilder()
				.setName('permission')
				.setDescription('Manage tracking permissions')
				.addSubcommand(subcommand =>
					subcommand
						.setName('add')
						.setDescription('Add tracking permission to a user')
						.addUserOption(option => option.setName('user').setDescription('User to grant permission').setRequired(true)))
				.addSubcommand(subcommand =>
					subcommand
						.setName('remove')
						.setDescription('Remove tracking permission from a user')
						.addUserOption(option => option.setName('user').setDescription('User to remove permission').setRequired(true)))
		].map(command => command.toJSON()) });
		console.log('Successfully reloaded application (/) commands.');
	} catch (error) {
		console.error('Error deploying commands:', error);
	}

	process.exit(0);
})();