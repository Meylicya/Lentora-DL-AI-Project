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
            currentSeconds = (parts[0] * 60) + parts[1]; // mm:ss
        } else if (parts.length === 3) {
            currentSeconds = (parts[0] * 3600) + (parts[1] * 60) + parts[2]; // hh:mm:ss
        }

        // AUTO-CALIBRATION LOGIC:
        // If the timer jumps up (like after hitting 'Reset' or 'Apply'), 
        // we update our 100% mark.
        if (currentSeconds > this.maxSeenSeconds) {
            this.maxSeenSeconds = currentSeconds;
        }

        // Prevent division by zero
        const denominator = this.maxSeenSeconds || 1;
        const progress = currentSeconds / denominator;
        const offset = this.circumference * progress;
        
        this.circle.style.transition = 'stroke-dashoffset 1s linear';
        this.circle.style.strokeDashoffset = offset;

        // If timer hits zero, reset maxSeenSeconds for the next session
        if (currentSeconds === 0) {
            this.maxSeenSeconds = 0;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.timerFix = new UniversalTimerFix();
});