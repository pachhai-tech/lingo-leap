import "@pages/popup/Popup.css";
import { useEffect, useState } from "react";

const Popup = () => {
  const [apiKey, setApiKey] = useState("");

  useEffect(() => {
    chrome.storage.local.get("openai_api_key", (data) => {
      if (data.openai_api_key) {
        setApiKey(data.openai_api_key);
      }
    });
  }, []);

  // Add this function to send the message when the API key is saved
  const executeContentScript = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "execute_content_script",
      });
      chrome.tabs.sendMessage(tabs[0].id, {
        message: "update_api_key",
        apiKey: apiKey,
      });
    });
  };

  // Update the saveApiKey function to call executeContentScript
  const saveApiKey = () => {
    chrome.storage.local.set({ openai_api_key: apiKey }, () => {
      if (chrome.runtime.lastError) {
        console.error(chrome.runtime.lastError);
      } else {
        console.log("API key saved");
        executeContentScript();
      }
    });
  };

  const handleChange = (e) => {
    setApiKey(e.target.value);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Lingo Leap</h1>
        <div>
          <label htmlFor="api-key-input">OpenAI API Key:</label>
          <input
            type="text"
            id="api-key-input"
            value={apiKey}
            onChange={handleChange}
          />
        </div>
        <button onClick={saveApiKey}>Save API Key</button>
      </header>
    </div>
  );
};

export default Popup;
