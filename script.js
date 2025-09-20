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
        
        // Reset game state
        this.currentGuess = '';
        this.guesses = [];
        this.currentRow = 0;
        this.gameOver = false;
        this.gameWon = false;
        
        // Create the game grid
        this.createGrid();
        
        // Clear messages
        this.hideMessage();
        
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
        }
    }
    
    async submitGuess() {
        if (this.gameOver) return;
        
        const guess = this.currentGuess.trim();
        
        // Show loading state
        this.showLoading();
        
        // Validate guess using API
        const isValid = await this.isValidGuess(guess);
        if (!isValid) {
            this.hideLoading();
            this.showMessage('Please enter a valid 5-letter English word!', 'danger');
            $('#guess-input').addClass('shake');
            setTimeout(() => $('#guess-input').removeClass('shake'), 500);
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
    
    async isValidGuess(guess) {
        // Check if it's exactly 5 letters and contains only letters
        const isValidLength = guess.length === 5;
        const isValidFormat = /^[A-Z]+$/.test(guess);
        
        if (!isValidLength || !isValidFormat) {
            return false;
        }
        
        // Use API to validate if it's a real word
        return await this.wordAPI.isValidWord(guess);
    }
    
    processGuess(guess) {
        const feedback = this.getFeedback(guess);
        this.guesses.push({ word: guess, feedback: feedback });
        
        // Update tiles with feedback
        this.updateTilesWithFeedback(feedback);
        
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
            
            // Add feedback class with delay for animation
            setTimeout(() => {
                tile.addClass(feedback[col]);
            }, col * 100);
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
        
        // Update streak display after game ends
        this.updateStreakDisplay();
    }
    
    showMessage(text, type = 'info') {
        const messageArea = $('#message-area');
        messageArea.removeClass('alert-success alert-danger alert-info')
                  .addClass(`alert-${type}`)
                  .text(text)
                  .show();
        
        // Auto-hide after 5 seconds for non-error messages
        if (type !== 'danger') {
            setTimeout(() => {
                this.hideMessage();
            }, 5000);
        }
    }
    
    hideMessage() {
        $('#message-area').hide();
    }
    
    showLoading() {
        $('#submit-btn').prop('disabled', true).html('<i class="fas fa-spinner fa-spin"></i>');
        $('#guess-input').prop('disabled', true);
    }
    
    hideLoading() {
        $('#submit-btn').prop('disabled', false).html('<i class="fas fa-paper-plane"></i>');
        $('#guess-input').prop('disabled', false);
    }
    
    updateStreakDisplay() {
        const stats = this.streakManager.getStats();
        $('#current-streak').text(stats.currentStreak);
        $('#longest-streak').text(stats.longestStreak);
    }
}

// Initialize the game when the page loads
$(document).ready(() => {
    const game = new WordleGame();
    
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
