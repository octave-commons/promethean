import { execa } from 'execa';

/**
 * Generate a spectrogram PNG image buffer from an in-memory WAV audio buffer.
 */
export async function generateSpectrogram(
	wavBuffer: Buffer,
	{
		width = 1024,
		height = 256,
		color = 'rainbow', // other options: viridis, gray, more available in ffmpeg filters
	}: {
		width?: number;
		height?: number;
		color?: string;
	} = {},
): Promise<Buffer> {
	const ffmpeg = execa(
		'ffmpeg',
		[
			'-y',
			'-f',
			'wav',
			'-i',
			'pipe:0', // read wav from stdin
			'-lavfi',
			`showspectrumpic=s=${width}x${height}:legend=disabled:color=${color}`,
			'-frames:v',
			'1', // ← THIS IS KEY
			'-f',
			'image2',
			'pipe:1', // output PNG to stdout
		],
		{
			encoding: 'buffer',
			stdout: 'pipe',
			stderr: 'ignore',
			stdin: 'pipe',
		},
	);

	// Write the wavBuffer to stdin
	ffmpeg.stdin!.write(wavBuffer);
	ffmpeg.stdin!.end();

	const { stdout } = await ffmpeg;

	// await writeFile('textspectrogram.png', stdout);
	return Buffer.from(stdout);
}
