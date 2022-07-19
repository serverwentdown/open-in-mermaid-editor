import browser from "webextension-polyfill";

declare global {
  const chrome: {
    clipboard: {
      writeText: any;
    };
  };
}

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
    await navigator.clipboard.writeText(text);
    await notify(successMessage);
  } catch (error) {
    await notify(failMessage, { error: error as Error });
  }
}
