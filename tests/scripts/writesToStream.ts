// Imports
import { fromFileUrl } from "https://deno.land/std@0.95.0/path/mod.ts";
import { ExecLazyResult, ExecResult } from "../../lib/results.ts";

const proc = Deno.run({
  cmd: [
    "deno",
    "run",
    fromFileUrl(import.meta.url).replace(
      /\/\w+\.\w+$/,
      (str) => "/_" + str.substring(1, str.length),
    ),
  ],
  stderr: "piped",
  stdout: "piped",
});

let results: ExecResult = await new ExecLazyResult(proc);

// try {
//   results = await new ExecLazyResult(proc, Deno.stdout, Deno.stderr);
// } catch (error) {
//   results = error;
// }

console.log("\n---");
console.log(results.stdout());
console.log(results.stderr());
console.log(results.combined());
console.log(results.code());
