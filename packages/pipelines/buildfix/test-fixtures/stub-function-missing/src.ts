export interface Processor {
  process(data: string): string;
}

export class DataProcessor implements Processor {
  // Missing process method
}