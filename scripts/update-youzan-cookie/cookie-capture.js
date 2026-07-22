import { randomUUID } from "node:crypto";
import { chmod, mkdir, open, rename, unlink } from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const AUTH_HOST_PARTS = ["account", "auth", "login", "oauth", "passport", "sso"];
const AUTH_PATH_PATTERN = /(?:^|\/)(?:login|oauth|passport|sso)(?:\/|$)/i;

function hostnameFromUrl(value) {
  try {
    return new URL(value).hostname.toLowerCase();
  } catch {
    return "";
  }
}

export function isAuthenticationUrl(value) {
  try {
    const parsedUrl = new URL(value);
    const hostnameParts = parsedUrl.hostname.toLowerCase().split(".");
    return (
      hostnameParts.some(part => AUTH_HOST_PARTS.includes(part)) ||
      AUTH_PATH_PATTERN.test(parsedUrl.pathname)
    );
  } catch {
    return false;
  }
}

export function cookieMatchesHostname(cookie, hostname) {
  const cookieDomain = cookie.domain.toLowerCase().replace(/^\./, "");
  const normalizedHostname = hostname.toLowerCase();
  return (
    cookieDomain.length > 0 &&
    (normalizedHostname === cookieDomain || normalizedHostname.endsWith(`.${cookieDomain}`))
  );
}

export function filterCookiesForHostname(cookies, hostname) {
  return cookies.filter(cookie => cookieMatchesHostname(cookie, hostname));
}

function delay(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

export async function waitForTargetHostname(
  page,
  targetHostname,
  { timeoutMs = 0, stabilityMs = 1_500, pollIntervalMs = 200, onStatus = () => {} } = {},
) {
  const startedAt = Date.now();
  let targetSince = null;
  let previousState;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (page.isClosed()) {
      throw new Error("浏览器页面已关闭，登录未完成");
    }

    const currentUrl = page.url();
    const currentHostname = hostnameFromUrl(currentUrl);
    const isTarget = currentHostname === targetHostname.toLowerCase();
    const state = isTarget
      ? "target"
      : isAuthenticationUrl(currentUrl)
        ? "authentication"
        : "external";

    if (state !== previousState) {
      onStatus({ state, url: currentUrl });
      previousState = state;
    }

    if (isTarget) {
      targetSince ??= Date.now();
      if (Date.now() - targetSince >= stabilityMs) {
        return currentUrl;
      }
    } else {
      targetSince = null;
    }

    if (timeoutMs > 0 && Date.now() - startedAt >= timeoutMs) {
      throw new Error(`等待登录超时（${timeoutMs} ms），Cookie 文件未更新`);
    }

    await delay(pollIntervalMs);
  }
}

async function setOwnerOnlyPermissions(filePath) {
  try {
    await chmod(filePath, 0o600);
  } catch (error) {
    if (!["ENOSYS", "ENOTSUP", "EPERM"].includes(error.code)) {
      throw error;
    }
  }
}

export async function writeJsonAtomically(outputPath, value) {
  const outputDirectory = path.dirname(outputPath);
  const temporaryPath = path.join(
    outputDirectory,
    `.${path.basename(outputPath)}.${process.pid}.${randomUUID()}.tmp`,
  );
  await mkdir(outputDirectory, { recursive: true });

  let temporaryFile;
  try {
    temporaryFile = await open(temporaryPath, "wx", 0o600);
    await temporaryFile.writeFile(`${JSON.stringify(value, null, 2)}\n`, "utf8");
    await temporaryFile.sync();
    await temporaryFile.close();
    temporaryFile = undefined;
    await setOwnerOnlyPermissions(temporaryPath);
    await rename(temporaryPath, outputPath);
  } catch (error) {
    if (temporaryFile) {
      await temporaryFile.close().catch(() => {});
    }
    await unlink(temporaryPath).catch(() => {});
    throw error;
  }
}

function reportNavigationStatus(logger, targetHostname, { state, url }) {
  if (state === "target") {
    logger.log(`已到达目标域名 ${targetHostname}，正在确认页面不再跳转...`);
    return;
  }

  const redirectType = state === "authentication" ? "有赞登录/OAuth/SSO" : "外部页面";
  logger.log(`检测到${redirectType}跳转：${url}`);
  logger.log(`请在浏览器中完成登录，脚本将等待返回 ${targetHostname}。`);
}

export async function captureAndSaveCookies(
  options,
  { browserLauncher = chromium, logger = console, stabilityMs = 1_500 } = {},
) {
  const sourceUrl = new URL(options.webUrl);
  const targetHostname = sourceUrl.hostname.toLowerCase();
  let context;

  try {
    logger.log(`正在启动 Chromium，浏览器资料目录：${options.profileDir}`);
    context = await browserLauncher.launchPersistentContext(options.profileDir, {
      headless: options.headless,
      viewport: null,
    });

    const page = context.pages()[0] ?? (await context.newPage());
    logger.log(`正在打开：${sourceUrl.href}`);
    await page.goto(sourceUrl.href, { waitUntil: "domcontentloaded" });

    await waitForTargetHostname(page, targetHostname, {
      timeoutMs: options.loginTimeoutMs,
      stabilityMs,
      onStatus: status => reportNavigationStatus(logger, targetHostname, status),
    });

    const allCookies = await context.cookies();
    const cookies = filterCookiesForHostname(allCookies, targetHostname);
    if (cookies.length === 0) {
      throw new Error(`未找到适用于 ${targetHostname} 的 Cookie，Cookie 文件未更新`);
    }

    const payload = {
      sourceUrl: sourceUrl.href,
      hostname: targetHostname,
      savedAt: new Date().toISOString(),
      cookies,
    };

    await context.close();
    context = undefined;
    await writeJsonAtomically(options.outputPath, payload);
    logger.log(`已保存 ${cookies.length} 个 Cookie：${options.outputPath}`);
    return payload;
  } finally {
    if (context) {
      await context.close().catch(() => {});
    }
  }
}
