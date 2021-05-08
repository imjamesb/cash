// Imports
import type { Style } from "./types.ts";
import * as colors from "https://deno.land/std@0.95.0/fmt/colors.ts";
import Callable from "./Callable.ts";

export interface Styler {
  (pieces: TemplateStringsArray, ...args: unknown[]): string;
  (text: string): string;
}

export class Styler extends Callable {
  #styler!: Style;
  protected _style_(
    piecesOrText: string | TemplateStringsArray,
    ...args: unknown[]
  ): string {
    if (Array.isArray(piecesOrText)) {
      if (args.length > 0) {
        return String.raw(
          piecesOrText as TemplateStringsArray,
          ...args.map((x) => this.#styler("" + x)),
        );
      }
      return this.#styler(
        String.raw(piecesOrText as TemplateStringsArray, []),
      );
    }
    return this.#styler("" + piecesOrText);
  }
  public constructor(styler: Style = (str: string) => str) {
    super("_style_");
    this.#styler = styler;
  }

  public get reset() {
    return new Styler((str: string) => colors.reset(this.#styler(str)));
  }

  public get bold() {
    return new Styler((str: string) => colors.bold(this.#styler(str)));
  }

  public get dim() {
    return new Styler((str: string) => colors.dim(this.#styler(str)));
  }

  public get hidden() {
    return new Styler((str: string) => colors.hidden(this.#styler(str)));
  }

  public get inverse() {
    return new Styler((str: string) => colors.inverse(this.#styler(str)));
  }

  public get italic() {
    return new Styler((str: string) => colors.italic(this.#styler(str)));
  }

  public get strikethrough() {
    return new Styler((str: string) => colors.strikethrough(this.#styler(str)));
  }

  public get underline() {
    return new Styler((str: string) => colors.underline(this.#styler(str)));
  }

  public get black() {
    return new Styler((str: string) => colors.black(this.#styler(str)));
  }

  public get red() {
    return new Styler((str: string) => colors.red(this.#styler(str)));
  }

  public get green() {
    return new Styler((str: string) => colors.green(this.#styler(str)));
  }

  public get yellow() {
    return new Styler((str: string) => colors.yellow(this.#styler(str)));
  }

  public get blue() {
    return new Styler((str: string) => colors.blue(this.#styler(str)));
  }

  public get magenta() {
    return new Styler((str: string) => colors.magenta(this.#styler(str)));
  }

  public get cyan() {
    return new Styler((str: string) => colors.cyan(this.#styler(str)));
  }

  public get white() {
    return new Styler((str: string) => colors.white(this.#styler(str)));
  }

  public get brightBlack() {
    return new Styler((str: string) => colors.brightBlack(this.#styler(str)));
  }

  public get brightRed() {
    return new Styler((str: string) => colors.brightRed(this.#styler(str)));
  }

  public get brightGreen() {
    return new Styler((str: string) => colors.brightGreen(this.#styler(str)));
  }

  public get brightYellow() {
    return new Styler((str: string) => colors.brightYellow(this.#styler(str)));
  }

  public get brightBlue() {
    return new Styler((str: string) => colors.brightBlue(this.#styler(str)));
  }

  public get brightMagenta() {
    return new Styler((str: string) => colors.brightMagenta(this.#styler(str)));
  }

  public get brightCyan() {
    return new Styler((str: string) => colors.brightCyan(this.#styler(str)));
  }

  public get brightWhite() {
    return new Styler((str: string) => colors.brightWhite(this.#styler(str)));
  }

  public get bgBlack() {
    return new Styler((str: string) => colors.bgBlack(this.#styler(str)));
  }

  public get bgRed() {
    return new Styler((str: string) => colors.bgRed(this.#styler(str)));
  }

  public get bgGreen() {
    return new Styler((str: string) => colors.bgGreen(this.#styler(str)));
  }

  public get bgYellow() {
    return new Styler((str: string) => colors.bgYellow(this.#styler(str)));
  }

  public get bgBlue() {
    return new Styler((str: string) => colors.bgBlue(this.#styler(str)));
  }

  public get bgMagenta() {
    return new Styler((str: string) => colors.bgMagenta(this.#styler(str)));
  }

  public get bgCyan() {
    return new Styler((str: string) => colors.bgCyan(this.#styler(str)));
  }

  public get bgWhite() {
    return new Styler((str: string) => colors.bgWhite(this.#styler(str)));
  }

  public get bgBrightBlack() {
    return new Styler((str: string) => colors.bgBrightBlack(this.#styler(str)));
  }

  public get bgBrightRed() {
    return new Styler((str: string) => colors.bgBrightRed(this.#styler(str)));
  }

  public get bgBrightGreen() {
    return new Styler((str: string) => colors.bgBrightGreen(this.#styler(str)));
  }

  public get bgBrightYellow() {
    return new Styler((str: string) =>
      colors.bgBrightYellow(this.#styler(str))
    );
  }

  public get bgBrightBlue() {
    return new Styler((str: string) => colors.bgBrightBlue(this.#styler(str)));
  }

  public get bgBrightMagenta() {
    return new Styler((str: string) =>
      colors.bgBrightMagenta(this.#styler(str))
    );
  }

  public get bgBrightCyan() {
    return new Styler((str: string) => colors.bgBrightCyan(this.#styler(str)));
  }

  public get bgBrightWhite() {
    return new Styler((str: string) => colors.bgBrightWhite(this.#styler(str)));
  }

  protected getRGB(
    r: string | number,
    g?: number,
    b?: number,
  ): { r: number; g: number; b: number } {
    if (typeof r === "string") {
      if (!/^\#?([0-9a-f]{1,6}|[0-9a-f]{1,3})$/gi.test(r)) {
        throw new Error("Invalid hex code!");
      }
      r = r.replace(/^\#/g, "");
      if (r.length === 3) {
        r = r[0].repeat(2) + r[1].repeat(2) + r[2].repeat(2);
      }
      r = parseInt(r, 16);
    }
    if (typeof r === "number") {
      if (typeof g !== "number" && typeof b !== "number") {
        b = r & 0xFF;
        g = (r >> 8) && 0xFF;
        r = (r >> 16) && 0xFF;
      }
      return { r, g: g!, b: b! };
    }
    throw new Error("Invalid rgb combinations.");
  }

  public rgb(hex: string | number): Styler;
  public rgb(r: number, g: number, b: number): Styler;
  public rgb(r: string | number, g?: number, b?: number): Styler {
    return new Styler((str: string) =>
      colors.rgb24(this.#styler(str), this.getRGB(r, g, b))
    );
  }

  public rgb8(color: number): Styler {
    return new Styler((str: string) => colors.rgb8(this.#styler(str), color));
  }

  public bgRgb(hex: string | number): Styler;
  public bgRgb(r: number, g: number, b: number): Styler;
  public bgRgb(r: string | number, g?: number, b?: number): Styler {
    return new Styler((str: string) =>
      colors.bgRgb24(this.#styler(str), this.getRGB(r, g, b))
    );
  }

  public bgRgb8(color: number): Styler {
    return new Styler((str: string) => colors.bgRgb8(this.#styler(str), color));
  }
}

export default Styler;
