/**
 * Frontend Configuration Settings
 */
const CONFIG = {
  // Compute base API dynamically, falling back to local server port if needed
  apiBaseUrl: window.location.origin + '/api',
  
  // Available Mentor Tones matching the backend lists
  mentorTones: [
    { value: 'Calm Mentor', label: 'Calm Mentor (Wise, patient)' },
    { value: 'Motivational', label: 'Motivational (Energetic, high-vibe)' },
    { value: 'Brutally Honest', label: 'Brutally Honest (No excuses)' },
    { value: 'CEO Mode', label: 'CEO Mode (Strategic, metrics)' },
    { value: 'Stoic Philosopher', label: 'Stoic Philosopher (Calm, logical)' },
    { value: 'Spiritual Guide', label: 'Spiritual Guide (Mindful, alignment)' },
    { value: 'Elite Athlete', label: 'Elite Athlete (Discipline, performance)' },
    { value: 'Scientist', label: 'Scientist (Hypothesis, data)' },
    { value: 'Visionary Founder', label: 'Visionary Founder (Bold, creative)' },
    { value: 'Military Discipline', label: 'Military Discipline (Duty, process)' }
  ],

  // Suggested starter queries based on user onboarding
  defaultSuggestedQuestions: [
    "What's my biggest obstacle today?",
    "Tell me about a habit I need to start.",
    "Will I make it to my 5-year goal?",
    "Give me some brutally honest advice."
  ]
};
