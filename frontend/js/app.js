/**
 * FutureMe Application Orchestrator
 * Bootstraps the Single Page Application, routes click handlers, and manages memory state.
 */
const App = {
  profile: null,
  mentorData: null,
  focusGoals: [],
  chatHistory: [],
  activeTone: null,
  isGenerating: false,

  /**
   * Application Bootloader
   */
  async init() {
    // Expose App globally for inline DOM click handlers (e.g. checkbox clicks)
    window.App = this;

    // Load initial storage caches
    this.profile = await StorageService.getProfile();
    this.mentorData = await StorageService.getMentorData();
    this.focusGoals = await StorageService.getFocusGoals();
    this.chatHistory = await StorageService.getChatHistory();
    this.activeTone = await StorageService.getActiveTone() || (this.profile ? this.profile.mentorTone : 'Calm Mentor');

    UIManager.init();
    this.setupEventListeners();

    // Determine starting view
    if (this.profile && this.mentorData) {
      this.activeTone = this.profile.mentorTone;
      document.getElementById('chat-tone-selector').value = this.activeTone;
      UIManager.renderDashboard(this.profile, this.mentorData, this.focusGoals);
      UIManager.renderChatHistory(this.chatHistory);
      UIManager.showView('app');
      UIManager.showToast(`Welcome back, ${this.profile.name}. Link restored.`, 'success');
    } else {
      UIManager.showView('landing');
    }
  },

  /**
   * Bind event listeners to DOM buttons, dropdowns, and keypresses
   */
  setupEventListeners() {
    // 1. Landing view CTA
    document.getElementById('btn-start-onboarding').addEventListener('click', () => {
      UIManager.showView('onboarding');
      UIManager.setStep(1);
    });

    // 2. Onboarding Back / Next steps
    document.getElementById('btn-onboarding-back').addEventListener('click', () => {
      UIManager.setStep(UIManager.onboardingStep - 1);
    });

    document.getElementById('btn-onboarding-next').addEventListener('click', () => {
      if (this.validateOnboardingStep(UIManager.onboardingStep)) {
        if (UIManager.onboardingStep < 3) {
          UIManager.setStep(UIManager.onboardingStep + 1);
        } else {
          this.triggerMentorGeneration();
        }
      }
    });

    // 3. Reset Button (Profile Menu avatar reset trigger)
    document.getElementById('btn-profile-menu').addEventListener('click', () => {
      if (confirm('Reset your link with FutureMe? This wipes all focus lists and chat history.')) {
        this.resetSession();
      }
    });

    // 4. Navigation Panel triggers
    document.getElementById('nav-dashboard').addEventListener('click', (e) => {
      e.preventDefault();
      UIManager.showPanel('dashboard');
    });
    
    document.getElementById('nav-timeline').addEventListener('click', (e) => {
      e.preventDefault();
      UIManager.showPanel('timeline');
    });

    document.getElementById('nav-letters').addEventListener('click', (e) => {
      e.preventDefault();
      UIManager.showPanel('letters');
    });

    // Mobile Chat Navigation link
    document.getElementById('nav-chat').addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleChatSidebar(true);
    });

    // Close mobile chat panel button
    document.getElementById('btn-chat-close-mobile').addEventListener('click', () => {
      this.toggleChatSidebar(false);
    });

    // Desktop toggle chat drawer button
    document.getElementById('btn-toggle-chat').addEventListener('click', () => {
      const sidebar = document.getElementById('app-chat-sidebar');
      sidebar.classList.toggle('hidden');
    });

    // 5. Today's Focus Action triggers
    document.getElementById('btn-add-focus').addEventListener('click', () => {
      const container = document.getElementById('focus-input-container');
      container.classList.toggle('hidden');
      document.getElementById('input-new-focus').focus();
    });

    document.getElementById('btn-save-focus').addEventListener('click', () => {
      this.addFocusGoalFromInput();
    });

    document.getElementById('input-new-focus').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.addFocusGoalFromInput();
      }
    });

    // 6. Mantra Clipboard Copy
    document.getElementById('btn-copy-mantra').addEventListener('click', () => {
      const mantra = document.getElementById('card-mantra').textContent;
      navigator.clipboard.writeText(mantra).then(() => {
        UIManager.showToast('Mantra copied to clipboard!', 'success');
      });
    });

    // Copy full Letter
    document.getElementById('btn-copy-letter').addEventListener('click', () => {
      const letter = document.getElementById('letter-body').textContent;
      navigator.clipboard.writeText(letter).then(() => {
        UIManager.showToast('Letter copied to clipboard!', 'success');
      });
    });

    // 7. Chat triggers
    document.getElementById('chat-send').addEventListener('click', () => {
      this.handleSendChatMessage();
    });

    document.getElementById('chat-input').addEventListener('keyup', (e) => {
      if (e.key === 'Enter') {
        this.handleSendChatMessage();
      }
    });

    // Dynamic Tone selector dropdown
    const toneSelector = document.getElementById('chat-tone-selector');
    toneSelector.addEventListener('change', async (e) => {
      const selectedTone = e.target.value;
      this.activeTone = selectedTone;
      await StorageService.setActiveTone(selectedTone);
      UIManager.showToast(`Mentor Tone changed: ${selectedTone}`, 'success');
    });
  },

  /**
   * Validates form inputs for active onboarding wizard steps
   */
  validateOnboardingStep(step) {
    if (step === 1) {
      const name = document.getElementById('input-name').value.trim();
      const age = document.getElementById('input-age').value;
      const profession = document.getElementById('input-profession').value.trim();
      const values = document.getElementById('input-values').value.trim();
      
      if (!name || !age || !profession || !values) {
        UIManager.showToast('Please fill out all basic details.', 'warning');
        return false;
      }
    } else if (step === 2) {
      const dream = document.getElementById('input-dream').value.trim();
      const goal = document.getElementById('input-currentGoal').value.trim();
      const oneYear = document.getElementById('input-oneYearVision').value.trim();
      const fiveYears = document.getElementById('input-fiveYearVision').value.trim();
      const habit = document.getElementById('input-habit').value.trim();

      if (!dream || !goal || !oneYear || !fiveYears || !habit) {
        UIManager.showToast('Please define your dreams and vision.', 'warning');
        return false;
      }
    } else if (step === 3) {
      const struggle = document.getElementById('input-struggle').value.trim();
      const fear = document.getElementById('input-fear').value.trim();

      if (!struggle || !fear) {
        UIManager.showToast('Please clarify your struggles and fears.', 'warning');
        return false;
      }
    }
    return true;
  },

  /**
   * Triggers API Generation call to compile initial identity
   */
  async triggerMentorGeneration() {
    if (this.isGenerating) return;
    this.isGenerating = true;

    // Collect profile data object
    const profile = {
      name: document.getElementById('input-name').value.trim(),
      age: document.getElementById('input-age').value,
      profession: document.getElementById('input-profession').value.trim(),
      values: document.getElementById('input-values').value.trim(),
      currentMood: document.getElementById('input-mood').value,
      dream: document.getElementById('input-dream').value.trim(),
      currentGoal: document.getElementById('input-currentGoal').value.trim(),
      oneYearVision: document.getElementById('input-oneYearVision').value.trim(),
      fiveYearVision: document.getElementById('input-fiveYearVision').value.trim(),
      biggestHabit: document.getElementById('input-habit').value.trim(),
      currentStruggle: document.getElementById('input-struggle').value.trim(),
      biggestFear: document.getElementById('input-fear').value.trim(),
      mentorTone: document.getElementById('input-tone').value,
      communicationStyle: document.getElementById('input-style').value
    };

    // Show cinematic temporal portal loading views
    const loadingPromise = UIManager.runTemporalLoading();

    try {
      // Execute API Call
      const mentorData = await ApiService.generateFutureMe(profile);

      // Hydrate Initial Focus checklist with AI-recommended Next Moves
      const defaultGoals = (mentorData.nextThreeMoves || []).map(move => ({
        text: move,
        completed: false
      }));

      // Cache values
      this.profile = profile;
      this.mentorData = mentorData;
      this.focusGoals = defaultGoals;
      this.chatHistory = [];
      this.activeTone = profile.mentorTone;

      await StorageService.saveProfile(profile);
      await StorageService.saveMentorData(mentorData);
      await StorageService.saveFocusGoals(defaultGoals);
      await StorageService.saveChatHistory([]);
      await StorageService.setActiveTone(profile.mentorTone);

      // Wait for loading animation cycle to finish
      await loadingPromise;

      // Hydrate views
      document.getElementById('chat-tone-selector').value = this.activeTone;
      UIManager.renderDashboard(this.profile, this.mentorData, this.focusGoals);
      
      // Inject welcome letter text as first message bubble
      const initialMessage = mentorData.mentorMessage || "I've connected with your frequency.";
      await StorageService.addChatMessage('mentor', initialMessage);
      this.chatHistory = await StorageService.getChatHistory();
      UIManager.renderChatHistory(this.chatHistory);

      // Switch to main app view
      UIManager.showView('app');
      UIManager.showPanel('dashboard');
      UIManager.showToast('Temporal connection established.', 'success');

    } catch (err) {
      console.error(err);
      UIManager.showView('onboarding');
      UIManager.showToast(err.message, 'error');
    } finally {
      this.isGenerating = false;
    }
  },

  /**
   * Action handler for sending messages in Chat Sidebar
   */
  async handleSendChatMessage() {
    const input = document.getElementById('chat-input');
    const text = input.value.trim();
    if (!text || this.isGenerating) return;

    input.value = '';
    
    // 1. Add user message
    this.chatHistory = await StorageService.addChatMessage('user', text);
    UIManager.renderChatHistory(this.chatHistory);
    UIManager.setChatTyping(true);

    try {
      // 2. Fetch AI Mentor response
      const updatedData = await ApiService.sendChatMessage(
        this.profile, 
        this.chatHistory, 
        text, 
        this.activeTone
      );

      // 3. Add response bubble
      const reply = updatedData.mentorMessage || "I am reflecting.";
      this.chatHistory = await StorageService.addChatMessage('mentor', reply);
      UIManager.setChatTyping(false);
      UIManager.renderChatHistory(this.chatHistory);

      // 4. DYNAMIC DASHBOARD UPDATE: Apply updated metrics in real-time!
      this.mentorData = { ...this.mentorData, ...updatedData };
      await StorageService.saveMentorData(this.mentorData);
      
      // Re-hydrate cards dynamically
      UIManager.renderDashboard(this.profile, this.mentorData, this.focusGoals);

      // Render Suggested Questions if generated
      if (updatedData.suggestedQuestions) {
        UIManager.renderSuggestedQuestions(updatedData.suggestedQuestions);
      } else {
        UIManager.renderSuggestedQuestions(CONFIG.defaultSuggestedQuestions);
      }

    } catch (err) {
      UIManager.setChatTyping(false);
      UIManager.showToast(err.message, 'error');
      
      // Inject standard error message to chat window
      const errMsg = "Your Future Mentor is reflecting. Please try again in a moment.";
      this.chatHistory = await StorageService.addChatMessage('mentor', errMsg);
      UIManager.renderChatHistory(this.chatHistory);
    }
  },

  /**
   * Adds a focus goal item manually
   */
  async addFocusGoalFromInput() {
    const input = document.getElementById('input-new-focus');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    document.getElementById('focus-input-container').classList.add('hidden');

    this.focusGoals.push({ text, completed: false });
    await StorageService.saveFocusGoals(this.focusGoals);
    
    UIManager.renderFocusList(this.focusGoals);
    UIManager.showToast('Focus goal added.', 'success');
  },

  /**
   * Toggles focus item checkmark completion status
   */
  async toggleGoal(index) {
    if (this.focusGoals[index]) {
      this.focusGoals[index].completed = !this.focusGoals[index].completed;
      await StorageService.saveFocusGoals(this.focusGoals);
      UIManager.renderFocusList(this.focusGoals);
      
      const isDone = this.focusGoals[index].completed;
      UIManager.showToast(isDone ? 'Goal completed!' : 'Goal unchecked.', isDone ? 'success' : 'info');
    }
  },

  /**
   * Deletes a focus item from the checklist
   */
  async deleteGoal(index) {
    event.stopPropagation(); // Avoid triggering checklist toggle click
    this.focusGoals.splice(index, 1);
    await StorageService.saveFocusGoals(this.focusGoals);
    UIManager.renderFocusList(this.focusGoals);
    UIManager.showToast('Goal deleted.', 'warning');
  },

  /**
   * Clipboard Copy Utility for particular messages
   */
  copyMessage(index) {
    const msg = this.chatHistory[index];
    if (msg) {
      navigator.clipboard.writeText(msg.text).then(() => {
        UIManager.showToast('Message copied to clipboard!', 'success');
      });
    }
  },

  /**
   * Regenerates AI message at index
   */
  async regenerateMessage(index) {
    if (this.isGenerating) return;
    
    // Find the last user message before this index
    let userMsgText = '';
    let targetIndex = -1;

    for (let i = index - 1; i >= 0; i--) {
      if (this.chatHistory[i].sender === 'user') {
        userMsgText = this.chatHistory[i].text;
        targetIndex = i;
        break;
      }
    }

    if (targetIndex === -1) {
      UIManager.showToast('Cannot regenerate without previous conversation context.', 'warning');
      return;
    }

    // Cut chat history down to targetIndex (removing the user's message and all subsequent messages)
    const truncatedHistory = this.chatHistory.slice(0, targetIndex);
    this.chatHistory = truncatedHistory;
    await StorageService.saveChatHistory(truncatedHistory);

    // Re-fill chat inputs and submit
    document.getElementById('chat-input').value = userMsgText;
    this.handleSendChatMessage();
    UIManager.showToast('Regenerating response...', 'success');
  },

  /**
   * Show/hide mobile right-side chat drawer panel
   */
  toggleChatSidebar(show) {
    const sidebar = document.getElementById('app-chat-sidebar');
    if (!sidebar) return;

    if (show) {
      sidebar.classList.remove('hidden');
      sidebar.classList.add('flex');
    } else {
      sidebar.classList.add('hidden');
      sidebar.classList.remove('flex');
    }
  },

  /**
   * Wipe caches and return back to Landing view
   */
  async resetSession() {
    await StorageService.clearAll();
    
    this.profile = null;
    this.mentorData = null;
    this.focusGoals = [];
    this.chatHistory = [];
    this.activeTone = 'Calm Mentor';

    // Clear onboarding input values
    document.getElementById('onboarding-form').reset();
    
    UIManager.showView('landing');
    UIManager.showToast('Link severed. Profile reset.', 'warning');
  }
};

// Bootstrap the App on DOM load
window.addEventListener('DOMContentLoaded', () => {
  App.init();
});
