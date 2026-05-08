// ============================================
// Portfolio Tracking Application
// ============================================

class PortfolioTracker {
    constructor() {
        this.currentMonth = this.getCurrentMonth();
        this.startDate = new Date('2026-05-01');
        this.endDate = new Date('2026-12-01');
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupScrolling();
        this.setupProgressBar();
        this.setupWeeklyLog();
        this.setupMonthCards();
        this.updateProgressIndicators();
        this.loadSavedData();
    }

    // ============================================
    // Navigation Setup
    // ============================================
    setupNavigation() {
        const navLinks = document.querySelectorAll('.nav-link');
        const sections = document.querySelectorAll('section[id]');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);

                if (targetSection) {
                    navLinks.forEach(l => l.classList.remove('active'));
                    link.classList.add('active');
                    targetSection.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });

        // Update active nav link on scroll
        window.addEventListener('scroll', () => {
            let activeSection = null;
            sections.forEach(section => {
                const rect = section.getBoundingClientRect();
                if (rect.top < window.innerHeight / 2 && rect.bottom > window.innerHeight / 2) {
                    activeSection = section.id;
                }
            });

            if (activeSection) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${activeSection}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    // ============================================
    // Smooth Scrolling
    // ============================================
    setupScrolling() {
        const allLinks = document.querySelectorAll('a[href^="#"]');
        allLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const href = link.getAttribute('href');
                if (href === '#') return;

                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        });
    }

    // ============================================
    // Progress Bar Update
    // ============================================
    setupProgressBar() {
        const progressFill = document.querySelector('.progress-fill');
        if (progressFill) {
            const progress = this.calculateProgress();
            progressFill.style.width = `${progress}%`;
        }
    }

    calculateProgress() {
        const now = new Date();
        const total = this.endDate - this.startDate;
        const elapsed = now - this.startDate;
        const percentage = Math.max(0, Math.min(100, (elapsed / total) * 100));
        return Math.round(percentage);
    }

    // ============================================
    // Monthly Cards Setup
    // ============================================
    setupMonthCards() {
        const monthCards = document.querySelectorAll('.month-card');
        monthCards.forEach(card => {
            this.styleMonthCard(card);
            card.addEventListener('mouseenter', () => {
                card.style.transform = 'translateY(-12px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = 'translateY(0)';
            });
        });
    }

    styleMonthCard(card) {
        const monthTag = card.querySelector('.phase-tag');
        if (!monthTag) return;

        const phaseClass = Array.from(card.classList).find(cls => 
            ['foundation', 'integration', 'credibility', 'readiness'].includes(cls.split('-')[1]) ||
            ['foundation', 'integration', 'credibility', 'readiness'].includes(cls)
        );
    }

    // ============================================
    // Weekly Log Management
    // ============================================
    setupWeeklyLog() {
        const saveButton = document.querySelector('.log-save');
        const logInput = document.querySelector('.log-input');
        const logTextarea = document.querySelector('.log-textarea');

        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveWeeklyLog(logInput, logTextarea);
            });

            // Auto-save on Enter
            logInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.saveWeeklyLog(logInput, logTextarea);
                }
            });

            // Load last log if exists
            const lastLog = this.getLastWeeklyLog();
            if (lastLog) {
                logInput.value = lastLog.week || '';
                logTextarea.value = lastLog.notes || '';
                this.updateLogStatus(logInput);
            }
        }
    }

    saveWeeklyLog(inputElement, textareaElement) {
        const week = inputElement.value.trim();
        const notes = textareaElement.value.trim();

        if (!week || !notes) {
            alert('Please fill in both Week date and notes');
            return;
        }

        const logData = {
            week,
            notes,
            timestamp: new Date().toISOString(),
            month: this.currentMonth
        };

        let logs = JSON.parse(localStorage.getItem('weeklyLogs') || '[]');
        logs.push(logData);
        localStorage.setItem('weeklyLogs', JSON.stringify(logs));

        // Visual feedback
        const saveButton = document.querySelector('.log-save');
        const originalText = saveButton.textContent;
        saveButton.textContent = '✓ Saved!';
        saveButton.style.background = '#28a745';

        setTimeout(() => {
            saveButton.textContent = originalText;
            saveButton.style.background = '';
            inputElement.value = '';
            textareaElement.value = '';
        }, 2000);

        console.log('Weekly log saved:', logData);
    }

    getLastWeeklyLog() {
        const logs = JSON.parse(localStorage.getItem('weeklyLogs') || '[]');
        return logs[logs.length - 1] || null;
    }

    updateLogStatus(element) {
        if (element.value) {
            element.style.borderColor = '#28a745';
        }
    }

    // ============================================
    // Progress Indicators
    // ============================================
    updateProgressIndicators() {
        const milestones = document.querySelectorAll('.milestone');
        const today = new Date();

        const monthMap = {
            'may': new Date('2026-05-31'),
            'july': new Date('2026-07-31'),
            'september': new Date('2026-09-30'),
            'december': new Date('2026-12-01')
        };

        milestones.forEach(milestone => {
            const month = milestone.dataset.month;
            const targetDate = monthMap[month];

            if (targetDate && today >= targetDate) {
                milestone.classList.add('completed');
                milestone.querySelector('.milestone-marker').style.background = '#28a745';
            } else if (targetDate && this.isCurrentOrUpcoming(targetDate)) {
                milestone.classList.add('active');
                milestone.querySelector('.milestone-marker').style.boxShadow = '0 0 0 4px rgba(0, 102, 204, 0.2)';
            }
        });
    }

    isCurrentOrUpcoming(date) {
        const today = new Date();
        const nextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);
        return date >= today && date <= nextMonth;
    }

    // ============================================
    // Helper Methods
    // ============================================
    getCurrentMonth() {
        const now = new Date();
        const months = ['may', 'june', 'july', 'august', 'september', 'october', 'november', 'december'];
        
        const startDate = new Date('2026-05-01');
        const endDate = new Date('2026-12-31');

        if (now < startDate) return 'may';
        if (now > endDate) return 'december';

        return months[now.getMonth()] || 'may';
    }

    // ============================================
    // Data Persistence
    // ============================================
    loadSavedData() {
        const savedProgress = localStorage.getItem('transformation_progress');
        if (savedProgress) {
            const data = JSON.parse(savedProgress);
            console.log('Loaded saved progress:', data);
        }
    }

    saveProgress(data) {
        localStorage.setItem('transformation_progress', JSON.stringify({
            ...data,
            lastSaved: new Date().toISOString()
        }));
    }
}

// ============================================
// Deliverables Tracker
// ============================================
class DeliverablesTracker {
    constructor() {
        this.init();
    }

    init() {
        this.setupStatusUpdates();
        this.loadDeliverableStatus();
    }

    setupStatusUpdates() {
        const table = document.querySelector('.deliverables-table tbody');
        if (!table) return;

        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
            row.addEventListener('click', () => {
                this.toggleDeliverableStatus(row, index);
            });
            row.style.cursor = 'pointer';
            row.style.transition = 'background-color 0.3s ease';
        });
    }

    toggleDeliverableStatus(row, index) {
        const statusCell = row.querySelector('.status-badge');
        if (!statusCell) return;

        let currentStatus = statusCell.className.split(' ')[1];
        let nextStatus;

        const statusCycle = ['pending', 'in-progress', 'completed'];
        const currentIndex = statusCycle.indexOf(currentStatus);
        nextStatus = statusCycle[(currentIndex + 1) % statusCycle.length];

        statusCell.className = `status-badge ${nextStatus}`;
        statusCell.textContent = nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1);

        this.saveDeliverableStatus(index, nextStatus);
        this.updateDeliverableStats();
    }

    saveDeliverableStatus(index, status) {
        let statuses = JSON.parse(localStorage.getItem('deliverable_status') || '{}');
        statuses[index] = status;
        localStorage.setItem('deliverable_status', JSON.stringify(statuses));
    }

    loadDeliverableStatus() {
        const statuses = JSON.parse(localStorage.getItem('deliverable_status') || '{}');
        const table = document.querySelector('.deliverables-table tbody');
        if (!table) return;

        const rows = table.querySelectorAll('tr');
        rows.forEach((row, index) => {
            if (statuses[index]) {
                const statusCell = row.querySelector('.status-badge');
                statusCell.className = `status-badge ${statuses[index]}`;
                statusCell.textContent = statuses[index].charAt(0).toUpperCase() + statuses[index].slice(1);
            }
        });

        this.updateDeliverableStats();
    }

    updateDeliverableStats() {
        const completed = document.querySelectorAll('.status-badge.completed').length;
        const inProgress = document.querySelectorAll('.status-badge.in-progress').length;
        const pending = document.querySelectorAll('.status-badge.pending').length;

        const stats = document.querySelectorAll('.stat-card .stat-number');
        if (stats.length >= 3) {
            stats[1].textContent = completed;
            stats[2].textContent = inProgress;
        }
    }
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    console.log('Initializing Portfolio Tracker...');
    
    const tracker = new PortfolioTracker();
    const deliverables = new DeliverablesTracker();

    // Add keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + S: Save weekly log
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            const saveButton = document.querySelector('.log-save');
            if (saveButton) {
                saveButton.click();
            }
        }
    });

    console.log('Portfolio Tracker initialized successfully');
});

// ============================================
// Utility Functions
// ============================================
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }).format(date);
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Export for testing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PortfolioTracker, DeliverablesTracker };
}
