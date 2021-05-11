// Imports
import {
  blue,
  bold,
  green,
  red,
} from "https://deno.land/std@0.95.0/fmt/colors.ts";
import { ExecLazyResult, ExecResult } from "./results.ts";

const L1 = bold(blue("$ "));
const L2 = bold(blue("| "));
const L3F = bold(red("# "));
const L3S = bold(green("# "));

/**
 * Execute a shell-script in any given shell.
 * @param options The options to use when launching the shell.
 */
export function exec(options: ExecOptions): ExecLazyResult {
  const { shell, shellOptions, command, env, cwd } = options;
  const verbose = Number(options.verbose ?? false);
  if (verbose > 1) console.log(L1 + command.replaceAll("\n", "\n" + L2));
  const proc = Deno.run({
    cmd: [
      shell,
      ...shellOptions,
      command,
    ],
    env,
    cwd,
    stderr: options.stderr === undefined || options.stderr ? "piped" : "null",
    stdout: options.stdout === undefined || options.stdout ? "piped" : "null",
    stdin: "null",
  });
  let stdout: Deno.Writer | undefined;
  let stderr: Deno.Writer | undefined;
  if (verbose > 0) {
    stdout = Deno.stdout;
    stderr = Deno.stderr;
  }
  const result = new ExecLazyResult(proc, stdout, stderr);
  if (verbose > 2) {
    result.then((_result) =>
      console.log(L3S + "Process exited with a zero-exit code.")
    ).catch((result: ExecResult) =>
      console.log(
        L3F + "Process exited with a non zero-exit code (%d).",
        result.code(),
      )
    );
  }
  return result;
}

export default exec;

export interface ExecOptions {
  /** Which shell to launch. */
  shell: string;
  /** The options used to launch the given shell. */
  shellOptions: string[];
  /** The shell-script to execute. */
  command: string;
  /**
   * The verbose level.
   *
   * - `0` / `false` - No output.
   * - `1` / `true` - Print to stdout and stderr.
   * - `2` - Previous and print command.
   * - `3` - Previous and print exit codes.
   */
  verbose?: boolean | number;
  /** The environment variables to pass to the shell, defaults to inherit. */
  env?: Record<string, string>;
  /** Whether or not to capture stdout. */
  stdout?: boolean;
  /** Whether or not to capture stdin. */
  stderr?: boolean;
  /** The shell's current working directory. Defaults to inherit. */
  cwd?: string;
}
