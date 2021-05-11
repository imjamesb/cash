// Imports
import { assertStrictEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import MockProcess from "./MockProcess.ts";
import { ExecLazyResult, ExecResult } from "../lib/results.ts";

Deno.test("Get values from <ExecResult>.", () => {
  const result = new ExecResult("foo", "bar", "foobar", true, 0);
  assertStrictEquals(result.success(), true);
  assertStrictEquals(result.code(), 0);
  assertStrictEquals(result.signal(), undefined);
  assertStrictEquals(result.stdout(), "foo");
  assertStrictEquals(result.stderr(), "bar");
  assertStrictEquals(result.combined(), "foobar");
});

Deno.test("Creates a bad finished result.", () => {
  const result = new ExecResult("foo", "bar", "foobar", false, 1, 1);
  assertStrictEquals(result.success(), false);
  assertStrictEquals(result.code(), 1);
  assertStrictEquals(result.signal(), 1);
  assertStrictEquals(result.stdout(), "foo");
  assertStrictEquals(result.stderr(), "bar");
  assertStrictEquals(result.combined(), "foobar");
});

Deno.test("Creates a lazy result and resolves.", async () => {
  const proc = new MockProcess(0, "foo", "bar");
  const result = await new ExecLazyResult(proc as unknown as Deno.Process);
  assertStrictEquals(result.success(), true);
  assertStrictEquals(result.code(), 0);
  assertStrictEquals(result.signal(), undefined);
  assertStrictEquals(result.stdout(), "foo");
  assertStrictEquals(result.stderr(), "bar");
  assertStrictEquals(result.combined(), "foobar");
});

Deno.test("Lazily gets results.", async () => {
  const proc = new MockProcess(0, "foo", "bar");
  const result = new ExecLazyResult(proc as unknown as Deno.Process);
  assertStrictEquals(await result.success(), true);
  assertStrictEquals(await result.code(), 0);
  assertStrictEquals(await result.signal(), undefined);
  assertStrictEquals(await result.stdout(), "foo");
  assertStrictEquals(await result.stderr(), "bar");
  assertStrictEquals(await result.combined(), "foobar");
});

Deno.test("ExecLazyResult writes to stream.", async () => {
  // todo: test this.
});
