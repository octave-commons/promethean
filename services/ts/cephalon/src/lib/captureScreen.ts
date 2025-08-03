import * as dotenv from 'dotenv';
import { Buffer } from 'buffer';

dotenv.config({ path: '../../../.env' });

const VISION_HOST = process.env.VISION_HOST || 'http://localhost:9999';

export async function captureScreen(): Promise<Buffer> {
	if (process.env.NO_SCREENSHOT === '1') {
		return Buffer.alloc(0);
	}
	const res = await fetch(`${VISION_HOST}/capture`);
	if (!res.ok) throw new Error('Failed to capture screen');
	const arrayBuf = await res.arrayBuffer();
	return Buffer.from(arrayBuf);
}
