import { captureAndRenderWaveform, AudioImageData } from "./waveform";

export class CircularWaveForm {
    frames:AudioImageData[]=[];
    limit=5;
    step=5; // how many seconds is each waveform capturing?
    isRunning = false;
    async start() {
        this.isRunning = true
        while(this.isRunning) {
            this.frames.push(await captureAndRenderWaveform())
            if(this.frames.length > this.limit) {
                this.frames.shift();
            }
        }
    }
    stop() {
        this.isRunning = false
    }
}
