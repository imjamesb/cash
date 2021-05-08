#!/usr/bin/env deno run -A --allow-read
/// <reference path="./types.d.ts" />
import $ from "./mod.ts";

const file = Deno.args[0];

window.$ = $;
(globalThis as Record<string, unknown>).$ = $;

if (file) {
  await import(file);
} else {
  console.log("usage: cash <script>");
}
