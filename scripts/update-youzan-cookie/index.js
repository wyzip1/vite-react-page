import path from "node:path";
import { pathToFileURL } from "node:url";
import { captureAndSaveCookies } from "./cookie-capture.js";
import { loadOptions } from "./config.js";

export async function main(args = process.argv.slice(2)) {
  const options = await loadOptions(args);
  if (options.help) {
    console.log(options.usage);
    return;
  }
  await captureAndSaveCookies(options);
}

const isEntryPoint =
  process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href;

if (isEntryPoint) {
  main().catch(error => {
    console.error(`执行失败：${error.message}`);
    process.exitCode = 1;
  });
}
