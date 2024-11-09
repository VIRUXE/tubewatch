export interface YouTubeTracker {
	id                   : number;
	guildId              : string;
	channelId            : string;
	type                 : 'channel' | 'video';
	notificationChannelId: string;
	lastChecked          : Date;
}