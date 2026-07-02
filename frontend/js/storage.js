/**
 * Database-Ready Storage Service Abstraction
 * Currently uses async localStorage wrappers to simulate network/database latency.
 * Swapping this out for SQLite, Firebase, Postgres, or MongoDB later only requires changing this file.
 */
const StorageService = {
  // Key names
  KEYS: {
    PROFILE: 'futureme_profile',
    MENTOR_DATA: 'futureme_mentor_data',
    CHAT_HISTORY: 'futureme_chat_history',
    FOCUS_GOALS: 'futureme_focus_goals',
    ACTIVE_TONE: 'futureme_active_tone'
  },

  // Simulates small async delay to make it feel like a real DB / API call
  _delay(ms = 50) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },

  /**
   * Get User Profile Data
   */
  async getProfile() {
    await this._delay();
    const data = localStorage.getItem(this.KEYS.PROFILE);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Save User Profile Data
   */
  async saveProfile(profile) {
    await this._delay();
    localStorage.setItem(this.KEYS.PROFILE, JSON.stringify(profile));
    return true;
  },

  /**
   * Get generated mentor analysis payload (identity, strengths, mantras, etc.)
   */
  async getMentorData() {
    await this._delay();
    const data = localStorage.getItem(this.KEYS.MENTOR_DATA);
    return data ? JSON.parse(data) : null;
  },

  /**
   * Save generated mentor data
   */
  async saveMentorData(mentorData) {
    await this._delay();
    localStorage.setItem(this.KEYS.MENTOR_DATA, JSON.stringify(mentorData));
    return true;
  },

  /**
   * Get focus checklist goals
   */
  async getFocusGoals() {
    await this._delay();
    const data = localStorage.getItem(this.KEYS.FOCUS_GOALS);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Save focus checklist goals
   */
  async saveFocusGoals(goals) {
    await this._delay();
    localStorage.setItem(this.KEYS.FOCUS_GOALS, JSON.stringify(goals));
    return true;
  },

  /**
   * Get active conversation history
   */
  async getChatHistory() {
    await this._delay();
    const data = localStorage.getItem(this.KEYS.CHAT_HISTORY);
    return data ? JSON.parse(data) : [];
  },

  /**
   * Save full conversation history
   */
  async saveChatHistory(history) {
    await this._delay();
    localStorage.setItem(this.KEYS.CHAT_HISTORY, JSON.stringify(history));
    return true;
  },

  /**
   * Append a single chat message
   */
  async addChatMessage(sender, text, timestamp = new Date().toISOString()) {
    const history = await this.getChatHistory();
    history.push({ sender, text, timestamp });
    await this.saveChatHistory(history);
    return history;
  },

  /**
   * Get/Set active mentor tone
   */
  async getActiveTone() {
    await this._delay();
    return localStorage.getItem(this.KEYS.ACTIVE_TONE) || null;
  },

  async setActiveTone(tone) {
    await this._delay();
    localStorage.setItem(this.KEYS.ACTIVE_TONE, tone);
    return true;
  },

  /**
   * Wipes all user profile, chat, and dashboard data (Clear Conversation / Reset)
   */
  async clearAll() {
    await this._delay(100);
    Object.values(this.KEYS).forEach(key => {
      localStorage.removeItem(key);
    });
    return true;
  }
};
