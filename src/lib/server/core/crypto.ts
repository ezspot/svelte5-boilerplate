/**
 * AES-256-GCM encryption for sensitive fields stored in the database.
 * Uses BETTER_AUTH_SECRET as the key material (first 32 bytes of SHA-256 hash).
 */

import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'node:crypto';
import { env } from '$lib/server/config/env';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const TAG_LENGTH = 16;

function deriveKey(): Buffer {
	return createHash('sha256').update(env.BETTER_AUTH_SECRET).digest();
}

/**
 * Encrypt a plaintext string.
 * Returns a hex-encoded string: iv + authTag + ciphertext.
 */
export function encryptField(plaintext: string): string {
	const key = deriveKey();
	const iv = randomBytes(IV_LENGTH);
	const cipher = createCipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });

	const encrypted = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
	const authTag = cipher.getAuthTag();

	return Buffer.concat([iv, authTag, encrypted]).toString('hex');
}

/**
 * Decrypt a hex-encoded ciphertext produced by `encryptField`.
 * Returns the original plaintext, or `null` if decryption fails.
 */
export function decryptField(cipherHex: string): string | null {
	try {
		const key = deriveKey();
		const data = Buffer.from(cipherHex, 'hex');

		const iv = data.subarray(0, IV_LENGTH);
		const authTag = data.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH);
		const ciphertext = data.subarray(IV_LENGTH + TAG_LENGTH);

		const decipher = createDecipheriv(ALGORITHM, key, iv, { authTagLength: TAG_LENGTH });
		decipher.setAuthTag(authTag);

		const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
		return decrypted.toString('utf8');
	} catch {
		return null;
	}
}
