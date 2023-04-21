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

chrome.contextMenus.create({
  id: "translate",
  title: "Translate",
  contexts: ["selection"],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translate") {
    chrome.tabs.sendMessage(tab.id, { action: "translateSelection" });
  }
});

console.log("background loaded");
