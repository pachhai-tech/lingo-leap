/* import * as francModule from "franc";
import langs from "langs"; */

console.log("content loaded");

const API_KEY = "API-KEY";

async function processSelectedText(operation, targetLanguage) {
  const selection = window.getSelection();

  if (selection.rangeCount) {
    const range = selection.getRangeAt(0);
    const fragment = range.cloneContents();
    const textNodes = getAllTextNodes(fragment);

    let combinedText = "";
    for (const textNode of textNodes) {
      combinedText += textNode.nodeValue + "\u200B\u200B\u200B";
    }

    const maxTokensPerBatch = 2000;
    const batches = splitTextIntoTokenBatches(combinedText, maxTokensPerBatch);

    let processedTexts = [];

    for (const batch of batches) {
      console.log("batch: ", batch);
      let promptText;
      if (operation === "translate") {
        promptText = `Translate the following text to '${targetLanguage}' language':\n\n${batch}`;
      } else if (operation === "summarize") {
        promptText = `Summarize the following text in '${targetLanguage}' language. Please provide the summary so anyone can understand:\n\n${batch}`;
      }

      const processedText = await translateOrSummarize(promptText);
      console.log("processedText: ", processedText);
      if (processedText) {
        processedTexts.push(...processedText.split("\u200B\u200B\u200B"));
      }
    }

    let newTextIndex = 0;
    for (const textNode of textNodes) {
      textNode.nodeValue = processedTexts[newTextIndex];
      newTextIndex++;
    }

    range.deleteContents();
    range.insertNode(fragment);
  }
}

function getAllTextNodes(node) {
  const allTextNodes = [];
  const treeWalker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);

  let currentNode;
  while ((currentNode = treeWalker.nextNode())) {
    allTextNodes.push(currentNode);
  }

  return allTextNodes;
}

async function translateOrSummarize(promptText) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: promptText }],
      n: 1,
      stop: null,
      temperature: 0.5,
    }),
  });

  const data = await response.json();

  console.log("data: ", JSON.stringify(data, null, 4));

  if (!response.ok) {
    console.error("API request failed:", JSON.stringify(data, null, 4));
    throw new Error(`API request failed with status ${response.status}`);
  }

  return data.choices && data.choices[0] && data.choices[0].message.content;
}

function splitTextIntoTokenBatches(text, maxTokensPerBatch) {
  const words = text.split(/\s+/);
  const batches = [];
  let currentBatch = [];

  let tokensInCurrentBatch = 0;
  for (const word of words) {
    const tokensInWord = word.length + 1; // +1 for the space or newline

    if (tokensInCurrentBatch + tokensInWord <= maxTokensPerBatch) {
      currentBatch.push(word);
      tokensInCurrentBatch += tokensInWord;
    } else {
      batches.push(currentBatch.join(" "));
      currentBatch = [word];
      tokensInCurrentBatch = tokensInWord;
    }
  }

  if (currentBatch.length > 0) {
    batches.push(currentBatch.join(" "));
  }

  return batches;
}

async function handleMessage(request, sender) {
  console.log("Received message in content script:", request);
  return new Promise(async (resolve) => {
    if (request.action) {
      const operation = request.action;
      const targetLanguage = request.targetLanguage;

      try {
        await processSelectedText(operation, targetLanguage);
        resolve({ success: true });
      } catch (error) {
        console.error("Error during operation:", error);
        resolve({ success: false, error });
      }
    } else {
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

/* function detectLanguage(text) {
  const detectedLanguageISO6393 = francModule.franc(text);
  const language = langs.where("3", detectedLanguageISO6393);
  const languageCode = language && language["1"];

  // Add this line to check if the detected language is supported by OpenAI API
  const supportedLanguages = ["en", "ne", "epo"]; // Add other supported languages here
  if (!supportedLanguages.includes(languageCode)) {
    return null;
  }

  return languageCode;
} 

async function countTokens(text) {
  const tokens = text.split(/\s+/).length;
  return tokens;
}
*/
