const express = require('express');
const router = express.Router();
const geminiService = require('../services/geminiService');
const templates = require('../prompts/templates');

/**
 * Route: POST /api/generate-futureme
 * Description: Generates the initial future self identity, mantra, check-lists and goals.
 */
router.post('/generate-futureme', async (req, res, next) => {
  try {
    const profile = req.body;

    // Validation
    if (!profile.name || !profile.dream || !profile.currentGoal) {
      return res.status(400).json({
        success: false,
        message: "Profile details are incomplete. Please fill out Name, Dream, and Goal."
      });
    }

    // Construct prompt
    const prompt = templates.getGenerationPrompt(profile);

    // Call Gemini
    const result = await geminiService.callAPI(prompt);
    
    // Return standard response
    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Route: POST /api/chat
 * Description: Handles chat messaging, maintaining conversation context.
 */
router.post('/chat', async (req, res, next) => {
  try {
    const { profile, history, message, tone } = req.body;

    // Validation
    if (!profile || !message) {
      return res.status(400).json({
        success: false,
        message: "Missing profile or message context for conversation."
      });
    }

    // Construct prompt
    const activeTone = tone || profile.mentorTone || 'Calm Mentor';
    const activeHistory = history || [];
    
    const prompt = templates.getChatPrompt(profile, activeHistory, message, activeTone);

    // Call Gemini
    const result = await geminiService.callAPI(prompt);

    return res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
