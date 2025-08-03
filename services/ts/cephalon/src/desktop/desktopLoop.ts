import { captureAndRenderWaveform, AudioImageData } from '../audioProcessing/waveform';

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

export interface DesktopCaptureData {
	audio: AudioImageData;
	screen: Buffer;
}

export class DesktopCaptureManager {
	frames: DesktopCaptureData[] = [];
	limit = 5;
	step = 5; // how many seconds is each waveform capturing?
	isRunning = false;
	static async capture(): Promise<DesktopCaptureData> {
		const [screen, audio] = await Promise.all([captureScreen(), captureAndRenderWaveform()]);
		return { screen, audio };
	}
	async start() {
		this.isRunning = true;
		while (this.isRunning) {
			this.frames.push({
				screen: await captureScreen(),
				audio: await captureAndRenderWaveform(),
			});
			if (this.frames.length > this.limit) {
				this.frames.shift();
			}
		}
	}
	stop() {
		this.isRunning = false;
	}
}
