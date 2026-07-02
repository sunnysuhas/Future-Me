require('dotenv').config();

const config = {
  port: process.env.PORT || 3000,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: 'gemini-3.5-flash',
  
  // Available mentor tones
  mentorTones: [
    'Motivational',
    'Brutally Honest',
    'Calm Mentor',
    'CEO Mode',
    'Stoic Philosopher',
    'Spiritual Guide',
    'Elite Athlete',
    'Scientist',
    'Visionary Founder',
    'Military Discipline'
  ],

  // Default communication styles
  commStyles: [
    'Direct & Action-Oriented',
    'Gentle & Empathetic',
    'Socratic & Question-Based',
    'Storytelling & Metaphorical'
  ]
};

module.exports = config;
