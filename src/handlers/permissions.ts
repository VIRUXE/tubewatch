import { ChatInputCommandInteraction } from 'discord.js';
import db from '../database';

export async function hasPermission(userId: string, guildId: string): Promise<boolean> {
	const [rows] = await db.execute('SELECT 1 FROM guild_permissions WHERE guild_id = ? AND user_id = ?', [guildId, userId]);

	return Array.isArray(rows) && rows.length > 0;
}

export async function handlePermission(interaction: ChatInputCommandInteraction) {
	if (!interaction.guildId || !interaction.guild) {
		await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
		return;
	}

	// Only server owner can manage permissions
	if (interaction.user.id !== interaction.guild.ownerId) {
		await interaction.reply({ content: 'Only the server owner can manage permissions!', ephemeral: true });
		return;
	}

	const subcommand = interaction.options.getSubcommand(true);
	const user       = interaction.options.getUser('user', true);

	try {
		if (subcommand === 'add') {
			await db.execute('INSERT IGNORE INTO guild_permissions (guild_id, user_id) VALUES (?, ?)', [interaction.guildId, user.id]);
			await interaction.reply({ content: `Granted tracking permissions to ${user.tag}`, ephemeral: true });
		} else {
			await db.execute('DELETE FROM guild_permissions WHERE guild_id = ? AND user_id = ?', [interaction.guildId, user.id]);
			await interaction.reply({ content: `Removed tracking permissions from ${user.tag}`, ephemeral: true });
		}
	} catch (error) {
		console.error('Error managing permissions:', error);
		await interaction.reply({ content: 'Failed to update permissions!', ephemeral: true });
	}
}