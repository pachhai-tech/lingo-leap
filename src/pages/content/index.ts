import * as francModule from "franc";
import langs from "langs";

console.log("content loaded");

async function translateSelectedText(targetLanguage) {
  const selectedText = window.getSelection().toString();
  const sourceLanguage = detectLanguage(selectedText);

  if (!sourceLanguage) {
    console.error("Unsupported language detected. Translation aborted.");
    return;
  }

  const tokensInSelectedText = await countTokens(selectedText);

  if (tokensInSelectedText > 4000) {
    console.warn(
      "Selected text is too long. Please select a shorter text and try again."
    );
    return;
  }

  console.log(
    `sourceLanguage: ${sourceLanguage} to targetLanguage: ${targetLanguage}`
  );

  // Translate the entire selected text at once
  const translatedText = await fetchTranslation(
    selectedText,
    sourceLanguage,
    targetLanguage
  );

  // Replace the selected text with the translated text
  const selection = window.getSelection();
  if (selection.rangeCount) {
    const range = selection.getRangeAt(0);
    const newNode = document.createTextNode(translatedText);
    range.deleteContents();
    range.insertNode(newNode);
  }
}

async function fetchTranslation(text, sourceLanguage, targetLanguage) {
  const API_KEY = "API-KEY";

  const response = await fetch(
    "https://api.openai.com/v1/engines/text-davinci-003/completions",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        prompt: `Translate the following text from '${sourceLanguage}' to '${targetLanguage}':\n\n${text}`,
        max_tokens: 4000,
        n: 1,
        stop: null,
        temperature: 0.5,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    console.error("API request failed:", JSON.stringify(data, null, 4));
    throw new Error(`API request failed with status ${response.status}`);
  }

  console.log("Translated text: ", JSON.stringify(data, null, 4));
  return data.choices && data.choices[0] && data.choices[0].text.trim();
}

function detectLanguage(text) {
  const detectedLanguageISO6393 = francModule.franc(text);
  const language = langs.where("3", detectedLanguageISO6393);
  const languageCode = language && language["1"];

  // Add this line to check if the detected language is supported by OpenAI API
  const supportedLanguages = ["en", "ne"]; // Add other supported languages here
  if (!supportedLanguages.includes(languageCode)) {
    return null;
  }

  return languageCode;
}

async function countTokens(text) {
  const tokens = text.split(/\s+/).length;
  return tokens;
}

async function handleMessage(request, sender) {
  console.log("Received message in content script:", request);
  return new Promise(async (resolve) => {
    if (request.action === "translate") {
      const targetLanguage = request.targetLanguage;

      try {
        await translateSelectedText(targetLanguage);
        resolve({ success: true });
      } catch (error) {
        console.error("Error during translation:", error);
        resolve({ success: false, error });
      }
    } else {
      // Add this line to handle unexpected actions
      resolve({
        success: false,
        error: `Unexpected action: ${request.action}`,
      });
    }
  });
}

chrome.runtime.onMessage.removeListener(handleMessage);
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  handleMessage(request, sender).then(sendResponse);
  return true;
});

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
