import browser from "webextension-polyfill";

import { notify } from "./notify";
import { actionOpen, actionCopy } from "./actions";
import { detectURL } from "./detection";
import { Code, pakoSerde, fromCode, getSource } from "./serde";

browser.contextMenus.create({
  id: "edit-mermaid",
  title: "Edit Mermaid",
  contexts: ["image", "link", "page", "frame"],
});

browser.contextMenus.create({
  id: "edit-mermaid-open-new-mermaid.link",
  title: "Open with mermaid.link in new tab",
  parentId: "edit-mermaid",
});

browser.contextMenus.create({
  id: "edit-mermaid-open-current-mermaid.link",
  title: "Open with mermaid.link in current tab",
  parentId: "edit-mermaid",
});

browser.contextMenus.create({
  id: "edit-mermaid-copy-source",
  title: "Copy Source",
  parentId: "edit-mermaid",
});

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

  if (info.menuItemId === "edit-mermaid-open-new-mermaid.link") {
    await handleEdit(url, {
      async action(code) {
        const data = pakoSerde.serialize(fromCode(code));
        await actionOpen(`https://mermaid.live/edit#pako:${data}`, "new");
      },
    });
  } else if (info.menuItemId === "edit-mermaid-open-current-mermaid.link") {
    await handleEdit(url, {
      async action(code) {
        const data = pakoSerde.serialize(fromCode(code));
        await actionOpen(`https://mermaid.live/edit#pako:${data}`, "current");
      },
    });
  } else if (info.menuItemId === "edit-mermaid-copy-source") {
    await handleEdit(url, {
      async action(code) {
        const source = getSource(code);
        await actionCopy(source, "copy-code-success", "copy-fail");
      },
    });
  }
});

console.debug("Started");