import { RowDataPacket } from 'mysql2';

export interface TrackerRow extends RowDataPacket {
	id                     : number;
	guild_id               : string;
	youtube_id             : string;
	type                   : 'channel' | 'video';
	notification_channel_id: string;
	last_checked           : Date;
	created_at             : Date;
}

export interface VideoStateRow extends RowDataPacket {
	id           : number;
	tracker_id   : number;
	video_id     : string;
	title        : string;
	description  : string;
	view_count   : string;
	like_count   : string;
	comment_count: string;
	duration     : string;
	thumbnail_url: string;
	published_at : string;
	updated_at   : Date;
}

export interface ChannelStateRow extends RowDataPacket {
	id              : number;
	tracker_id      : number;
	channel_id      : string;
	title           : string;
	description     : string;
	subscriber_count: string;
	view_count      : string;
	video_count     : string;
	thumbnail_url   : string;
	updated_at      : Date;
}

export interface GuildRow extends RowDataPacket {
	guild_id  : string;
	prefix    : string;
	created_at: Date;
}