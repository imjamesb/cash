// Imports
import $Error from "./$.Error.ts";

class Err extends $Error {
  public constructor(message?: string) {
    super(message);
    this.removeTraceItem(0);
  }
}

export class ProcessOutput extends Err {
  #stdout: string;
  #stderr: string;
  #combined: string;
  #status: Deno.ProcessStatus;
  public constructor(
    stdout: string,
    stderr: string,
    combined: string,
    status: Deno.ProcessStatus,
  ) {
    super(
      status.success
        ? "No error here!"
        : "Exited with status code " + status.code + "!",
    );
    this.#stdout = stdout;
    this.#stderr = stderr;
    this.#combined = combined;
    this.#status = status;
  }
  public get stdout() {
    return this.#stdout;
  }
  public get stderr() {
    return this.#stderr;
  }
  public get combined() {
    return this.#combined;
  }
  public get code() {
    return this.#status.code;
  }
  public get success() {
    return this.#status.success;
  }
  public get signal() {
    return this.#status.signal;
  }
}

export default ProcessOutput;
