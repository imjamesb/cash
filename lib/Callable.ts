export interface Callable {
  (...args: unknown[]): void;
}

export class Callable extends Function {
  private readonly _bound: unknown;
  public constructor(callable: string) {
    super("...args", "return this._bound." + callable + "(...args)");
    if (
      typeof (this as unknown as Record<string, () => void>)[callable] !==
        "function"
    ) {
      throw new Error(
        "Provided method name must exist on `this` and be a function!",
      );
    }
    return this._bound = this.bind(this);
  }
}

export default Callable;
