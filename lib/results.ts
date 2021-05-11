// Imports
import { iter } from "https://deno.land/std@0.95.0/io/util.ts";
import { deferred } from "../lib/utils.ts";

/**
 * These are the finished results of an execution, you don't have to `await`
 * these values.
 */
export class ExecResult {
  protected name = "ExecResult";
  protected message?: string;
  #stdout: string;
  #stderr: string;
  #combined: string;
  #success: boolean;
  #code: number;
  #signal?: number;
  /**
   * Initiate the result object.
   * @param stdout The *stdout* string.
   * @param stderr The *stderr* string.
   * @param combined A combination of the *stdout* and *stderr* strings.
   * @param success Whether or not the process succeeded.
   * @param code The status code the process exited with.
   * @param signal The failure signal.
   */
  public constructor(
    stdout: string,
    stderr: string,
    combined: string,
    success: boolean,
    code: number,
    signal?: number,
  ) {
    this.#stdout = stdout;
    this.#stderr = stderr;
    this.#combined = combined;
    this.#success = success;
    this.#code = code;
    this.#signal = signal;
    if (!success) {
      this.message = "Process returned with a non-zero exit code!";
      Error.captureStackTrace(this, ExecResult);
    }
    Object.seal(Object.freeze(this));
  }
  /** Get the *stdout* string. */
  public stdout(): string {
    return this.#stdout;
  }
  /** Get the *stderr* string. */
  public stderr(): string {
    return this.#stderr;
  }
  /** Get the combination of *stdout* and *stderr* strings. */
  public combined(): string {
    return this.#combined;
  }
  /** Whether or not the success returned a zero-exit code. */
  public success(): boolean {
    return this.#success;
  }
  /** The process' exit-code. */
  public code(): number {
    return this.#code;
  }
  /** The process' dying signal. */
  public signal(): number | undefined {
    return this.#signal;
  }
}

/**
 * The ExecLazyResult is an object that mimics the ExecResult object, however
 * instead of returning the exec result values it returns promises that
 * resolves them when the results are done.
 */
export class ExecLazyResult {
  #promise: Promise<ExecResult>;
  /**
   * Get results from a process.
   * @param proc The process to get results from.
   * @param stdoutStream A stream to write the process' *stdout* stream to.
   * *Stdout* will always be available through `.stdout()`.
   * @param stderrStreamA stream to write the process' *stderr* stream to.
   * *Stderr* will always be available through `.stderr()`.
   */
  public constructor(
    proc: Deno.Process<Deno.RunOptions>,
    stdoutStream?: Deno.Writer,
    stderrStream?: Deno.Writer,
  ) {
    const [promise, { resolve, reject }] = deferred<ExecResult>();
    this.#promise = promise;
    promise.finally();

    const out: number[] = [];
    const err: number[] = [];
    const com: number[] = [];
    let success!: boolean;
    let code!: number;
    let signal!: number | undefined;
    const promises: Promise<unknown>[] = [];

    if (proc.stdout) {
      promises.push((async () => {
        for await (const data of iter(proc.stdout!)) {
          for (const byte of data) {
            out.push(byte);
            com.push(byte);
          }
          if (stdoutStream) await stdoutStream.write(data);
        }
      })());
    }

    if (proc.stderr) {
      promises.push((async () => {
        for await (const data of iter(proc.stderr!)) {
          for (const byte of data) {
            err.push(byte);
            com.push(byte);
          }
          if (stderrStream) await Deno.stderr.write(data);
        }
      })());
    }

    proc.status()
      .then((status: Deno.ProcessStatus) => {
        success = status.success;
        code = status.code;
        signal = status.signal;
      }).catch(() => {
        success = false;
        code = 1;
      }).finally(() => Promise.all(promises))
      .catch(() => {})
      .finally(() => {
        const result = new ExecResult(
          new TextDecoder().decode(new Uint8Array(out)),
          new TextDecoder().decode(new Uint8Array(err)),
          new TextDecoder().decode(new Uint8Array(com)),
          success,
          code,
          signal,
        );
        if (result.success()) return resolve(result);
        reject(result);
      });
  }

  public then(
    onfulfilled?: (result: ExecResult) => unknown,
    // deno-lint-ignore no-explicit-any
    onrejected?: (reason: any) => unknown,
  ) {
    return this.#promise.then(onfulfilled, onrejected);
  }

  // deno-lint-ignore no-explicit-any
  public catch(onrejected?: (reason: any) => unknown) {
    return this.#promise.catch(onrejected);
  }

  public finally(onfinally?: () => unknown) {
    return this.#promise.finally(onfinally);
  }

  /** Get the *stdout* string. */
  public async stdout(): Promise<string> {
    const result = await this;
    return result.stdout();
  }

  /** Get the *stderr* string. */
  public async stderr(): Promise<string> {
    const result = await this;
    return result.stderr();
  }

  /** Get the combination of *stdout* and *stderr* strings. */
  public async combined(): Promise<string> {
    const result = await this;
    return result.combined();
  }

  /** Whether or not the success returned a zero-exit code. */
  public async success(): Promise<boolean> {
    const result = await this;
    return result.success();
  }

  /** The process' exit-code. */
  public async code(): Promise<number> {
    const result = await this;
    return result.code();
  }

  /** The process' dying signal. */
  public async signal(): Promise<number | undefined> {
    const result = await this;
    return result.signal();
  }
}

export default ExecLazyResult;
