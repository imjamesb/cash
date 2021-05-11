// Imports
import type { ExecLazyResult } from "./results.ts";
import type { ExecOptions } from "./exec.ts";
import { existsSync } from "https://deno.land/std@0.95.0/fs/exists.ts";
import {
  dirname,
  isAbsolute,
  join,
  resolve,
} from "https://deno.land/std@0.95.0/path/mod.ts";
import Callable from "./Callable.ts";
import exec from "./exec.ts";

/**
 * A tool that let's you create a function(ish) that can run shell commands in
 * any shell you prefer.
 */
export class Cash extends Callable<
  | ((pieces: TemplateStringsArray, ...args: unknown[]) => ExecLazyResult)
  | ((
    command: string,
    execOptions?: Omit<ExecOptions, "command">,
  ) => ExecLazyResult)
> {
  protected static getEnv(): undefined | Record<string, string> {
    try {
      return { ...Deno.env.toObject() };
    } catch {
      return;
    }
  }

  protected static getCwd(): string {
    try {
      return Deno.cwd();
    } catch {
      return "";
    }
  }

  public osType!: "windows" | "unix";
  public shell!: string;
  public shellOptions!: string[];
  public verbose: boolean | number = 0;
  public env = Cash.getEnv();
  public cwd = Cash.getCwd();
  public stdout = true;
  public stderr = true;
  public type!: "unix" | "pwsh" | "cmd" | "unknown";

  public constructor(defaults?: Partial<Omit<ExecOptions, "command">>) {
    super((...args: Parameters<Cash["run"]>) => this.run(...args));
    if (Deno.build.os === "windows") {
      Object.defineProperty(this, "osType", {
        configurable: false,
        enumerable: true,
        writable: false,
        value: "windows",
      });
      this.setShell("pwsh");
    } else {
      Object.defineProperty(this, "osType", {
        configurable: false,
        enumerable: true,
        writable: false,
        value: "unix",
      });
      this.setShell("unix");
    }
    if (defaults) {
      if (typeof defaults.shell !== "undefined") this.shell = defaults.shell;
      if (typeof defaults.shellOptions !== "undefined") {
        this.shellOptions = defaults.shellOptions;
      }
      if (typeof defaults.verbose !== "undefined") {
        this.verbose = defaults.verbose;
      }
      if (typeof defaults.env !== "undefined") this.env = defaults.env;
      if (typeof defaults.cwd !== "undefined") this.cwd = defaults.cwd;
      if (typeof defaults.stdout !== "undefined") this.stdout = defaults.stdout;
      if (typeof defaults.stderr !== "undefined") this.stderr = defaults.stderr;
    }
  }

  protected setType(kind: "unix" | "pwsh" | "cmd" | "unknown"): this {
    Object.defineProperty(this, "type", {
      configurable: false,
      enumerable: true,
      writable: false,
      value: kind,
    });
    return this;
  }

  public setShell(shell: "unix" | "pwsh" | "cmd"): this;
  public setShell(executable: string, ...options: string[]): this;
  public setShell(exe: string, ...options: string[]): this {
    let path: string | undefined = "";
    let opts: string[] = [];
    let type: "unix" | "pwsh" | "cmd" | "unknown" = "unknown";
    if (exe === "cmd") {
      if (this.osType !== "windows") {
        throw new Error("Cannot use cmd.exe on non-windows systems!");
      }
      path = "cmd.exe";
      opts = ["/k"];
      type = "cmd";
    } else if (exe === "pwsh") {
      if (this.osType === "windows") {
        path = "powershell.exe";
      } else {
        path = this.__which("pwsh");
        if (!path) {
          throw new Error(
            "Can't find a powershell executable for this device!",
          );
        }
      }
      opts = ["-Command"];
      type = "pwsh";
    } else if (exe === "unix") {
      if (this.osType === "windows") {
        const PATH = (this.__path() || []).filter((_) =>
          _.includes("\\Git\\cmd")
        );
        if (PATH.length < 1) {
          throw new Error("Could not find git bash on your device!");
        }
        path = join(dirname(PATH[0]), "usr", "bin", "sh.exe");
      } else {
        path = "/bin/sh";
      }
      opts = ["-c"];
      type = "unix";
    } else {
      path = exe;
      opts = options;
      type = "unknown";
    }
    const which = this.__which(path);
    if (!which) {
      throw new Error("Shell executable not found!");
    }
    path = which;
    Object.defineProperties(this, {
      shell: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: path,
      },
      shellOptions: {
        configurable: false,
        enumerable: true,
        writable: false,
        value: opts,
      },
    });
    this.setType(type);
    return this;
  }

  protected exec(
    command: string,
    execOptions: Omit<ExecOptions, "command">,
  ): ExecLazyResult {
    return exec({ ...execOptions, command });
  }

  protected execOptions(): Omit<ExecOptions, "command"> {
    return {
      shell: this.shell,
      shellOptions: this.shellOptions,
      verbose: this.verbose,
      env: this.env,
      cwd: this.cwd,
      stdout: this.stdout,
      stderr: this.stderr,
    };
  }

  public run(pieces: TemplateStringsArray, ...args: unknown[]): ExecLazyResult;
  public run(
    command: string,
    execOptions?: Partial<Omit<ExecOptions, "command">>,
  ): ExecLazyResult;
  public run(
    arg1: TemplateStringsArray | string,
    ...args: unknown[]
  ): ExecLazyResult {
    const options = this.execOptions();
    if (Array.isArray(arg1)) {
      return this.exec(
        String.raw(arg1 as TemplateStringsArray, ...args),
        options,
      );
    }
    const command = arg1 as string;
    if (typeof args[0] === "object" && args[0] !== null) {
      for (const key in args[0]) {
        (options as Record<string, unknown>)[key] =
          (args[0] as Record<string, unknown>)[key];
      }
    }
    return this.exec(command, options);
  }

  protected pathVar() {
    return this.osType === "windows"
      ? /\\Git/g.test(this.env?.EXEPATH || "") ? "PATH" : "Path"
      : "PATH";
  }

  protected __path(): undefined | string[] {
    try {
      const _ = Deno.env.get(this.pathVar());
      if (_) return _.split(this.osType === "windows" ? ";" : ":");
    } catch {
      //
    }
  }

  protected async _path(): Promise<string[]> {
    const __ = this.__path();
    if (__) return __;

    let out!: ExecLazyResult;
    try {
      if (this.type === "cmd") {
        out = this`echo %PATH%`;
      } else if (this.type === "pwsh") {
        out = this`[Environment]::GetEnvironmentVariable(${
          this.osType === "windows" ? "Path" : "PATH"
        })`;
      } else if (this.type === "unix") {
        out = this`echo $PATH`;
      }
      if (out) {
        return (await out.stdout()).trim().split(
          this.osType === "windows" ? ";" : ":",
        );
      }
    } catch {
      //
    }
    return [];
  }

  public __which(cmd: string): string | undefined {
    try {
      if (isAbsolute(cmd) || /^\.?\.(\/|\\)/.test(cmd)) {
        const _ = resolve(this.cwd, cmd);
        return existsSync(_) ? _ : undefined;
      }
      const paths = this.__path();
      for (const path of paths || []) {
        const _ = resolve(path, cmd);
        if (existsSync(_)) return _;
      }
    } catch {
      //
    }
  }

  public async _which(cmd: string): Promise<string | undefined> {
    try {
      const __ = this.__which(cmd);
      if (__) return __;
      const paths = await this._path();
      for (const path of paths) {
        const _ = resolve(path, cmd);
        if (existsSync(_)) return _;
      }
    } catch {
      //
    }
  }

  public echo(
    pieces: TemplateStringsArray,
    ...args: unknown[]
  ): ExecLazyResult;
  public echo(
    cmd: string,
    options?: Partial<Omit<ExecOptions, "command">>,
  ): ExecLazyResult;
  public echo(
    arg1: TemplateStringsArray | string,
    ...args: unknown[]
  ): ExecLazyResult {
    const options = this.execOptions();
    let echoed = "";
    if (Array.isArray(arg1)) {
      echoed = String.raw(arg1 as TemplateStringsArray, ...args);
    } else {
      echoed = arg1 as string;
      if (typeof args[0] === "object" && args[0] !== null) {
        for (const key in args[0]) {
          (options as Record<string, unknown>)[key] =
            (args[0] as Record<string, unknown>)[key];
        }
      }
    }
    // todo(ihack2712): Escape the echoed variable.
    return this.run(
      (this.type === "pwsh" ? "Write-Output" : "echo") + " " + echoed,
      options,
    );
  }
}

export default Cash;
