import { ChatInputCommandInteraction } from 'discord.js';
import db from '../database';
import { hasPermission } from './permissions';
import { extractYouTubeId } from '../utils/youtube';

export async function handleUntrack(interaction: ChatInputCommandInteraction) {
    if (!interaction.guildId) {
        await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
        return;
    }

    try {
        // Check permissions
        const hasPerms = await hasPermission(interaction.user.id, interaction.guildId);
        if (!hasPerms && interaction.user.id !== interaction.guild?.ownerId) {
            await interaction.reply({ content: 'You don\'t have permission to remove trackers!', ephemeral: true });
            return;
        }

        const url = interaction.options.getString('url', true);
        const { id } = await extractYouTubeId(url);

        const [result] = await db.execute(
            'DELETE FROM trackers WHERE guild_id = ? AND youtube_id = ?',
            [interaction.guildId, id]
        );

        // @ts-ignore (ResultSetHeader type)
        if (result.affectedRows === 0) {
            await interaction.reply({ content: 'Not tracking this!', ephemeral: true });
            return;
        }

        await interaction.reply({ content: 'Stopped tracking!', ephemeral: true });
    } catch (error) {
        console.error('Error in untrack command:', error);
        await interaction.reply({ 
            content: error instanceof Error ? error.message : 'Failed to remove tracker!', 
            ephemeral: true 
        });
    }
}
