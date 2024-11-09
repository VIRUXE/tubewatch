import { google } from 'googleapis';
import config from '../config';
import type { YouTubeVideoResponse, YouTubeChannelResponse, YouTubeVideo, YouTubeChannel } from '../types/youtube';

export class YouTubeService {
	private youtube = google.youtube({
		version: 'v3',
		auth   : config.youtube.apiKey
	});

	async getVideo(videoId: string): Promise<YouTubeVideoResponse> {
		try {
			const response = await this.youtube.videos.list({
				part: ['snippet', 'statistics', 'contentDetails'],
				id  : [videoId]
			});

			return response.data as YouTubeVideoResponse;
		} catch (error) {
			console.error('Error fetching video:', error);
			throw error;
		}
	}

	async getChannel(channelId: string): Promise<YouTubeChannelResponse> {
		try {
			const response = await this.youtube.channels.list({
				part: ['snippet', 'statistics'],
				id  : [channelId]
			});

			return response.data as YouTubeChannelResponse;
		} catch (error) {
			console.error('Error fetching channel:', error);
			throw error;
		}
	}

	detectVideoChanges(oldState: YouTubeVideo, newState: YouTubeVideo) {
		const changes: Array<{field: string; old: string; new: string}> = [];

		// Check title changes
		if (oldState.snippet.title !== newState.snippet.title) {
			changes.push({
				field: 'title',
				old  : oldState.snippet.title,
				new  : newState.snippet.title
			});
		}

		// Check view count changes
		if (oldState.statistics.viewCount !== newState.statistics.viewCount) {
			changes.push({
				field: 'viewCount',
				old  : oldState.statistics.viewCount,
				new  : newState.statistics.viewCount
			});
		}

		// Check like count changes
		if (oldState.statistics.likeCount !== newState.statistics.likeCount) {
			changes.push({
				field: 'likeCount',
				old  : oldState.statistics.likeCount,
				new  : newState.statistics.likeCount
			});
		}

		// Check comment count changes
		if (oldState.statistics.commentCount !== newState.statistics.commentCount) {
			changes.push({
				field: 'commentCount',
				old  : oldState.statistics.commentCount,
				new  : newState.statistics.commentCount
			});
		}

		// Check description changes
		if (oldState.snippet.description !== newState.snippet.description) {
			changes.push({
				field: 'description',
				old  : oldState.snippet.description,
				new  : newState.snippet.description
			});
		}

		return changes;
	}

	detectChannelChanges(oldState: YouTubeChannel, newState: YouTubeChannel) {
		const changes: Array<{field: string; old: string; new: string}> = [];

		// Check title changes
		if (oldState.snippet.title !== newState.snippet.title) {
			changes.push({
				field: 'title',
				old  : oldState.snippet.title,
				new  : newState.snippet.title
			});
		}

		// Check subscriber count changes
		if (oldState.statistics.subscriberCount !== newState.statistics.subscriberCount) {
			changes.push({
				field: 'subscriberCount',
				old  : oldState.statistics.subscriberCount,
				new  : newState.statistics.subscriberCount
			});
		}

		// Check view count changes
		if (oldState.statistics.viewCount !== newState.statistics.viewCount) {
			changes.push({
				field: 'viewCount',
				old  : oldState.statistics.viewCount,
				new  : newState.statistics.viewCount
			});
		}

		// Check video count changes
		if (oldState.statistics.videoCount !== newState.statistics.videoCount) {
			changes.push({
				field: 'videoCount',
				old  : oldState.statistics.videoCount,
				new  : newState.statistics.videoCount
			});
		}

		// Check description changes
		if (oldState.snippet.description !== newState.snippet.description) {
			changes.push({
				field: 'description',
				old  : oldState.snippet.description,
				new  : newState.snippet.description
			});
		}

		return changes;
	}
}

export const youtubeService = new YouTubeService();