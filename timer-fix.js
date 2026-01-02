class UniversalTimerFix {
    constructor() {
        this.circle = document.querySelector('.progress-ring-circle');
        this.timeDisplay = document.getElementById('time-left');
        this.lastTime = '';
        this.totalSeconds = 0; 
        this.maxSeenSeconds = 0; // The magic variable to handle custom times
        
        if (!this.circle || !this.timeDisplay) return;
        this.init();
    }
    
    init() {
        const svg = document.querySelector('.progress-ring svg');
        if (svg) {
            svg.removeAttribute('width');
            svg.removeAttribute('height');
            svg.setAttribute('viewBox', '0 0 420 420');
        }
        
        const radius = 200;
        this.circumference = 2 * Math.PI * radius;
        this.circle.style.strokeDasharray = `${this.circumference} ${this.circumference}`;
        
        this.observeTime();
    }
    
    observeTime() {
        const observer = new MutationObserver(() => {
            const currentTime = this.timeDisplay.textContent;
            if (currentTime !== this.lastTime) {
                this.lastTime = currentTime;
                this.syncProgress();
            }
        });
        
        observer.observe(this.timeDisplay, { 
            childList: true, 
            characterData: true, 
            subtree: true 
        });
    }
    
    syncProgress() {
        const timeText = this.timeDisplay.textContent;
        const parts = timeText.split(':').map(Number);
        
        let currentSeconds = 0;
        if (parts.length === 2) {
            currentSeconds = (parts[0] * 60) + parts[1];
        } else if (parts.length === 3) {
            currentSeconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2];
        }

        if (currentSeconds > this.maxSeenSeconds) {
            this.maxSeenSeconds = currentSeconds;
        }

        const denominator = this.maxSeenSeconds || 1;
        const progress = currentSeconds / denominator;
        const offset = this.circumference * progress;

        if (currentSeconds >= this.maxSeenSeconds) {
            this.circle.style.transition = 'none'; 
        } else {
            this.circle.style.transition = 'stroke-dashoffset 1s linear';
        }

        this.circle.style.strokeDashoffset = offset;

        if (currentSeconds === 0) {
            this.maxSeenSeconds = 0;
        }
    }
}

function switchPhase(newPhase) {
    currentTimerType = newPhase;
    timeRemaining = getPhaseDuration(newPhase);

    updateTimerLabel();
    updateTimerDisplay(); // This updates the text that the Observer is watching

    // FIX: Reset the UniversalTimerFix calibration so the circle snaps correctly
    if (window.timerFix) {
        window.timerFix.maxSeenSeconds = timeRemaining;
    }

    if (newPhase === 'focus' && sessionNumber) {
        sessionNumber.textContent = sessionsCompleted + 1;
    }
}  

function skipTimer() {
    stopTimer(); // Stop the current ticking
    
    const nextPhase = determineNextPhase(false); 
    switchPhase(nextPhase); // This now resets the circle via the code above
    
    // Explicitly start the new session
    startTimer(); 
}

document.addEventListener('DOMContentLoaded', () => {
    window.timerFix = new UniversalTimerFix();
});