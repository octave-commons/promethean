const supervisedFfmpeg = (...args: any[]) => ({}) as any;

export async function generateSpectrogram(
    audioBuffer: Buffer,
    width: number,
    height: number,
    color: string,
): Promise<Buffer> {
    const ffmpeg = await supervisedFfmpeg(
        [
            '-y',
            '-f',
            'wav',
            '-i',
            'pipe:0',
            '-lavfi',
            `showspectrumpic=s=${width}x${height}:legend=disabled:color=${color}`,
            '-frames:v',
            '1',
            '-f',
            'image2',
            'pipe:1',
        ],
        {
            encoding: 'buffer',
            stdout: 'pipe',
            stderr: 'ignore',
            stdin: 'pipe',
        },
    );

    ffmpeg.stdin?.end(audioBuffer);
    const { stdout } = await ffmpeg;
    return Buffer.from(stdout as Buffer);
}
