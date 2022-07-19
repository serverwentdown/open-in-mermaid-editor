import browser from "webextension-polyfill";

export type NotifyMessageKey =
  | "detect-fail"
  | "copy-code-success"
  | "copy-fail"
  | "current-tab-fail";

interface NotifyMessage {
  title: string;
  message: string;
}

type NotifyMessages = {
  [Key in NotifyMessageKey]: NotifyMessage;
};

const notifyMessages: NotifyMessages = {
  "detect-fail": {
    title: "Detection failed",
    message: "Could not find Mermaid code in the link or page",
  },
  "copy-code-success": {
    title: "Copied",
    message: "Mermaid code has been copied to your clipboard",
  },
  "copy-fail": {
    title: "A fatal error occurred",
    message: "Failed to copy code to clipboard",
  },
  "current-tab-fail": {
    title: "Cannot find current tab",
    message: "More than one or no tab is active",
  },
};

export async function notify(key: NotifyMessageKey) {
  const message = notifyMessages[key];
  await browser.notifications.create(key, {
    type: "basic",
    title: message.title,
    message: message.message,
  });
}
