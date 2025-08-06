export class AbsoluteVariableIdentifierGenerator {
  constructor(property: string) {
    this.property = property;
    this.count = 0;
  }

  forward(): void {
    this.count++;
  }

  backward(): void {
    this.count--;
  }

  generate(): string {
    this.count++;
    return `--adm-${this.count.toString(16)}-${this.property}`;
  }
}
