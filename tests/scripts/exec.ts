// Imports
import exec from "../../lib/exec.ts";

console.log(
  await exec({
    shell: Deno.build.os === "windows" ? "cmd.exe" : "/bin/sh",
    shellOptions: [
      Deno.build.os === "windows" ? "/k" : "-c",
    ],
    command: "echo foo",
    verbose: 0,
  }).stdout(),
);

console.log(
  await exec({
    shell: Deno.build.os === "windows" ? "cmd.exe" : "/bin/sh",
    shellOptions: [
      Deno.build.os === "windows" ? "/k" : "-c",
    ],
    command: "echo bar",
    verbose: 1,
  }).stdout(),
);

console.log(
  await exec({
    shell: Deno.build.os === "windows" ? "cmd.exe" : "/bin/sh",
    shellOptions: [
      Deno.build.os === "windows" ? "/k" : "-c",
    ],
    command: "echo baz",
    verbose: 2,
  }).stdout(),
);

console.log(
  await exec({
    shell: Deno.build.os === "windows" ? "cmd.exe" : "/bin/sh",
    shellOptions: [
      Deno.build.os === "windows" ? "/k" : "-c",
    ],
    command: "echo \\\ndaz",
    verbose: 3,
  }).stdout(),
);
