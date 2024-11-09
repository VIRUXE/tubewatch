import { CommandInteraction } from 'discord.js';
import db from '../database';
import { TrackerRow } from '../types/database';

export async function handleList(interaction: CommandInteraction) {
    if (!interaction.guildId) {
        await interaction.reply({ content: 'This command can only be used in a server!', ephemeral: true });
        return;
    }

    try {
        const [trackers] = await db.execute<TrackerRow[]>(
            `SELECT t.*, cs.title as channel_name FROM trackers t LEFT JOIN channel_states cs ON t.id = cs.tracker_id WHERE t.guild_id = ?`,
            [interaction.guildId]
        );

        if (trackers.length === 0) {
            await interaction.reply({ content: 'No active trackers!', ephemeral: true });
            return;
        }

        const list = trackers.map(t => `- ${t.type}: ${t.youtube_id} → <#${t.notification_channel_id}>`).join('\n');

        await interaction.reply({ content: `Active trackers:\n${list}`, ephemeral: true });
    } catch (error) {
        console.error('Error in list command:', error);
        await interaction.reply({ content: 'Failed to list trackers!', ephemeral: true });
    }
}