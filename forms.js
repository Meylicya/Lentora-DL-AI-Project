// forms.js - Form handling for Lentora Workspace

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Forms.js loaded - Form handling initialized');
    
    // ======================
    // ELEMENT REFERENCES
    // ======================
    const taskModal = document.getElementById('task-modal');
    const inviteModal = document.getElementById('invite-modal');
    const dashboardModal = document.getElementById('dashboard-modal');
    const addTaskBtn = document.getElementById('add-task-btn');
    const inviteFriendBtn = document.getElementById('invite-friend');
    const saveTaskBtn = document.getElementById('save-task');
    const sendInvitationBtn = document.getElementById('send-invitation');
    const taskForm = document.getElementById('task-form');
    const todoList = document.getElementById('todo-list');
    const applyDurationsBtn = document.getElementById('apply-durations');
    
    // ======================
    // STATE MANAGEMENT
    // ======================
    let taskId = localStorage.getItem('taskIdCounter') || 1;
    let editingTaskId = null;
    
    // ======================
    // MODAL HANDLING
    // ======================
    
    // Close modals when clicking X or cancel button
    const modalCloses = document.querySelectorAll('.modal-close, .btn-secondary.modal-close');
    modalCloses.forEach(btn => {
        btn.addEventListener('click', function() {
            const modal = this.closest('.modal');
            if (modal) {
                closeModal(modal);
            }
        });
    });
    
    // Close modal when clicking outside content
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this && !e.target.closest('.modal-content')) {
                closeModal(this);
            }
        });
    });
    
    // Close modal with Escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                closeModal(modal);
            });
        }
    });
    
    // Open Add Task Modal
    addTaskBtn.addEventListener('click', function() {
        openModal(taskModal);
        resetTaskForm();
        setTimeout(() => {
            const titleInput = document.getElementById('task-title');
            if (titleInput) titleInput.focus();
        }, 100);
    });
    
    // Open Invite Modal
    inviteFriendBtn.addEventListener('click', function() {
        openModal(inviteModal);
        setTimeout(() => {
            const emailInput = document.getElementById('friend-email');
            if (emailInput) emailInput.focus();
        }, 100);
    });
    
    // ======================
    // TASK FORM HANDLING
    // ======================
    
    // Handle task form submission
    if (taskForm) {
        taskForm.addEventListener('submit', function(e) {
            e.preventDefault();
            handleSaveTask();
        });
    }
    
    // Save task button click
    if (saveTaskBtn) {
        saveTaskBtn.addEventListener('click', handleSaveTask);
    }
    
    function handleSaveTask() {
        const title = getInputValue('task-title');
        const description = getInputValue('task-description');
        const priority = getInputValue('task-priority');
        const isShared = document.getElementById('task-shared')?.checked || false;
        
        // Validate
        if (!validateRequired(title, 'Task title')) {
            return;
        }
        
        // Create or update task
        if (editingTaskId) {
            updateExistingTask(editingTaskId, title, description, priority, isShared);
        } else {
            createNewTask(title, description, priority, isShared);
        }
        
        // Close modal
        closeModal(taskModal);
        resetTaskForm();
    }
    
    // ======================
    // INVITATION FORM HANDLING
    // ======================
    
    if (sendInvitationBtn) {
        sendInvitationBtn.addEventListener('click', handleSendInvitation);
    }
    
    function handleSendInvitation() {
        const email = getInputValue('friend-email');
        const message = getInputValue('invite-message') || 'Join me for a focused work session!';
        
        // Validate
        if (!validateRequired(email, "Friend's email")) {
            return;
        }
        
        if (!validateEmail(email)) {
            showNotification('Please enter a valid email address', 'warning');
            return;
        }
        
        // Show loading state
        const originalText = sendInvitationBtn.innerHTML;
        sendInvitationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
        sendInvitationBtn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
            // Save invitation to localStorage (in real app, send to backend)
            saveInvitation(email, message);
            
            // Show success
            showNotification(`Invitation sent to ${email}`, 'success');
            
            // Close modal
            closeModal(inviteModal);
            document.getElementById('friend-email').value = '';
            document.getElementById('invite-message').value = 'Join me for a focused work session!';
            
            // Reset button
            sendInvitationBtn.innerHTML = originalText;
            sendInvitationBtn.disabled = false;
        }, 1500);
    }
    
    // ======================
    // CUSTOM DURATIONS
    // ======================
    
    if (applyDurationsBtn) {
        applyDurationsBtn.addEventListener('click', handleApplyDurations);
    }
    
    function handleApplyDurations() {
        const focusDuration = parseInt(getInputValue('focus-duration'));
        const shortBreakDuration = parseInt(getInputValue('short-break-duration'));
        const longBreakDuration = parseInt(getInputValue('long-break-duration'));
        
        // Validate
        if (!validateDuration(focusDuration, 1, 60, 'Focus duration') ||
            !validateDuration(shortBreakDuration, 1, 30, 'Short break duration') ||
            !validateDuration(longBreakDuration, 5, 60, 'Long break duration')) {
            return;
        }
        
        // Update UI
        updatePhaseDurations(focusDuration, shortBreakDuration, longBreakDuration);
        
        // Save to localStorage
        saveDurationsToStorage(focusDuration, shortBreakDuration, longBreakDuration);
        
        showNotification('Timer durations updated successfully!', 'success');
    }
    
    // ======================
    // TASK MANAGEMENT
    // ======================
    
    function createNewTask(title, description, priority, isShared) {
        const taskIdNum = parseInt(taskId);
        const taskElement = createTaskElement(taskIdNum, title, description, priority, isShared);
        
        // Add to list
        todoList.insertBefore(taskElement, todoList.firstChild);
        
        // If shared, add to shared workspace
        if (isShared) {
            addSharedTask(taskIdNum, title, 'You');
        }
        
        // Save to localStorage
        saveTaskToStorage(taskIdNum, title, description, priority, isShared, false);
        
        // Increment task ID
        taskId++;
        localStorage.setItem('taskIdCounter', taskId);
        
        // Update stats
        updateTaskStats();
        
        showNotification('Task added successfully!', 'success');
    }
    
    function updateExistingTask(taskId, title, description, priority, isShared) {
        const taskElement = document.querySelector(`.todo-item[data-task-id="${taskId}"]`);
        if (!taskElement) return;
        
        // Update task element
        updateTaskElement(taskElement, title, description, priority, isShared);
        
        // Update in localStorage
        updateTaskInStorage(taskId, title, description, priority, isShared);
        
        // Update shared tasks if needed
        updateSharedTask(taskId, title, isShared);
        
        editingTaskId = null;
        showNotification('Task updated successfully!', 'success');
    }
    
    function createTaskElement(id, title, description, priority, isShared) {
        const taskElement = document.createElement('div');
        taskElement.className = 'todo-item';
        taskElement.dataset.taskId = id;
        
        taskElement.innerHTML = `
            <div class="todo-checkbox" onclick="toggleTaskComplete(${id})"></div>
            <div class="todo-content">
                <div class="todo-title">${escapeHtml(title)}</div>
                ${description ? `<div class="todo-description">${escapeHtml(description)}</div>` : ''}
                <span class="todo-priority ${priority}">${priority.toUpperCase()}</span>
                ${isShared ? '<span class="shared-badge"><i class="fas fa-users"></i> Shared</span>' : ''}
            </div>
            <div class="todo-actions">
                <button class="todo-action-btn" onclick="editTask(${id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="todo-action-btn" onclick="deleteTask(${id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        return taskElement;
    }
    
    // ======================
    // SHARED TASKS
    // ======================
    
    function addSharedTask(taskId, title, user) {
        const sharedTasks = document.getElementById('shared-tasks');
        const sharedWorkspace = document.getElementById('shared-workspace');
        
        if (!sharedTasks) return;
        
        // Show shared workspace
        sharedWorkspace.style.display = 'block';
        
        const sharedElement = document.createElement('div');
        sharedElement.className = 'shared-task';
        sharedElement.dataset.taskId = taskId;
        
        sharedElement.innerHTML = `
            <div class="shared-task-info">
                <div class="shared-task-user"><i class="fas fa-user"></i> ${user}</div>
                <div class="shared-task-title">${escapeHtml(title)}</div>
            </div>
            <span class="shared-task-status">In Progress</span>
        `;
        
        sharedTasks.appendChild(sharedElement);
    }
    
    // ======================
    // LOAD SAVED DATA
    // ======================
    
    loadSavedData();
    
    function loadSavedData() {
        // Load durations
        const durations = getDurationsFromStorage();
        if (durations) {
            document.getElementById('focus-duration').value = durations.focus;
            document.getElementById('short-break-duration').value = durations.shortBreak;
            document.getElementById('long-break-duration').value = durations.longBreak;
            updatePhaseDurations(durations.focus, durations.shortBreak, durations.longBreak);
        }
        
        // Load tasks
        const tasks = getTasksFromStorage();
        tasks.forEach(task => {
            const taskElement = createTaskElement(
                task.id,
                task.title,
                task.description,
                task.priority,
                task.shared,
                task.completed
            );
            
            if (task.completed) {
                taskElement.classList.add('completed');
                taskElement.querySelector('.todo-checkbox').classList.add('checked');
            }
            
            todoList.appendChild(taskElement);
            
            if (task.shared) {
                addSharedTask(task.id, task.title, 'You');
            }
        });
        
        updateTaskStats();
    }
    
    // ======================
    // HELPER FUNCTIONS
    // ======================
    
    function openModal(modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    function closeModal(modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
        resetTaskForm();
    }
    
    function resetTaskForm() {
        if (taskForm) {
            taskForm.reset();
            document.getElementById('task-priority').value = 'medium';
            document.getElementById('task-shared').checked = false;
        }
        editingTaskId = null;
        if (saveTaskBtn) {
            saveTaskBtn.innerHTML = '<i class="fas fa-check"></i> Save Task';
        }
    }
    
    function getInputValue(id) {
        const element = document.getElementById(id);
        return element ? element.value.trim() : '';
    }
    
    // ======================
    // VALIDATION FUNCTIONS
    // ======================
    
    function validateRequired(value, fieldName) {
        if (!value) {
            showNotification(`${fieldName} is required`, 'warning');
            return false;
        }
        return true;
    }
    
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    function validateDuration(value, min, max, fieldName) {
        if (isNaN(value) || value < min || value > max) {
            showNotification(`${fieldName} must be between ${min} and ${max}`, 'warning');
            return false;
        }
        return true;
    }
    
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
    
    // ======================
    // UI UPDATE FUNCTIONS
    // ======================
    
    function updatePhaseDurations(focus, shortBreak, longBreak) {
        // Update phase toggle buttons
        const focusBtn = document.querySelector('[data-phase="focus"] .phase-duration');
        const shortBreakBtn = document.querySelector('[data-phase="short-break"] .phase-duration');
        const longBreakBtn = document.querySelector('[data-phase="long-break"] .phase-duration');
        
        if (focusBtn) focusBtn.textContent = `${focus.toString().padStart(2, '0')}:00`;
        if (shortBreakBtn) shortBreakBtn.textContent = `${shortBreak.toString().padStart(2, '0')}:00`;
        if (longBreakBtn) longBreakBtn.textContent = `${longBreak.toString().padStart(2, '0')}:00`;
    }
    
    function updateTaskStats() {
        const totalTasks = document.querySelectorAll('.todo-item').length;
        const completedTasks = document.querySelectorAll('.todo-item.completed').length;
        
        // Update sidebar stats
        const tasksCompletedElement = document.getElementById('tasks-completed');
        if (tasksCompletedElement) {
            tasksCompletedElement.textContent = completedTasks;
        }
        
        // Update dashboard if open
        const todayTasksElement = document.getElementById('today-tasks');
        if (todayTasksElement) {
            todayTasksElement.textContent = completedTasks;
        }
    }
});

// ======================
// GLOBAL FUNCTIONS
// (Accessible from HTML onclick)
// ======================

// Toggle task completion
window.toggleTaskComplete = function(taskId) {
    const taskElement = document.querySelector(`.todo-item[data-task-id="${taskId}"]`);
    if (!taskElement) return;
    
    const checkbox = taskElement.querySelector('.todo-checkbox');
    const isCompleted = !taskElement.classList.contains('completed');
    
    // Toggle UI
    taskElement.classList.toggle('completed');
    checkbox.classList.toggle('checked');
    
    // Update shared task status
    const sharedTask = document.querySelector(`.shared-task[data-task-id="${taskId}"]`);
    if (sharedTask) {
        const status = sharedTask.querySelector('.shared-task-status');
        status.textContent = isCompleted ? 'Completed' : 'In Progress';
        status.className = isCompleted ? 'shared-task-status completed' : 'shared-task-status';
    }
    
    // Update storage
    updateTaskCompletion(taskId, isCompleted);
    
    // Update stats
    updateTaskStats();
};

// Edit task
window.editTask = function(taskId) {
    const taskElement = document.querySelector(`.todo-item[data-task-id="${taskId}"]`);
    if (!taskElement) return;
    
    const title = taskElement.querySelector('.todo-title').textContent;
    const description = taskElement.querySelector('.todo-description')?.textContent || '';
    const priority = taskElement.querySelector('.todo-priority').className.split(' ')[1];
    const isShared = taskElement.querySelector('.shared-badge') !== null;
    
    // Open modal with task data
    const modal = document.getElementById('task-modal');
    modal.classList.add('active');
    
    document.getElementById('task-title').value = title;
    document.getElementById('task-description').value = description;
    document.getElementById('task-priority').value = priority;
    document.getElementById('task-shared').checked = isShared;
    
    // Change button text
    const saveBtn = document.getElementById('save-task');
    saveBtn.innerHTML = '<i class="fas fa-check"></i> Update Task';
    
    // Store task ID for update
    window.editingTaskId = taskId;
    
    // Focus title field
    setTimeout(() => document.getElementById('task-title').focus(), 100);
};

// Delete task
window.deleteTask = function(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    const taskElement = document.querySelector(`.todo-item[data-task-id="${taskId}"]`);
    const sharedTask = document.querySelector(`.shared-task[data-task-id="${taskId}"]`);
    
    if (taskElement) {
        // Animate out
        taskElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            taskElement.remove();
            removeTaskFromStorage(taskId);
            
            if (sharedTask) {
                sharedTask.remove();
            }
            
            updateTaskStats();
            showNotification('Task deleted', 'info');
            
            // Hide shared workspace if no shared tasks left
            const sharedTasks = document.querySelectorAll('.shared-task');
            if (sharedTasks.length === 0) {
                document.getElementById('shared-workspace').style.display = 'none';
            }
        }, 300);
    }
};

// Update task element after edit
function updateTaskElement(taskElement, title, description, priority, isShared) {
    // Update title
    taskElement.querySelector('.todo-title').textContent = title;
    
    // Update description
    const descElement = taskElement.querySelector('.todo-description');
    if (description) {
        if (descElement) {
            descElement.textContent = description;
        } else {
            const contentDiv = taskElement.querySelector('.todo-content');
            const titleElement = contentDiv.querySelector('.todo-title');
            const newDesc = document.createElement('div');
            newDesc.className = 'todo-description';
            newDesc.textContent = description;
            contentDiv.insertBefore(newDesc, titleElement.nextSibling);
        }
    } else if (descElement) {
        descElement.remove();
    }
    
    // Update priority
    const priorityElement = taskElement.querySelector('.todo-priority');
    priorityElement.className = `todo-priority ${priority}`;
    priorityElement.textContent = priority.toUpperCase();
    
    // Update shared badge
    const sharedBadge = taskElement.querySelector('.shared-badge');
    if (isShared && !sharedBadge) {
        const contentDiv = taskElement.querySelector('.todo-content');
        const newBadge = document.createElement('span');
        newBadge.className = 'shared-badge';
        newBadge.innerHTML = '<i class="fas fa-users"></i> Shared';
        contentDiv.appendChild(newBadge);
    } else if (!isShared && sharedBadge) {
        sharedBadge.remove();
    }
}

// Update shared task
function updateSharedTask(taskId, title, isShared) {
    const sharedTask = document.querySelector(`.shared-task[data-task-id="${taskId}"]`);
    const sharedWorkspace = document.getElementById('shared-workspace');
    
    if (isShared) {
        if (!sharedTask) {
            addSharedTask(taskId, title, 'You');
        } else {
            sharedTask.querySelector('.shared-task-title').textContent = title;
        }
        sharedWorkspace.style.display = 'block';
    } else if (sharedTask) {
        sharedTask.remove();
        
        // Hide shared workspace if no tasks left
        const remainingTasks = document.querySelectorAll('.shared-task');
        if (remainingTasks.length === 0) {
            sharedWorkspace.style.display = 'none';
        }
    }
}

// ======================
// STORAGE FUNCTIONS
// ======================

// Task storage
function saveTaskToStorage(id, title, description, priority, shared, completed = false) {
    const tasks = getTasksFromStorage();
    tasks.push({ id, title, description, priority, shared, completed });
    localStorage.setItem('lentora_tasks', JSON.stringify(tasks));
}

function getTasksFromStorage() {
    const tasksJson = localStorage.getItem('lentora_tasks');
    return tasksJson ? JSON.parse(tasksJson) : [];
}

function updateTaskInStorage(id, title, description, priority, shared) {
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        tasks[index] = { ...tasks[index], title, description, priority, shared };
        localStorage.setItem('lentora_tasks', JSON.stringify(tasks));
    }
}

function updateTaskCompletion(id, completed) {
    const tasks = getTasksFromStorage();
    const index = tasks.findIndex(task => task.id === id);
    if (index !== -1) {
        tasks[index].completed = completed;
        localStorage.setItem('lentora_tasks', JSON.stringify(tasks));
    }
}

function removeTaskFromStorage(id) {
    const tasks = getTasksFromStorage();
    const filteredTasks = tasks.filter(task => task.id !== id);
    localStorage.setItem('lentora_tasks', JSON.stringify(filteredTasks));
}

// Duration storage
function saveDurationsToStorage(focus, shortBreak, longBreak) {
    localStorage.setItem('lentora_durations', JSON.stringify({
        focus,
        shortBreak,
        longBreak
    }));
}

function getDurationsFromStorage() {
    const durationsJson = localStorage.getItem('lentora_durations');
    return durationsJson ? JSON.parse(durationsJson) : null;
}

// Invitation storage
function saveInvitation(email, message) {
    const invitations = getInvitationsFromStorage();
    invitations.push({
        email,
        message,
        date: new Date().toISOString(),
        status: 'sent'
    });
    localStorage.setItem('lentora_invitations', JSON.stringify(invitations));
}

function getInvitationsFromStorage() {
    const invitationsJson = localStorage.getItem('lentora_invitations');
    return invitationsJson ? JSON.parse(invitationsJson) : [];
}

// ======================
// NOTIFICATION FUNCTION
// ======================

window.showNotification = function(message, type = 'info') {
    // Use existing notification system if available
    if (typeof showNotification !== 'undefined' && type === 'function') {
        return showNotification(message, type);
    }
    
    // Fallback notification
    const container = document.getElementById('notification-container');
    if (!container) return;
    
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : type === 'warning' ? 'exclamation-triangle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(notification);
    
    // Remove after 5 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 5000);
};

// Helper to update task stats globally
window.updateTaskStats = function() {
    const completedTasks = document.querySelectorAll('.todo-item.completed').length;
    const tasksCompletedElement = document.getElementById('tasks-completed');
    if (tasksCompletedElement) {
        tasksCompletedElement.textContent = completedTasks;
    }
};

// Initialize forms on window load
window.addEventListener('load', function() {
    console.log('Lentora Forms initialized');
});// ======================
// FORM ENHANCEMENTS
// ======================

function enhanceFormElements() {
    // Character counter for description
    const descTextarea = document.getElementById('task-description');
    if (descTextarea) {
        const charCounter = document.createElement('div');
        charCounter.className = 'char-counter';
        charCounter.textContent = '0/500';
        
        descTextarea.parentNode.appendChild(charCounter);
        
        descTextarea.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = `${length}/500`;
            charCounter.style.display = length > 0 ? 'block' : 'none';
            
            // Color code based on length
            if (length > 450) {
                charCounter.style.color = 'var(--peach-blossom)';
            } else if (length > 350) {
                charCounter.style.color = 'var(--mauve-whisper)';
            } else {
                charCounter.style.color = 'var(--sage-depth)';
            }
        });
        
        // Show counter when focused if there's text
        descTextarea.addEventListener('focus', function() {
            if (this.value.length > 0) {
                charCounter.style.display = 'block';
            }
        });
        
        descTextarea.addEventListener('blur', function() {
            setTimeout(() => {
                if (this.value.length === 0) {
                    charCounter.style.display = 'none';
                }
            }, 200);
        });
    }
    
    // Priority visual indicator
    const prioritySelect = document.getElementById('task-priority');
    if (prioritySelect) {
        // Update on change
        prioritySelect.addEventListener('change', function() {
            const priorityColors = {
                low: 'var(--eucalyptus-shade)',
                medium: 'var(--lilac-breeze)', 
                high: 'var(--peach-blossom)'
            };
            
            // Remove previous color classes
            this.classList.remove('priority-low', 'priority-medium', 'priority-high');
            
            // Add current priority class
            this.classList.add(`priority-${this.value}`);
            
            // Update border color
            this.style.borderLeftColor = priorityColors[this.value] || 'var(--lilac-breeze)';
            this.style.borderLeftWidth = '4px';
        });
        
        // Trigger initial state
        if (prioritySelect.value) {
            prioritySelect.dispatchEvent(new Event('change'));
        }
    }
}

// Call this function inside your DOMContentLoaded
enhanceFormElements();// ============================================
// ENHANCE PRIORITY SELECT
// ============================================
function enhancePrioritySelect() {
    const prioritySelect = document.getElementById('task-priority');
    if (!prioritySelect) return;
    
    // Wrap select in a container for custom styling
    const wrapper = document.createElement('div');
    wrapper.className = 'priority-select-wrapper';
    prioritySelect.parentNode.insertBefore(wrapper, prioritySelect);
    wrapper.appendChild(prioritySelect);
    
    // Add visual indicator for current selection
    function updatePriorityIndicator() {
        const colors = {
            'low': 'var(--sage-depth)',
            'medium': 'var(--wisteria-dream)', 
            'high': 'var(--peach-blossom)'
        };
        
        // Remove all existing indicators
        wrapper.classList.remove('priority-low', 'priority-medium', 'priority-high');
        
        // Add current priority class
        const currentPriority = prioritySelect.value;
        wrapper.classList.add(`priority-${currentPriority}`);
        
        // Update border color
        prioritySelect.style.borderColor = colors[currentPriority] || 'var(--lilac-breeze)';
    }
    
    // Update on change
    prioritySelect.addEventListener('change', updatePriorityIndicator);
    
    // Initial update
    updatePriorityIndicator();
    
    // Add hover effect
    prioritySelect.addEventListener('mouseenter', function() {
        this.style.boxShadow = '0 0 0 3px rgba(197, 178, 224, 0.1)';
    });
    
    prioritySelect.addEventListener('mouseleave', function() {
        this.style.boxShadow = 'none';
    });
}

// ============================================
// ENHANCE INVITE FORM INPUTS
// ============================================
function enhanceInviteForm() {
    const emailInput = document.getElementById('friend-email');
    const messageInput = document.getElementById('invite-message');
    
    if (emailInput) {
        // Add email validation styling
        emailInput.addEventListener('blur', function() {
            if (this.value && !isValidEmail(this.value)) {
                this.style.borderColor = 'var(--peach-blossom)';
                this.style.boxShadow = '0 0 0 3px rgba(255, 224, 237, 0.2)';
            } else {
                this.style.borderColor = 'var(--lilac-breeze)';
                this.style.boxShadow = 'none';
            }
        });
        
        emailInput.addEventListener('input', function() {
            this.style.borderColor = 'var(--lilac-breeze)';
            this.style.boxShadow = 'none';
        });
    }
    
    if (messageInput) {
        // Character counter for message
        const charCounter = document.createElement('div');
        charCounter.className = 'invite-char-counter';
        charCounter.style.cssText = `
            font-size: 0.8rem;
            color: var(--mauve-whisper);
            text-align: right;
            margin-top: 5px;
            display: none;
        `;
        
        messageInput.parentNode.appendChild(charCounter);
        
        messageInput.addEventListener('input', function() {
            const length = this.value.length;
            charCounter.textContent = `${length}/200 characters`;
            charCounter.style.display = length > 0 ? 'block' : 'none';
            
            if (length > 180) {
                charCounter.style.color = 'var(--peach-blossom)';
            } else {
                charCounter.style.color = 'var(--mauve-whisper)';
            }
        });
    }
}

// ============================================
// ENHANCE STATS FORM
// ============================================
function enhanceStatsForm() {
    const applyBtn = document.getElementById('apply-durations');
    if (!applyBtn) return;
    
    // Add visual feedback on click
    applyBtn.addEventListener('click', function() {
        const originalText = this.innerHTML;
        
        // Add loading state
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
        this.disabled = true;
        
        // Simulate processing
        setTimeout(() => {
            this.innerHTML = '<i class="fas fa-check"></i> Applied!';
            
            // Reset after 1.5 seconds
            setTimeout(() => {
                this.innerHTML = originalText;
                this.disabled = false;
            }, 1500);
        }, 800);
    });
    
    // Add input validation for duration inputs
    const durationInputs = document.querySelectorAll('#dashboard-modal input[type="number"]');
    durationInputs.forEach(input => {
        input.addEventListener('change', function() {
            const value = parseInt(this.value);
            const min = parseInt(this.min) || 1;
            const max = parseInt(this.max) || 60;
            
            if (value < min) this.value = min;
            if (value > max) this.value = max;
            
            // Visual feedback
            if (value === min || value === max) {
                this.style.borderColor = 'var(--peach-blossom)';
                setTimeout(() => {
                    this.style.borderColor = 'var(--lilac-breeze)';
                }, 1000);
            }
        });
    });
}


// ============================================
// ENHANCE STATS FORM (UPDATED)
// ============================================
function enhanceStatsForm() {
    const applyBtn = document.getElementById('apply-durations');
    if (!applyBtn) return;
    
    // Add duration units to inputs
    const durationInputs = document.querySelectorAll('#dashboard-modal input[type="number"]');
    durationInputs.forEach(input => {
        const wrapper = document.createElement('div');
        wrapper.className = 'duration-unit';
        wrapper.style.position = 'relative';
        
        input.parentNode.insertBefore(wrapper, input);
        wrapper.appendChild(input);
    });
    
    // Apply button click with improved animation
    applyBtn.addEventListener('click', function() {
        // Validate inputs first
        const focusInput = document.getElementById('focus-duration');
        const shortInput = document.getElementById('short-break-duration');
        const longInput = document.getElementById('long-break-duration');
        
        // Check all inputs have values
        if (!focusInput.value || !shortInput.value || !longInput.value) {
            // Shake animation for empty fields
            const inputs = [focusInput, shortInput, longInput];
            inputs.forEach(input => {
                if (!input.value) {
                    input.style.animation = 'shake 0.5s ease';
                    input.style.borderColor = 'var(--peach-blossom)';
                    setTimeout(() => {
                        input.style.animation = '';
                        input.style.borderColor = 'var(--lilac-breeze)';
                    }, 500);
                }
            });
            return;
        }
        
        // Success state
        const originalHTML = this.innerHTML;
        const originalBg = this.style.background;
        
        // Loading animation
        this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Applying...';
        this.style.background = 'linear-gradient(135deg, var(--wisteria-dream) 0%, var(--thistle-mist) 100%)';
        this.disabled = true;
        
        // Simulate processing
        setTimeout(() => {
            // Success animation
            this.innerHTML = '<i class="fas fa-check"></i> Success!';
            this.style.background = 'linear-gradient(135deg, var(--sage-depth) 0%, var(--eucalyptus-shade) 100%)';
            
            // Add confetti effect to inputs
            durationInputs.forEach(input => {
                input.style.borderColor = 'var(--sage-depth)';
                input.style.boxShadow = '0 0 0 2px rgba(122, 153, 120, 0.2)';
            });
            
            // Reset after 1.5 seconds
            setTimeout(() => {
                this.innerHTML = originalHTML;
                this.style.background = originalBg;
                this.disabled = false;
                
                durationInputs.forEach(input => {
                    input.style.borderColor = '';
                    input.style.boxShadow = '';
                });
            }, 1500);
        }, 800);
    });
    
    // Add input animation on focus
    durationInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentNode.style.transform = 'scale(1.02)';
        });
        
        input.addEventListener('blur', function() {
            this.parentNode.style.transform = 'scale(1)';
        });
    });
}

// ============================================
// UPDATE INITIALIZATION
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Replace old priority function with new one
    createPriorityBoxes();  // NEW: replaces enhancePrioritySelect()
    enhanceInviteForm();
    enhanceStatsForm();
    
    console.log('Enhanced forms loaded with priority boxes');
});

// Add shake animation to CSS
const style = document.createElement('style');
style.textContent = `
@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}
`;
document.head.appendChild(style);
// ============================================
// HELPER FUNCTIONS
// ============================================
function isValidEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
}
// DEBUG: Check if priority select exists
console.log('Priority select exists:', document.getElementById('task-priority'));

// Test priority boxes function
function testPriorityBoxes() {
    const prioritySelect = document.getElementById('task-priority');
    console.log('1. Select element:', prioritySelect);
    console.log('2. Select value:', prioritySelect?.value);
    
    
    
}

// Run test when page loads
document.addEventListener('DOMContentLoaded', function() {
    testPriorityBoxes();
});
// ============================================
// INITIALIZE ENHANCEMENTS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Call all enhancement functions
    enhancePrioritySelect();
    enhanceInviteForm();
    enhanceStatsForm();
    
    console.log('Form enhancements loaded');
});
// ============================================
// CREATE PRIORITY CARDS (like the image)
// ============================================
function createPriorityCards() {
    const prioritySelect = document.getElementById('task-priority');
    if (!prioritySelect) {
        console.error('Priority select not found');
        return;
    }
    
    // Hide the original select
    prioritySelect.style.display = 'none';
    
    // Create cards container
    const cardsContainer = document.createElement('div');
    cardsContainer.className = 'priority-cards';
    
    // Define priority cards data
    const priorityCards = [
        {
            value: 'low',
            label: 'Low',
            icon: '🟢',
            desc: 'Not urgent, can wait'
        },
        {
            value: 'medium', 
            label: 'Medium',
            icon: '🟠',
            desc: 'Important, do soon'
        },
        {
            value: 'high',
            label: 'High',
            icon:'🔴',
            desc: 'Urgent, do now'
        }
    ];
    
    // Create each priority card
    priorityCards.forEach(cardData => {
        const card = document.createElement('div');
        card.className = 'priority-card';
        card.dataset.value = cardData.value;
        
        card.innerHTML = `
            <div class="priority-icon">${cardData.icon}</div>
            <div class="priority-label">${cardData.label}</div>
            <div class="priority-desc">${cardData.desc}</div>
        `;
        
        // Set as active if it matches current selection
        if (cardData.value === prioritySelect.value) {
            card.classList.add('active');
        }
        
        // Add click handler
        card.addEventListener('click', function() {
            // Remove active class from all cards
            document.querySelectorAll('.priority-card').forEach(c => {
                c.classList.remove('active');
            });
            
            // Add active class to clicked card
            this.classList.add('active');
            
            // Update the hidden select value
            prioritySelect.value = this.dataset.value;
            
            // Add click animation
            this.style.transform = 'translateY(-3px) scale(1.02)';
            setTimeout(() => {
                this.style.transform = 'translateY(-3px) scale(1)';
            }, 200);
            
            console.log('Priority selected:', this.dataset.value);
        });
        
        cardsContainer.appendChild(card);
    });
    
    // Insert cards after the label (not after select)
    const priorityLabel = document.querySelector('label[for="task-priority"]');
    if (priorityLabel && priorityLabel.parentNode) {
        priorityLabel.parentNode.insertBefore(cardsContainer, priorityLabel.nextSibling);
    } else {
        // Fallback: insert after the select
        prioritySelect.parentNode.insertBefore(cardsContainer, prioritySelect.nextSibling);
    }
    
    console.log('Priority cards created successfully');
}

// ============================================
// INITIALIZE WHEN PAGE LOADS
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Create priority cards
    createPriorityCards();
    
    console.log('Priority cards initialized');
});