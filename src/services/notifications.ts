import { EmbedBuilder, Colors } from 'discord.js';
import type { YouTubeVideo, YouTubeChannel } from '../types/youtube.js';

export class NotificationService {
	buildVideoChangeEmbed(video: YouTubeVideo, changes: Array<{field: string; old: string; new: string}>) {
		const embed = new EmbedBuilder()
			.setColor(Colors.Red)
			.setTitle(video.snippet.title)
			.setURL(`https://youtube.com/watch?v=${video.id}`)
			.setThumbnail(video.snippet.thumbnails.high.url)
			.setAuthor({ name: video.snippet.channelTitle, url : `https://youtube.com/channel/${video.snippet.channelId}` })
			.setTimestamp();

		// Add fields for each change
		changes.forEach(change => {
			let formattedOld = change.old;
			let formattedNew = change.new;

			// Format numbers
			if (['viewCount', 'likeCount', 'commentCount'].includes(change.field)) {
				formattedOld = parseInt(change.old).toLocaleString();
				formattedNew = parseInt(change.new).toLocaleString();
			}

			// Handle description changes differently due to length
			if (change.field === 'description') {
				embed.addFields({
					name  : 'Description Updated',
					value : 'The video description has been changed.',
					inline: true
				});
			} else {
				embed.addFields({
					name  : this.formatFieldName(change.field),
					value : `${formattedOld} → ${formattedNew}`,
					inline: true
				});
			}
		});

		return embed;
	}

	buildChannelChangeEmbed(channel: YouTubeChannel, changes: Array<{field: string; old: string; new: string}>) {
		const embed = new EmbedBuilder()
			.setColor(Colors.Red)
			.setTitle('Channel Update')
			.setURL(`https://youtube.com/channel/${channel.id}`)
			.setThumbnail(channel.snippet.thumbnails.high.url)
			.setAuthor({name: channel.snippet.title})
			.setTimestamp();

		// Add fields for each change
		changes.forEach(change => {
			let formattedOld = change.old;
			let formattedNew = change.new;

			// Format numbers
			if (['subscriberCount', 'viewCount', 'videoCount'].includes(change.field)) {
				formattedOld = parseInt(change.old).toLocaleString();
				formattedNew = parseInt(change.new).toLocaleString();
			}

			// Handle description changes differently due to length
			if (change.field === 'description') {
				embed.addFields({
					name  : 'Description Updated',
					value : 'The channel description has been changed.',
					inline: true
				});
			} else {
				embed.addFields({
					name  : this.formatFieldName(change.field),
					value : `${formattedOld} → ${formattedNew}`,
					inline: true
				});
			}
		});

		return embed;
	}

	buildNewVideoEmbed = (video: YouTubeVideo) => new EmbedBuilder()
		.setColor(Colors.Green)
		.setTitle(video.snippet.title)
		.setURL(`https://youtube.com/watch?v=${video.id}`)
		.setThumbnail(video.snippet.thumbnails.high.url)
		.setAuthor({
			name: video.snippet.channelTitle,
			url : `https://youtube.com/channel/${video.snippet.channelId}`
		})
		.addFields({
			name  : 'Duration',
			value : this.formatDuration(video.contentDetails.duration),
			inline: true
		}, {
			name  : 'Published',
			value : `<t:${Math.floor(new Date(video.snippet.publishedAt).getTime() / 1000)}:R>`,
			inline: true
		})
		.setTimestamp()

	// Turns "likeCount" into "Like Count"
	private formatFieldName(field: string): string {
		const formatted = field.replace(/([A-Z])/g, ' $1').toLowerCase();
		return formatted.charAt(0).toUpperCase() + formatted.slice(1);
	}

	private formatDuration(duration: string): string {
		const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
		if (!match) return '0:00';

		const hours   = (match[1] ? parseInt(match[1]) : 0);
		const minutes = (match[2] ? parseInt(match[2]) : 0);
		const seconds = (match[3] ? parseInt(match[3]) : 0);

		if (hours > 0) return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

		return `${minutes}:${seconds.toString().padStart(2, '0')}`;
	}
}

export const notificationService = new NotificationService();