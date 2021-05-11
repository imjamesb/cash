// Imports
import {
  assertStrictEquals,
  assertThrowsAsync,
} from "https://deno.land/std@0.95.0/testing/asserts.ts";
import { deferred } from "../lib/utils.ts";

Deno.test("Creates and resolves a deferred promise.", async () => {
  const _ = {};
  const [promise, { resolve }] = deferred<typeof _>();
  setTimeout(() => resolve(_));
  const result = await promise;
  assertStrictEquals(result, _);
});

Deno.test("Creates and rejects a deferred promise.", async () => {
  const _ = {};
  const [promise, { reject }] = deferred<typeof _>();
  setTimeout(() => reject(new Error("Nope")));
  await assertThrowsAsync(() => promise, Error, "Nope");
});
