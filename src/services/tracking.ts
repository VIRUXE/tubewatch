import { Pool } from 'mysql2/promise';
import { google } from 'googleapis';
import { Client, TextChannel } from 'discord.js';
import config from '../config';
import { NotificationService } from './notifications';
import { TrackerRow, VideoStateRow, ChannelStateRow } from '../types/database';
import { YouTubeVideo, YouTubeChannel } from '../types/youtube';


interface YouTubeError extends Error { code?: number; }

export class TrackingService {
	private youtube = google.youtube({
		version: 'v3',
		auth   : config.youtube.apiKey
	});
	
	constructor(
		private db           : Pool,
		private discord      : Client,
		private notifications: NotificationService
	) {}

	async checkTrackers(): Promise<void> {
		try {
			const [trackers] = await this.db.execute<TrackerRow[]>(`SELECT t.* FROM trackers t WHERE t.last_checked < DATE_SUB(NOW(), INTERVAL 5 MINUTE) OR t.last_checked IS NULL LIMIT 10`);

			if (trackers.length === 0) return;

			for (const tracker of trackers) {
				try {
					if (tracker.type === 'video') await this.checkVideo(tracker); else await this.checkChannel(tracker);

					await this.db.execute('UPDATE trackers SET last_checked = NOW() WHERE id = ?', [tracker.id]);
				} catch (error) {
					console.error(`Error checking tracker ${tracker.id}:`, error);
					
					if ((error as YouTubeError).code === 404) await this.db.execute('DELETE FROM trackers WHERE id = ?', [tracker.id]);
				}

				// Wait 1 second between checks to avoid rate limiting
				await new Promise(resolve => setTimeout(resolve, 1000));
			}
		} catch (error) {
			console.error('Error in checkTrackers:', error);
		}
	}

	private async checkVideo(tracker: TrackerRow): Promise<void> {
		const response = await this.youtube.videos.list({
			part: ['snippet', 'statistics', 'contentDetails'],
			id  : [tracker.youtube_id]
		});
		
		console.info(`Checking video ${tracker.youtube_id}...`);
		
		const video = response.data.items?.[0];
		if (!video || !video.snippet || !video.statistics || !video.contentDetails) throw { code: 404, message: 'Video not found or incomplete data' } as YouTubeError;
		
		const comments = await this.youtube.commentThreads.list({
			part      : ['snippet'],
			videoId   : tracker.youtube_id,
			maxResults: 100,
			order     : 'time'
		});

		try {
			for (const thread of comments.data.items || []) {
				const comment = thread.snippet?.topLevelComment?.snippet;
				if (!comment) continue;
			
				await this.db.execute('INSERT IGNORE INTO comments (video_id, comment_id, author, text, published_at) VALUES (?, ?, ?, ?, ?)', [tracker.youtube_id, thread.id, comment.authorDisplayName, comment.textDisplay, comment.publishedAt]);
			}
		} catch (error) {
			console.error('Error checking comments:', error);
		}

		const currentState = {
			tracker_id   : tracker.id,
			video_id     : video.id || '',
			title        : video.snippet.title || '',
			description  : video.snippet.description || '',
			view_count   : video.statistics.viewCount || '0',
			like_count   : video.statistics.likeCount || '0',
			comment_count: video.statistics.commentCount || '0',
			duration     : video.contentDetails.duration || '',
			thumbnail_url: video.snippet.thumbnails?.high?.url ?? video.snippet.thumbnails?.default?.url ?? '',
			published_at : video.snippet.publishedAt ? new Date(video.snippet.publishedAt).toISOString().slice(0, 19).replace('T', ' ') : 'NULL'
		};
		
		// Get previous state
		const [states] = await this.db.execute<VideoStateRow[]>('SELECT * FROM video_states WHERE tracker_id = ? ORDER BY updated_at DESC LIMIT 1', [tracker.id]);
		const oldState = states[0];

		try {
			if (oldState) {
				const changes: Array<{ field: string; old: string; new: string }> = [];

				if (oldState.title != currentState.title) changes.push({ field: 'title', old: oldState.title, new: currentState.title });
				if (oldState.view_count != currentState.view_count) changes.push({ field: 'viewCount', old: oldState.view_count, new: currentState.view_count });
				if (oldState.like_count != currentState.like_count) changes.push({ field: 'likeCount', old: oldState.like_count, new: currentState.like_count });
				if (oldState.comment_count != currentState.comment_count) changes.push({ field: 'commentCount', old: oldState.comment_count, new: currentState.comment_count });

				if (changes.length > 0) {
					console.log(`Changes detected in video ${tracker.youtube_id}:`, changes);

					await this.db.query('INSERT INTO video_states SET ?', [currentState]);

					const channel = this.discord.channels.cache.get(tracker.notification_channel_id) as TextChannel;
					if (channel) await channel.send({ embeds: [this.notifications.buildVideoChangeEmbed(video as YouTubeVideo, changes)] });
				}
			} else {
				// First time checking this video, save initial state
				console.log(`First time checking video ${tracker.youtube_id}, saving initial state`);
				await this.db.query('INSERT INTO video_states SET ?', [currentState]);
			}
		} catch (error) {
			console.error('Error checking video:', error, currentState);
		}
	}

	private async checkChannel(tracker: TrackerRow): Promise<void> {
		const response = await this.youtube.channels.list({
			part: ['snippet', 'statistics'],
			id  : [tracker.youtube_id]
		});

		const channel = response.data.items?.[0];
		console.log(response);
		if (!channel || !channel.snippet || !channel.statistics) throw { code: 404, message: 'Channel not found or incomplete data' } as YouTubeError;

		// Get previous state
		const [states] = await this.db.execute<ChannelStateRow[]>('SELECT * FROM channel_states WHERE tracker_id = ? ORDER BY updated_at DESC LIMIT 1', [tracker.id]);

		const currentState = {
			tracker_id      : tracker.id,
			channel_id      : channel.id || '',
			title           : channel.snippet.title || '',
			description     : channel.snippet.description || '',
			subscriber_count: channel.statistics.subscriberCount || '0',
			view_count      : channel.statistics.viewCount || '0',
			video_count     : channel.statistics.videoCount || '0',
			thumbnail_url   : channel.snippet.thumbnails?.high?.url ?? channel.snippet.thumbnails?.default?.url ?? ''
		};

		const oldState = states[0];
		if (oldState) {
			const changes: Array<{ field: string; old: string; new: string }> = [];

			if (oldState.title != currentState.title) changes.push({ field: 'title', old: oldState.title, new: currentState.title });
			if (oldState.subscriber_count != currentState.subscriber_count) changes.push({ field: 'subscriberCount', old: oldState.subscriber_count, new: currentState.subscriber_count });
			if (oldState.view_count != currentState.view_count) changes.push({ field: 'viewCount', old: oldState.view_count, new: currentState.view_count });
			if (oldState.video_count != currentState.video_count) changes.push({ field: 'videoCount', old: oldState.video_count, new: currentState.video_count });

			if (changes.length > 0) {
				await this.db.query('INSERT INTO channel_states SET ?', [currentState]);

				const discordChannel = this.discord.channels.cache.get(tracker.notification_channel_id) as TextChannel;
				if (discordChannel) await discordChannel.send({ embeds: [this.notifications.buildChannelChangeEmbed(channel as YouTubeChannel, changes)] });
			}
		} else {
			// First time checking this channel, save initial state
			await this.db.query('INSERT INTO channel_states SET ?', [currentState]);
		}
	}
}