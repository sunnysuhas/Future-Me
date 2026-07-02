/**
 * UI Manager - Controls all view state transitions, toast alerts,
 * and page renders for FutureMe.
 */
const UIManager = {
  activeView: 'landing', // 'landing', 'onboarding', 'temporal', 'app'
  activePanel: 'dashboard', // 'dashboard', 'timeline', 'letters'
  onboardingStep: 1,

  /**
   * Initializes basic UI nodes and styles
   */
  init() {
    this.hydrateTonesDropdown();
    this.showView('landing');
  },

  /**
   * Smoothly switch between top-level full-screen views
   */
  showView(viewName) {
    const views = {
      landing: document.getElementById('landing-view'),
      onboarding: document.getElementById('onboarding-view'),
      temporal: document.getElementById('temporal-view'),
      app: document.getElementById('app-view')
    };

    // Fade out active views
    Object.keys(views).forEach(key => {
      if (views[key]) {
        if (key === viewName) {
          views[key].classList.remove('hidden');
          setTimeout(() => {
            views[key].style.opacity = '1';
            views[key].style.transform = 'scale(1)';
          }, 50);
        } else {
          views[key].style.opacity = '0';
          views[key].style.transform = 'scale(0.98)';
          setTimeout(() => {
            views[key].classList.add('hidden');
          }, 300);
        }
      }
    });

    this.activeView = viewName;
  },

  /**
   * Switch between sub-panels inside the main App View (Dashboard, Timeline, Letters)
   */
  showPanel(panelName) {
    const panels = {
      dashboard: document.getElementById('panel-dashboard'),
      timeline: document.getElementById('panel-timeline-view'),
      letters: document.getElementById('panel-letters-view')
    };

    const navLinks = {
      dashboard: document.getElementById('nav-dashboard'),
      timeline: document.getElementById('nav-timeline'),
      letters: document.getElementById('nav-letters')
    };

    // Switch panels
    Object.keys(panels).forEach(key => {
      if (panels[key]) {
        if (key === panelName) {
          panels[key].classList.remove('hidden');
        } else {
          panels[key].classList.add('hidden');
        }
      }
      
      // Update nav link styles
      if (navLinks[key]) {
        if (key === panelName) {
          navLinks[key].className = "flex items-center gap-4 px-4 py-3 rounded-2xl bg-[#111111] text-white shadow-md transition-all";
        } else {
          navLinks[key].className = "flex items-center gap-4 px-4 py-3 rounded-2xl text-[#6E6E73] hover:bg-white/50 hover:text-[#111111] transition-all";
        }
      }
    });

    this.activePanel = panelName;
    this.showToast(`Navigated to ${panelName.charAt(0).toUpperCase() + panelName.slice(1)}`);
  },

  /**
   * Trigger a custom, Apple-like Toast Notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-notification glass-panel px-5 py-3 rounded-2xl flex items-center gap-3 shadow-lg pointer-events-auto border-l-4`;
    
    // Type colors
    if (type === 'success') {
      toast.classList.add('border-l-[#34C759]');
    } else if (type === 'error') {
      toast.classList.add('border-l-[#FF3B30]');
    } else if (type === 'warning') {
      toast.classList.add('border-l-[#FF9500]');
    } else {
      toast.classList.add('border-l-[#0A84FF]');
    }

    toast.innerHTML = `
      <div class="w-2 h-2 rounded-full ${type === 'success' ? 'bg-[#34C759]' : type === 'error' ? 'bg-[#FF3B30]' : type === 'warning' ? 'bg-[#FF9500]' : 'bg-[#0A84FF]'}"></div>
      <span class="text-xs font-semibold text-[#111111]">${message}</span>
    `;

    container.appendChild(toast);

    // Trigger animate-in
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    // Auto-remove after 3s
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        toast.remove();
      }, 400);
    }, 3000);
  },

  /**
   * Onboarding step management
   */
  setStep(step) {
    if (step < 1 || step > 3) return;
    this.onboardingStep = step;

    // Update step numbers and bars
    document.getElementById('onboarding-step-num').textContent = step;
    
    for (let i = 1; i <= 3; i++) {
      const bar = document.getElementById(`onboarding-bar-${i}`);
      if (bar) {
        if (i <= step) {
          bar.className = "w-12 h-1.5 rounded-full bg-[#0A84FF] transition-all duration-300";
        } else {
          bar.className = "w-12 h-1.5 rounded-full bg-gray-200 transition-all duration-300";
        }
      }
    }

    // Toggle fields
    const steps = [
      document.getElementById('step-1-fields'),
      document.getElementById('step-2-fields'),
      document.getElementById('step-3-fields')
    ];

    steps.forEach((el, index) => {
      if (el) {
        if (index + 1 === step) {
          el.classList.remove('hidden');
        } else {
          el.classList.add('hidden');
        }
      }
    });

    // Toggle buttons
    const btnBack = document.getElementById('btn-onboarding-back');
    const btnNextSpan = document.querySelector('#btn-onboarding-next span');

    if (btnBack) {
      if (step === 1) {
        btnBack.classList.add('hidden');
      } else {
        btnBack.classList.remove('hidden');
      }
    }

    if (btnNextSpan) {
      if (step === 3) {
        btnNextSpan.textContent = "Connect Link";
      } else {
        btnNextSpan.textContent = "Continue";
      }
    }
  },

  /**
   * Run cinematic temporal loading sequence with rotating updates
   */
  async runTemporalLoading() {
    this.showView('temporal');
    const statusText = document.getElementById('temporal-status');
    const messages = [
      "Connecting with your future self...",
      "Mapping your life decisions...",
      "Analyzing your habits...",
      "Building your future identity...",
      "Preparing your mentor..."
    ];

    for (let i = 0; i < messages.length; i++) {
      if (statusText) {
        statusText.style.opacity = '0';
        await new Promise(resolve => setTimeout(resolve, 300));
        statusText.textContent = messages[i];
        statusText.style.opacity = '1';
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
    }
  },

  /**
   * Hydrates Tones Dropdown from config constants
   */
  hydrateTonesDropdown() {
    const selector = document.getElementById('chat-tone-selector');
    if (!selector) return;

    selector.innerHTML = '';
    CONFIG.mentorTones.forEach(tone => {
      const opt = document.createElement('option');
      opt.value = tone.value;
      opt.textContent = tone.label;
      selector.appendChild(opt);
    });
  },

  /**
   * Hydrate full growth dashboard analytics
   */
  renderDashboard(profile, mentorData, focusGoals) {
    // 1. Header
    document.getElementById('dashboard-welcome').textContent = `Welcome back, ${profile.name}.`;
    document.getElementById('dashboard-quote').innerHTML = `"${mentorData.futureQuote || 'I am waiting for your decision.'}"`;
    document.getElementById('chat-header-name').textContent = `Future ${profile.name}`;

    // 2. Avatars using Dicebear Notionists
    document.getElementById('avatar-user').src = `https://api.dicebear.com/7.x/notionists/svg?seed=${profile.name}&backgroundColor=F5F5F7`;
    document.getElementById('avatar-mentor').src = `https://api.dicebear.com/7.x/notionists/svg?seed=Future${profile.name}&backgroundColor=ffffff`;

    // 3. Focus Checklist
    this.renderFocusList(focusGoals);

    // 4. Cards
    document.getElementById('card-future-identity').textContent = mentorData.futureIdentity || 'Parsed identity error.';
    document.getElementById('score-percentage').textContent = `${mentorData.confidenceScore || 0}%`;
    document.getElementById('card-strength').textContent = mentorData.hiddenStrength || 'Loading strength...';
    document.getElementById('card-blindspot').textContent = mentorData.blindSpot || 'Loading pitfalls...';
    document.getElementById('card-habit').textContent = mentorData.dailyHabit || 'Loading daily routine...';
    document.getElementById('card-mission').textContent = mentorData.weeklyMission || 'Loading mission...';
    document.getElementById('card-mantra').textContent = `"${mentorData.dailyMantra || 'Stay focused.'}"`;

    // 5. Timeline Nodes setup
    this.renderTimelinePreview(mentorData.timelinePredictions);

    // 6. Letter section compile
    document.getElementById('letter-body').innerHTML = mentorData.mentorMessage || 'Loading transmission...';
    document.getElementById('letter-date').textContent = `Date: October 24, ${parseInt(new Date().getFullYear()) + 10}`;
  },

  /**
   * Updates today's focus goals list dynamically
   */
  renderFocusList(goals) {
    const container = document.getElementById('focus-list');
    if (!container) return;

    if (goals.length === 0) {
      container.innerHTML = `
        <div class="text-center py-6 text-sm text-[#6E6E73]">
          No goals active. Ask your future self to generate moves or add one manually!
        </div>
      `;
      this.updateStreakCircle(0, 0);
      return;
    }

    container.innerHTML = '';
    let completedCount = 0;

    goals.forEach((goal, index) => {
      const item = document.createElement('div');
      
      if (goal.completed) {
        completedCount++;
        item.className = "flex items-center justify-between p-4 rounded-2xl bg-white/30 border border-white/40 opacity-60 transition-all duration-300";
        item.innerHTML = `
          <div class="flex items-center gap-4 cursor-pointer" onclick="App.toggleGoal(${index})">
            <div class="w-6 h-6 rounded-full bg-[#34C759] flex items-center justify-center">
              <svg class="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="text-lg font-medium text-[#6E6E73] line-through">${goal.text}</span>
          </div>
          <button onclick="App.deleteGoal(${index})" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
        `;
      } else {
        item.className = "flex items-center justify-between p-4 rounded-2xl bg-white/50 border border-white/60 hover:bg-white/80 transition-colors cursor-pointer group transition-all duration-300";
        item.innerHTML = `
          <div class="flex items-center gap-4 cursor-pointer" onclick="App.toggleGoal(${index})">
            <div class="w-6 h-6 rounded-full border-2 border-[#0A84FF] group-hover:bg-[#0A84FF] transition-colors flex items-center justify-center">
              <svg class="w-3 h-3 text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"></path></svg>
            </div>
            <span class="text-lg font-medium text-[#111111]">${goal.text}</span>
          </div>
          <button onclick="App.deleteGoal(${index})" class="text-xs text-gray-400 hover:text-red-500 transition-colors">Delete</button>
        `;
      }
      container.appendChild(item);
    });

    this.updateStreakCircle(completedCount, goals.length);
  },

  /**
   * Animates Consistency Ring SVG dashoffset and day counter
   */
  updateStreakCircle(completed, total) {
    const circle = document.getElementById('consistency-circle');
    const counter = document.getElementById('streak-counter');
    const label = document.querySelector('#streak-counter + span');

    if (!circle || !counter) return;

    if (total === 0) {
      circle.style.strokeDashoffset = '251';
      counter.textContent = '0';
      if (label) label.textContent = 'Goals Set';
      return;
    }

    const completionRate = completed / total;
    // stroke-dasharray is 251. Complete means dashoffset = 0, Empty means offset = 251.
    const offset = 251 - (251 * completionRate);
    circle.style.strokeDashoffset = offset;
    
    counter.textContent = completed;
    if (label) {
      label.textContent = `${completed}/${total} Completed`;
    }
  },

  /**
   * Configures timeline preview node clicking
   */
  renderTimelinePreview(predictions) {
    if (!predictions) return;

    // Define timeline nodes click listeners
    const nodes = {
      now: { element: document.getElementById('time-node-now'), title: "Present Era", text: "You are standing at the starting threshold. Every habit you execute daily shapes your timeline." },
      '3m': { element: document.getElementById('time-node-3m'), title: "3-Month Horizon", text: predictions.threeMonths || "Navigating intermediate milestones..." },
      '1y': { element: document.getElementById('time-node-1y'), title: "1-Year Milestone", text: predictions.oneYear || "Your vision takes physical form..." },
      '5y': { element: document.getElementById('time-node-5y'), title: "5-Year Horizon", text: predictions.fiveYears || "At this stage, you experience a major lifestyle shift..." }
    };

    const detailsTitle = document.getElementById('timeline-detail-title');
    const detailsText = document.getElementById('timeline-detail-text');

    const updateActiveNodeStyle = (activeKey) => {
      Object.keys(nodes).forEach(key => {
        const dot = document.getElementById(`node-dot-${key}`);
        const label = document.getElementById(`node-label-${key}`);
        
        if (dot) {
          if (key === activeKey) {
            dot.className = "w-4 h-4 bg-[#0A84FF] rounded-full ring-4 ring-white shadow-md";
          } else {
            dot.className = "w-4 h-4 bg-white border-2 border-gray-300 rounded-full ring-4 ring-white shadow-md";
          }
        }
        
        if (label) {
          if (key === activeKey) {
            label.className = "text-sm font-semibold text-[#111111]";
          } else {
            label.className = "text-sm font-medium text-[#6E6E73]";
          }
        }
      });
    };

    Object.keys(nodes).forEach(key => {
      if (nodes[key].element) {
        // Remove existing listener to prevent piling
        const oldEl = nodes[key].element;
        const newEl = oldEl.cloneNode(true);
        oldEl.parentNode.replaceChild(newEl, oldEl);
        nodes[key].element = newEl;

        newEl.addEventListener('click', () => {
          if (detailsTitle && detailsText) {
            detailsTitle.textContent = nodes[key].title;
            detailsText.textContent = nodes[key].text;
            updateActiveNodeStyle(key);
            this.showToast(`Parsing timeline: ${nodes[key].title}`);
          }
        });
      }
    });

    // Render detailed timeline panels view
    const timelinePanelContainer = document.getElementById('detailed-timeline-container');
    if (timelinePanelContainer) {
      timelinePanelContainer.innerHTML = `
        <div class="relative pl-8 border-l border-gray-300 space-y-8">
          <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-[#0A84FF] ring-4 ring-white"></div>
            <h3 class="text-lg font-semibold text-[#111]">Immediate (Present Self)</h3>
            <p class="text-sm text-[#6E6E73] mt-1 leading-relaxed">${nodes.now.text}</p>
          </div>
          <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white"></div>
            <h3 class="text-lg font-semibold text-[#111]">3-Month Milestone</h3>
            <p class="text-sm text-[#6E6E73] mt-1 leading-relaxed">${predictions.threeMonths}</p>
          </div>
          <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white"></div>
            <h3 class="text-lg font-semibold text-[#111]">1-Year Projection</h3>
            <p class="text-sm text-[#6E6E73] mt-1 leading-relaxed">${predictions.oneYear}</p>
          </div>
          <div class="relative">
            <div class="absolute -left-10 top-1 w-4 h-4 rounded-full bg-white border-2 border-gray-300 ring-4 ring-white"></div>
            <h3 class="text-lg font-semibold text-[#111]">5-Year Future State</h3>
            <p class="text-sm text-[#6E6E73] mt-1 leading-relaxed">${predictions.fiveYears}</p>
          </div>
        </div>
      `;
    }

    // Set initial display to Now
    if (detailsTitle && detailsText) {
      detailsTitle.textContent = nodes.now.title;
      detailsText.textContent = nodes.now.text;
      updateActiveNodeStyle('now');
    }
  },

  /**
   * Refreshes the side message bubbles list
   */
  renderChatHistory(history) {
    const container = document.getElementById('chat-history-container');
    if (!container) return;

    container.innerHTML = '';
    
    if (history.length === 0) {
      container.innerHTML = `
        <div class="text-center py-10 flex-1 flex flex-col items-center justify-center text-sm text-[#6E6E73]">
          <svg class="w-8 h-8 mb-2 text-[#0A84FF]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
          Start a conversation with your future self. Ask anything about your decisions, worries, or plans.
        </div>
      `;
      this.renderSuggestedQuestions(CONFIG.defaultSuggestedQuestions);
      return;
    }

    history.forEach((msg, index) => {
      const bubble = document.createElement('div');
      
      const formattedTime = msg.timestamp 
        ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : '';

      if (msg.sender === 'user') {
        bubble.className = "flex justify-end animate-fade-in";
        bubble.innerHTML = `
          <div class="flex flex-col items-end max-w-[85%]">
            <div class="bg-[#111111] text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-md">
              <p class="text-sm leading-relaxed">${msg.text}</p>
            </div>
            <span class="text-[10px] text-[#6E6E73] mt-1 font-medium">${formattedTime}</span>
          </div>
        `;
      } else {
        bubble.className = "flex justify-start animate-fade-in";
        bubble.innerHTML = `
          <div class="flex flex-col items-start max-w-[90%] group">
            <div class="bg-white/80 border border-white px-5 py-4 rounded-2xl rounded-tl-sm shadow-sm backdrop-blur-md relative">
              
              <!-- Quick Actions on hover -->
              <div class="absolute right-2 -top-4 bg-white/90 border border-gray-200 rounded-full px-2 py-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 text-xs">
                <button onclick="App.copyMessage(${index})" class="text-[#6E6E73] hover:text-[#0A84FF]">Copy</button>
                <button onclick="App.regenerateMessage(${index})" class="text-[#6E6E73] hover:text-[#0A84FF]">Regen</button>
              </div>

              <p class="text-sm text-[#111111] leading-relaxed">${msg.text}</p>
            </div>
            <span class="text-[10px] text-[#6E6E73] mt-1 font-medium">${formattedTime}</span>
          </div>
        `;
      }
      container.appendChild(bubble);
    });

    this.scrollToBottom();
  },

  /**
   * Renders suggested prompt questions below history
   */
  renderSuggestedQuestions(questions) {
    const list = document.getElementById('chat-suggestions');
    const container = document.getElementById('chat-suggestions-container');
    
    if (!list) return;

    if (!questions || questions.length === 0) {
      if (container) container.classList.add('hidden');
      return;
    }

    if (container) container.classList.remove('hidden');
    list.innerHTML = '';
    
    questions.forEach(q => {
      const btn = document.createElement('button');
      btn.className = "px-4 py-2 bg-white/60 hover:bg-[#0A84FF]/10 hover:text-[#0A84FF] border border-white/80 text-xs font-semibold rounded-full shadow-sm flex-shrink-0 transition-all";
      btn.textContent = q;
      btn.addEventListener('click', () => {
        document.getElementById('chat-input').value = q;
        document.getElementById('chat-send').click();
      });
      list.appendChild(btn);
    });
  },

  /**
   * Toggles typing indicator loader
   */
  setChatTyping(isTyping) {
    const id = 'chat-typing-indicator';
    let indicator = document.getElementById(id);
    const container = document.getElementById('chat-history-container');

    if (!container) return;

    if (isTyping) {
      if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = id;
        indicator.className = "flex justify-start opacity-70 animate-fade-in";
        indicator.innerHTML = `
          <div class="bg-white/50 border border-white px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm backdrop-blur-md flex gap-1.5 items-center">
            <div class="w-1.5 h-1.5 bg-[#6E6E73] rounded-full typing-dot" style="animation-delay: 0ms;"></div>
            <div class="w-1.5 h-1.5 bg-[#6E6E73] rounded-full typing-dot" style="animation-delay: 150ms;"></div>
            <div class="w-1.5 h-1.5 bg-[#6E6E73] rounded-full typing-dot" style="animation-delay: 300ms;"></div>
          </div>
        `;
        container.appendChild(indicator);
      }
      this.scrollToBottom();
    } else {
      if (indicator) {
        indicator.remove();
      }
    }
  },

  /**
   * Smoothly scrolls chat window to bottom
   */
  scrollToBottom() {
    const container = document.getElementById('chat-history-container');
    if (container) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
      });
    }
  }
};
