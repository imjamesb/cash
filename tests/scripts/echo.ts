// Imports
import $ from "../../mod.ts";

$.verbose = 3;

async function echo() {
  await $.echo`"; exit 1`;
  await $.echo`'; exit 1`;
}

try {
  console.log("Testing for Unix!");
  $.setShell("unix");
  await echo();
} catch {
  console.log("No Unix support for device!");
}

console.log("\n");

try {
  console.log("Testing for PowerShell!");
  $.setShell("pwsh");
  await echo().catch((error) =>
    console.log("PowerShell failed:", error.message)
  );
} catch {
  console.log("No PowerShell support for device!");
}

console.log("\n");

try {
  console.log("Testing for cmd!");
  $.setShell("cmd");
  await echo();
} catch {
  console.log("No cmd support for device!");
}
