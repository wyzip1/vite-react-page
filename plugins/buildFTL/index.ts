import { writeFileSync } from "fs";
import { resolve, parse } from "path";
import child_process from "child_process";
import * as utils from "./utils.js";
import { mkdirp } from "mkdirp";

import type { Plugin } from "vite";
import type { OutputAsset } from "rollup";

interface DataMark {
  file: string;
  src: string;
  isEntry?: boolean;
  css?: string[];
  assets?: string[];
  imports?: string[];
}

interface ManifestJSON {
  [filename: string]: DataMark;
}

interface BuildFTLProps {
  ftlDir: string;
}

function getAppName() {
  const remote = child_process.execSync("git remote -v").toString("utf8");
  const appNameArr = remote.split("/").pop()?.split(".");
  return appNameArr?.slice(0, appNameArr.length - 1).join("/");
}

export default ({ ftlDir }: BuildFTLProps): Plugin => ({
  name: "vite:buildFTL",
  async writeBundle(options, bundle) {
    mkdirp.sync(ftlDir);

    const manifest = bundle["manifest.json"] as OutputAsset;
    const manifestJSON: ManifestJSON = JSON.parse(manifest.source as string);
    for (const key in manifestJSON) {
      const value = manifestJSON[key];
      if (!value.isEntry) continue;
      const enterHTML = bundle[value.src] as OutputAsset;
      const filename = parse(value.src).name;
      writeFileSync(resolve(process.cwd(), ftlDir, filename + ".ftl"), enterHTML.source);
    }

    const fileList = Object.keys(bundle);

    utils.uploadCdn(fileList, options.dir);
  },
});

export const publicPath = `https://file.yzcdn.cn/mall-cloud/${getAppName()}/`;
