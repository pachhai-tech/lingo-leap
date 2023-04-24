import reloadOnUpdate from "virtual:reload-on-update-in-background-script";

reloadOnUpdate("pages/background");

reloadOnUpdate("pages/content/style.scss");

chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("Extension installed");
    // Perform any additional setup or initialization here
  } else if (details.reason === "update") {
    const previousVersion = details.previousVersion;
    console.log(
      `Extension updated from version ${previousVersion} to ${
        chrome.runtime.getManifest().version
      }`
    );
    // Perform any additional update-related tasks here
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
    id: "translate",
    title: "Translate",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "translateToNepali",
    parentId: "translate",
    title: "Translate to Nepali",
    contexts: ["selection"],
  });

  createContextMenuItem({
    id: "translateToEnglish",
    parentId: "translate",
    title: "Translate to English",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log("Context menu item clicked:", info.menuItemId);

  let targetLanguage;

  if (info.menuItemId === "translateToNepali") {
    targetLanguage = "ne";
  } else if (info.menuItemId === "translateToEnglish") {
    targetLanguage = "en";
  }

  if (targetLanguage) {
    console.log("Sending message to content script:", {
      action: "translate",
      targetLanguage,
    });
    chrome.tabs.sendMessage(
      tab.id,
      { action: "translate", targetLanguage },
      (response) => {
        if (chrome.runtime.lastError) {
          console.error(chrome.runtime.lastError);
          return;
        }

        console.log("Received response from content script:", response);

        if (!response.success) {
          console.error("Error during translation:", response.error);
        } else {
          console.log("Translation successful");
        }
      }
    );
  }
});

console.log("background loaded");
