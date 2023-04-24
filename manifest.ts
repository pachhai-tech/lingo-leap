import packageJson from "./package.json";

const manifest: chrome.runtime.ManifestV3 = {
  manifest_version: 3,
  name: "Lingo Leap",
  version: packageJson.version,
  description: packageJson.description,
  background: {
    service_worker: "background.js",
    type: "module",
  },
  content_scripts: [
    {
      matches: ["<all_urls>"],
      js: ["content.js"],
      run_at: "document_end",
    },
  ],
  host_permissions: ["*://*/*"],
  permissions: ["activeTab", "storage", "scripting", "tabs", "contextMenus"],
  action: {
    default_icon: "icon-34.png",
    default_title: "Lingo Leap",
    // default_popup: "src/pages/popup/index.html",
  },
  options_page: "src/pages/options/index.html",
  chrome_url_overrides: {
    newtab: "src/pages/newtab/index.html",
  },
  icons: {
    "128": "icon-128.png",
  },
  devtools_page: "src/pages/devtools/index.html",
  web_accessible_resources: [
    {
      resources: [
        "assets/js/*.js",
        "assets/css/*.css",
        "icon-128.png",
        "icon-34.png",
      ],
      matches: ["*://*/*"],
    },
  ],
};

export default manifest;
