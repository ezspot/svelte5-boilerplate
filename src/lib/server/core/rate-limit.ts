/**
 * Simple in-memory sliding-window rate limiter.
 * Good for single-instance deployments. For multi-instance, swap to Redis.
 */

interface RateLimitEntry {
	timestamps: number[];
}

const store = new Map<string, RateLimitEntry>();

// Evict stale entries every 5 minutes
setInterval(() => {
	const cutoff = Date.now() - 600_000;
	for (const [key, entry] of store) {
		entry.timestamps = entry.timestamps.filter((t) => t > cutoff);
		if (entry.timestamps.length === 0) store.delete(key);
	}
}, 300_000);

/**
 * Check if a request is rate-limited.
 *
 * @param key   Unique key for the limiter (e.g. `portal:submit:${ip}`)
 * @param limit Max requests allowed in the window
 * @param windowMs Window duration in milliseconds
 * @returns `{ limited: true, retryAfterMs }` or `{ limited: false }`
 */
export function checkRateLimit(
	key: string,
	limit: number,
	windowMs: number
): { limited: false } | { limited: true; retryAfterMs: number } {
	const now = Date.now();
	const cutoff = now - windowMs;

	let entry = store.get(key);
	if (!entry) {
		entry = { timestamps: [] };
		store.set(key, entry);
	}

	entry.timestamps = entry.timestamps.filter((t) => t > cutoff);

	if (entry.timestamps.length >= limit) {
		const oldest = entry.timestamps[0];
		return { limited: true, retryAfterMs: oldest + windowMs - now };
	}

	entry.timestamps.push(now);
	return { limited: false };
}
