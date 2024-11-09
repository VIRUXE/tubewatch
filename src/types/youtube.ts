export interface YouTubeVideoResponse {
	kind: string;
	etag: string;
	items: YouTubeVideo[];
	pageInfo: {
		totalResults  : number;
		resultsPerPage: number;
	};
}

export interface YouTubeVideo {
	kind: string;
	etag: string;
	id: string;
	snippet: {
		publishedAt: string;
		channelId: string;
		title: string;
		description: string;
		thumbnails: {
			default  : YouTubeThumbnail;
			medium   : YouTubeThumbnail;
			high     : YouTubeThumbnail;
			standard?: YouTubeThumbnail;
			maxres  ?: YouTubeThumbnail;
		};
		channelTitle: string;
		categoryId: string;
		liveBroadcastContent: string;
		localized: {
			title      : string;
			description: string;
		};
		defaultAudioLanguage?: string;
	};
	contentDetails: {
		duration       : string;
		dimension      : string;
		definition     : string;
		caption        : string;
		licensedContent: boolean;
		contentRating  : Record<string, unknown>;
		projection     : string;
	};
	statistics: {
		viewCount    : string;
		likeCount    : string;
		favoriteCount: string;
		commentCount : string;
	};
}

export interface YouTubeChannelResponse {
	kind: string;
	etag: string;
	pageInfo: {
		totalResults  : number;
		resultsPerPage: number;
	};
	items: YouTubeChannel[];
}

export interface YouTubeChannel {
	kind: string;
	etag: string;
	id: string;
	snippet: {
		title      : string;
		description: string;
		customUrl  : string;
		publishedAt: string;
		thumbnails : {
			default: YouTubeThumbnail;
			medium : YouTubeThumbnail;
			high   : YouTubeThumbnail;
		};
		localized: {
			title      : string;
			description: string;
		};
		country?: string;
	};
	statistics: {
		viewCount            : string;
		subscriberCount      : string;
		hiddenSubscriberCount: boolean;
		videoCount           : string;
	};
}

interface YouTubeThumbnail {
	url   : string;
	width : number;
	height: number;
}
