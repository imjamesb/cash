// Imports
import type { Cash } from "./lib/$.ts";

declare global {
  const $: Cash;
  interface Window {
    $: Cash;
  }
}
