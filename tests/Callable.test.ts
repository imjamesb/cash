// Imports
import { assertStrictEquals } from "https://deno.land/std@0.95.0/testing/asserts.ts";
import Callable from "../lib/Callable.ts";

Deno.test("Creates a callable from Callable.", () => {
  const callable = new Callable((value: unknown) => value);
  for (let i = 0; i < 10; i++) {
    assertStrictEquals(callable(i), i);
    const random = Math.random();
    assertStrictEquals(callable(random), random);
  }
});

Deno.test("Extends callable", () => {
  class MyCallable extends Callable<(n: number) => number> {
    public constructor() {
      super((n) => n + 1);
    }
  }
  const callable = new MyCallable();
  for (let i = 0; i < 10; i++) {
    assertStrictEquals(callable(i), i + 1);
    const random = Math.random();
    assertStrictEquals(callable(random), random + 1);
  }
});
