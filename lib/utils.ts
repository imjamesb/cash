/**
 * Generate a deferred promise giving you access to both the promise and the
 * `resolve` and `reject` functions.
 *
 * @template X The value that is resolved by the promise
 *
 * @example A simple deffered promise.
 * ```ts
 * const [promise, { resolve }] = deferred();
 * setTimeout(resolve);
 * await promise;
 * ```
 *
 * @example Reject a deferred promise.
 * ```ts
 * const [promise, { reject }] = deferred();
 * setTimeout(() => reject(new Error("Nope")));
 * await promise; // throws
 * ```
 */
// deno-lint-ignore no-explicit-any
export function deferred<X = any>(): [Promise<X>, {
  resolve: (value: X | PromiseLike<X>) => void;
  // deno-lint-ignore no-explicit-any
  reject: (reason?: any) => void;
}] {
  let resolve!: (value: X | PromiseLike<X>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<X>((resolveFn, rejectFn) => {
    resolve = resolveFn;
    reject = rejectFn;
  });
  return [promise, { resolve, reject }];
}

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export async function verbose(
  stream: Deno.Writer,
  data: string | Uint8Array,
  secrets: string[],
): Promise<void> {
  if (data instanceof Uint8Array) data = decoder.decode(data);
  for (const secret of secrets) {
    data = (data as string).replaceAll(secret, "***");
  }
  await stream.write(encoder.encode(data));
}

export function verboseSync(
  stream: Deno.WriterSync,
  data: string | Uint8Array,
  secrets: string[],
) {
  if (data instanceof Uint8Array) data = decoder.decode(data);
  for (const secret of secrets) {
    data = (data as string).replaceAll(secret, "***");
  }
  stream.writeSync(encoder.encode(data));
}
