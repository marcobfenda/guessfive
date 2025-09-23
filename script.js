// Wordle Clone Game Logic
class WordleGame {
    constructor() {
        // Use API service for word validation and generation
        this.wordAPI = wordAPI;
        this.streakManager = streakManager;
        
        this.secretWord = '';
        this.currentGuess = '';
        this.guesses = [];
        this.currentRow = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.letterStatus = {}; // Track status of each letter: 'correct', 'present', 'absent', or undefined
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    async initializeGame() {
        // Check and reset streak if needed (24+ hours since last game)
        this.streakManager.checkAndResetStreak();
        
        // Pick a random word using API
        try {
            this.secretWord = await this.wordAPI.getRandomSecretWord();
        } catch (error) {
            console.error('Failed to get random word:', error);
            // Fallback to a default word
            this.secretWord = 'APPLE';
        }
        console.log("Secret Word: " + this.secretWord);
        
        // Reset game state
        this.currentGuess = '';
        this.guesses = [];
        this.currentRow = 0;
        this.gameOver = false;
        this.gameWon = false;
        this.letterStatus = {};
        
        // Create the game grid
        this.createGrid();
        
        // Create the letter tracker
        this.createLetterTracker();
        
        // Clear messages
        this.hideMessage();
        
        // Enable input for new game
        this.enableInput();
        
        // Focus input for immediate typing
        setTimeout(() => {
            $('#guess-input').focus();
        }, 100);
        
        // Update streak display
        this.updateStreakDisplay();
    }
    
    createGrid() {
        const grid = $('#game-grid');
        grid.empty();
        
        for (let row = 0; row < 6; row++) {
            for (let col = 0; col < 5; col++) {
                const tile = $('<div>').addClass('tile').attr('data-row', row).attr('data-col', col);
                grid.append(tile);
            }
        }
    }
    
    createLetterTracker() {
        const tracker = $('#letter-tracker-grid');
        tracker.empty();
        
        // Create tiles for letters A-Z
        for (let i = 0; i < 26; i++) {
            const letter = String.fromCharCode(65 + i); // A-Z
            const tile = $('<div>')
                .addClass('letter-tracker-tile')
                .attr('data-letter', letter)
                .text(letter);
            tracker.append(tile);
        }
    }
    
    setupEventListeners() {
        // Input field events
        $('#guess-input').on('input', (e) => {
            this.handleInput(e.target.value);
        });
        
        $('#guess-input').on('keypress keydown', async (e) => {
            if (e.which === 13 || e.keyCode === 13 || e.key === 'Enter') { // Enter key
                e.preventDefault();
                await this.submitGuess();
            }
        });
        
        // Submit button
        $('#submit-btn').on('click', async () => {
            await this.submitGuess();
        });
        
        // New game button
        $('#new-game-btn').on('click', async () => {
            await this.initializeGame();
        });
        
        // Keep input focused - click anywhere to focus input (except buttons)
        $(document).on('click', (e) => {
            // Don't refocus if clicking on buttons or the input itself
            if (!$(e.target).is('button, input, .submit-btn, .new-game-btn')) {
                $('#guess-input').focus();
            }
        });
        
        // Also focus input when the page loads
        $('#guess-input').focus();
    }
    
    handleInput(value) {
        // Convert to uppercase and limit to 5 characters
        this.currentGuess = value.toUpperCase().slice(0, 5);
        $('#guess-input').val(this.currentGuess);
        
        // Update current row tiles
        this.updateCurrentRow();
    }
    
    updateCurrentRow() {
        // Clear current row
        for (let col = 0; col < 5; col++) {
            const tile = $(`.tile[data-row="${this.currentRow}"][data-col="${col}"]`);
            tile.removeClass('current').text('');
        }
        
        // Fill with current guess
        for (let col = 0; col < this.currentGuess.length; col++) {
            const tile = $(`.tile[data-row="${this.currentRow}"][data-col="${col}"]`);
            tile.addClass('current').text(this.currentGuess[col]);
            
            // Add bounce animation for new letters
            tile.addClass('bounce');
            setTimeout(() => {
                tile.removeClass('bounce');
            }, 300);
        }
    }
    
    async submitGuess() {
        if (this.gameOver) return;
        
        const guess = this.currentGuess.trim();
        
        // Show loading state
        this.showLoading();
        
        // Validate guess using API
        const validationResult = await this.validateGuess(guess);
        if (!validationResult.isValid) {
            this.hideLoading();
            this.showMessage(validationResult.message, 'danger');
            $('#guess-input').addClass('shake');
            setTimeout(() => $('#guess-input').removeClass('shake'), 500);
            
            // Shake the current row tiles
            for (let col = 0; col < 5; col++) {
                const tile = $(`.tile[data-row="${this.currentRow}"][data-col="${col}"]`);
                tile.addClass('shake');
                setTimeout(() => tile.removeClass('shake'), 500);
            }
            return;
        }
        
        // Hide loading state
        this.hideLoading();
        
        // Process the guess
        this.processGuess(guess);
        
        // Clear input
        $('#guess-input').val('');
        this.currentGuess = '';
        
        // Refocus input if game is still active
        if (!this.gameOver) {
            setTimeout(() => {
                $('#guess-input').focus();
            }, 100);
        }
        
        // Check game state
        this.checkGameState();
    }
    
    async validateGuess(guess) {
        // Check if it's exactly 5 letters and contains only letters
        const isValidLength = guess.length === 5;
        const isValidFormat = /^[A-Z]+$/.test(guess);
        
        if (!isValidLength || !isValidFormat) {
            return {
                isValid: false,
                message: 'Please enter a valid 5-letter English word!'
            };
        }
        
        // Check if word has already been used in this game
        const alreadyUsed = this.guesses.some(guessObj => guessObj.word === guess);
        if (alreadyUsed) {
            return {
                isValid: false,
                message: 'You have already used this word! Try a different one.'
            };
        }
        
        // Use API to validate if it's a real word
        const isRealWord = await this.wordAPI.isValidWord(guess);
        if (!isRealWord) {
            return {
                isValid: false,
                message: 'Please enter a valid 5-letter English word!'
            };
        }
        
        return {
            isValid: true,
            message: ''
        };
    }
    
    async isValidGuess(guess) {
        const result = await this.validateGuess(guess);
        return result.isValid;
    }
    
    processGuess(guess) {
        const feedback = this.getFeedback(guess);
        this.guesses.push({ word: guess, feedback: feedback });
        
        // Update tiles with feedback
        this.updateTilesWithFeedback(feedback);
        
        // Update letter tracker
        this.updateLetterTracker(guess, feedback);
        
        this.currentRow++;
    }
    
    getFeedback(guess) {
        const feedback = new Array(5).fill('absent');
        const secretLetters = this.secretWord.split('');
        const guessLetters = guess.split('');
        
        // First pass: mark correct letters in correct positions
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] === secretLetters[i]) {
                feedback[i] = 'correct';
                secretLetters[i] = null; // Mark as used
                guessLetters[i] = null; // Mark as used
            }
        }
        
        // Second pass: mark correct letters in wrong positions
        for (let i = 0; i < 5; i++) {
            if (guessLetters[i] !== null && secretLetters.includes(guessLetters[i])) {
                feedback[i] = 'present';
                const index = secretLetters.indexOf(guessLetters[i]);
                secretLetters[index] = null; // Mark as used
            }
        }
        
        return feedback;
    }
    
    updateTilesWithFeedback(feedback) {
        const row = this.currentRow;
        
        for (let col = 0; col < 5; col++) {
            const tile = $(`.tile[data-row="${row}"][data-col="${col}"]`);
            tile.removeClass('current');
            tile.addClass('filled');
            
            // Add flip animation with individual delay for each tile
            setTimeout(() => {
                tile.addClass('flip');
                // Add feedback class after flip animation starts
                setTimeout(() => {
                    tile.addClass(feedback[col]);
                }, 300); // Halfway through the flip animation
            }, col * 200); // 200ms delay between each tile for individual rotation
        }
    }
    
    updateLetterTracker(guess, feedback) {
        const guessLetters = guess.split('');
        
        for (let i = 0; i < 5; i++) {
            const letter = guessLetters[i];
            const status = feedback[i];
            
            // Update letter status - prioritize correct > present > absent
            if (!this.letterStatus[letter] || 
                (this.letterStatus[letter] === 'absent' && status !== 'absent') ||
                (this.letterStatus[letter] === 'present' && status === 'correct')) {
                this.letterStatus[letter] = status;
            }
        }
        
        // Update the visual display
        this.updateLetterTrackerDisplay();
    }
    
    updateLetterTrackerDisplay() {
        for (const letter in this.letterStatus) {
            const tile = $(`.letter-tracker-tile[data-letter="${letter}"]`);
            const status = this.letterStatus[letter];
            
            // Remove all status classes
            tile.removeClass('used correct present absent');
            
            // Add the appropriate class
            if (status) {
                tile.addClass('used');
                tile.addClass(status);
            }
        }
    }
    
    checkGameState() {
        const lastGuess = this.guesses[this.guesses.length - 1];
        
        if (lastGuess.word === this.secretWord) {
            this.gameWon = true;
            this.gameOver = true;
            this.streakManager.recordWin();
            this.showMessage('🎉 Congratulations! You guessed it!', 'success');
        } else if (this.currentRow >= 6) {
            this.gameOver = true;
            this.streakManager.recordLoss();
            this.showMessage(`Game Over! The word was: ${this.secretWord}`, 'danger');
        }
        
        // Disable input if game is over
        if (this.gameOver) {
            this.disableInput();
        }
        
        // Update streak display after game ends
        this.updateStreakDisplay();
    }
    
    showMessage(text, type = 'info') {
        this.showToast(text, type);
    }
    
    hideMessage() {
        // Toast notifications auto-hide, so this method is kept for compatibility
    }
    
    showToast(text, type = 'info', duration = 5000) {
        const container = $('#toast-container');
        
        if (container.length === 0) {
            console.error('Toast container not found!');
            return;
        }
        
        const toastId = 'toast-' + Date.now();
        
        // Map message types to toast types
        const toastTypeMap = {
            'success': 'success',
            'danger': 'error',
            'error': 'error',
            'info': 'info'
        };
        
        const toastType = toastTypeMap[type] || 'info';
        
        // Get appropriate icon
        const iconMap = {
            'success': 'fas fa-check-circle',
            'error': 'fas fa-exclamation-circle',
            'info': 'fas fa-info-circle'
        };
        
        const icon = iconMap[toastType];
        
        // Create toast HTML
        const toastHtml = `
            <div id="${toastId}" class="toast ${toastType}">
                <i class="toast-icon ${icon}"></i>
                <div class="toast-content">${text}</div>
                <button class="toast-close" data-toast-id="${toastId}">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        // Add toast to container
        container.append(toastHtml);
        
        // Force styles with inline CSS to override any conflicts
        const addedToast = $(`#${toastId}`);
        
        // Set base styles
        const baseStyles = {
            'position': 'relative',
            'display': 'flex',
            'width': '300px',
            'height': 'auto',
            'padding': '1rem',
            'border-radius': '8px',
            'z-index': '1001',
            'opacity': '1',
            'visibility': 'visible',
            'transform': 'none',
            'box-sizing': 'border-box',
            'flex-shrink': '0',
            'box-shadow': '0 4px 6px rgba(0, 0, 0, 0.1)',
            'align-items': 'center',
            'gap': '0.75rem'
        };
        
        // Set type-specific styles
        if (toastType === 'success') {
            baseStyles.background = 'linear-gradient(135deg, #d1fae5, #a7f3d0)';
            baseStyles.color = '#065f46';
            baseStyles.borderLeft = '4px solid #10b981';
        } else if (toastType === 'error') {
            baseStyles.background = 'linear-gradient(135deg, #fee2e2, #fecaca)';
            baseStyles.color = '#991b1b';
            baseStyles.borderLeft = '4px solid #ef4444';
        } else { // info
            baseStyles.background = 'linear-gradient(135deg, #dbeafe, #bfdbfe)';
            baseStyles.color = '#1e40af';
            baseStyles.borderLeft = '4px solid #3b82f6';
        }
        
        addedToast.css(baseStyles);
        
        // Add click handler for close button
        $(`#${toastId} .toast-close`).on('click', () => {
            this.hideToast(toastId);
        });
        
        // Auto-hide after duration (except for errors which stay longer)
        const autoHideDuration = type === 'danger' || type === 'error' ? 8000 : duration;
        setTimeout(() => {
            this.hideToast(toastId);
        }, autoHideDuration);
    }
    
    hideToast(toastId) {
        const toast = $(`#${toastId}`);
        if (toast.length) {
            toast.addClass('hiding');
            setTimeout(() => {
                toast.remove();
            }, 300); // Match animation duration
        }
    }
    
    showLoading() {
        $('#submit-btn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
        $('#guess-input').prop('disabled', true);
    }
    
    hideLoading() {
        $('#submit-btn').prop('disabled', false).html('<i class="fas fa-paper-plane"></i>');
        $('#guess-input').prop('disabled', false);
    }
    
    disableInput() {
        $('#guess-input').prop('disabled', true).addClass('disabled');
        $('#submit-btn').prop('disabled', true).addClass('disabled');
    }
    
    enableInput() {
        $('#guess-input').prop('disabled', false).removeClass('disabled');
        $('#submit-btn').prop('disabled', false).removeClass('disabled');
    }
    
    updateStreakDisplay() {
        const stats = this.streakManager.getStats();
        $('#current-streak').text(stats.currentStreak);
        $('#longest-streak').text(stats.longestStreak);
    }
}

// Initialize the game when the page loads
$(document).ready(() => {
    window.game = new WordleGame();
    
    
    // Add some keyboard shortcuts
    $(document).on('keydown', (e) => {
        // Prevent default behavior for certain keys
        if (e.key === 'Enter' && $('#guess-input').is(':focus')) {
            e.preventDefault();
        }
    });
    
    // Add visual feedback for input validation
    $('#guess-input').on('blur', function() {
        const value = $(this).val().toUpperCase();
        if (value.length > 0 && value.length < 5) {
            $(this).addClass('is-invalid');
        } else {
            $(this).removeClass('is-invalid');
        }
    });
});
