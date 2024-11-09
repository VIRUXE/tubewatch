import { ChatInputCommandInteraction, CommandInteraction, TextChannel } from 'discord.js';
import db from '../database';
import { hasPermission } from './permissions';
import { extractYouTubeId } from '../utils/youtube';

export async function handleTrack(interaction: ChatInputCommandInteraction) {
	if (!interaction.guildId) {
		await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
		return;
	}

	try {
		// Check permissions
		const hasPerms = await hasPermission(interaction.user.id, interaction.guildId);
		if (!hasPerms && interaction.user.id !== interaction.guild?.ownerId) {
			await interaction.reply({ content: 'You don\'t have permission to add trackers!', ephemeral: true });
			return;
		}

		const url     = interaction.options.getString('url', true);
		const channel = interaction.options.getChannel('channel', true);

		if (!(channel instanceof TextChannel)) {
			await interaction.reply({ content: 'Please select a text channel!', ephemeral: true });
			return;
		}

		const { type, id } = await extractYouTubeId(url);

		// Check if already tracking
		const [existing] = await db.execute('SELECT id FROM trackers WHERE guild_id = ? AND youtube_id = ?', [interaction.guildId, id]);

		if (Array.isArray(existing) && existing.length > 0) {
			await interaction.reply({ content: 'Already tracking this!', ephemeral: true });
			return;
		}

		// Add tracker
		await db.execute('INSERT INTO trackers (guild_id, youtube_id, type, notification_channel_id) VALUES (?, ?, ?, ?)', [interaction.guildId, id, type, channel.id]);

		await interaction.reply({ content: `Now tracking ${type}: ${url}`, ephemeral: true });
	} catch (error) {
		console.error('Error in track command:', error);

		await interaction.reply({ content: error instanceof Error ? error.message : 'Failed to add tracker!', ephemeral: true });
	}
}