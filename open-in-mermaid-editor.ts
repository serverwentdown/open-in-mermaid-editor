import browser from "webextension-polyfill";

import { notify } from "./notify";
import { actionOpen, actionCopy } from "./actions";
import { detectURL } from "./detection";
import { Code, pakoSerde, fromCode, asLiveState, getSource } from "./serde";

browser.contextMenus.create({
  id: "edit-mermaid",
  title: "Edit Mermaid",
  contexts: ["image", "link", "page", "frame"],
});

browser.contextMenus.create({
  id: "edit-mermaid-open-new-mermaid.live",
  title: "Open with mermaid.live in New Tab",
  parentId: "edit-mermaid",
});

browser.contextMenus.create({
  id: "edit-mermaid-open-current-mermaid.live",
  title: "Open with mermaid.live in Current Tab",
  parentId: "edit-mermaid",
});

if (navigator.clipboard?.writeText !== undefined) {
  browser.contextMenus.create({
    id: "edit-mermaid-copy-mermaid.live",
    title: "Copy mermaid.live URL",
    parentId: "edit-mermaid",
  });

  browser.contextMenus.create({
    id: "edit-mermaid-copy-source",
    title: "Copy Source",
    parentId: "edit-mermaid",
  });
}

interface HandleEditOptions {
  action(code: Code): Promise<void>;
}

async function handleEdit(url: string | undefined, options: HandleEditOptions) {
  const code = url ? detectURL(url) : url;
  if (!code) {
    notify("detect-fail");
    return;
  }
  await options.action(code);
}

browser.contextMenus.onClicked.addListener(async (info, _) => {
  let url;
  url ??= info.srcUrl;
  url ??= info.linkUrl;
  url ??= info.frameUrl;
  url ??= info.pageUrl;
  console.debug(`Detected URL: ${url}`);

  if (info.menuItemId === "edit-mermaid-open-new-mermaid.live") {
    await handleEdit(url, {
      async action(code) {
        const data = pakoSerde.serialize(fromCode(asLiveState(code)));
        const url = `https://mermaid.live/edit#pako:${data}`;
        await actionOpen(url, "new");
      },
    });
  } else if (info.menuItemId === "edit-mermaid-open-current-mermaid.live") {
    await handleEdit(url, {
      async action(code) {
        const data = pakoSerde.serialize(fromCode(asLiveState(code)));
        const url = `https://mermaid.live/edit#pako:${data}`;
        await actionOpen(url, "current");
      },
    });
  } else if (info.menuItemId === "edit-mermaid-copy-mermaid.live") {
    await handleEdit(url, {
      async action(code) {
        const data = pakoSerde.serialize(fromCode(asLiveState(code)));
        const url = `https://mermaid.live/edit#pako:${data}`;
        await actionCopy(url, "copy-link-success", "copy-fail");
      },
    });
  } else if (info.menuItemId === "edit-mermaid-copy-source") {
    await handleEdit(url, {
      async action(code) {
        const source = getSource(code);
        await actionCopy(source, "copy-code-success", "copy-fail");
      },
    });
  } else {
    console.error(`Unhandled menuItemId ${info.menuItemId}`);
  }
});

console.debug("Started");
