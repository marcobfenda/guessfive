// API Service for Word Validation and Generation
class WordAPIService {
    constructor() {
        this.apiBase = 'https://api.dictionaryapi.dev/api/v2/entries/en';
        
        // Common person names to exclude from secret words
        this.personNames = new Set([
            'BILLY', 'HARRY', 'JIMMY', 'JONES', 'LEWIS', 'MARIA', 'PETER', 'ROBIN', 'ROGER', 
            'SMITH', 'TERRY', 'TYLER', 'FRANK', 'JAPAN', 'TEXAS', 'ROMAN', 'WELSH'
        ]);
        
        this.fallbackWords = [
            'APPLE', 'BRAIN', 'CHAIR', 'DANCE', 'EARTH', 'FRUIT', 'GRASS', 'HAPPY', 'IDEAS', 'JUICE',
            'KNIFE', 'LIGHT', 'MUSIC', 'NIGHT', 'OCEAN', 'PAPER', 'QUEEN', 'RIVER', 'SMART', 'TIGER',
            'ABOUT', 'ABOVE', 'ABUSE', 'ACTOR', 'ACUTE', 'ADMIT', 'ADOPT', 'ADULT', 'AFTER', 'AGAIN',
            'AGENT', 'AGREE', 'AHEAD', 'ALARM', 'ALBUM', 'ALERT', 'ALIEN', 'ALIGN', 'ALIKE', 'ALIVE',
            'ALLOW', 'ALONE', 'ALONG', 'ALTER', 'AMONG', 'ANGER', 'ANGLE', 'ANGRY', 'APART', 'APPLY',
            'ARENA', 'ARGUE', 'ARISE', 'ARRAY', 'ASIDE', 'ASSET', 'AVOID', 'AWAKE', 'AWARD', 'AWARE',
            'BADLY', 'BAKER', 'BASES', 'BASIC', 'BEACH', 'BEGAN', 'BEGIN', 'BEING', 'BELOW', 'BENCH',
            'BILLY', 'BIRTH', 'BLACK', 'BLAME', 'BLANK', 'BLIND', 'BLOCK', 'BLOOD', 'BOARD', 'BOOST',
            'BOOTH', 'BOUND', 'BRAND', 'BRASS', 'BRAVE', 'BREAD', 'BREAK', 'BREED', 'BRIEF', 'BRING',
            'BROAD', 'BROKE', 'BROWN', 'BUILD', 'BUILT', 'BUYER', 'CABLE', 'CARRY', 'CATCH', 'CAUSE',
            'CHAIN', 'CHAOS', 'CHARM', 'CHART', 'CHASE', 'CHEAP', 'CHECK', 'CHEST', 'CHIEF', 'CHILD',
            'CHINA', 'CHOSE', 'CIVIL', 'CLAIM', 'CLASS', 'CLEAN', 'CLEAR', 'CLICK', 'CLIMB', 'CLOCK',
            'CLOSE', 'CLOUD', 'COACH', 'COAST', 'COULD', 'COUNT', 'COURT', 'COVER', 'CRAFT', 'CRASH',
            'CRAZY', 'CREAM', 'CRIME', 'CROSS', 'CROWD', 'CROWN', 'CRUDE', 'CURVE', 'CYCLE', 'DAILY',
            'DATED', 'DEALT', 'DEATH', 'DEBUT', 'DELAY', 'DEPTH', 'DOING', 'DOUBT', 'DOZEN', 'DRAFT',
            'DRAMA', 'DRANK', 'DRAWN', 'DREAM', 'DRESS', 'DRILL', 'DRINK', 'DRIVE', 'DROVE', 'DYING',
            'EAGER', 'EARLY', 'ELITE', 'EMPTY', 'ENEMY', 'ENJOY', 'ENTER', 'ENTRY', 'EQUAL', 'ERROR',
            'EVENT', 'EVERY', 'EXACT', 'EXIST', 'EXTRA', 'FAITH', 'FALSE', 'FAULT', 'FIBER', 'FIELD',
            'FIFTH', 'FIFTY', 'FIGHT', 'FINAL', 'FIRST', 'FIXED', 'FLASH', 'FLEET', 'FLOOR', 'FLUID',
            'FOCUS', 'FORCE', 'FORTH', 'FORTY', 'FORUM', 'FOUND', 'FRAME', 'FRANK', 'FRAUD', 'FRESH',
            'FRONT', 'FULLY', 'FUNNY', 'GIANT', 'GIVEN', 'GLASS', 'GLOBE', 'GOING', 'GRACE', 'GRADE',
            'GRAND', 'GRANT', 'GRAVE', 'GREAT', 'GREEN', 'GROSS', 'GROUP', 'GROWN', 'GUARD', 'GUESS',
            'GUEST', 'GUIDE', 'HARRY', 'HEART', 'HEAVY', 'HORSE', 'HOTEL', 'HOUSE', 'HUMAN', 'IDEAL',
            'IMAGE', 'INDEX', 'INNER', 'INPUT', 'ISSUE', 'JAPAN', 'JIMMY', 'JOINT', 'JONES', 'JUDGE',
            'KNOWN', 'LABEL', 'LARGE', 'LASER', 'LATER', 'LAUGH', 'LAYER', 'LEARN', 'LEASE', 'LEAST',
            'LEAVE', 'LEGAL', 'LEVEL', 'LEWIS', 'LIMIT', 'LINKS', 'LIVES', 'LOCAL', 'LOOSE', 'LOWER',
            'LUCKY', 'LUNCH', 'LYING', 'MAGIC', 'MAJOR', 'MAKER', 'MARCH', 'MARIA', 'MATCH', 'MAYBE',
            'MAYOR', 'MEANT', 'MEDIA', 'METAL', 'MIGHT', 'MINOR', 'MINUS', 'MIXED', 'MODEL', 'MONEY',
            'MONTH', 'MORAL', 'MOTOR', 'MOUNT', 'MOUSE', 'MOUTH', 'MOVED', 'MOVIE', 'NEEDS', 'NEVER',
            'NEWLY', 'NOISE', 'NORTH', 'NOTED', 'NOVEL', 'NURSE', 'OCCUR', 'OFFER', 'OFTEN', 'ORDER',
            'OTHER', 'OUGHT', 'PAINT', 'PANEL', 'PARTY', 'PEACE', 'PETER', 'PHASE', 'PHONE', 'PHOTO',
            'PIANO', 'PIECE', 'PILOT', 'PITCH', 'PLACE', 'PLAIN', 'PLANE', 'PLANT', 'PLATE', 'PLAZA',
            'POINT', 'POUND', 'POWER', 'PRESS', 'PRICE', 'PRIDE', 'PRIME', 'PRINT', 'PRIOR', 'PRIZE',
            'PROOF', 'PROUD', 'PROVE', 'QUICK', 'QUIET', 'QUITE', 'RADIO', 'RAISE', 'RANGE', 'RAPID',
            'RATIO', 'REACH', 'READY', 'REALM', 'REBEL', 'REFER', 'RELAX', 'REPLY', 'RIGHT', 'RIGID',
            'ROBIN', 'ROGER', 'ROMAN', 'ROUGH', 'ROUND', 'ROUTE', 'ROYAL', 'RURAL', 'SCALE', 'SCENE',
            'SCOPE', 'SCORE', 'SENSE', 'SERVE', 'SETUP', 'SEVEN', 'SHALL', 'SHAPE', 'SHARE', 'SHARP',
            'SHEET', 'SHELF', 'SHELL', 'SHIFT', 'SHINE', 'SHIRT', 'SHOCK', 'SHOOT', 'SHORT', 'SHOWN',
            'SIDED', 'SIGHT', 'SILLY', 'SINCE', 'SIXTH', 'SIXTY', 'SIZED', 'SKILL', 'SLEEP', 'SLIDE',
            'SMALL', 'SMILE', 'SMITH', 'SMOKE', 'SNAKE', 'SOLAR', 'SOLID', 'SOLVE', 'SORRY', 'SOUND',
            'SOUTH', 'SPACE', 'SPARE', 'SPEAK', 'SPEED', 'SPEND', 'SPENT', 'SPLIT', 'SPOKE', 'SPORT',
            'STAFF', 'STAGE', 'STAKE', 'STAND', 'START', 'STATE', 'STEAM', 'STEEL', 'STEEP', 'STEER',
            'STEPS', 'STICK', 'STILL', 'STOCK', 'STONE', 'STOOD', 'STORE', 'STORM', 'STORY', 'STRIP',
            'STUCK', 'STUDY', 'STUFF', 'STYLE', 'SUGAR', 'SUITE', 'SUPER', 'SWEET', 'TABLE', 'TAKEN',
            'TASTE', 'TAXES', 'TEACH', 'TEETH', 'TERRY', 'TEXAS', 'THANK', 'THEFT', 'THEIR', 'THEME',
            'THERE', 'THESE', 'THICK', 'THING', 'THINK', 'THIRD', 'THOSE', 'THREE', 'THREW', 'THROW',
            'THUMB', 'TIGHT', 'TIMER', 'TIMES', 'TITLE', 'TODAY', 'TOPIC', 'TOTAL', 'TOUCH', 'TOUGH',
            'TOWER', 'TRACK', 'TRADE', 'TRAIN', 'TREAT', 'TREND', 'TRIAL', 'TRIBE', 'TRICK', 'TRIED',
            'TRIES', 'TRUCK', 'TRULY', 'TRUNK', 'TRUST', 'TRUTH', 'TWICE', 'TWIST', 'TYLER', 'UNDER',
            'UNDUE', 'UNION', 'UNITY', 'UNTIL', 'UPPER', 'UPSET', 'URBAN', 'USAGE', 'USUAL', 'VALID',
            'VALUE', 'VIDEO', 'VIRUS', 'VISIT', 'VITAL', 'VOCAL', 'WASTE', 'WATCH', 'WAVES', 'WEIRD',
            'WELSH', 'WHEEL', 'WHERE', 'WHICH', 'WHILE', 'WHOLE', 'WHOSE', 'WOMAN', 'WOMEN', 'WORLD',
            'WORRY', 'WORSE', 'WORST', 'WORTH', 'WOULD', 'WRITE', 'WRONG', 'WROTE', 'YOUNG', 'YOUTH'
        ];
    }

    // Check if a word is valid using the Dictionary API
    async isValidWord(word) {
        // First check our comprehensive fallback list
        if (this.fallbackWords.includes(word.toUpperCase())) {
            return true;
        }
        
        // Then try API validation for additional words
        try {
            const response = await fetch(`${this.apiBase}/${word.toLowerCase()}`);
            return response.ok;
        } catch (error) {
            console.warn('API validation failed, using fallback:', error);
            // If API fails, only accept words from our fallback list
            return false;
        }
    }

    // Get a random 5-letter word
    async getRandomWord() {
        try {
            // Try to get a random word from our fallback list first
            const randomIndex = Math.floor(Math.random() * this.fallbackWords.length);
            const candidateWord = this.fallbackWords[randomIndex];
            
            // Verify it's valid with the API
            const isValid = await this.isValidWord(candidateWord);
            if (isValid) {
                return candidateWord;
            }
            
            // If API validation fails, just return the fallback word
            return candidateWord;
        } catch (error) {
            console.warn('Random word generation failed, using fallback:', error);
            // Fallback to local random selection
            const randomIndex = Math.floor(Math.random() * this.fallbackWords.length);
            return this.fallbackWords[randomIndex];
        }
    }

    // Check if a word is a person name
    isPersonName(word) {
        return this.personNames.has(word.toUpperCase());
    }

    // Get a random word from a specific list (for secret words)
    getRandomSecretWord() {
        // Filter out person names from the first 100 words
        const secretWords = this.fallbackWords.slice(0, 100).filter(word => !this.isPersonName(word));
        
        if (secretWords.length === 0) {
            // Fallback to any word if all are person names (shouldn't happen)
            const randomIndex = Math.floor(Math.random() * this.fallbackWords.length);
            return this.fallbackWords[randomIndex];
        }
        
        const randomIndex = Math.floor(Math.random() * secretWords.length);
        return secretWords[randomIndex];
    }

    // Batch validate multiple words (for performance)
    async validateWords(words) {
        const validationPromises = words.map(word => this.isValidWord(word));
        return Promise.all(validationPromises);
    }
}

// Create a global instance
const wordAPI = new WordAPIService();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WordAPIService;
}
