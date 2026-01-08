// DOM Elements
const sidebarToggle = document.getElementById('sidebar-toggle');
const themeToggle = document.getElementById('theme-toggle');
const startPauseBtn = document.getElementById('start-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const skipBtn = document.getElementById('skip-btn');
const timeLeft = document.getElementById('time-left');
const timerLabel = document.getElementById('timer-label');
const currentPhase = document.getElementById('current-phase');
const sessionNumber = document.getElementById('session-number');
const phaseOptions = document.querySelectorAll('.phase-option');
const focusDurationInput = document.getElementById('focus-duration');
const shortBreakDurationInput = document.getElementById('short-break-duration');
const longBreakDurationInput = document.getElementById('long-break-duration');
const applyDurationsBtn = document.getElementById('apply-durations');
const addTaskBtn = document.getElementById('add-task-btn');
const todoList = document.getElementById('todo-list');
const taskModal = document.getElementById('task-modal');
const saveTaskBtn = document.getElementById('save-task');
const taskForm = document.getElementById('task-form');
const dashboardToggle = document.getElementById('dashboard-toggle');
const dashboardModal = document.getElementById('dashboard-modal');
const inviteFriendBtn = document.getElementById('invite-friend');
const inviteModal = document.getElementById('invite-modal');
const sendInvitationBtn = document.getElementById('send-invitation');
const copyLinkBtns = document.querySelectorAll('.btn-copy');
const logoutBtn = document.getElementById('logout-btn');
const newQuoteBtn = document.getElementById('new-quote');
const currentQuote = document.getElementById('current-quote');
const quoteAuthor = document.querySelector('.quote-author');
const soundOptions = document.querySelectorAll('.sound-option');
const volumeSliders = document.querySelectorAll('.volume-slider');
const notificationContainer = document.getElementById('notification-container');
const modalCloseButtons = document.querySelectorAll('.modal-close');
const userName = document.getElementById('user-name');
const userEmail = document.getElementById('user-email');
const currentDate = document.getElementById('current-date');
const progressCircle = document.querySelector('.progress-ring-circle');
const messageCard = document.querySelector('.message-card');
const messageText = document.querySelector('.message-text');
const filterBtns = document.querySelectorAll('.filter-btn');

// Timer Variables
let timer;
let isRunning = false;
let timeRemaining = 25 * 60;
let currentTimerType = 'focus';
let sessionsCompleted = 0;
let totalFocusTime = 0;
let tasksCompleted = 0;

// Timer Settings
let settings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: true,
    autoStartFocus: true,
    soundEnabled: true
};

// To-Do List
let tasks = [];
let currentFilter = 'all';

// User Data
let user = {
    name: 'Guest User',
    email: 'guest@lentora.com',
    mode: 'guest'
};

// Motivational Quotes
const quotes = [
    { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
    { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
    { text: "The future depends on what you do today.", author: "Mahatma Gandhi" },
    { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
    { text: "Quality is not an act, it is a habit.", author: "Aristotle" },
    { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
    { text: "Productivity is never an accident. It is always the result of a commitment to excellence.", author: "Paul J. Meyer" },
    { text: "Your mind is for having ideas, not holding them.", author: "David Allen" },
    { text: "The key is not to prioritize what's on your schedule, but to schedule your priorities.", author: "Stephen Covey" },
    { text: "Efficiency is doing things right; effectiveness is doing the right things.", author: "Peter Drucker" }
];

// Supportive Messages
const supportiveMessages = [
    "Great work! You've planted another seed of progress in your garden of productivity.",
    "Well done! Your focused effort is like sunshine helping your goals grow.",
    "Another session complete! You're cultivating discipline with every focused minute.",
    "Excellent work! You're nurturing your potential with each completed session.",
    "Bravo! Your consistency is the water that helps your productivity garden flourish.",
    "Fantastic focus! You're building momentum with every session you complete.",
    "Outstanding! You've just added another brick to your foundation of success.",
    "Impressive work! You're training your mind to focus, one session at a time.",
    "You're doing amazing! Each focused session is a step toward your goals.",
    "Keep it up! Your dedication is turning small efforts into significant results."
];

// Ambient Sounds
const sounds = {
    rain: document.getElementById('rain-sound'),
    forest: document.getElementById('forest-sound'),
    stream: document.getElementById('stream-sound'),
    wind: document.getElementById('wind-sound')
};

const sessionEndSound = document.getElementById('session-end-sound');
const breakEndSound = document.getElementById('break-end-sound');

// Chart Variables
let dailyChart, weeklyChart, monthlyChart;

// Initialize the application
function init() {
    loadUserData();
    loadSettings();
    loadTasks();
    updateDateDisplay();
    updateTimerDisplay();
    updateProgressCircle();
    updateStats();
    loadRandomQuote();
    loadRandomMessage();
    setupEventListeners();
    initCharts();
}

// ================================
// DATA MANAGEMENT FUNCTIONS
// ================================

function loadUserData() {
    const savedName = localStorage.getItem('lentora_user_name');
    const savedEmail = localStorage.getItem('lentora_user_email');
    const savedMode = localStorage.getItem('lentora_user_mode');
    
    if (savedName) user.name = savedName;
    if (savedEmail) user.email = savedEmail;
    if (savedMode) user.mode = savedMode;
    
    userName.textContent = user.name;
    userEmail.textContent = user.email;
}

function loadSettings() {
    const savedSettings = localStorage.getItem('lentora_settings');
    if (savedSettings) {
        const parsedSettings = JSON.parse(savedSettings);
        
        Object.keys(settings).forEach(key => {
            if (parsedSettings[key] !== undefined) {
                settings[key] = parsedSettings[key];
            }
        });
        
        // Populate inputs
        if (focusDurationInput) focusDurationInput.value = settings.focusDuration;
        if (shortBreakDurationInput) shortBreakDurationInput.value = settings.shortBreakDuration;
        if (longBreakDurationInput) longBreakDurationInput.value = settings.longBreakDuration;
    }
    
    // FORCE DEFAULT: If autoStart settings are somehow false/undefined because of old data, force them true for now
    // (Remove these two lines later if you add UI toggles for these settings)
    if (settings.autoStartBreaks === undefined) settings.autoStartBreaks = true;
    if (settings.autoStartFocus === undefined) settings.autoStartFocus = true;

    resetToCurrentPhaseDuration();
    updateTimerLabel();
}

function saveSettings() {
    localStorage.setItem('lentora_settings', JSON.stringify(settings));
}

function loadTasks() {
    const savedTasks = localStorage.getItem('lentora_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('lentora_tasks', JSON.stringify(tasks));
}

function saveStats() {
    const stats = {
        sessionsCompleted,
        totalFocusTime,
        tasksCompleted,
        lastUpdated: new Date().toISOString()
    };
    localStorage.setItem('lentora_stats', JSON.stringify(stats));
}

// ================================
// TIMER FUNCTIONS (FIXED)
// ================================

// Centralized function to stop the interval
function stopTimer() {
    if (timer) {
        clearInterval(timer);
        timer = null;
    }
    isRunning = false;
    
    // Update UI Button to "Start" state
    if (startPauseBtn) {
        startPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
        startPauseBtn.classList.remove('active');
    }
}

// Get duration in seconds based on phase
function getPhaseDuration(phase) {
    const activePhase = phase || currentTimerType;
    switch (activePhase) {
        case 'focus': return (settings.focusDuration || 25) * 60;
        case 'shortBreak': return (settings.shortBreakDuration || 5) * 60;
        case 'longBreak': return (settings.longBreakDuration || 15) * 60;
        default: return 25 * 60;
    }
}

// Core function to start the timer
function startTimer() {
    // Prevent multiple intervals
    if (isRunning && timer) return;

    // Safety: If time is zero (or negative), reset it before starting
    if (timeRemaining <= 0) {
        timeRemaining = getPhaseDuration(currentTimerType);
    }

    isRunning = true;
    
    if (startPauseBtn) {
        startPauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
        startPauseBtn.classList.add('active');
    }

    // Update display immediately so there is no 1-second delay
    updateTimerDisplay();

    timer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();

        if (timeRemaining <= 0) {
            stopTimer(); 
            processTimerCompletion();
        }
    }, 1000);
}

function pauseTimer() {
    stopTimer();
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function resetTimer() {
    stopTimer();
    timeRemaining = getPhaseDuration(currentTimerType);
    updateTimerDisplay();
}

function skipTimer() {
    stopTimer();
    // Passing 'false' because it's a skip, not a completion
    const nextPhase = determineNextPhase(false); 
    switchPhase(nextPhase);
}

// Logic that runs when timer reaches 0
function processTimerCompletion() {
    const wasFocus = currentTimerType === 'focus';
    
    // 1. Determine next phase (passing 'true' because timer reached 00:00)
    const nextPhase = determineNextPhase(true);

    // 2. Switch the state and UI
    switchPhase(nextPhase);

    // 3. Audio and Notifications
    try {
        if (wasFocus) {
            totalFocusTime += settings.focusDuration;
            updateStats();
            if (settings.soundEnabled) sessionEndSound.play();
            showNotification('Focus Session Complete!', 'Time for a break.', 'success');
        } else {
            if (settings.soundEnabled) breakEndSound.play();
            showNotification('Break Time Over!', 'Ready to focus?', 'info');
        }
    } catch (error) {
        console.error("UI/Audio update failed:", error);
    }

    // 4. Auto-Start
    const shouldAutoStart = (nextPhase === 'focus') ? settings.autoStartFocus : settings.autoStartBreaks;
    if (shouldAutoStart) {
        setTimeout(() => startTimer(), 500);
    }
}

function determineNextPhase(wasNaturalCompletion) {
    if (currentTimerType === 'focus') {
        if (wasNaturalCompletion) {
            sessionsCompleted++;
        }

        // 1. If we hit the goal (4), go to Long Break and reset counter NOW
        if (sessionsCompleted >= settings.longBreakInterval) {
            // We reset to 0 here so the NEXT cycle is ready
            // But we return 'longBreak' so the user gets their big rest
            sessionsCompleted = 0; 
            return 'longBreak';
        }
        
        // 2. Otherwise, just a short break
        return 'shortBreak';
    } else {
        // 3. If we are in ANY break (short or long), the next step is ALWAYS focus
        return 'focus';
    }
}

function switchPhase(newPhase) {
    currentTimerType = newPhase;
    timeRemaining = getPhaseDuration(newPhase);

    try {
        updateTimerLabel();
        updateTimerDisplay();
        
        // Reset the Circle UI
        if (window.timerFix) {
            window.timerFix.maxSeenSeconds = timeRemaining;
        }

        if (sessionNumber) {
            const maxSessions = settings.longBreakInterval; // This is 4
            
            if (newPhase === 'focus') {
                // Calculation: (0%4)+1 = 1, (1%4)+1 = 2, (2%4)+1 = 3, (3%4)+1 = 4
                // When sessionsCompleted hits 4, it loops back: (4%4)+1 = 1
                const currentDisplay = (sessionsCompleted % maxSessions) + 1;
                sessionNumber.textContent = `${currentDisplay}/${maxSessions}`;
            } else {
                // During breaks, show the number of the session just completed
                // We use a small trick: if it's 0 after completion, it was the 4th session
                let completedDisplay = sessionsCompleted % maxSessions;
                if (completedDisplay === 0 && sessionsCompleted > 0) completedDisplay = maxSessions;
                sessionNumber.textContent = `${completedDisplay}/${maxSessions}`;
            }
        }
    } catch(e) {
        console.warn("Error updating phase UI", e);
    }
}

function resetToCurrentPhaseDuration() {
    timeRemaining = getPhaseDuration(currentTimerType);
}

function changePhase(e) {
    const phase = e.currentTarget.dataset.phase;
    const phaseMap = {
        'focus': 'focus',
        'short-break': 'shortBreak',
        'long-break': 'longBreak'
    };
    
    const nextPhase = phaseMap[phase] || 'focus';

    if (nextPhase === currentTimerType) return;

    if (isRunning) {
        if (!confirm('Changing phase will reset the current timer. Continue?')) {
            return;
        }
        stopTimer();
    }

    switchPhase(nextPhase);
}

function updateTimerDisplay() {
    // Prevent negative numbers display
    const validTime = Math.max(0, timeRemaining);
    const minutes = Math.floor(validTime / 60);
    const seconds = validTime % 60;
    
    if (timeLeft) {
        timeLeft.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    document.title = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')} - Lentora`;

    updateProgressCircle();
}

function updateProgressCircle() {
    if (!progressCircle) return;
    
    const totalTime = getPhaseDuration(currentTimerType);
    const validTime = Math.max(0, timeRemaining);
    const progress = ((totalTime - validTime) / totalTime) * 100;
    
    const circumference = 2 * Math.PI * 200; // Assuming r=200
    const offset = circumference - (progress / 100) * circumference;
    
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;
    
    const colors = {
        focus: 'var(--golden-light)',
        shortBreak: 'var(--sage-depth)',
        longBreak: 'var(--forest-shadow)'
    };
    progressCircle.style.stroke = colors[currentTimerType] || colors.focus;
}

function updateTimerLabel() {
    const phaseData = {
        focus: { label: 'Focus Time', text: 'Focus', selector: '[data-phase="focus"]' },
        shortBreak: { label: 'Short Break', text: 'Short Break', selector: '[data-phase="short-break"]' },
        longBreak: { label: 'Long Break', text: 'Long Break', selector: '[data-phase="long-break"]' }
    };
    
    const data = phaseData[currentTimerType] || phaseData.focus;
    
    // Remove active class from all
    document.querySelectorAll('.phase-option').forEach(option => {
        option.classList.remove('active');
    });
    
    if (timerLabel) timerLabel.textContent = data.label;
    if (currentPhase) currentPhase.textContent = data.text;
    
    const activeTab = document.querySelector(data.selector);
    if (activeTab) activeTab.classList.add('active');
}

function applyCustomDurations() {
    settings.focusDuration = parseInt(focusDurationInput.value) || 25;
    settings.shortBreakDuration = parseInt(shortBreakDurationInput.value) || 5;
    settings.longBreakDuration = parseInt(longBreakDurationInput.value) || 15;
    
    if (!isRunning) {
        resetToCurrentPhaseDuration();
        updateTimerDisplay();
    }
    
    saveSettings();
    showNotification('Settings Updated', 'Timer durations have been updated.', 'success');
}

// ================================
// UI UPDATE FUNCTIONS
// ================================

function updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

function updateStats() {
    document.getElementById('sessions-today').textContent = sessionsCompleted;
    document.getElementById('focus-time-today').textContent = `${totalFocusTime}m`;
    document.getElementById('tasks-completed').textContent = tasksCompleted;
    
    document.getElementById('today-focus').textContent = `${totalFocusTime} min`;
    document.getElementById('today-sessions').textContent = sessionsCompleted;
    document.getElementById('today-tasks').textContent = tasksCompleted;
    
    saveStats();
}

function loadRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote.textContent = `"${quotes[randomIndex].text}"`;
    quoteAuthor.textContent = `- ${quotes[randomIndex].author}`;
}

function loadRandomMessage() {
    const randomIndex = Math.floor(Math.random() * supportiveMessages.length);
    messageText.textContent = supportiveMessages[randomIndex];
    
    const icons = ['fa-spa', 'fa-leaf', 'fa-seedling', 'fa-feather-alt', 'fa-cloud'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    messageCard.querySelector('i').className = `fas ${randomIcon}`;
}

// ================================
// TASK MANAGEMENT FUNCTIONS
// ================================

function renderTasks() {
    todoList.innerHTML = '';
    
    let filteredTasks = tasks;
    
    if (currentFilter === 'active') {
        filteredTasks = tasks.filter(task => !task.completed);
    } else if (currentFilter === 'completed') {
        filteredTasks = tasks.filter(task => task.completed);
    }
    
    if (filteredTasks.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.className = 'empty-tasks';
        emptyMessage.innerHTML = `
            <i class="fas fa-seedling"></i>
            <p>No tasks yet. Add one to get started!</p>
        `;
        todoList.appendChild(emptyMessage);
        return;
    }
    
    filteredTasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = `todo-item ${task.completed ? 'completed' : ''}`;
        taskElement.dataset.id = task.id;
        
        taskElement.innerHTML = `
            <div class="todo-checkbox ${task.completed ? 'checked' : ''}" data-id="${task.id}">
                ${task.completed ? '✓' : ''}
            </div>
            <div class="todo-content">
                <div class="todo-title">${task.title}</div>
                ${task.description ? `<div class="todo-description">${task.description}</div>` : ''}
                <div class="todo-priority ${task.priority}">${task.priority}</div>
            </div>
            <div class="todo-actions">
                <button class="todo-action-btn delete-task" data-id="${task.id}">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        todoList.appendChild(taskElement);
    });
    
    // Add event listeners to checkboxes and delete buttons
    document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', toggleTaskCompletion);
    });
    
    document.querySelectorAll('.delete-task').forEach(button => {
        button.addEventListener('click', deleteTask);
    });
}

function addTask(title, description, priority, shared = false) {
    const newTask = {
        id: Date.now(),
        title,
        description: description || '',
        priority,
        completed: false,
        shared,
        createdAt: new Date().toISOString()
    };
    
    tasks.push(newTask);
    saveTasks();
    renderTasks();
    
    showNotification('Task Added', `"${title}" has been added to your list.`, 'success');
    
    if (shared) {
        setTimeout(() => {
            showNotification('Task Shared', `"${title}" has been shared with your focus group.`, 'info');
        }, 500);
    }
}

function toggleTaskCompletion(e) {
    const taskId = parseInt(e.currentTarget.dataset.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        if (tasks[taskIndex].completed) {
            tasksCompleted++;
            showNotification('Task Completed!', `"${tasks[taskIndex].title}" is done!`, 'success');
        } else {
            tasksCompleted = Math.max(0, tasksCompleted - 1);
        }
        
        saveTasks();
        updateStats();
        renderTasks();
    }
}

function deleteTask(e) {
    const taskId = parseInt(e.currentTarget.dataset.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        const taskTitle = tasks[taskIndex].title;
        tasks.splice(taskIndex, 1);
        saveTasks();
        renderTasks();
        
        showNotification('Task Removed', `"${taskTitle}" has been removed.`, 'info');
    }
}

// ================================
// NOTIFICATION FUNCTIONS
// ================================

function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    const iconMap = {
        info: 'fa-info-circle',
        success: 'fa-check-circle',
        warning: 'fa-exclamation-triangle',
        error: 'fa-exclamation-circle'
    };
    
    notification.innerHTML = `
        <i class="fas ${iconMap[type] || 'fa-info-circle'}"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    notificationContainer.appendChild(notification);
    
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// ================================
// UI TOGGLE FUNCTIONS
// ================================

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const icon = themeToggle.querySelector('i');
    
    if (document.body.classList.contains('dark-theme')) {
        icon.className = 'fas fa-sun';
        localStorage.setItem('lentora_theme', 'dark');
    } else {
        icon.className = 'fas fa-moon';
        localStorage.setItem('lentora_theme', 'light');
    }
}

function toggleDashboard() {
    dashboardModal.classList.toggle('active');
}

function toggleTaskModal() {
    taskModal.classList.toggle('active');
    if (taskModal.classList.contains('active')) {
        taskForm.reset();
    }
}

function toggleInviteModal() {
    inviteModal.classList.toggle('active');
}

// ================================
// OTHER FUNCTIONS
// ================================

function copySessionLink() {
    const linkInput = document.getElementById('session-link');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999);
    
    navigator.clipboard.writeText(linkInput.value)
        .then(() => {
            showNotification('Link Copied', 'Session link copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showNotification('Error', 'Failed to copy link. Please try again.', 'error');
        });
}

function sendInvitation() {
    const friendEmail = document.getElementById('friend-email').value;
    const message = document.getElementById('invite-message').value;
    
    if (!friendEmail || !isValidEmail(friendEmail)) {
        showNotification('Invalid Email', 'Please enter a valid email address.', 'error');
        return;
    }
    
    showNotification('Invitation Sent', `Invitation sent to ${friendEmail}.`, 'success');
    
    setTimeout(() => {
        inviteModal.classList.remove('active');
        document.getElementById('friend-email').value = '';
        document.getElementById('invite-message').value = 'Join me for a focused work session!';
    }, 2000);
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        if (user.mode === 'guest') {
            localStorage.removeItem('lentora_tasks');
            localStorage.removeItem('lentora_stats');
        }
        window.location.href = 'index.html';
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ================================
// CHART FUNCTIONS
// ================================

function initCharts() {
    // Chart initialization code remains the same
    // (Keeping it unchanged as it's not duplicated)
    // Daily Chart
    const dailyCtx = document.getElementById('daily-chart').getContext('2d');
    dailyChart = new Chart(dailyCtx, {
        type: 'line',
        data: {
            labels: ['6 AM', '9 AM', '12 PM', '3 PM', '6 PM', '9 PM'],
            datasets: [{
                label: 'Focus Minutes',
                data: [25, 45, 30, 50, 40, 20],
                borderColor: 'var(--sage-depth)',
                backgroundColor: 'rgba(122, 153, 120, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(232, 224, 248, 0.3)' },
                    ticks: { color: 'var(--mauve-whisper)' }
                },
                x: {
                    grid: { color: 'rgba(232, 224, 248, 0.3)' },
                    ticks: { color: 'var(--mauve-whisper)' }
                }
            }
        }
    });
    
    // Weekly Chart
    const weeklyCtx = document.getElementById('weekly-chart').getContext('2d');
    weeklyChart = new Chart(weeklyCtx, {
        type: 'bar',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Focus Minutes',
                data: [120, 150, 180, 140, 200, 60, 90],
                backgroundColor: 'var(--lilac-breeze)',
                borderColor: 'var(--wisteria-dream)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(232, 224, 248, 0.3)' },
                    ticks: { color: 'var(--mauve-whisper)' }
                },
                x: {
                    grid: { color: 'rgba(232, 224, 248, 0.3)' },
                    ticks: { color: 'var(--mauve-whisper)' }
                }
            }
        }
    });
    
    // Monthly Chart
    const monthlyCtx = document.getElementById('monthly-chart').getContext('2d');
    monthlyChart = new Chart(monthlyCtx, {
        type: 'line',
        data: {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'Focus Hours',
                data: [8, 12, 10, 15],
                borderColor: 'var(--forest-shadow)',
                backgroundColor: 'rgba(90, 122, 88, 0.1)',
                tension: 0.3,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(232, 224, 248, 0.3)' },
                    ticks: { color: 'var(--mauve-whisper)' }
                },
                x: {
                    grid: { color: 'rgba(232, 224, 248, 0.3)' },
                    ticks: { color: 'var(--mauve-whisper)' }
                }
            }
        }
    });
}

// ================================
// EVENT LISTENER SETUP
// ================================

function setupEventListeners() {
    // Sidebar and theme
    sidebarToggle.addEventListener('click', toggleSidebar);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Timer controls
    startPauseBtn.addEventListener('click', toggleTimer);
    resetBtn.addEventListener('click', resetTimer);
    skipBtn.addEventListener('click', skipTimer);
    
    // Phase options
    phaseOptions.forEach(option => {
        option.addEventListener('click', changePhase);
    });
    
    // Apply custom durations
    applyDurationsBtn.addEventListener('click', applyCustomDurations);
    
    // Task management
    addTaskBtn.addEventListener('click', toggleTaskModal);
    saveTaskBtn.addEventListener('click', () => {
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-description').value;
        const priority = document.getElementById('task-priority').value;
        const shared = document.getElementById('task-shared').checked;
        
        if (!title.trim()) {
            showNotification('Error', 'Task title is required.', 'error');
            return;
        }
        
        addTask(title, description, priority, shared);
        toggleTaskModal();
    });
    
    // Filter tasks
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });
    
    // Dashboard
    dashboardToggle.addEventListener('click', toggleDashboard);
    
    // Invitations
    inviteFriendBtn.addEventListener('click', toggleInviteModal);
    sendInvitationBtn.addEventListener('click', sendInvitation);
    
    // Copy link buttons
    copyLinkBtns.forEach(btn => {
        btn.addEventListener('click', copySessionLink);
    });
    
    // Logout
    logoutBtn.addEventListener('click', logout);
    
    // New quote
    newQuoteBtn.addEventListener('click', loadRandomQuote);
    
    // Sound options
    soundOptions.forEach(option => {
        const soundType = option.dataset.sound;
        const volumeSlider = option.querySelector('.volume-slider');
        const volumeIcon = option.querySelector('.fa-volume-mute');
        
        option.addEventListener('click', () => {
            soundOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.toggle('active');
            
            Object.values(sounds).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
            });
            
            if (option.classList.contains('active')) {
                sounds[soundType].volume = volumeSlider.value / 100;
                sounds[soundType].play();
                volumeIcon.className = 'fas fa-volume-up';
            } else {
                volumeIcon.className = 'fas fa-volume-mute';
            }
        });
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            sounds[soundType].volume = volume;
            
            if (volume === 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (volume < 0.5) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
            
            if (option.classList.contains('active')) {
                sounds[soundType].volume = volume;
            }
        });
    });
    
    // Modal close buttons
    modalCloseButtons.forEach(button => {
        button.addEventListener('click', () => {
            button.closest('.modal').classList.remove('active');
        });
    });
    
    // Close modals when clicking outside
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
            }
        });
    });
    
    // Tab switching in dashboard
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });
}

// Initialize
if (localStorage.getItem('lentora_theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.querySelector('i').className = 'fas fa-sun';
}

document.addEventListener('DOMContentLoaded', init);

//fix the drop down arrow moving down upon clicking
document.addEventListener('DOMContentLoaded', function() {
  const compactToggle = document.querySelector('.compact-toggle');
  const dropdownContent = document.querySelector('.sidebar-dropdown-content');
  
  if (!compactToggle || !dropdownContent) return;
  
  // Store original position
  const originalTransform = compactToggle.style.transform;
  
  compactToggle.addEventListener('click', function(e) {
    e.preventDefault();
    
    // Prevent any layout shift during toggle
    requestAnimationFrame(() => {
      const isExpanded = dropdownContent.classList.toggle('expanded');
      compactToggle.classList.toggle('expanded', isExpanded);
      compactToggle.setAttribute('aria-expanded', isExpanded);
      
      // Force arrow to stay in position
      compactToggle.style.transform = 'translateY(-50%)';
    });
  });
});