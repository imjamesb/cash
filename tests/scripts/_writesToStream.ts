await Deno.stdout.write(new TextEncoder().encode("foo"));
await Deno.stderr.write(new TextEncoder().encode("bar"));
