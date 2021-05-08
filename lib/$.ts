// Imports
import type {
  CashConstructorOptions,
  CashRunOptions,
  LaunchResult,
} from "./types.ts";
import { iter } from "https://deno.land/std@0.95.0/io/util.ts";
import { exists, existsSync } from "https://deno.land/std@0.95.0/fs/exists.ts";
import { resolve } from "https://deno.land/std@0.95.0/path/mod.ts";
import Callable from "./Callable.ts";
import ProcessOutput from "./ProcessOutput.ts";
import $Error from "./$.Error.ts";
import $Styler from "./$.Styler.ts";

export interface Cash {
  (pieces: TemplateStringsArray, ...args: unknown[]): LaunchResult;
  (cmd: string, options?: Partial<CashRunOptions>): LaunchResult;
}

export class Cash extends Callable implements CashRunOptions {
  protected static stringify(value: unknown): string {
    return "" + value;
  }

  protected static getDefaultShell(): [string, string[]] {
    try {
      if (Deno.env.get("PSModulePath")) {
        if (Deno.build.os === "windows") {
          return ["powershell.exe", ["-Command"]];
        }
        const shell = Deno.env.get("_");
        if (shell) return [shell, ["-Command"]];
      }
      const shell = Deno.env.get("SHELL");
      if (shell) return [shell, ["-c"]];
    } catch {
      // ignore
    }
    if (Deno.build.os === "windows") return ["cmd.exe", ["/k"]];
    return ["/bin/sh", ["-c"]];
  }

  protected static cwd(): string | undefined {
    try {
      return Deno.cwd();
    } catch {
      return ".";
    }
  }

  protected static getDefaultRunOptions(): CashRunOptions {
    const [shell, shellOptions] = Cash.getDefaultShell();
    return {
      shell,
      shellOptions,
      cwd: Cash.cwd()!,
      verbose: 2,
    };
  }

  private static STYLE_P1 = new $Styler().brightBlue.bold;
  private static STYLE_N = new $Styler().brightGreen;

  protected static launch(
    cmd: string,
    options: CashRunOptions,
  ): LaunchResult {
    let resolve!: (value: unknown) => unknown;
    let reject!: (value: unknown) => unknown;

    const promise = new Promise((a, b) => {
      // @ts-ignore because
      resolve = a;
      reject = b;
    }) as LaunchResult;

    const promise1 = (async () => {
      if (options.verbose === 2) {
        console.log(
          Cash.STYLE_P1`$`,
          cmd.replace(/^\S+/g, (str) => Cash.STYLE_N(str)).replace(
            /\r?\n/g,
            (str) => str + Cash.STYLE_P1`|` + " ",
          ),
        );
      }
      const proc = Deno.run({
        cmd: [
          options.shell,
          ...options.shellOptions,
          cmd,
        ],
        cwd: options.cwd,
        stdout: "piped",
        stderr: "piped",
      });
      const stdout: number[] = [];
      const stderr: number[] = [];
      const combined: number[] = [];
      const stdoutPromise = (async () => {
        for await (const data of iter(proc.stdout)) {
          if (options.verbose) await Deno.stdout.write(data);
          for (const byte of data) stdout.push(byte);
        }
      })();
      const stderrPromise = (async () => {
        for await (const data of iter(proc.stderr)) {
          if (options.verbose) await Deno.stderr.write(data);
          for (const byte of data) stderr.push(byte);
        }
      })();
      const promises: [
        status: Promise<Deno.ProcessStatus>,
        ...other: unknown[],
      ] = [proc.status(), stdoutPromise, stderrPromise];
      const [status] = (await Promise.all(promises)) as [Deno.ProcessStatus];
      const result = new ProcessOutput(
        new TextDecoder().decode(new Uint8Array(stdout)),
        new TextDecoder().decode(new Uint8Array(stderr)),
        new TextDecoder().decode(new Uint8Array(combined)),
        status,
      );
      if (status.success) {
        return result;
      } else {
        throw result;
      }
    })();

    Object.defineProperties(promise, {
      stdout: {
        configurable: false,
        enumerable: true,
        get() {
          return new Promise((resolve, reject) => {
            promise.then((out) => resolve(out.stdout)).catch(reject);
          });
        },
      },
      stderr: {
        configurable: false,
        enumerable: true,
        get() {
          return new Promise((resolve, reject) => {
            promise.then((out) => resolve(out.stderr)).catch(reject);
          });
        },
      },
      combined: {
        configurable: false,
        enumerable: true,
        get() {
          return new Promise((resolve, reject) => {
            promise.then((out) => resolve(out.combined)).catch(reject);
          });
        },
      },
      code: {
        configurable: false,
        enumerable: true,
        get() {
          return new Promise((resolve, reject) => {
            promise.then((out) => resolve(out.code)).catch(reject);
          });
        },
      },
      success: {
        configurable: false,
        enumerable: true,
        get() {
          return new Promise((resolve, reject) => {
            promise.then((out) => resolve(out.success)).catch(reject);
          });
        },
      },
      signal: {
        configurable: false,
        enumerable: true,
        get() {
          return new Promise((resolve, reject) => {
            promise.then((out) => resolve(out.signal)).catch(reject);
          });
        },
      },
    });
    promise1.then(resolve).catch(reject);
    return promise as LaunchResult;
  }

  public readonly Cash = Cash;

  public get Error() {
    return $Error;
  }

  // #region styler

  public get styler() {
    return new $Styler();
  }

  public get reset() {
    return this.styler.reset;
  }

  public get bold() {
    return this.styler.bold;
  }

  public get dim() {
    return this.styler.dim;
  }

  public get hidden() {
    return this.styler.hidden;
  }

  public get inverse() {
    return this.styler.inverse;
  }

  public get italic() {
    return this.styler.italic;
  }

  public get strikethrough() {
    return this.styler.strikethrough;
  }

  public get underline() {
    return this.styler.underline;
  }

  public get black() {
    return this.styler.black;
  }

  public get red() {
    return this.styler.red;
  }

  public get green() {
    return this.styler.green;
  }

  public get yellow() {
    return this.styler.yellow;
  }

  public get blue() {
    return this.styler.blue;
  }

  public get magenta() {
    return this.styler.magenta;
  }

  public get cyan() {
    return this.styler.cyan;
  }

  public get white() {
    return this.styler.white;
  }

  public get brightBlack() {
    return this.styler.brightBlack;
  }

  public get brightRed() {
    return this.styler.brightRed;
  }

  public get brightGreen() {
    return this.styler.brightGreen;
  }

  public get brightYellow() {
    return this.styler.brightYellow;
  }

  public get brightBlue() {
    return this.styler.brightBlue;
  }

  public get brightMagenta() {
    return this.styler.brightMagenta;
  }

  public get brightCyan() {
    return this.styler.brightCyan;
  }

  public get brightWhite() {
    return this.styler.brightWhite;
  }

  public get bgBlack() {
    return this.styler.bgBlack;
  }

  public get bgRed() {
    return this.styler.bgRed;
  }

  public get bgGreen() {
    return this.styler.bgGreen;
  }

  public get bgYellow() {
    return this.styler.bgYellow;
  }

  public get bgBlue() {
    return this.styler.bgBlue;
  }

  public get bgMagenta() {
    return this.styler.bgMagenta;
  }

  public get bgCyan() {
    return this.styler.bgCyan;
  }

  public get bgWhite() {
    return this.styler.bgWhite;
  }

  public get bgBrightBlack() {
    return this.styler.bgBrightBlack;
  }

  public get bgBrightRed() {
    return this.styler.bgBrightRed;
  }

  public get bgBrightGreen() {
    return this.styler.bgBrightGreen;
  }

  public get bgBrightYellow() {
    return this.styler.bgBrightYellow;
  }

  public get bgBrightBlue() {
    return this.styler.bgBrightBlue;
  }

  public get bgBrightMagenta() {
    return this.styler.bgBrightMagenta;
  }

  public get bgBrightCyan() {
    return this.styler.bgBrightCyan;
  }

  public get bgBrightWhite() {
    return this.styler.bgBrightWhite;
  }

  public rgb(hex: string | number): $Styler;
  public rgb(r: number, g: number, b: number): $Styler;
  public rgb(r: string | number, g?: number, b?: number): $Styler {
    return this.styler.rgb(r as number, g as number, b as number);
  }

  public bgRgb(hex: string | number): $Styler;
  public bgRgb(r: number, g: number, b: number): $Styler;
  public bgRgb(r: string | number, g?: number, b?: number): $Styler {
    return this.styler.bgRgb(r as number, g as number, b as number);
  }

  public rgb8(color: number): $Styler {
    return this.styler.rgb8(color);
  }
  public bgRgb8(color: number): $Styler {
    return this.styler.rgb8(color);
  }

  // #endregion

  public shell!: string;
  public shellOptions!: string[];
  public cwd!: string;
  public verbose!: boolean | 0 | 1 | 2;

  public get shellEnv() {
    const sh = this.shellOptions[0];
    if (sh === "-Command") {
      return "powershell";
    } else if (sh === "/k") {
      return "cmd";
    } else if (sh === "-c") {
      return "unix";
    }
    return "unknown";
  }

  public constructor(options?: CashConstructorOptions) {
    super("run");
    // deno-lint-ignore no-explicit-any
    const opts1 = Cash.getDefaultRunOptions() as any;
    // deno-lint-ignore no-explicit-any
    const opts2 = (options as any) ?? {};
    for (const key in opts1) {
      // deno-lint-ignore no-explicit-any
      (this as any)[key] = opts2[key] || opts1[key];
    }
  }

  protected runOptions(): CashRunOptions {
    return {
      shell: this.shell,
      shellOptions: this.shellOptions,
      cwd: this.cwd,
      verbose: this.verbose,
    };
  }

  public run(
    pieces: TemplateStringsArray,
    ...args: unknown[]
  ): LaunchResult;

  public run(
    cmd: string,
    options?: Partial<CashRunOptions>,
  ): LaunchResult;

  public run(
    piecesOrCmd: TemplateStringsArray | string,
    ...optionsOrArgs: unknown[]
  ): LaunchResult {
    let command!: string;
    const runOptions: CashRunOptions = this.runOptions();
    if (Array.isArray(piecesOrCmd)) {
      command = String.raw(
        piecesOrCmd as TemplateStringsArray,
        ...optionsOrArgs,
      );
    } else {
      command = piecesOrCmd as string;
      // deno-lint-ignore no-explicit-any
      const opts = optionsOrArgs[0] as any;
      if (typeof opts === "object") {
        for (const key in opts) {
          // deno-lint-ignore no-explicit-any
          (runOptions as any)[key] = opts[key];
        }
      }
    }
    return Cash.launch(command, runOptions);
  }

  protected getPathSync(): string {
    let path!: string;
    try {
      path = Deno.env.get("PATH")!;
    } catch {
      // Ignore
    }
    if (!path) throw new Error("Could not get path!");
    return path;
  }

  protected async getPath(): Promise<string> {
    let path!: string;
    try {
      path = Deno.env.get("PATH")!;
    } catch {
      // Ignore
    }
    if (!path) {
      if (this.shellEnv === "unix") {
        path = (await this`echo $PATH`.stdout).trim();
      } else if (this.shellEnv === "cmd") {
        path = (await this`echo %PATH%`.stdout).trim();
      } else if (this.shellEnv === "powershell") {
        path = (await this`$env:PATH`.stdout).trim();
      } else {
        throw new this.Error("Unknown shell environment!");
      }
    }
    return path;
  }

  public async which(name: string): Promise<string | undefined> {
    if (/\/\\/.test(name)) return;
    const path = await this.getPath();
    console.log(path);
    const dirs = path.split(/:+/g);
    for (const dir of dirs) {
      const filename = resolve(dir, name);
      if (await exists(filename)) {
        return filename;
      }
    }
  }

  public whichSync(name: string): string | undefined {
    if (/\/\\/.test(name)) return;
    const path = this.getPathSync();
    console.log(path);
    const dirs = path.split(/:+/g);
    for (const dir of dirs) {
      const filename = resolve(dir, name);
      if (existsSync(filename)) {
        return filename;
      }
    }
  }

  public echo(
    pieces: TemplateStringsArray,
    ...args: unknown[]
  ): LaunchResult;
  public echo(
    cmd: string,
    options?: Partial<CashRunOptions>,
  ): LaunchResult;
  public echo(
    piecesOrCmd: TemplateStringsArray | string,
    ...optionsOrArgs: unknown[]
  ): LaunchResult {
    let value!: string;
    let opts: Partial<CashRunOptions> | undefined = undefined;
    if (Array.isArray(piecesOrCmd)) {
      value = String.raw(
        piecesOrCmd as TemplateStringsArray,
        ...optionsOrArgs,
      );
    } else {
      value = piecesOrCmd as string;
      // deno-lint-ignore no-explicit-any
      opts = optionsOrArgs[0] as any;
    }
    value = value.replace('"', '\\"');
    return this(
      this.shellEnv === "powershell"
        ? `Write-Output "${value}"`
        : `echo "${value}"`,
      opts,
    );
  }
}

export default Cash;
