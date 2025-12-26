// notifications.js - Enhanced notification system with sound support

class NotificationSystem {
    constructor() {
        this.audioEnabled = false;
        this.notificationSounds = {};
        this.soundEnabled = true;
        this.init();
    }
    
    init() {
        // Load sound preference
        this.loadSoundPreference();
        
        // Initialize notification container
        this.setupNotificationContainer();
        
        // Setup audio system
        this.setupAudioSystem();
        
        // Preload notification sounds
        this.preloadSounds();
        
        // Request notification permissions
        this.requestPermissions();
        
        // Override the existing showNotification function
        this.overrideExistingNotification();
        
        // Add sound toggle to UI
        this.addSoundToggle();
    }
    
    loadSoundPreference() {
        const saved = localStorage.getItem('lentora_sound_enabled');
        this.soundEnabled = saved !== 'false'; // Default to true
    }
    
    saveSoundPreference() {
        localStorage.setItem('lentora_sound_enabled', this.soundEnabled);
    }
    
    setupNotificationContainer() {
        // Ensure notification container exists and is empty
        let container = document.getElementById('notification-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notification-container';
            container.className = 'notification-container';
            document.body.appendChild(container);
        }
        
        // Clear any old notifications
        container.innerHTML = '';
    }
    
    setupAudioSystem() {
        // Browser autoplay policy requires user interaction before playing audio
        // We'll unlock audio on first user interaction
        
        const unlockAudio = () => {
            if (!this.audioEnabled && this.soundEnabled) {
                try {
                    // Create and resume AudioContext
                    const AudioContext = window.AudioContext || window.webkitAudioContext;
                    const audioContext = new AudioContext();
                    
                    // Play silent sound to unlock audio
                    const buffer = audioContext.createBuffer(1, 1, 22050);
                    const source = audioContext.createBufferSource();
                    source.buffer = buffer;
                    source.connect(audioContext.destination);
                    source.start(0);
                    
                    this.audioEnabled = true;
                    console.log('🔊 Audio unlocked for notifications');
                    
                    // Show hint notification
                    setTimeout(() => {
                        this.show({
                            title: 'Sound Enabled',
                            message: 'Notification sounds are now active.',
                            type: 'success',
                            duration: 3000
                        });
                    }, 1000);
                    
                    // Remove event listeners
                    document.removeEventListener('click', unlockAudio);
                    document.removeEventListener('keydown', unlockAudio);
                    document.removeEventListener('touchstart', unlockAudio);
                } catch (error) {
                    console.error('Failed to unlock audio:', error);
                }
            }
        };
        
        // Listen for user interaction
        ['click', 'keydown', 'touchstart'].forEach(event => {
            document.addEventListener(event, unlockAudio, { once: true });
        });
        
        // Show hint for first-time users
        setTimeout(() => {
            if (!this.audioEnabled && this.soundEnabled) {
                this.show({
                    title: 'Enable Sounds',
                    message: 'Click anywhere to enable notification sounds',
                    type: 'info',
                    duration: 5000
                });
            }
        }, 2000);
    }
    
    preloadSounds() {
        // Use the existing audio elements from dashboard.html
        this.notificationSounds = {
            focusEnd: document.getElementById('session-end-sound'),
            breakEnd: document.getElementById('break-end-sound'),
            success: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-achievement-bell-600.mp3'),
            info: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-happy-bells-notification-937.mp3'),
            taskComplete: this.createSound('https://assets.mixkit.co/sfx/preview/mixkit-winning-chimes-2015.mp3')
        };
        
        // Set volume for notification sounds
        Object.values(this.notificationSounds).forEach(sound => {
            if (sound) {
                sound.volume = 0.4; // 40% volume for subtlety
                sound.preload = 'auto';
            }
        });
    }
    
    createSound(url) {
        const audio = new Audio();
        audio.src = url;
        audio.preload = 'auto';
        return audio;
    }
    
    async requestPermissions() {
        // Request browser notification permissions
        if ('Notification' in window && Notification.permission === 'default') {
            try {
                await Notification.requestPermission();
            } catch (error) {
                console.warn('Notification permission request failed:', error);
            }
        }
    }
    
    overrideExistingNotification() {
        // Store the original function
        const originalShowNotification = window.showNotification;
        
        // Override with our enhanced version
        window.showNotification = (title, message, type = 'info') => {
            // Suppress the old-style notifications for timer events
            if (title.includes('Session Complete') || title.includes('Break Time')) {
                return; // Don't show old notifications for timer events
            }
            
            this.show({
                title,
                message,
                type,
                playSound: this.soundEnabled && (type === 'success' || type === 'info' || type === 'error')
            });
        };
    }
    
    playSound(soundType) {
        if (!this.audioEnabled || !this.soundEnabled) return false;
        
        const sound = this.notificationSounds[soundType];
        if (!sound) return false;
        
        try {
            sound.currentTime = 0;
            return sound.play().then(() => true).catch(error => {
                console.log('Sound play failed:', error);
                // Try to re-enable audio on next interaction
                this.audioEnabled = false;
                return false;
            });
        } catch (error) {
            console.error('Error playing sound:', error);
            return false;
        }
    }
    
    show(options) {
        const {
            title,
            message,
            type = 'info',
            duration = 5000,
            playSound = true,
            actions = []
        } = options;
        
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `system-notification ${type}`;
        
        // Set icon based on type
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'warning') icon = 'fa-exclamation-triangle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        
        // Play sound if enabled and requested
        let soundPlayed = false;
        if (playSound && this.soundEnabled) {
            switch (type) {
                case 'success':
                    soundPlayed = this.playSound('success');
                    break;
                case 'error':
                    // Use info sound for errors to avoid harsh sounds
                    soundPlayed = this.playSound('info');
                    break;
                default:
                    soundPlayed = this.playSound('info');
            }
        }
        
        // Set sound indicator text
        const soundIndicator = !this.soundEnabled ? 
            '<div class="sound-indicator"><i class="fas fa-volume-mute"></i> Sounds disabled</div>' :
            soundPlayed ? 
            '<div class="sound-indicator"><i class="fas fa-volume-up"></i> Sound played</div>' : 
            '<div class="sound-indicator"><i class="fas fa-volume-mute"></i> Click to enable sounds</div>';
        
        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
                ${actions.length > 0 ? `
                    <div class="notification-actions">
                        ${actions.map(action => 
                            `<button class="notification-action-btn" data-action="${action.id}">${action.label}</button>`
                        ).join('')}
                    </div>
                ` : ''}
                ${soundIndicator}
                <div class="notification-progress"></div>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        document.getElementById('notification-container').appendChild(notification);
        
        // Add close event
        notification.querySelector('.notification-close').addEventListener('click', () => {
            this.dismiss(notification);
        });
        
        // Add action events
        notification.querySelectorAll('.notification-action-btn').forEach(button => {
            button.addEventListener('click', (e) => {
                const actionId = e.target.dataset.action;
                const action = actions.find(a => a.id === actionId);
                if (action && action.callback) {
                    action.callback();
                }
                this.dismiss(notification);
            });
        });
        
        // Auto-dismiss after duration
        const autoDismiss = setTimeout(() => {
            this.dismiss(notification);
        }, duration);
        
        // Pause auto-dismiss on hover
        notification.addEventListener('mouseenter', () => {
            clearTimeout(autoDismiss);
            const progress = notification.querySelector('.notification-progress');
            if (progress) {
                progress.style.animationPlayState = 'paused';
            }
        });
        
        notification.addEventListener('mouseleave', () => {
            const progress = notification.querySelector('.notification-progress');
            if (!progress) return;
            
            const remainingTime = duration * (
                parseFloat(getComputedStyle(progress).width) / 
                progress.offsetWidth
            );
            
            if (remainingTime > 0) {
                setTimeout(() => {
                    this.dismiss(notification);
                }, remainingTime);
            }
        });
        
        // Also show browser notification if permission granted
        if (Notification.permission === 'granted') {
            try {
                new Notification(title, {
                    body: message,
                    icon: '/favicon.ico',
                    tag: 'lentora-notification'
                });
            } catch (error) {
                console.log('Browser notification failed:', error);
            }
        }
        
        return notification;
    }
    
    dismiss(notification) {
        notification.style.animation = 'notificationSlideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification && notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }
    
    // Specialized notifications for Pomodoro
    notifyFocusEnd() {
        // Play focus end sound
        if (this.soundEnabled && this.audioEnabled) {
            this.playSound('focusEnd');
        }
        
        return this.show({
            title: 'Focus Session Complete! 🌿',
            message: 'Time for a well-deserved break. Your focus has blossomed!',
            type: 'success',
            duration: 6000,
            playSound: false, // We already played the specific sound
            actions: [
                {
                    id: 'start-break',
                    label: 'Start Break',
                    callback: () => {
                        if (window.skipTimer) {
                            window.skipTimer();
                        }
                    }
                }
            ]
        });
    }
    
    notifyBreakEnd() {
        // Play break end sound
        if (this.soundEnabled && this.audioEnabled) {
            this.playSound('breakEnd');
        }
        
        return this.show({
            title: 'Break Time Over! 🌸',
            message: 'Ready to plant more seeds of productivity?',
            type: 'info',
            duration: 5000,
            playSound: false, // We already played the specific sound
            actions: [
                {
                    id: 'start-focus',
                    label: 'Start Focus',
                    callback: () => {
                        if (window.skipTimer) {
                            window.skipTimer();
                        }
                    }
                }
            ]
        });
    }
    
    notifyTaskCompleted(taskTitle) {
        // Play task complete sound
        if (this.soundEnabled && this.audioEnabled) {
            this.playSound('taskComplete');
        }
        
        return this.show({
            title: 'Task Completed! 🎉',
            message: `"${taskTitle}" has been marked as complete. Your garden grows!`,
            type: 'success',
            duration: 5000,
            playSound: false // We already played the specific sound
        });
    }
    
    notifyFriendActivity(friendName, action) {
        return this.show({
            title: `${friendName} ${action}`,
            message: `Your friend just ${action}. Keep growing together!`,
            type: 'info',
            duration: 4000,
            playSound: true
        });
    }
    
    toggleSound() {
        this.soundEnabled = !this.soundEnabled;
        this.saveSoundPreference();
        
        this.show({
            title: this.soundEnabled ? 'Sounds Enabled' : 'Sounds Disabled',
            message: this.soundEnabled ? 
                'Notification sounds are now active.' : 
                'Notification sounds are now muted.',
            type: 'info',
            duration: 3000,
            playSound: false // Don't play sound when toggling sound
        });
        
        return this.soundEnabled;
    }
    
    addSoundToggle() {
        // Add sound toggle button to the header
        const headerRight = document.querySelector('.header-right');
        if (headerRight && !document.getElementById('sound-toggle-btn')) {
            const soundToggleBtn = document.createElement('button');
            soundToggleBtn.id = 'sound-toggle-btn';
            soundToggleBtn.className = 'btn-icon';
            soundToggleBtn.innerHTML = `
                <i class="fas ${this.soundEnabled ? 'fa-volume-up' : 'fa-volume-mute'}"></i>
                <span>Sound</span>
            `;
            
            soundToggleBtn.addEventListener('click', () => {
                const enabled = this.toggleSound();
                soundToggleBtn.innerHTML = `
                    <i class="fas ${enabled ? 'fa-volume-up' : 'fa-volume-mute'}"></i>
                    <span>Sound</span>
                `;
            });
            
            // Insert before logout button
            headerRight.insertBefore(soundToggleBtn, headerRight.lastElementChild);
        }
    }
}

// Initialize notification system when DOM is loaded
let notificationSystem;

document.addEventListener('DOMContentLoaded', () => {
    notificationSystem = new NotificationSystem();
    
    // Hook into timer completion (FIX for double notifications)
    hookIntoTimerCompletion();
    
    // Hook into task completion
    hookIntoTaskCompletion();
});

function hookIntoTimerCompletion() {
    // Store original completeTimer function
    const originalCompleteTimer = window.completeTimer;
    
    if (originalCompleteTimer) {
        window.completeTimer = function(skipped = false) {
            // Call original function but suppress its notifications
            const originalSoundSetting = window.settings ? window.settings.soundEnabled : true;
            
            // Temporarily disable sound in settings to prevent old notification sounds
            if (window.settings) {
                window.settings.soundEnabled = false;
            }
            
            // Call original function
            originalCompleteTimer.call(this, skipped);
            
            // Restore sound setting
            if (window.settings) {
                window.settings.soundEnabled = originalSoundSetting;
            }
            
            // Show our enhanced notification (only if not skipped)
            if (notificationSystem && !skipped) {
                setTimeout(() => {
                    if (this.currentTimerType === 'focus') {
                        notificationSystem.notifyFocusEnd();
                    } else {
                        notificationSystem.notifyBreakEnd();
                    }
                }, 100);
            }
        };
    }
    
    // Also override the timer's notification calls directly
    const timerModule = {
        completeTimer: window.completeTimer
    };
}

function hookIntoTaskCompletion() {
    // Hook into task completion
    const originalToggleTaskCompletion = window.toggleTaskCompletion;
    
    if (originalToggleTaskCompletion) {
        window.toggleTaskCompletion = function(e) {
            const taskId = parseInt(e.currentTarget.dataset.id);
            const taskIndex = window.tasks ? window.tasks.findIndex(task => task.id === taskId) : -1;
            
            // Store task title before toggling
            let taskTitle = '';
            if (taskIndex !== -1 && window.tasks) {
                taskTitle = window.tasks[taskIndex].title;
            }
            
            // Call original function
            originalToggleTaskCompletion.call(this, e);
            
            // Show notification if task was completed (not uncompleted)
            if (notificationSystem && taskIndex !== -1 && window.tasks && 
                window.tasks[taskIndex] && window.tasks[taskIndex].completed) {
                setTimeout(() => {
                    notificationSystem.notifyTaskCompleted(taskTitle);
                }, 300);
            }
        };
    }
}

// Export for use in other files
window.NotificationSystem = NotificationSystem;

// Debug function to test sounds
window.testNotificationSounds = function() {
    if (!notificationSystem) {
        console.error('Notification system not initialized');
        return;
    }
    
    const sounds = ['focusEnd', 'breakEnd', 'success', 'info', 'taskComplete'];
    let index = 0;
    
    function playNextSound() {
        if (index < sounds.length) {
            const soundType = sounds[index];
            console.log(`Testing sound: ${soundType}`);
            
            notificationSystem.show({
                title: `Sound Test: ${soundType}`,
                message: 'This is a test notification sound.',
                type: 'info',
                duration: 2000,
                playSound: true
            });
            
            index++;
            setTimeout(playNextSound, 2500);
        }
    }
    
    playNextSound();
};
