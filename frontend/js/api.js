/**
 * API Service for communicating with the FutureMe Express backend
 */
const ApiService = {
  /**
   * Helper to perform HTTP POST requests with standard headers
   */
  async _post(endpoint, body) {
    try {
      const response = await fetch(`${CONFIG.apiBaseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      const result = await response.json();
      
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Server error occurred');
      }
      
      return result.data;
    } catch (error) {
      console.error(`API Error on ${endpoint}:`, error);
      // Map raw API exceptions to custom UX friendly reflections warning
      throw new Error(
        error.message.includes('Failed to fetch') 
          ? "Connection issue. Your Future Mentor is reflecting. Please check if your server is running and try again." 
          : "Your Future Mentor is reflecting. Please try again in a moment."
      );
    }
  },

  /**
   * Generates the initial Future Identity and Dashboard metrics
   * @param {Object} profile - User onboarding choices
   */
  async generateFutureMe(profile) {
    return this._post('/generate-futureme', profile);
  },

  /**
   * Sends a chat message and returns the updated mentor response and updated metrics
   * @param {Object} profile - User profile config
   * @param {Array} history - Previous messages array
   * @param {String} message - New text message from present self
   * @param {String} tone - Active mentor tone overrides
   */
  async sendChatMessage(profile, history, message, tone) {
    return this._post('/chat', {
      profile,
      history,
      message,
      tone
    });
  }
};
