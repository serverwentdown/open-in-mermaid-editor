import browser from "webextension-polyfill";

import { NotifyMessageKey, notify } from "./notify";

export async function actionOpen(url: string, target: "new" | "current") {
  if (target === "new") {
    await browser.tabs.create({
      url,
    });
  } else if (target === "current") {
    const currentWindow = await browser.windows.getCurrent({ populate: true });
    const currentTabs = currentWindow.tabs?.filter((tab) => tab.active);
    if (currentTabs?.length !== 1) {
      notify("current-tab-fail");
      return;
    }
    await browser.tabs.update(currentTabs[0].id, {
      url,
    });
  }
}

export async function actionCopy(
  text: string,
  successMessage: NotifyMessageKey,
  failMessage: NotifyMessageKey
) {
  try {
    try {
      // Modern API (spotty support, but works in Firefox)
      await navigator.clipboard.writeText(text);
      // FUN FACT:
      // Before this API existed we had no access to cliboard from
      // the background page in Firefox and had to inject content script
      // into current page to copy there:
      // https://github.com/ipfs-shipyard/ipfs-companion/blob/b4a168880df95718e15e57dace6d5006d58e7f30/add-on/src/lib/copier.js#L10-L35
      // :-))
    } catch (e) {
      // Fallback to old API (works only in Chromium)
      function oncopy(event: ClipboardEvent) {
        // eslint-disable-line no-inner-declarations
        document.removeEventListener("copy", oncopy, true);
        event.stopImmediatePropagation();
        event.preventDefault();
        event.clipboardData!.setData("text/plain", text);
      }
      document.addEventListener("copy", oncopy, true);
      document.execCommand("copy");
    }
    await notify(successMessage);
  } catch (error) {
    await notify(failMessage);
  }
}
