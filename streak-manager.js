// Streak Management Service
class StreakManager {
    constructor() {
        this.storageKey = 'guess5-streaks';
        this.streaks = this.loadStreaks();
    }

    // Load streaks from localStorage
    loadStreaks() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('Failed to load streaks from localStorage:', error);
        }
        
        // Default streaks
        return {
            currentStreak: 0,
            longestStreak: 0,
            totalGames: 0,
            totalWins: 0,
            lastPlayedDate: null
        };
    }

    // Save streaks to localStorage
    saveStreaks() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.streaks));
        } catch (error) {
            console.warn('Failed to save streaks to localStorage:', error);
        }
    }

    // Record a win
    recordWin() {
        this.streaks.currentStreak++;
        this.streaks.totalWins++;
        this.streaks.totalGames++;
        this.streaks.lastPlayedDate = new Date().toISOString();
        
        // Update longest streak if current streak is higher
        if (this.streaks.currentStreak > this.streaks.longestStreak) {
            this.streaks.longestStreak = this.streaks.currentStreak;
        }
        
        this.saveStreaks();
    }

    // Record a loss
    recordLoss() {
        this.streaks.currentStreak = 0;
        this.streaks.totalGames++;
        this.streaks.lastPlayedDate = new Date().toISOString();
        
        this.saveStreaks();
    }

    // Get current streak
    getCurrentStreak() {
        return this.streaks.currentStreak;
    }

    // Get longest streak
    getLongestStreak() {
        return this.streaks.longestStreak;
    }

    // Get total games played
    getTotalGames() {
        return this.streaks.totalGames;
    }

    // Get total wins
    getTotalWins() {
        return this.streaks.totalWins;
    }

    // Get win percentage
    getWinPercentage() {
        if (this.streaks.totalGames === 0) return 0;
        return Math.round((this.streaks.totalWins / this.streaks.totalGames) * 100);
    }

    // Get last played date
    getLastPlayedDate() {
        return this.streaks.lastPlayedDate;
    }

    // Check if streak should be reset (if last game was more than 24 hours ago)
    shouldResetStreak() {
        if (!this.streaks.lastPlayedDate) return false;
        
        const lastPlayed = new Date(this.streaks.lastPlayedDate);
        const now = new Date();
        const hoursDiff = (now - lastPlayed) / (1000 * 60 * 60);
        
        return hoursDiff > 24;
    }

    // Reset streak if needed
    checkAndResetStreak() {
        if (this.shouldResetStreak()) {
            this.streaks.currentStreak = 0;
            this.saveStreaks();
        }
    }

    // Get formatted stats
    getStats() {
        return {
            currentStreak: this.getCurrentStreak(),
            longestStreak: this.getLongestStreak(),
            totalGames: this.getTotalGames(),
            totalWins: this.getTotalWins(),
            winPercentage: this.getWinPercentage(),
            lastPlayedDate: this.getLastPlayedDate()
        };
    }

    // Reset all stats (for testing or user request)
    resetAllStats() {
        this.streaks = {
            currentStreak: 0,
            longestStreak: 0,
            totalGames: 0,
            totalWins: 0,
            lastPlayedDate: null
        };
        this.saveStreaks();
    }
}

// Create a global instance
const streakManager = new StreakManager();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = StreakManager;
}
