export async function extractYouTubeId(url: string): Promise<{ type: 'video' | 'channel', id: string }> {
	// Check video patterns
	for (const pattern of [
		/(?:youtube\.com\/watch\?v=|youtu.be\/)([^&\n?#]+)/,
		/youtube.com\/shorts\/([^&\n?#]+)/
	]) {
		const match = url.match(pattern);
		if (match?.[1]) return { type: 'video', id: match[1] };
	}

	// Check channel patterns
	for (const pattern of [
		/youtube\.com\/channel\/([^&\n?#]+)/,
		/youtube\.com\/@([^&\n?#]+)/
	]) {
		const match = url.match(pattern);
		if (match?.[1]) return { type: 'channel', id: match[1] };
	}

	throw new Error('Invalid YouTube URL');
}