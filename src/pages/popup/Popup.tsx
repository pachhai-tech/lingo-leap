import "@pages/popup/Popup.css";
import { useState } from "react";

const Popup = () => {
  const [targetLanguage, setTargetLanguage] = useState("en");

  const handleTranslate = async (action) => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs || !tabs.length) {
        console.error("Failed to get active tab");
        return;
      }
      const tab = tabs[0];
      if (
        tab.url &&
        (tab.url.startsWith("chrome://") ||
          tab.url.startsWith("chrome-extension://"))
      ) {
        console.error(
          "Cannot inject content script into restricted URL:",
          tab.url
        );
        return;
      }

      const injectContentScript = () => {
        return new Promise<void>((resolve, reject) => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tab.id },
              files: ["content.js"],
            },
            () => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve();
              }
            }
          );
        });
      };

      const sendMessageToContentScript = () => {
        const message = {
          action: action,
          targetLanguage: targetLanguage,
        };
        return new Promise((resolve, reject) => {
          chrome.tabs.sendMessage(tab.id, message, (response) => {
            if (chrome.runtime.lastError) {
              reject(chrome.runtime.lastError);
            } else {
              resolve(response);
            }
          });
        });
      };

      injectContentScript()
        .then(sendMessageToContentScript)
        .catch((error) => {
          console.error("Error:", error);
        });
    });
  };

  const handleTranslateSelectedText = async () => {
    handleTranslate("translateSelection");
  };

  const handleTranslatePage = async () => {
    handleTranslate("translatePage");
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lingo Leap</h1>
        <p>Select your target language:</p>
        <select
          value={targetLanguage}
          onChange={(e) => setTargetLanguage(e.target.value)}
        >
          <option value="English">English</option>
          <option value="Nepali">Nepali</option>
          {/* Add more language options here */}
        </select>
        <button onClick={handleTranslatePage}>Translate Page</button>
        <button onClick={handleTranslateSelectedText}>
          Translate Selected Text
        </button>
      </header>
    </div>
  );
};

export default Popup;
