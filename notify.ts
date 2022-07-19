import browser from "webextension-polyfill";

export type NotifyMessageKey =
  | "detect-fail"
  | "copy-code-success"
  | "copy-link-success"
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
  "copy-link-success": {
    title: "Copied",
    message: "Link has been copied to your clipboard",
  },
  "copy-fail": {
    title: "A fatal error occurred",
    message: "Failed to copy to clipboard",
  },
  "current-tab-fail": {
    title: "Cannot find current tab",
    message: "More than one or no tab is active",
  },
};

interface NotifyOptions {
  error?: Error | string;
}

export async function notify(key: NotifyMessageKey, options?: NotifyOptions) {
  const message = notifyMessages[key];
  let finalTitle = message.title;
  let finalMessage = message.message;
  if (options?.error) {
    finalMessage += ": " + options.error.toString();
  }
  await browser.notifications.create(key, {
    type: "basic",
    iconUrl: new URL("icon_48.png", import.meta.url).toString(),
    title: finalTitle,
    message: finalMessage,
  });
}
