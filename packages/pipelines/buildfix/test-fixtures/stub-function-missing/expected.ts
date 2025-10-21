export interface Processor {
  process(data: string): string;
}

export class DataProcessor implements Processor {
  process(data: string): string {
    return data.trim();
  }
}