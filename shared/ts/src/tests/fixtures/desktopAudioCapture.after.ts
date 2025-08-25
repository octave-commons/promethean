const supervisedFfmpeg = (...args: any[]) => ({}) as any;

export async function captureDesktopAudio(input: string, format: string, duration: number): Promise<Buffer> {
    const ffmpeg = await supervisedFfmpeg(
        [
            '-y',
            '-f',
            format,
            '-i',
            input,
            '-t',
            duration.toString(),
            '-acodec',
            'pcm_s16le',
            '-ar',
            '44100',
            '-ac',
            '1',
            '-f',
            'wav',
            'pipe:1',
        ],
        {
            stdout: 'pipe',
            stderr: 'ignore',
            encoding: 'buffer',
        },
    );

    const { stdout } = await ffmpeg;
    return Buffer.from(stdout as Buffer);
}
