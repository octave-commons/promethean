export class Greeter {
  constructor(private name: string) {}
  greet(): string {
    return `Hello, ${this.name}!`;
  }
}

export function add(a: number, b: number) {
  return a + b;
}
