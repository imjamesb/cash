// Imports
import type { ProcessOutput } from "./ProcessOutput.ts";

export interface CashRunOptions {
  shell: string;
  shellOptions: string[];
  cwd: string;
  verbose: boolean | 0 | 1 | 2;
}

export type StdData = Deno.Writer & {
  data: number[];
  decode(...args: ConstructorParameters<typeof TextDecoder>): string;
};

// deno-lint-ignore no-empty-interface
export interface CashConstructorOptions extends Partial<CashRunOptions> {
  // info: This is just here, in case there will be any options in the future
  // that should only be given to the constructor and not the `Cash.launch`
  // method.
}

export type Style = (text: string) => string;
export type LaunchResult =
  & Promise<ProcessOutput>
  & Record<"stdout" | "stderr" | "combined", Promise<string>>
  & Record<"code", Promise<number>>
  & Record<"signal", Promise<number | undefined>>;
