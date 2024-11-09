CREATE TABLE guilds (
    guild_id VARCHAR(20) PRIMARY KEY,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guild_permissions (
    guild_id VARCHAR(20),
    user_id VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (guild_id, user_id),
    FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE
);

CREATE TABLE trackers (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    guild_id VARCHAR(20),
    notification_channel_id VARCHAR(20) NOT NULL,
    youtube_id VARCHAR(24) NOT NULL,
    type ENUM('channel', 'video') NOT NULL,
    last_checked TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (guild_id) REFERENCES guilds(guild_id) ON DELETE CASCADE,
    INDEX idx_guild_youtube (guild_id, youtube_id),
    INDEX idx_last_checked (last_checked)
);

CREATE TABLE video_states (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tracker_id BIGINT,
    video_id VARCHAR(11) NOT NULL,
    title TEXT,
    description TEXT,
    view_count BIGINT UNSIGNED,
    like_count BIGINT UNSIGNED,
    comment_count BIGINT UNSIGNED,
    duration VARCHAR(20),
    thumbnail_url TEXT,
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
);

CREATE TABLE channel_states (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    tracker_id BIGINT,
    channel_id VARCHAR(24) NOT NULL,
    title VARCHAR(255),
    description TEXT,
    subscriber_count BIGINT UNSIGNED,
    view_count BIGINT UNSIGNED,
    video_count INT UNSIGNED,
    thumbnail_url TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (tracker_id) REFERENCES trackers(id) ON DELETE CASCADE
);

CREATE TABLE comments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    video_id VARCHAR(11) NOT NULL,
    comment_id VARCHAR(50) NOT NULL,
    author VARCHAR(255) NOT NULL,
    text TEXT NOT NULL,
    published_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_comment (video_id, comment_id)
);

CREATE INDEX idx_video_states_tracker ON video_states(tracker_id);
CREATE INDEX idx_channel_states_tracker ON channel_states(tracker_id);
