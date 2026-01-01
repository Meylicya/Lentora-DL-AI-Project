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
let timeRemaining = 25 * 60; // 25 minutes in seconds
let currentTimerType = 'focus'; // 'focus', 'shortBreak', 'longBreak'
let sessionsCompleted = 0;
let totalFocusTime = 0;
let tasksCompleted = 0;

// Timer Settings
let settings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
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
    // Load user data
    loadUserData();
    
    // Load saved settings
    loadSettings();
    
    // Load saved tasks
    loadTasks();
    
    // Initialize date display
    updateDateDisplay();
    
    // Initialize timer display
    updateTimerDisplay();
    
    // Initialize progress circle
    updateProgressCircle();
    
    // Initialize stats
    updateStats();
    
    // Load a random quote
    loadRandomQuote();
    
    // Load a random supportive message
    loadRandomMessage();
    
    // Set up event listeners
    setupEventListeners();
    
    // Initialize charts
    initCharts();
    
    // Check for notifications
    checkForNotifications();
}

// Load user data from localStorage
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

// Load settings from localStorage
function loadSettings() {
    const savedSettings = localStorage.getItem('lentora_settings');
    if (savedSettings) {
        settings = JSON.parse(savedSettings);
        
        // Update UI with saved settings
        focusDurationInput.value = settings.focusDuration;
        shortBreakDurationInput.value = settings.shortBreakDuration;
        longBreakDurationInput.value = settings.longBreakDuration;
        
        // Set initial timer based on settings
        if (currentTimerType === 'focus') {
            timeRemaining = settings.focusDuration * 60;
        }
    }
    
    updateTimerDisplay();
}

// Save settings to localStorage
function saveSettings() {
    localStorage.setItem('lentora_settings', JSON.stringify(settings));
}

// Load tasks from localStorage
function loadTasks() {
    const savedTasks = localStorage.getItem('lentora_tasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
        renderTasks();
    }
}

// Save tasks to localStorage
function saveTasks() {
    localStorage.setItem('lentora_tasks', JSON.stringify(tasks));
}

// Update date display
function updateDateDisplay() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDate.textContent = now.toLocaleDateString('en-US', options);
}

// Update timer display
function updateTimerDisplay() {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    
    timeLeft.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    // Update timer label based on current phase
    if (currentTimerType === 'focus') {
        timerLabel.textContent = 'Focus Time';
        currentPhase.textContent = 'Focus';
        document.querySelector('.phase-option[data-phase="focus"]').classList.add('active');
    } else if (currentTimerType === 'shortBreak') {
        timerLabel.textContent = 'Short Break';
        currentPhase.textContent = 'Short Break';
        document.querySelector('.phase-option[data-phase="short-break"]').classList.add('active');
    } else {
        timerLabel.textContent = 'Long Break';
        currentPhase.textContent = 'Long Break';
        document.querySelector('.phase-option[data-phase="long-break"]').classList.add('active');
    }
    
    updateProgressCircle();
}

// Update progress circle
function updateProgressCircle() {
    let totalTime;
    
    if (currentTimerType === 'focus') {
        totalTime = settings.focusDuration * 60;
    } else if (currentTimerType === 'shortBreak') {
        totalTime = settings.shortBreakDuration * 60;
    } else {
        totalTime = settings.longBreakDuration * 60;
    }
    
    const progress = ((totalTime - timeRemaining) / totalTime) * 100;
    const circumference = 2 * Math.PI * 130;
    const offset = circumference - (progress / 100) * circumference;
    
    progressCircle.style.strokeDasharray = `${circumference} ${circumference}`;
    progressCircle.style.strokeDashoffset = offset;
    
    // Update circle color based on phase
    if (currentTimerType === 'focus') {
        progressCircle.style.stroke = 'var(--thistle-mist)';
    } else if (currentTimerType === 'shortBreak') {
        progressCircle.style.stroke = 'var(--sage-depth)';
    } else {
        progressCircle.style.stroke = 'var(--forest-shadow)';
    }
}

// Start or pause the timer
function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

// Start the timer
function startTimer() {
    isRunning = true;
    startPauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause</span>';
    startPauseBtn.classList.add('active');
    
    timer = setInterval(() => {
        timeRemaining--;
        updateTimerDisplay();
        
        if (timeRemaining <= 0) {
            completeTimer();
        }
    }, 1000);
}

// Pause the timer
function pauseTimer() {
    isRunning = false;
    startPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
    startPauseBtn.classList.remove('active');
    
    clearInterval(timer);
}

// Reset the timer
function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    startPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
    startPauseBtn.classList.remove('active');
    
    // Reset to current phase duration
    if (currentTimerType === 'focus') {
        timeRemaining = settings.focusDuration * 60;
    } else if (currentTimerType === 'shortBreak') {
        timeRemaining = settings.shortBreakDuration * 60;
    } else {
        timeRemaining = settings.longBreakDuration * 60;
    }
    
    updateTimerDisplay();
}

// Skip current timer phase
function skipTimer() {
    clearInterval(timer);
    isRunning = false;
    startPauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Start</span>';
    
    completeTimer(true);
}

// Complete the current timer phase
function completeTimer(skipped = false) {
    clearInterval(timer);
    isRunning = false;
    
    // Play appropriate sound
    if (settings.soundEnabled) {
        if (currentTimerType === 'focus') {
            sessionEndSound.play();
            
            // Update stats
            sessionsCompleted++;
            totalFocusTime += settings.focusDuration;
            updateStats();
            
            // Show supportive message
            loadRandomMessage();
            
            // Show notification
            showNotification('Focus Session Complete!', 'Time for a break.', 'success');
        } else {
            breakEndSound.play();
            showNotification('Break Time Over!', 'Ready to focus again?', 'info');
        }
    }
    
    // Determine next phase
    if (currentTimerType === 'focus') {
        sessionsCompleted++;
        
        // Check if it's time for a long break
        if (sessionsCompleted % settings.longBreakInterval === 0) {
            currentTimerType = 'longBreak';
            timeRemaining = settings.longBreakDuration * 60;
        } else {
            currentTimerType = 'shortBreak';
            timeRemaining = settings.shortBreakDuration * 60;
        }
        
        // Update session counter
        sessionNumber.textContent = (sessionsCompleted % settings.longBreakInterval) + 1;
    } else {
        currentTimerType = 'focus';
        timeRemaining = settings.focusDuration * 60;
    }
    
    updateTimerDisplay();
    
    // Auto-start next timer if enabled
    if ((currentTimerType === 'shortBreak' || currentTimerType === 'longBreak') && settings.autoStartBreaks) {
        setTimeout(startTimer, 1000);
    } else if (currentTimerType === 'focus' && settings.autoStartFocus) {
        setTimeout(startTimer, 1000);
    }
}

// Update stats display
function updateStats() {
    document.getElementById('sessions-today').textContent = sessionsCompleted;
    document.getElementById('focus-time-today').textContent = `${totalFocusTime}m`;
    document.getElementById('tasks-completed').textContent = tasksCompleted;
    
    // Update dashboard stats
    document.getElementById('today-focus').textContent = `${totalFocusTime} min`;
    document.getElementById('today-sessions').textContent = sessionsCompleted;
    document.getElementById('today-tasks').textContent = tasksCompleted;
    
    // Save stats to localStorage
    saveStats();
}

// Save stats to localStorage
function saveStats() {
    const stats = {
        sessionsCompleted,
        totalFocusTime,
        tasksCompleted,
        lastUpdated: new Date().toISOString()
    };
    
    localStorage.setItem('lentora_stats', JSON.stringify(stats));
}

// Load a random quote
function loadRandomQuote() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    currentQuote.textContent = `"${quotes[randomIndex].text}"`;
    quoteAuthor.textContent = `- ${quotes[randomIndex].author}`;
}

// Load a random supportive message
function loadRandomMessage() {
    const randomIndex = Math.floor(Math.random() * supportiveMessages.length);
    messageText.textContent = supportiveMessages[randomIndex];
    
    // Add a random flower icon
    const icons = ['fa-spa', 'fa-leaf', 'fa-seedling', 'fa-feather-alt', 'fa-cloud'];
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];
    messageCard.querySelector('i').className = `fas ${randomIcon}`;
}

// Render tasks based on current filter
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
    
    filteredTasks.forEach((task, index) => {
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

// Add a new task
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
    
    // Show notification
    showNotification('Task Added', `"${title}" has been added to your list.`, 'success');
    
    // If shared, simulate sharing with friends
    if (shared) {
        setTimeout(() => {
            showNotification('Task Shared', `"${title}" has been shared with your focus group.`, 'info');
        }, 500);
    }
}

// Toggle task completion
function toggleTaskCompletion(e) {
    const taskId = parseInt(e.currentTarget.dataset.id);
    const taskIndex = tasks.findIndex(task => task.id === taskId);
    
    if (taskIndex !== -1) {
        tasks[taskIndex].completed = !tasks[taskIndex].completed;
        
        if (tasks[taskIndex].completed) {
            tasksCompleted++;
            
            // Show celebration for completing a task
            showNotification('Task Completed!', `"${tasks[taskIndex].title}" is done!`, 'success');
            
            // If it's a shared task, simulate friend notification
            if (tasks[taskIndex].shared) {
                setTimeout(() => {
                    showNotification('Friend Update', 'A friend completed a task before you!', 'info');
                }, 1500);
            }
        } else {
            tasksCompleted = Math.max(0, tasksCompleted - 1);
        }
        
        saveTasks();
        updateStats();
        renderTasks();
    }
}

// Delete a task
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

// Show notification
function showNotification(title, message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Set icon based on type
    let icon = 'fa-info-circle';
    if (type === 'success') icon = 'fa-check-circle';
    if (type === 'warning') icon = 'fa-exclamation-triangle';
    if (type === 'error') icon = 'fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="notification-content">
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    notificationContainer.appendChild(notification);
    
    // Add close event
    notification.querySelector('.notification-close').addEventListener('click', () => {
        notification.remove();
    });
    
    // Auto-remove after 5 seconds
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
    
    // Add slideOut animation
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(styleSheet);
}

// Toggle sidebar
function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('collapsed');
}

// Toggle theme
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

// Apply custom durations
function applyCustomDurations() {
    settings.focusDuration = parseInt(focusDurationInput.value) || 25;
    settings.shortBreakDuration = parseInt(shortBreakDurationInput.value) || 5;
    settings.longBreakDuration = parseInt(longBreakDurationInput.value) || 15;
    
    // Update timer if it's not running
    if (!isRunning) {
        if (currentTimerType === 'focus') {
            timeRemaining = settings.focusDuration * 60;
        } else if (currentTimerType === 'shortBreak') {
            timeRemaining = settings.shortBreakDuration * 60;
        } else {
            timeRemaining = settings.longBreakDuration * 60;
        }
        
        updateTimerDisplay();
    }
    
    saveSettings();
    
    showNotification('Settings Updated', 'Timer durations have been updated.', 'success');
}

// Change timer phase
function changePhase(e) {
    const phase = e.currentTarget.dataset.phase;
    
    // Remove active class from all phase options
    phaseOptions.forEach(option => option.classList.remove('active'));
    
    // Add active class to clicked option
    e.currentTarget.classList.add('active');
    
    // If timer is running, ask for confirmation
    if (isRunning) {
        if (!confirm('Changing phase will reset the current timer. Continue?')) {
            // Revert active class
            document.querySelector(`.phase-option[data-phase="${currentTimerType === 'focus' ? 'focus' : currentTimerType === 'shortBreak' ? 'short-break' : 'long-break'}"]`).classList.add('active');
            return;
        }
        
        pauseTimer();
    }
    
    // Update timer based on selected phase
    if (phase === 'focus') {
        currentTimerType = 'focus';
        timeRemaining = settings.focusDuration * 60;
    } else if (phase === 'short-break') {
        currentTimerType = 'shortBreak';
        timeRemaining = settings.shortBreakDuration * 60;
    } else {
        currentTimerType = 'longBreak';
        timeRemaining = settings.longBreakDuration * 60;
    }
    
    updateTimerDisplay();
}

// Initialize charts
function initCharts() {
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(232, 224, 248, 0.3)'
                    },
                    ticks: {
                        color: 'var(--mauve-whisper)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(232, 224, 248, 0.3)'
                    },
                    ticks: {
                        color: 'var(--mauve-whisper)'
                    }
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(232, 224, 248, 0.3)'
                    },
                    ticks: {
                        color: 'var(--mauve-whisper)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(232, 224, 248, 0.3)'
                    },
                    ticks: {
                        color: 'var(--mauve-whisper)'
                    }
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
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(232, 224, 248, 0.3)'
                    },
                    ticks: {
                        color: 'var(--mauve-whisper)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(232, 224, 248, 0.3)'
                    },
                    ticks: {
                        color: 'var(--mauve-whisper)'
                    }
                }
            }
        }
    });
}

// Toggle dashboard modal
function toggleDashboard() {
    dashboardModal.classList.toggle('active');
}

// Toggle task modal
function toggleTaskModal() {
    taskModal.classList.toggle('active');
    if (taskModal.classList.contains('active')) {
        taskForm.reset();
    }
}

// Toggle invite modal
function toggleInviteModal() {
    inviteModal.classList.toggle('active');
}

// Copy session link to clipboard
function copySessionLink() {
    const linkInput = document.getElementById('session-link');
    linkInput.select();
    linkInput.setSelectionRange(0, 99999); // For mobile devices
    
    navigator.clipboard.writeText(linkInput.value)
        .then(() => {
            showNotification('Link Copied', 'Session link copied to clipboard!', 'success');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            showNotification('Error', 'Failed to copy link. Please try again.', 'error');
        });
}

// Send invitation
function sendInvitation() {
    const friendEmail = document.getElementById('friend-email').value;
    const message = document.getElementById('invite-message').value;
    
    if (!friendEmail || !isValidEmail(friendEmail)) {
        showNotification('Invalid Email', 'Please enter a valid email address.', 'error');
        return;
    }
    
    // Simulate sending invitation
    showNotification('Invitation Sent', `Invitation sent to ${friendEmail}.`, 'success');
    
    // Close modal after delay
    setTimeout(() => {
        inviteModal.classList.remove('active');
        document.getElementById('friend-email').value = '';
        document.getElementById('invite-message').value = 'Join me for a focused work session!';
    }, 2000);
}

// Logout
function logout() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear user data if guest
        if (user.mode === 'guest') {
            localStorage.removeItem('lentora_tasks');
            localStorage.removeItem('lentora_stats');
        }
        
        // Redirect to index page
        window.location.href = 'index.html';
    }
}


// Setup all event listeners
function setupEventListeners() {
    // Sidebar toggle
    sidebarToggle.addEventListener('click', toggleSidebar);
    
    // Theme toggle
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
            // Toggle active state
            soundOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.toggle('active');
            
            // Stop all sounds
            Object.values(sounds).forEach(sound => {
                sound.pause();
                sound.currentTime = 0;
            });
            
            // If becoming active, play the sound
            if (option.classList.contains('active')) {
                sounds[soundType].volume = volumeSlider.value / 100;
                sounds[soundType].play();
                volumeIcon.className = 'fas fa-volume-up';
            } else {
                volumeIcon.className = 'fas fa-volume-mute';
            }
        });
        
        // Volume slider
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            sounds[soundType].volume = volume;
            
            // Update icon
            if (volume === 0) {
                volumeIcon.className = 'fas fa-volume-mute';
            } else if (volume < 0.5) {
                volumeIcon.className = 'fas fa-volume-down';
            } else {
                volumeIcon.className = 'fas fa-volume-up';
            }
            
            // If sound is active, update volume
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
            // Remove active class from all tabs and tab contents
            document.querySelectorAll('.tab-btn').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked tab and corresponding content
            tab.classList.add('active');
            document.getElementById(`${tab.dataset.tab}-tab`).classList.add('active');
        });
    });
}

// Utility function to validate email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Check for saved theme preference
if (localStorage.getItem('lentora_theme') === 'dark') {
    document.body.classList.add('dark-theme');
    themeToggle.querySelector('i').className = 'fas fa-sun';
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
function createPriorityBoxes() {
    const prioritySelect = document.getElementById('task-priority');
    if (!prioritySelect) return;

    // Create boxes container
    const boxesContainer = document.createElement('div');
    boxesContainer.className = 'priority-boxes';

    

    // Create each priority box
    priorities.forEach(priority => {
        const box = document.createElement('button');
        box.type = 'button';
        box.className = 'priority-box';
        box.dataset.value = priority.value;
        box.innerHTML = `
            <i class="${priority.icon}"></i>
            <span>${priority.label}</span>
        `;

        // Set active if matches current selection
        if (priority.value === prioritySelect.value) {
            box.classList.add('active');
        }

        // Handle box click
        box.addEventListener('click', function () {
            // Remove active class from all boxes
            document.querySelectorAll('.priority-box').forEach(b => {
                b.classList.remove('active');
            });

            // Add active class to clicked box
            this.classList.add('active');

            // Update the hidden select
            prioritySelect.value = this.dataset.value;

            // Trigger change event
            prioritySelect.dispatchEvent(new Event('change'));

            // Add animation effect
            this.style.transform = 'translateY(-2px) scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'translateY(-2px) scale(1)';
            }, 150);
        });

        boxesContainer.appendChild(box);
    });

    // Insert boxes after the select
    prioritySelect.parentNode.insertBefore(boxesContainer, prioritySelect.nextSibling);
}
// Find the end of your existing dashboard.js file
// Add the form handling code right before the file ends
// Make sure you're not inside another function

// FORM HANDLING CODE GOES HERE AT THE END OF THE FILE