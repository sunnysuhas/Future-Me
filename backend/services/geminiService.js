const { GoogleGenerativeAI } = require('@google/generative-ai');
const config = require('../config/config');

// Initialize Gemini SDK
let genAI;
let model;

function initGenAI() {
  if (!config.geminiApiKey) {
    console.error('CRITICAL: GEMINI_API_KEY is not defined in environment variables.');
    return;
  }
  genAI = new GoogleGenerativeAI(config.geminiApiKey);
  model = genAI.getGenerativeModel({ 
    model: config.geminiModel,
    generationConfig: {
      responseMimeType: "application/json" // Force JSON output mode if supported
    }
  });
}

// Helper to clean response strings and parse JSON safely
function cleanAndParseJSON(rawText) {
  let cleanedText = rawText.trim();
  
  // Robust regex to extract JSON content inside markdown code blocks (e.g. ```json ... ```)
  const codeBlockRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = cleanedText.match(codeBlockRegex);
  if (match) {
    cleanedText = match[1].trim();
  }

  try {
    return JSON.parse(cleanedText);
  } catch (err) {
    console.warn('Standard JSON parsing failed. Attempting structural recovery...', err.message);
    
    // Find boundaries of the JSON object
    const startIndex = cleanedText.indexOf('{');
    const endIndex = cleanedText.lastIndexOf('}');
    
    if (startIndex !== -1 && endIndex !== -1 && endIndex > startIndex) {
      const recoveredJSON = cleanedText.substring(startIndex, endIndex + 1);
      try {
        return JSON.parse(recoveredJSON);
      } catch (recoveryErr) {
        console.error('Recovery parsing failed as well:', recoveryErr.message);
      }
    }
    
    throw new Error('Gemini returned an invalid JSON schema: ' + rawText.substring(0, 100) + '...');
  }
}

/**
 * Service to execute prompts and return cleaned, parsed results.
 */
const geminiService = {
  async callAPI(prompt) {
    if (!genAI || !model) {
      initGenAI();
    }
    
    if (!genAI) {
      throw new Error('Gemini API is not initialized. Check your GEMINI_API_KEY configuration.');
    }

    console.log(`[Gemini SDK] Querying ${config.geminiModel}...`);

    try {
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      });
      
      const response = await result.response;
      const text = response.text();
      
      if (!text) {
        throw new Error('Empty response received from Gemini.');
      }
      
      return cleanAndParseJSON(text);
    } catch (error) {
      console.error('[Gemini SDK] Error during Gemini API execution:', error);
      throw error;
    }
  }
};

module.exports = geminiService;
