import * as francModule from "franc";

console.log("content loaded");

(function () {
  if (window.__contentScriptInjected) return;
  window.__contentScriptInjected = true;

  async function translatePage(targetLanguage) {
    const sourceLanguage = detectLanguage(document.body.innerText);
    const textNodes = [];
    getTextNodes(document.body, textNodes);

    const batchSize = 5;
    const batches = [];
    for (let i = 0; i < textNodes.length; i += batchSize) {
      batches.push(textNodes.slice(i, i + batchSize));
    }

    for (const batch of batches) {
      const texts = batch.map((node) => node.textContent);
      const translatedTexts = await fetchTranslation(
        texts.join("\n"),
        sourceLanguage,
        targetLanguage
      );
      const translatedTextNodes = translatedTexts.split("\n");
      for (let i = 0; i < batch.length; i++) {
        batch[i].textContent = translatedTextNodes[i];
      }
    }
  }

  async function translateSelectedText(targetLanguage) {
    const selectedText = window.getSelection().toString();
    const sourceLanguage = detectLanguage(selectedText);
    const texts = selectedText.split("\n");
    const batchSize = 10; // Increase the batch size to process more text at once
    const batches = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      batches.push(texts.slice(i, i + batchSize));
    }

    let translatedTexts = [];

    for (const batch of batches) {
      const translatedBatch = await fetchTranslation(
        batch.join("\n"),
        sourceLanguage,
        targetLanguage
      );
      translatedTexts.push(...translatedBatch.split("\n"));
    }

    // Replace the selected text with the translated text
    const selection = window.getSelection();
    if (selection.rangeCount) {
      const range = selection.getRangeAt(0);
      const newNode = document.createTextNode(translatedTexts.join("\n"));
      range.deleteContents();
      range.insertNode(newNode);
    }
  }

  function getTextNodes(node, textNodes) {
    if (node.nodeType === Node.TEXT_NODE) {
      textNodes.push(node);
    } else {
      for (const child of node.childNodes) {
        getTextNodes(child, textNodes);
      }
    }
  }

  async function fetchTranslation(text, sourceLanguage, targetLanguage) {
    const API_KEY = "";
    const response = await fetch(
      "https://api.openai.com/v1/engines/text-davinci-003/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `Translate the following text in ${sourceLanguage} to ${targetLanguage}:\n\n${text}`,
          max_tokens: 1000,
          n: 1,
          stop: null,
          temperature: 0.5,
        }),
      }
    );

    if (!response.ok) {
      console.error("API request failed:", response);
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data.choices && data.choices[0] && data.choices[0].text.trim();
  }

  function detectLanguage(text) {
    const detectedLanguage = francModule.franc(text);
    return detectedLanguage;
  }

  async function handleMessage(request, sender) {
    return new Promise(async (resolve) => {
      if (request.action === "translatePage") {
        const targetLanguage = request.targetLanguage;
        console.log(`Selected language: ${targetLanguage}`);

        try {
          await translatePage(targetLanguage);
          resolve({ success: true });
        } catch (error) {
          console.error("Error during translation:", error);
          resolve({ success: false, error });
        }
      } else if (request.action === "translateSelection") {
        const targetLanguage = "Nepali"; // You can replace this with the target language you want
        try {
          await translateSelectedText(targetLanguage);
          resolve({ success: true });
        } catch (error) {
          console.error("Error during translation:", error);
          resolve({ success: false, error });
        }
      }
    });
  }

  chrome.runtime.onMessage.removeListener(handleMessage);
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    handleMessage(request, sender).then(sendResponse);
    return true;
  });
})();

/* async function fetchTranslation(text, targetLanguage) {
  const response = await fetch("https://your-backend-server.com/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      text: text,
      targetLanguage: targetLanguage,
    }),
  });

  const data = await response.json();
  return data.translatedText;
} */
