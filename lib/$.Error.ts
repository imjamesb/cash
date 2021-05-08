// Imports
import { CustomStack } from "https://deno.land/x/cstack@0.4.2/mod.ts";

export class $Error extends CustomStack {
  name = "$";
}

export default $Error;
