function mockReadStream(data?: string): Deno.Reader & Deno.Closer {
  if (!data) {
    return {
      read() {
        return Promise.resolve(null);
      },
      close() {},
    };
  }
  return {
    read(array: Uint8Array) {
      if (!data) return Promise.resolve(null);
      const len = Math.min(array.length, data!.length);
      const buffer = new TextEncoder().encode(
        data!.substring(0, len),
      );
      data = data!.substring(len, data!.length);
      for (let i = 0; i < buffer.length; i++) {
        array[i] = buffer[i];
      }
      if (data.length === 0) return Promise.resolve(null);
      return Promise.resolve(data.length);
    },
    close() {
      this.read = () => Promise.resolve(null);
    },
  };
}

export default class MockProcess {
  #signal?: number;
  #success: boolean;
  #code: number;
  #stdout?: string;
  #stderr?: string;
  close() {
    if (this.stdout) this.stdout.close();
    if (this.stderr) this.stderr.close();
  }
  public stdout: Deno.Reader & Deno.Closer | null = null;
  public stderr: Deno.Reader & Deno.Closer | null = null;
  public stdin = null;
  public rid = -1;
  public pid = -1;
  public constructor(
    code: number,
    stdout?: string,
    stderr?: string,
    signal?: number,
  ) {
    let success = false;
    code = Math.floor(code);
    if (code < 1) code = 0;
    if (code === 0) success = true;
    if (!success) this.#signal = signal;
    this.#success = success;
    this.#code = code;
    this.#stdout = stdout;
    this.#stderr = stderr;
    if (stdout) this.stdout = mockReadStream(stdout);
    if (stderr) this.stderr = mockReadStream(stderr);
  }
  //public kill(_signal?: number) {}
  //public output(): Promise<Uint8Array> {
  //  return Promise.resolve(new TextEncoder().encode(this.#stdout));
  //}
  //public stderrOutput(): Promise<Uint8Array> {
  //  return Promise.resolve(new TextEncoder().encode(this.#stderr));
  //}
  public status(): Promise<Deno.ProcessStatus> {
    return Promise.resolve({
      code: this.#code,
      success: this.#success,
      signal: this.#signal,
      // deno-lint-ignore no-explicit-any
    } as any);
  }
}
