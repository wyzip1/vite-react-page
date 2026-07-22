import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL("../../", import.meta.url));

const usage = `用法: npm start -- [选项]

选项:
  --web-url <URL>              临时覆盖 config.json 中的 webUrl
  --output-path <路径>         临时覆盖 config.json 中的 outputPath
  --profile-dir <路径>         浏览器资料目录（默认 ./.playwright-profile）
  --headless                   使用无界面模式
  --login-timeout-ms <毫秒>    登录等待超时；0 表示不限时（默认 0）
  --help                       显示帮助`;

function takeValue(args, index, option) {
  const value = args[index + 1];
  if (!value || value.startsWith("--")) {
    throw new Error(`${option} 缺少参数值`);
  }
  return value;
}

export function parseCliArgs(args) {
  const options = {
    headless: false,
    loginTimeoutMs: 0,
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    switch (argument) {
      case "--web-url":
        options.webUrl = takeValue(args, index, argument);
        index += 1;
        break;
      case "--output-path":
        options.outputPath = takeValue(args, index, argument);
        index += 1;
        break;
      case "--profile-dir":
        options.profileDir = takeValue(args, index, argument);
        index += 1;
        break;
      case "--login-timeout-ms": {
        const value = takeValue(args, index, argument);
        const timeout = Number(value);
        if (!Number.isFinite(timeout) || timeout < 0) {
          throw new Error("--login-timeout-ms 必须是大于等于 0 的数字");
        }
        options.loginTimeoutMs = timeout;
        index += 1;
        break;
      }
      case "--headless":
        options.headless = true;
        break;
      case "--help":
        options.help = true;
        break;
      default:
        throw new Error(`未知参数: ${argument}`);
    }
  }

  return options;
}

function resolveProjectPath(value, fieldName) {
  if (path.isAbsolute(value)) {
    throw new Error(`${fieldName} 必须是相对于项目根目录的路径`);
  }

  const resolvedPath = path.resolve(projectRoot, value);
  const relativePath = path.relative(projectRoot, resolvedPath);
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
    throw new Error(`${fieldName} 不能指向项目根目录之外`);
  }
  return resolvedPath;
}

function validateWebUrl(value) {
  let parsedUrl;
  try {
    parsedUrl = new URL(value);
  } catch {
    throw new Error("webUrl 必须是有效 URL");
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw new Error("webUrl 仅支持 http 或 https");
  }
  return parsedUrl.href;
}

export async function loadOptions(args = process.argv.slice(2)) {
  const cliOptions = parseCliArgs(args);
  if (cliOptions.help) {
    return { help: true, usage };
  }

  const configPath = path.join(projectRoot, "./cookie-config.json");
  let config;
  try {
    config = JSON.parse(await readFile(configPath, "utf8"));
  } catch (error) {
    throw new Error(`无法读取配置文件 ${configPath}: ${error.message}`);
  }

  const webUrl = cliOptions.webUrl ?? config.webUrl;
  const outputPath = cliOptions.outputPath ?? config.outputPath;
  if (typeof webUrl !== "string" || webUrl.length === 0) {
    throw new Error("config.json 中的 webUrl 必须是非空字符串");
  }
  if (typeof outputPath !== "string" || outputPath.length === 0) {
    throw new Error("config.json 中的 outputPath 必须是非空字符串");
  }

  const profilePath = cliOptions.profileDir ?? "./.playwright-profile";
  return {
    webUrl: validateWebUrl(webUrl),
    outputPath: resolveProjectPath(outputPath, "outputPath"),
    profileDir: resolveProjectPath(profilePath, "profile-dir"),
    headless: cliOptions.headless,
    loginTimeoutMs: cliOptions.loginTimeoutMs,
  };
}
