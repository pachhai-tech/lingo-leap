import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");
reloadOnUpdate("pages/content/style.scss");

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Extension installed");
  } else if (details.reason === "update") {
    const previousVersion = details.previousVersion;
    console.log(
      `Extension updated from version ${previousVersion} to ${
        chrome.runtime.getManifest().version
      }`
    );
  }
});

function createContextMenuItem(options) {
  chrome.contextMenus.create(options, () => {
    if (chrome.runtime.lastError) {
      console.error(chrome.runtime.lastError);
    }
  });
}

chrome.runtime.onInstalled.addListener(() => {
  createContextMenuItem({
    id: "lingoLeap",
    title: "Lingo Leap",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "translate",
    parentId: "lingoLeap",
    title: "Translate",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "summarize",
    parentId: "lingoLeap",
    title: "Summarize",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "translateToEnglish",
    parentId: "translate",
    title: "Translate to English",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "translateToNepali",
    parentId: "translate",
    title: "Translate to Nepali",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "translateToSpanish",
    parentId: "translate",
    title: "Translate to Spanish",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "summarizeInEnglish",
    parentId: "summarize",
    title: "Summarize in English",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "summarizeInNepali",
    parentId: "summarize",
    title: "Summarize in Nepali",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "summarizeInSpanish",
    parentId: "summarize",
    title: "Summarize in Spanish",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu item clicked:", info.menuItemId);

  let operation;
  let targetLanguage;

  const menuItemId = info.menuItemId as string; // Add this line

  if (menuItemId.startsWith("translate")) {
    operation = "translate";
  } else if (menuItemId.startsWith("summarize")) {
    operation = "summarize";
  }

  if (menuItemId.endsWith("Nepali")) {
    targetLanguage = "Nepali";
  } else if (menuItemId.endsWith("English")) {
    targetLanguage = "English";
  } else if (menuItemId.endsWith("Spanish")) {
    targetLanguage = "Spanish";
  }

  if (operation && targetLanguage) {
    console.log("Sending message to content script:", {
      action: operation,
      targetLanguage,
    });
    chrome.tabs.sendMessage(
      tab.id,
      { action: operation, targetLanguage },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        console.log("Received response from content script:", response);

        if (!response.success) {
          console.error("Error during operation:", response.error);
        } else {
          console.log("Operation successful");
        }
      }
    );
  }
});

console.log("background loaded");
