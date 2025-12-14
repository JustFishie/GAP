class MathGame {
    constructor() {
        try {
            // Check if we're on a game page before initializing
            const titleScreen = document.getElementById('titleScreen');
            const gameScreen = document.getElementById('gameScreen');
            
            if (!titleScreen || !gameScreen) {
                // Not on a game page, don't initialize
                return;
            }
            
            this.currentLevel = 1;
            this.currentQuestion = null;
            this.correctAnswer = null;
            this.currentProblem = 0; // Track which problem we're on for Level 2
            this.currentSelectedBlank = null; // Track which blank is currently selected
            // Reset progress - clear completed levels
            localStorage.removeItem('completedLevels');
            this.completedLevels = [];
            
            this.initializeElements();
            this.bindEvents();
            this.updateLevelButtons();
            this.generateQuestion();
        } catch (error) {
            console.error('Error initializing game:', error);
            // Only show alert if we're actually on a game page
            const titleScreen = document.getElementById('titleScreen');
            const gameScreen = document.getElementById('gameScreen');
            if (titleScreen && gameScreen) {
                alert('Error loading game. Please check the console for details.');
            }
        }
    }
    
    initializeElements() {
        this.titleScreen = document.getElementById('titleScreen');
        this.gameScreen = document.getElementById('gameScreen');
        this.level1Btn = document.getElementById('level1Btn');
        this.level2Btn = document.getElementById('level2Btn');
        this.level3Btn = document.getElementById('level3Btn');
        this.backBtn = document.getElementById('backBtn');
        this.questionEl = document.getElementById('question');
        this.answerOptions = document.getElementById('answerOptions');
        this.piBubble = document.getElementById('piBubble');
        this.piEquation = document.getElementById('piEquation');
        this.submitSection = document.getElementById('submitSection');
        
        // Digital keyboard elements
        this.digitalKeyboard = document.getElementById('digitalKeyboard');
        this.keyboardInput = document.getElementById('keyboardInput');
        this.keyboardSubmit = document.getElementById('keyboardSubmit');
        this.userInput = '';
        
        // Verify all required elements exist
        if (!this.titleScreen || !this.gameScreen || !this.level1Btn || !this.level2Btn || 
            !this.level3Btn || !this.backBtn || !this.questionEl || !this.answerOptions) {
            throw new Error('Required game elements not found on this page');
        }
    }
    
    bindEvents() {
        // Only bind events if elements exist
        if (this.level1Btn) {
            this.level1Btn.addEventListener('click', () => this.startLevel(1));
        }
        if (this.level2Btn) {
            this.level2Btn.addEventListener('click', () => this.startLevel(2));
        }
        if (this.level3Btn) {
            this.level3Btn.addEventListener('click', () => this.startLevel(3));
        }
        if (this.backBtn) {
            this.backBtn.addEventListener('click', () => this.backToMenu());
        }
        
        // Digital keyboard events
        if (this.digitalKeyboard && this.keyboardInput && this.keyboardSubmit) {
            this.setupDigitalKeyboard();
        }
        
        // Add fullscreen button event listener
        const fullscreenBtn = document.getElementById('fullscreenBtn');
        if (fullscreenBtn) {
            fullscreenBtn.addEventListener('click', () => {
                if (window.toggleFullscreen) {
                    window.toggleFullscreen();
                }
            });
        }
        
        // Add event listeners to answer buttons
        if (this.answerOptions) {
            this.answerOptions.addEventListener('click', (e) => {
                if (e.target.classList.contains('answer-btn')) {
                    this.checkAnswer(e.target);
                }
            });
        }
    }
    
    updateLevelButtons() {
        // Temporarily enable all levels for testing
        this.level1Btn.disabled = false;
        this.level2Btn.disabled = false;
        this.level3Btn.disabled = false;
        
        // Original code (commented out for testing):
        // Level 1 is always available
        // this.level1Btn.disabled = false;
        
        // Level 2 is available if Level 1 is completed
        // this.level2Btn.disabled = !this.completedLevels.includes(1);
        
        // Level 3 is available if Level 2 is completed
        // this.level3Btn.disabled = !this.completedLevels.includes(2);
    }
    
    completeLevel(level) {
        if (!this.completedLevels.includes(level)) {
            this.completedLevels.push(level);
            localStorage.setItem('completedLevels', JSON.stringify(this.completedLevels));
            this.updateLevelButtons();
        }
    }
    
    startLevel(level) {
        this.currentLevel = level;
        this.correctAnswerCount = 0; // Reset correct answer count
        this.currentProblem = 0; // Reset problem counter
        
        // Update the level title
        const levelTitle = document.querySelector('.game-header h2');
        switch(level) {
            case 1:
                levelTitle.textContent = 'Level 1 - Fill in the Digits';
                break;
            case 2:
                levelTitle.textContent = 'Level 2 - Math Problems';
                break;
            case 3:
                levelTitle.textContent = 'Level 3 - Advanced Pi Problems';
                break;
        }
        
        this.titleScreen.style.display = 'none';
        this.gameScreen.style.display = 'block';
        
        this.createGameMathEffects();
        this.generateQuestion();
    }
    
    createGameMathEffects() {
        const gameMathEffects = document.getElementById('gameMathEffects');
        if (!gameMathEffects) {
            console.log('Game math effects container not found');
            return;
        }
        
        gameMathEffects.innerHTML = '';
        
        const symbols = ['1', '2', '3', '+', '-', '×', '÷', 'π'];
        for (let i = 0; i < 8; i++) {
            const element = document.createElement('div');
            element.className = 'game-math-symbol';
            element.textContent = symbols[i];
            element.style.top = Math.random() * 80 + 10 + '%';
            element.style.left = Math.random() * 80 + 10 + '%';
            element.style.animationDelay = Math.random() * 6 + 's';
            element.style.animationDuration = (Math.random() * 4 + 4) + 's';
            gameMathEffects.appendChild(element);
        }
        console.log('Created', gameMathEffects.children.length, 'math symbols');
    }
    
    backToMenu() {
        this.gameScreen.style.display = 'none';
        this.titleScreen.style.display = 'block';
        this.updateLevelButtons();
        
        // Hide the pi bubble when returning to menu
        this.piBubble.style.display = 'none';
    }
    
    getOrdinalSuffix(num) {
        const j = num % 10;
        const k = num % 100;
        if (j == 1 && k != 11) {
            return "st";
        }
        if (j == 2 && k != 12) {
            return "nd";
        }
        if (j == 3 && k != 13) {
            return "rd";
        }
        return "th";
    }

    generateQuestion() {
        // Reset keyboard input styling
        if (this.keyboardInput) {
            this.keyboardInput.style.borderColor = '';
            this.keyboardInput.style.backgroundColor = '';
        }
        
        // Clean up any existing visuals
        const existingCircle = document.getElementById('circleVisual');
        if (existingCircle) {
            existingCircle.remove();
        }
        
        const existingSquareCircle = document.getElementById('squareCircleVisual');
        if (existingSquareCircle) {
            existingSquareCircle.remove();
        }
        
        const existingPiInstruction = document.querySelector('.pi-instruction');
        if (existingPiInstruction) {
            existingPiInstruction.remove();
        }
        
        const existingArithmetic = document.getElementById('arithmeticVisual');
        if (existingArithmetic) {
            existingArithmetic.remove();
        }
        
        const existingQuarterCircles = document.getElementById('quarterCirclesVisual');
        if (existingQuarterCircles) {
            existingQuarterCircles.remove();
        }
        
        const existingSemicircle = document.getElementById('semicircleVisual');
        if (existingSemicircle) {
            existingSemicircle.remove();
        }
        
        const existingChessboard = document.getElementById('piChessboard');
        if (existingChessboard) {
            existingChessboard.remove();
        }
        
        let question, correctAnswer, options, piEquation = null;
        
        switch(this.currentLevel) {
            case 1:
                // Pi equation with missing digits (correct pi: 3.1415926535...)
                this.piDigits = ['1', '5', '9', '2', '6', '5', '3', '5'];
                this.missingPositions = [0, 1, 3, 4, 5, 7]; // Positions for the missing digits (1, 5, 2, 6, 5, 5)
                this.missingDigits = this.missingPositions.map(pos => this.piDigits[pos]);
                this.userAnswers = new Array(this.missingDigits.length).fill(null);
                this.correctCount = 0;
                
                // Create the pi equation with blanks and hints
                const hints = [
                    "Hint: any number multiplied by this equals itself",
                    "Hint: any number multiplied by this ends with 0 or 5",
                    "Hint: first prime number and the only even prime",
                    "Hint: the first perfect number. A perfect number is a number where all its factors add up to itself. For example 28 has factors 1, 2, 4, 7, and 14 and 1+2+4+7+14=28",
                    "Hint: Bob had 17 grapes. He ate 2 grapes and then shared it with his 2 friends Jimmy and Nick. If he evenly distributes the grapes between himself, Jimmy and Bob, how many grapes did Jimmy get?",
                    "Hint: a box has 14 red marbles and 8 blue marbles. Then, Jeff took out 3 red marbles and 2 blue marbles. How many more red marbles does the box have than the blue marbles?"
                ];
                
                piEquation = 'π = 3.14 ';
                let hintIndex = 0;
                for (let i = 0; i < this.piDigits.length; i++) {
                    if (this.missingPositions.includes(i)) {
                        piEquation += `<span class="blank-hint clickable-blank" data-hint="${hints[hintIndex]}" data-index="${hintIndex}" data-correct="${this.missingDigits[hintIndex]}" tabindex="0">_</span> `;
                        hintIndex++;
                    } else {
                        piEquation += this.piDigits[i] + ' ';
                    }
                }
                
                question = `Click on a blank or press Tab to focus, then type a number (0-9) or click to select, then submit when ready!`;
                correctAnswer = null; // No specific answer needed
                options = []; // No options needed
                break;
                
            case 2:
                // Three specific problems
                this.currentProblem++;
                console.log('Level 2 - Current problem:', this.currentProblem);
                switch(this.currentProblem) {
                    case 1:
                        // Circle problem with radius 2
                        correctAnswer = "4π"; // Circumference = 2πr = 2π(2) = 4π
                        question = `What is the circumference of the circle above?`;
                        options = this.generateOptions(correctAnswer, 8, 16);
                        
                        // Add circle visual
                        this.displayCircleVisual(2);
                break;
                    case 2:
                        // Square with inscribed circle - shaded area problem
                        correctAnswer = "16-4π"; // Square area - Circle area = 4² - π(2)² = 16 - 4π
                        question = `What is the area of the shaded parts?`;
                        options = this.generateOptions(correctAnswer, 10, 20);
                        
                        // Add square-circle visual
                        this.displaySquareCircleVisual();
                        break;
                    case 3:
                        // Square with inscribed circle and quarter circles in corners
                        correctAnswer = "4π"; // Area of the inscribed circle = π(2)² = 4π
                        question = `What is the area of the inscribed circle?`;
                        options = this.generateOptions(correctAnswer, 8, 16);
                        
                        // Add quarter circles visual
                        this.displayQuarterCirclesVisual();
                        break;
                }
                break;
                
            case 3:
                // Pi Chessboard Game
                question = `Use arrow keys or WASD to move. You will move until you hit an obstacle or the edge.`;
                correctAnswer = null; // No specific answer needed
                options = [];
                // Only generate chessboard when level 3 is actually started
                try {
                    this.displayPiChessboard();
                } catch (error) {
                    console.error('Error displaying chessboard:', error);
                    question = 'Error loading level 3. Please refresh the page.';
                }
                break;
        }
        
        this.currentQuestion = question;
        this.correctAnswer = correctAnswer;
        
        // Display the pi equation and question
        if (this.currentLevel === 1 && piEquation) {
            this.piBubble.style.display = 'block';
            this.piEquation.innerHTML = piEquation;
            this.questionEl.textContent = question;
            this.answerOptions.style.display = 'none'; // Hide answer options for Level 1
            this.submitSection.style.display = 'block'; // Show submit section for Level 1
            
            // Store the original question text for hover functionality
            this.originalQuestionText = question;
            
            // Set up clickable blanks AFTER innerHTML is set
            setTimeout(() => {
                this.setupClickableBlanks();
            }, 50);
            
            this.setupSubmitButton();
            this.updateProgressDisplay();
            console.log('Pi equation generated:', piEquation);
        } else {
            this.piBubble.style.display = 'none';
            this.questionEl.textContent = question;
            
            if (this.currentLevel === 2) {
                // Show digital keyboard for Level 2
                this.answerOptions.style.display = 'none';
                this.digitalKeyboard.style.display = 'block';
                this.submitSection.style.display = 'none';
                this.resetKeyboardInput();
                
                // Add pi format instruction
                this.addPiInstruction();
            } else if (this.currentLevel === 3) {
                // Level 3 uses chessboard interface - hide standard UI elements
                this.answerOptions.style.display = 'none';
                this.digitalKeyboard.style.display = 'none';
                this.submitSection.style.display = 'none';
                // Chessboard UI is handled in displayPiChessboard()
            } else {
                // Show answer options for other levels
                this.answerOptions.style.display = 'grid';
                this.digitalKeyboard.style.display = 'none';
                this.submitSection.style.display = 'none';
            this.displayOptions(options);
            }
        }
    }
    
    setupClickableBlanks() {
        // Clean up any existing hover state
        this.cleanupHoverState();
        
        // Set up event delegation on the pi equation container for all blanks
        const piEquation = document.getElementById('piEquation');
        
        // Remove any existing event listeners by cloning and replacing the container
        const newPiEquation = piEquation.cloneNode(true);
        piEquation.parentNode.replaceChild(newPiEquation, piEquation);
        
        // Set up hover state tracking
        this.currentHoveredBlank = null;
        this.hoverTimeout = null;
        
        // Use event delegation for hover events on all blanks (both filled and empty)
        // Use mouseover/mouseout instead of mouseenter/mouseleave for better control
        newPiEquation.addEventListener('mouseover', (e) => {
            if (e.target.classList.contains('blank-hint')) {
                this.handleMouseOver(e.target);
            }
        });
        
        newPiEquation.addEventListener('mouseout', (e) => {
            if (e.target.classList.contains('blank-hint')) {
                this.handleMouseOut(e.target);
            }
        });
        
        // Use event delegation for click events on all blanks (empty and filled)
        newPiEquation.addEventListener('click', (e) => {
            if (e.target.classList.contains('blank-hint')) {
                e.preventDefault();
                e.stopPropagation();
                
                // Close any existing selector first
                this.closeDigitSelector();
                
                // Small delay to ensure clean state
                setTimeout(() => {
                    this.showDigitSelector(e.target);
                }, 10);
            }
        });
        
        // Add keyboard input functionality
        newPiEquation.addEventListener('keydown', (e) => {
            if (e.target.classList.contains('blank-hint')) {
                const key = e.key;
                // Check if the key is a digit 0-9
                if (key >= '0' && key <= '9') {
                    e.preventDefault();
                    e.stopPropagation();
                    this.selectDigit(e.target, key);
                }
            }
        });
    }
    
    cleanupHoverState() {
        // Clean up any existing hover state
        if (this.currentHoveredBlank) {
            this.hideHint();
            this.currentHoveredBlank = null;
        }
        
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
    }
    
    handleMouseOver(blank) {
        // Clear any existing timeout
        if (this.hoverTimeout) {
            clearTimeout(this.hoverTimeout);
            this.hoverTimeout = null;
        }
        
        // If we're already hovering over this blank, do nothing
        if (this.currentHoveredBlank === blank) {
            return;
        }
        
        // Set the current hovered blank and show hint immediately
        this.currentHoveredBlank = blank;
        this.showHint(blank);
    }
    
    handleMouseOut(blank) {
        // Only hide hint if we're actually leaving the blank we were hovering over
        if (this.currentHoveredBlank === blank) {
            this.hideHint();
            this.currentHoveredBlank = null;
        }
    }
    
    showHint(blank) {
        const questionEl = document.getElementById('question');
        const hint = blank.getAttribute('data-hint');
        
        if (hint && this.currentHoveredBlank === blank) {
            // Store original styles to prevent layout shifts
            const originalHeight = questionEl.offsetHeight;
            
            questionEl.textContent = hint;
            
            // Set a fixed height and font size to prevent layout shifts
            questionEl.style.height = Math.max(originalHeight, 100) + 'px';
            questionEl.style.minHeight = '100px';
            questionEl.style.fontSize = '18px'; // Fixed font size to prevent shifts
            questionEl.style.lineHeight = '1.4';
        }
    }
            
    hideHint() {
        const questionEl = document.getElementById('question');
        questionEl.textContent = this.originalQuestionText;
                questionEl.style.fontSize = '18px'; // Reset to original font size
        
        // Reset height styles to allow natural sizing
        questionEl.style.height = '';
        questionEl.style.minHeight = '';
    }
    
    showDigitSelector(blank) {
        // Hide existing digit selector if any
        const existingSelector = document.getElementById('digitSelector');
        if (existingSelector) {
            // If selector is position-locked, don't reposition it
            if (existingSelector.getAttribute('data-position-locked') === 'true') {
                return;
            }
            existingSelector.remove();
        }
        
        // Store reference to the current blank
        this.currentSelectedBlank = blank;
        
        // Disable pi-bubble animation to prevent positioning interference
        const piBubble = document.getElementById('piBubble');
        if (piBubble) {
            piBubble.classList.remove('floating');
        }
        
        // Create digit selector
        const selector = document.createElement('div');
        selector.id = 'digitSelector';
        selector.className = 'digit-selector';
        selector.innerHTML = `
            <div class="digit-grid">
                <button class="digit-btn" data-digit="0">0</button>
                <button class="digit-btn" data-digit="1">1</button>
                <button class="digit-btn" data-digit="2">2</button>
                <button class="digit-btn" data-digit="3">3</button>
                <button class="digit-btn" data-digit="4">4</button>
                <button class="digit-btn" data-digit="5">5</button>
                <button class="digit-btn" data-digit="6">6</button>
                <button class="digit-btn" data-digit="7">7</button>
                <button class="digit-btn" data-digit="8">8</button>
                <button class="digit-btn" data-digit="9">9</button>
            </div>
        `;
        
        // Position the selector near the clicked blank with improved positioning
        const rect = blank.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const selectorWidth = 150; // Width of the selector
        const selectorHeight = 100; // Approximate height of the selector
        
        selector.style.position = 'fixed';
        selector.style.zIndex = '1001';
        
        // Calculate optimal position (center below the blank) with stable positioning
        let left = Math.round(rect.left + (rect.width / 2) - (selectorWidth / 2));
        let top = Math.round(rect.bottom + 15); // Increased spacing from blank
        
        // Adjust for viewport boundaries with better margins
        const margin = 20;
        
        // Adjust if too close to right edge
        if (left + selectorWidth > viewportWidth - margin) {
            left = viewportWidth - selectorWidth - margin;
        }
        
        // Adjust if too close to left edge
        if (left < margin) {
            left = margin;
        }
        
        // Adjust if too close to bottom edge (show above instead)
        if (top + selectorHeight > viewportHeight - margin) {
            top = Math.round(rect.top - selectorHeight - 15);
        }
        
        // Ensure top position is not negative
        if (top < margin) {
            top = margin;
        }
        
        // Round positions to prevent sub-pixel positioning issues
        selector.style.left = Math.round(left) + 'px';
        selector.style.top = Math.round(top) + 'px';
        
        // Add a position lock to prevent repositioning
        selector.setAttribute('data-position-locked', 'true');
        
        document.body.appendChild(selector);
        
        // Add click handlers for digits with improved event handling
        const digitBtns = selector.querySelectorAll('.digit-btn');
        digitBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const selectedDigit = btn.dataset.digit;
                this.selectDigit(this.currentSelectedBlank, selectedDigit);
                this.closeDigitSelector();
            });
            
            // Prevent hover events from interfering with positioning
            btn.addEventListener('mouseenter', (e) => {
                e.stopPropagation();
            });
            
            btn.addEventListener('mouseleave', (e) => {
                e.stopPropagation();
            });
        });
        
        // Close selector when clicking outside or on another blank
        // Reduced timeout to make it more responsive
        setTimeout(() => {
            const closeSelector = (e) => {
                if (!selector.contains(e.target) && !blank.contains(e.target)) {
                    this.closeDigitSelector();
                    document.removeEventListener('click', closeSelector);
                }
            };
            document.addEventListener('click', closeSelector);
        }, 50);
    }
    
    closeDigitSelector() {
        const selector = document.getElementById('digitSelector');
        if (selector) {
            selector.remove();
        }
        this.currentSelectedBlank = null;
        
        // Re-enable pi-bubble animation
        const piBubble = document.getElementById('piBubble');
        if (piBubble) {
            piBubble.classList.add('floating');
        }
    }
    
    setupDigitalKeyboard() {
        // Set up keyboard key event listeners
        const keyboardKeys = document.querySelectorAll('.keyboard-key');
        keyboardKeys.forEach(key => {
            key.addEventListener('click', (e) => {
                const keyValue = e.target.dataset.key;
                this.handleKeyboardInput(keyValue);
            });
        });
        
        // Set up submit button
        this.keyboardSubmit.addEventListener('click', () => {
            this.submitKeyboardAnswer();
        });
        
        // Set up physical keyboard input
        document.addEventListener('keydown', (e) => {
            if (this.currentLevel === 2 && this.digitalKeyboard.style.display !== 'none') {
                if (e.key >= '0' && e.key <= '9') {
                    e.preventDefault();
                    this.handleKeyboardInput(e.key);
                } else if (e.key === 'Backspace') {
                    e.preventDefault();
                    this.handleKeyboardInput('clear');
                } else if (e.key === 'Enter') {
                    e.preventDefault();
                    this.submitKeyboardAnswer();
                } else if (e.key.toLowerCase() === 'p' && e.ctrlKey) {
                    e.preventDefault();
                    this.handleKeyboardInput('π');
                } else if (e.key === '+') {
                    e.preventDefault();
                    this.handleKeyboardInput('+');
                } else if (e.key === '-') {
                    e.preventDefault();
                    this.handleKeyboardInput('-');
                }
            }
        });
    }
    
    handleKeyboardInput(keyValue) {
        if (keyValue === 'clear') {
            this.userInput = '';
        } else {
            // Handle pi input - if user types 'pi', convert to π
            if (keyValue === 'π') {
                this.userInput += 'π';
            } else {
                this.userInput += keyValue;
            }
        }
        
        this.updateKeyboardDisplay();
    }
    
    updateKeyboardDisplay() {
        this.keyboardInput.value = this.userInput;
        
        // Enable/disable submit button based on input
        this.keyboardSubmit.disabled = this.userInput.length === 0;
    }
    
    resetKeyboardInput() {
        this.userInput = '';
        this.updateKeyboardDisplay();
        // Reset input styling
        if (this.keyboardInput) {
            this.keyboardInput.style.borderColor = '';
            this.keyboardInput.style.backgroundColor = '';
        }
    }
    
    submitKeyboardAnswer() {
        if (this.userInput.length === 0) return;
        
        // For Level 2 and Level 3, compare answers (can be pi format or numeric)
        if (this.currentLevel === 2 || this.currentLevel === 3) {
            // Normalize both user input and correct answer for comparison
            const normalizedUserInput = this.userInput.toLowerCase().replace(/\s/g, '');
            const normalizedCorrectAnswer = this.correctAnswer.toLowerCase().replace(/\s/g, '');
            
            // Check if answers match exactly (case-insensitive, no spaces)
            const isCorrect = normalizedUserInput === normalizedCorrectAnswer;
            
            if (isCorrect) {
                // Handle correct answer
                this.handleCorrectAnswer();
            } else {
                // Handle incorrect answer
                this.keyboardInput.style.borderColor = '#e17055';
                this.keyboardInput.style.backgroundColor = '#ffeaa7';
                
                setTimeout(() => {
                    this.showCustomModal(
                        "Try Again",
                        "That's not quite right. Let's try this level again!",
                        () => this.resetCurrentLevel()
                    );
                }, 1000);
            }
            return;
        }
        
        // For other levels, use the old numerical comparison
        let userAnswer;
        if (this.userInput.includes('π')) {
            // Handle pi in the answer
            const parts = this.userInput.split('π');
            if (parts.length === 2 && parts[0] === '' && parts[1] === '') {
                userAnswer = Math.PI; // Just π
            } else if (parts.length === 2 && parts[1] === '') {
                userAnswer = parseFloat(parts[0]) * Math.PI; // Number * π
            } else {
                userAnswer = parseFloat(this.userInput.replace('π', '')); // Just the number part
            }
        } else {
            userAnswer = parseFloat(this.userInput);
        }
        
        // Check if answer is correct
        const isCorrect = Math.abs(userAnswer - this.correctAnswer) < 0.01; // Allow small floating point differences
        
        // Disable keyboard temporarily
        const keyboardKeys = document.querySelectorAll('.keyboard-key');
        keyboardKeys.forEach(key => key.disabled = true);
        this.keyboardSubmit.disabled = true;
        
        if (isCorrect) {
            // Handle correct answer
            this.handleCorrectAnswer();
        } else {
            // Handle incorrect answer
            this.keyboardInput.style.borderColor = '#e17055';
            this.keyboardInput.style.backgroundColor = '#ffeaa7';
            
            setTimeout(() => {
                this.showCustomModal(
                    "Try Again",
                    `That's not quite right. The correct answer is ${this.correctAnswer}. Let's try this level again!`,
                    () => this.resetCurrentLevel()
                );
            }, 1000);
        }
    }
    
    handleCorrectAnswer() {
        this.keyboardInput.style.borderColor = '#00b894';
        this.keyboardInput.style.backgroundColor = '#d1f2eb';
        
        if (this.currentLevel === 2) {
            // For Level 2, complete after 3 problems
            console.log('Level 2 completion check - currentProblem:', this.currentProblem);
            if (this.currentProblem >= 3) {
                this.completeLevel(this.currentLevel);
                setTimeout(() => {
                    this.showCustomModal(
                        "🎉 Level Complete!",
                        `Level ${this.currentLevel} completed! You can now access the next level.`,
                        () => this.backToMenu()
                    );
                }, 1000);
                return;
            } else {
                // Move to next problem - reset input styling first
                setTimeout(() => {
                    if (this.keyboardInput) {
                        this.keyboardInput.style.borderColor = '';
                        this.keyboardInput.style.backgroundColor = '';
                    }
                    this.generateQuestion();
                }, 1000);
                return;
            }
        } else if (this.currentLevel === 3) {
            // For Level 3, complete after 5 problems
            console.log('Level 3 completion check - currentProblem:', this.currentProblem);
            if (this.currentProblem >= 5) {
                this.completeLevel(this.currentLevel);
                setTimeout(() => {
                    this.showCustomModal(
                        "🎉 Level Complete!",
                        `Level ${this.currentLevel} completed! You can now access the next level.`,
                        () => this.backToMenu()
                    );
                }, 1000);
                return;
            } else {
                // Move to next problem - reset input styling first
                setTimeout(() => {
                    if (this.keyboardInput) {
                        this.keyboardInput.style.borderColor = '';
                        this.keyboardInput.style.backgroundColor = '';
                    }
                    this.generateQuestion();
                }, 1000);
                return;
            }
        }
    }
    
    addPiInstruction() {
        // Remove any existing instruction
        const existingInstruction = document.getElementById('piInstruction');
        if (existingInstruction) {
            existingInstruction.remove();
        }
        
        // Create instruction element
        const instruction = document.createElement('div');
        instruction.id = 'piInstruction';
        instruction.className = 'pi-instruction';
        instruction.innerHTML = `
            <div class="instruction-content">
                <span class="instruction-icon">π</span>
                <span class="instruction-text">Make your answer as a value of pi like 10π</span>
            </div>
        `;
        
        // Insert the instruction before the question
        const questionContainer = document.querySelector('.question-container');
        const question = document.getElementById('question');
        questionContainer.insertBefore(instruction, question);
    }
    
    displayCircleVisual(radius = 2) {
        // Remove any existing circle visual
        const existingCircle = document.getElementById('circleVisual');
        if (existingCircle) {
            existingCircle.remove();
        }
        
        // Create circle visual container
        const circleContainer = document.createElement('div');
        circleContainer.id = 'circleVisual';
        circleContainer.className = 'circle-visual-container';
        
        // Scale SVG size - make it smaller
        // Set to 200px for a smaller diagram
        const svgSize = 200;
        const center = svgSize / 2;
        const circleRadius = radius * (svgSize / 4); // Scale based on SVG size
        const radiusLineEnd = center + circleRadius;
        
        // Create SVG circle with dynamic radius
        // Set explicit width and height attributes to prevent scaling
        circleContainer.innerHTML = `
            <svg class="circle-svg" width="${svgSize}" height="${svgSize}" style="width: ${svgSize}px !important; height: ${svgSize}px !important; max-width: ${svgSize}px !important; min-width: ${svgSize}px !important; box-sizing: border-box !important; display: block !important; margin: 0 auto !important; flex-shrink: 0 !important; flex-grow: 0 !important; transform: none !important;">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#ff6b6b"/>
                    </marker>
                </defs>
                <circle cx="${center}" cy="${center}" r="${circleRadius}" stroke="#4ecdc4" stroke-width="${Math.max(3, svgSize / 100)}" fill="rgba(78, 205, 196, 0.1)"/>
                <!-- Radius line -->
                <line x1="${center}" y1="${center}" x2="${radiusLineEnd}" y2="${center}" stroke="#ff6b6b" stroke-width="${Math.max(2, svgSize / 150)}" marker-end="url(#arrowhead)"/>
                <!-- Radius label -->
                <text x="${center + circleRadius/2}" y="${center - svgSize * 0.05}" text-anchor="middle" class="radius-label" font-size="${Math.max(16, svgSize / 20)}">${radius}</text>
                <!-- Center point -->
                <circle cx="${center}" cy="${center}" r="${Math.max(3, svgSize / 100)}" fill="#333"/>
            </svg>
            <div class="circle-caption">Circle with radius = ${radius}</div>
        `;
        
        // Insert the circle visual before the question
        const questionContainer = document.querySelector('.question-container');
        const question = document.getElementById('question');
        questionContainer.insertBefore(circleContainer, question);
        
        // Use requestAnimationFrame to ensure DOM is ready before setting styles
        requestAnimationFrame(() => {
            // Force set the size directly on the SVG element after it's created
            // This ensures it overrides any CSS rules
            const svgElement = circleContainer.querySelector('.circle-svg');
            if (svgElement) {
                // Remove viewBox to prevent scaling - use fixed dimensions instead
                svgElement.removeAttribute('viewBox');
                svgElement.setAttribute('width', svgSize);
                svgElement.setAttribute('height', svgSize);
                svgElement.style.cssText = `
                    width: ${svgSize}px !important;
                    height: ${svgSize}px !important;
                    max-width: ${svgSize}px !important;
                    min-width: ${svgSize}px !important;
                    box-sizing: border-box !important;
                    display: block !important;
                    margin: 0 auto !important;
                    flex-shrink: 0 !important;
                    flex-grow: 0 !important;
                `;
            }
            
            // Also ensure the container itself is the right size
            circleContainer.style.cssText = `
                width: ${svgSize}px !important;
                max-width: ${svgSize}px !important;
                min-width: ${svgSize}px !important;
                box-sizing: border-box !important;
                text-align: center !important;
                margin: 1rem auto !important;
                padding: 0 !important;
                background: none !important;
                border: none !important;
                border-radius: 0 !important;
                overflow: visible !important;
            `;
        });
    }
    
    displaySquareCircleVisual() {
        // Remove any existing square-circle visual
        const existingVisual = document.getElementById('squareCircleVisual');
        if (existingVisual) {
            existingVisual.remove();
        }
        
        // Create square-circle visual container
        const visualContainer = document.createElement('div');
        visualContainer.id = 'squareCircleVisual';
        visualContainer.className = 'square-circle-visual-container';
        
        // Create SVG square with inscribed circle and shaded regions - same size as first diagram
        const svgSize = 320;
        const halfSize = svgSize / 2;
        const quarterSize = svgSize / 4;
        const circleRadius = quarterSize;
        
        visualContainer.innerHTML = `
            <svg class="square-circle-svg" viewBox="0 0 ${svgSize} ${svgSize}">
                <defs>
                    <!-- Define a mask to exclude the circle area -->
                    <mask id="circleMask">
                        <rect width="${svgSize}" height="${svgSize}" fill="white"/>
                        <circle cx="${halfSize}" cy="${halfSize}" r="${circleRadius}" fill="black"/>
                    </mask>
                </defs>
                
                <!-- Square with side length 4 -->
                <rect x="${quarterSize}" y="${quarterSize}" width="${halfSize}" height="${halfSize}" stroke="#4ecdc4" stroke-width="${Math.max(3, svgSize / 100)}" fill="white"/>
                
                <!-- Circle inscribed in square (radius 2, diameter 4) -->
                <circle cx="${halfSize}" cy="${halfSize}" r="${circleRadius}" stroke="#4ecdc4" stroke-width="${Math.max(3, svgSize / 100)}" fill="none"/>
                
                <!-- Shaded regions (area between square and circle) using mask -->
                <rect x="${quarterSize}" y="${quarterSize}" width="${halfSize}" height="${halfSize}" fill="rgba(64, 64, 64, 0.6)" mask="url(#circleMask)"/>
                
                <!-- Side length label -->
                <line x1="${quarterSize}" y1="${quarterSize * 0.8}" x2="${quarterSize + halfSize}" y2="${quarterSize * 0.8}" stroke="#ff6b6b" stroke-width="${Math.max(2, svgSize / 150)}"/>
                <text x="${halfSize}" y="${quarterSize * 0.7}" text-anchor="middle" class="side-label" font-size="${Math.max(16, svgSize / 20)}">4</text>
            </svg>
            <div class="square-circle-caption">Square with inscribed circle (side length = 4)</div>
        `;
        
        // Insert the visual before the question
        const questionContainer = document.querySelector('.question-container');
        const question = document.getElementById('question');
        questionContainer.insertBefore(visualContainer, question);
    }
    
    displayArithmeticVisual() {
        // Create arithmetic visual container
        const visualContainer = document.createElement('div');
        visualContainer.id = 'arithmeticVisual';
        visualContainer.className = 'arithmetic-visual-container';
        
        // Create SVG showing 18 - 6 = 12
        visualContainer.innerHTML = `
            <svg width="300" height="150" class="arithmetic-svg">
                <!-- 18 circles (3 rows of 6) -->
                <g class="circles-group">
                    <!-- Row 1 -->
                    <circle cx="30" cy="30" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="60" cy="30" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="90" cy="30" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="120" cy="30" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="150" cy="30" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="180" cy="30" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <!-- Row 2 -->
                    <circle cx="30" cy="60" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="60" cy="60" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="90" cy="60" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="120" cy="60" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="150" cy="60" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="180" cy="60" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <!-- Row 3 -->
                    <circle cx="30" cy="90" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="60" cy="90" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="90" cy="90" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="120" cy="90" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="150" cy="90" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                    <circle cx="180" cy="90" r="12" fill="#4ecdc4" stroke="#2d3436" stroke-width="2"/>
                </g>
                
                <!-- Cross out 6 circles (last 6) -->
                <g class="crossed-out" stroke="#e17055" stroke-width="3" fill="none">
                    <line x1="120" y1="30" x2="180" y2="90"/>
                    <line x1="150" y1="30" x2="150" y2="90"/>
                    <line x1="180" y1="30" x2="120" y2="90"/>
                </g>
                
                <!-- Labels -->
                <text x="90" y="120" text-anchor="middle" class="arithmetic-label">18 - 6 = 12</text>
                <text x="30" y="15" text-anchor="middle" class="count-label">18</text>
                <text x="150" y="15" text-anchor="middle" class="count-label">-6</text>
                <text x="270" y="60" text-anchor="middle" class="result-label">= 12</text>
            </svg>
            <div class="arithmetic-caption">Visual representation: 18 circles minus 6 crossed out = 12 remaining</div>
        `;
        
        // Insert the visual before the question
        const questionContainer = document.querySelector('.question-container');
        const question = document.getElementById('question');
        questionContainer.insertBefore(visualContainer, question);
    }
    
    displayQuarterCirclesVisual() {
        // Create quarter circles visual container
        const visualContainer = document.createElement('div');
        visualContainer.id = 'quarterCirclesVisual';
        visualContainer.className = 'quarter-circles-visual-container';
        
        // Create SVG showing square with inscribed circle and quarter circles in corners - same size as first diagram
        const svgSize = 320;
        const halfSize = svgSize / 2;
        const quarterSize = svgSize / 4;
        const circleRadius = quarterSize;
        
        visualContainer.innerHTML = `
            <svg class="quarter-circles-svg" viewBox="0 0 ${svgSize} ${svgSize}">
                <defs>
                    <!-- Clip paths for each quarter circle -->
                    <clipPath id="topLeftQuarter">
                        <path d="M ${quarterSize} ${quarterSize} L ${quarterSize} ${halfSize} A ${circleRadius} ${circleRadius} 0 0 0 ${halfSize} ${quarterSize} Z"/>
                    </clipPath>
                    <clipPath id="topRightQuarter">
                        <path d="M ${quarterSize + halfSize} ${quarterSize} L ${halfSize} ${quarterSize} A ${circleRadius} ${circleRadius} 0 0 0 ${quarterSize + halfSize} ${halfSize} Z"/>
                    </clipPath>
                    <clipPath id="bottomLeftQuarter">
                        <path d="M ${quarterSize} ${quarterSize + halfSize} L ${halfSize} ${quarterSize + halfSize} A ${circleRadius} ${circleRadius} 0 0 0 ${quarterSize} ${halfSize} Z"/>
                    </clipPath>
                    <clipPath id="bottomRightQuarter">
                        <path d="M ${quarterSize + halfSize} ${quarterSize + halfSize} L ${quarterSize + halfSize} ${halfSize} A ${circleRadius} ${circleRadius} 0 0 0 ${halfSize} ${quarterSize + halfSize} Z"/>
                    </clipPath>
                </defs>
                
                <!-- Square with side length 4 -->
                <rect x="${quarterSize}" y="${quarterSize}" width="${halfSize}" height="${halfSize}" stroke="#4ecdc4" stroke-width="${Math.max(3, svgSize / 100)}" fill="white"/>
                
                <!-- Quarter circles outlines (no fill, just outlines) -->
                <path d="M ${quarterSize} ${quarterSize} L ${quarterSize} ${halfSize} A ${circleRadius} ${circleRadius} 0 0 0 ${halfSize} ${quarterSize} Z" fill="none" stroke="#ff6b6b" stroke-width="${Math.max(2, svgSize / 150)}"/>
                <path d="M ${quarterSize + halfSize} ${quarterSize} L ${halfSize} ${quarterSize} A ${circleRadius} ${circleRadius} 0 0 0 ${quarterSize + halfSize} ${halfSize} Z" fill="none" stroke="#ff6b6b" stroke-width="${Math.max(2, svgSize / 150)}"/>
                <path d="M ${quarterSize} ${quarterSize + halfSize} L ${halfSize} ${quarterSize + halfSize} A ${circleRadius} ${circleRadius} 0 0 0 ${quarterSize} ${halfSize} Z" fill="none" stroke="#ff6b6b" stroke-width="${Math.max(2, svgSize / 150)}"/>
                <path d="M ${quarterSize + halfSize} ${quarterSize + halfSize} L ${quarterSize + halfSize} ${halfSize} A ${circleRadius} ${circleRadius} 0 0 0 ${halfSize} ${quarterSize + halfSize} Z" fill="none" stroke="#ff6b6b" stroke-width="${Math.max(2, svgSize / 150)}"/>
                
                <!-- Center inscribed circle outline (no fill) -->
                <circle cx="${halfSize}" cy="${halfSize}" r="${circleRadius}" stroke="#4ecdc4" stroke-width="${Math.max(3, svgSize / 100)}" fill="none"/>
                
                <!-- Shaded overlapping regions: inscribed circle clipped by each quarter circle -->
                <!-- Top-left overlap -->
                <circle cx="${halfSize}" cy="${halfSize}" r="${circleRadius}" fill="rgba(64, 64, 64, 0.6)" clip-path="url(#topLeftQuarter)"/>
                
                <!-- Top-right overlap -->
                <circle cx="${halfSize}" cy="${halfSize}" r="${circleRadius}" fill="rgba(64, 64, 64, 0.6)" clip-path="url(#topRightQuarter)"/>
                
                <!-- Bottom-left overlap -->
                <circle cx="${halfSize}" cy="${halfSize}" r="${circleRadius}" fill="rgba(64, 64, 64, 0.6)" clip-path="url(#bottomLeftQuarter)"/>
                
                <!-- Bottom-right overlap -->
                <circle cx="${halfSize}" cy="${halfSize}" r="${circleRadius}" fill="rgba(64, 64, 64, 0.6)" clip-path="url(#bottomRightQuarter)"/>
                
                <!-- Side length label -->
                <line x1="${quarterSize}" y1="${quarterSize * 0.8}" x2="${quarterSize + halfSize}" y2="${quarterSize * 0.8}" stroke="#ff6b6b" stroke-width="${Math.max(2, svgSize / 150)}"/>
                <text x="${halfSize}" y="${quarterSize * 0.7}" text-anchor="middle" class="side-label" font-size="${Math.max(16, svgSize / 20)}">4</text>
            </svg>
            <div class="quarter-circles-caption">Square with inscribed circle and quarter circles in corners (side length = 4)</div>
        `;
        
        // Insert the visual before the question
        const questionContainer = document.querySelector('.question-container');
        const question = document.getElementById('question');
        questionContainer.insertBefore(visualContainer, question);
    }
    
    displaySemicircleVisual(radius) {
        // Remove any existing semicircle visual
        const existingVisual = document.getElementById('semicircleVisual');
        if (existingVisual) {
            existingVisual.remove();
        }
        
        // Create semicircle visual container
        const visualContainer = document.createElement('div');
        visualContainer.id = 'semicircleVisual';
        visualContainer.className = 'semicircle-visual-container';
        
        // Scale SVG size based on radius
        const svgSize = Math.max(200, radius * 20 + 80);
        const centerX = svgSize / 2;
        const centerY = svgSize / 2;
        const circleRadius = radius * 10;
        
        // Create SVG showing semicircle
        visualContainer.innerHTML = `
            <svg width="${svgSize}" height="${svgSize}" class="semicircle-svg">
                <defs>
                    <marker id="semicircleArrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                        <polygon points="0 0, 10 3, 0 6" fill="#ff6b6b"/>
                    </marker>
                </defs>
                <!-- Semicircle (top half of circle) -->
                <path d="M ${centerX - circleRadius} ${centerY} A ${circleRadius} ${circleRadius} 0 0 1 ${centerX + circleRadius} ${centerY} Z" 
                      fill="rgba(78, 205, 196, 0.2)" stroke="#4ecdc4" stroke-width="3"/>
                <!-- Radius line -->
                <line x1="${centerX}" y1="${centerY}" x2="${centerX + circleRadius}" y2="${centerY}" 
                      stroke="#ff6b6b" stroke-width="2" marker-end="url(#semicircleArrow)"/>
                <!-- Radius label -->
                <text x="${centerX + circleRadius/2}" y="${centerY - 10}" text-anchor="middle" class="radius-label">${radius}</text>
                <!-- Center point -->
                <circle cx="${centerX}" cy="${centerY}" r="3" fill="#333"/>
                <!-- Base line -->
                <line x1="${centerX - circleRadius}" y1="${centerY}" x2="${centerX + circleRadius}" y2="${centerY}" 
                      stroke="#333" stroke-width="2" stroke-dasharray="5,5"/>
            </svg>
            <div class="semicircle-caption">Semicircle with radius = ${radius}</div>
        `;
        
        // Insert the visual before the question
        const questionContainer = document.querySelector('.question-container');
        const question = document.getElementById('question');
        questionContainer.insertBefore(visualContainer, question);
    }
    
    generateRandomObstacles() {
        // Generate 20-25 obstacles that require at least 5 moves to solve
        const start = { x: 1, y: 9 };
        const finish = { x: 9, y: 1 };
        const numObstacles = 20 + Math.floor(Math.random() * 6); // 20-25 obstacles
        const minMovesRequired = 5;
        
        // Try multiple configurations to find one that requires at least 5 moves
        for (let attempt = 0; attempt < 50; attempt++) {
            const obstacles = [];
            const used = new Set();
            
            // Add start and finish to used set
            used.add(`${start.x},${start.y}`);
            used.add(`${finish.x},${finish.y}`);
            
            // Generate all possible positions and shuffle them for true randomness
            const allPositions = [];
            for (let x = 1; x <= 9; x++) {
                for (let y = 1; y <= 9; y++) {
                    const key = `${x},${y}`;
                    if (!used.has(key)) {
                        allPositions.push({ x, y });
                    }
                }
            }
            
            // Shuffle array using Fisher-Yates algorithm
            for (let i = allPositions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [allPositions[i], allPositions[j]] = [allPositions[j], allPositions[i]];
            }
            
            // Helper function to check minimum distance from existing obstacles
            const hasMinimumDistance = (x, y, obstacles, minDistance = 2) => {
                for (const obs of obstacles) {
                    const dx = Math.abs(obs.x - x);
                    const dy = Math.abs(obs.y - y);
                    const manhattanDistance = dx + dy;
                    // Require at least minDistance cells away (Manhattan distance)
                    if (manhattanDistance < minDistance) {
                        return false;
                    }
                }
                return true;
            };
            
            // Helper function to count nearby obstacles (for cluster detection)
            const countNearbyObstacles = (x, y, obstacles, radius = 2) => {
                let count = 0;
                for (const obs of obstacles) {
                    const dx = Math.abs(obs.x - x);
                    const dy = Math.abs(obs.y - y);
                    const manhattanDistance = dx + dy;
                    if (manhattanDistance <= radius) {
                        count++;
                    }
                }
                return count;
            };
            
            // Place obstacles with spacing to prevent clusters
            let placedWithSpacing = 0;
            const minSpacingRequired = Math.floor(numObstacles * 0.7); // 70% should have good spacing
            
            for (const pos of allPositions) {
                if (obstacles.length >= numObstacles) break;
                
                // For first 70% of obstacles, require minimum distance
                if (placedWithSpacing < minSpacingRequired) {
                    if (!hasMinimumDistance(pos.x, pos.y, obstacles, 2)) {
                        continue;
                    }
                    // Also check that we're not creating a cluster (max 1 nearby obstacle)
                    if (countNearbyObstacles(pos.x, pos.y, obstacles, 2) > 1) {
                        continue;
                    }
                    placedWithSpacing++;
                } else {
                    // For remaining obstacles, allow closer placement but still prevent large clusters
                    if (countNearbyObstacles(pos.x, pos.y, obstacles, 2) > 2) {
                        continue; // Don't place if there are already 2+ obstacles nearby
                    }
                }
                
                obstacles.push(pos);
                used.add(`${pos.x},${pos.y}`);
            }
            
            // If we don't have enough obstacles, fill remaining randomly
            while (obstacles.length < numObstacles) {
                const x = 1 + Math.floor(Math.random() * 9);
                const y = 1 + Math.floor(Math.random() * 9);
                const key = `${x},${y}`;
                
                if (!used.has(key)) {
                    obstacles.push({ x, y });
                    used.add(key);
                }
            }
            
            // Check if solvable and requires at least 5 moves
            const pathResult = this.hasPath(start, finish, obstacles);
            if (pathResult.hasPath && pathResult.minMoves >= minMovesRequired) {
                return obstacles;
            }
        }
        
        // Fallback: guaranteed solvable configuration that requires at least 5 moves
        // This configuration forces a longer path by blocking direct routes
        return [
            { x: 2, y: 8 }, { x: 3, y: 8 }, { x: 4, y: 8 }, { x: 5, y: 8 }, { x: 6, y: 8 }, { x: 7, y: 8 }, { x: 8, y: 8 },
            { x: 2, y: 7 }, { x: 4, y: 7 }, { x: 6, y: 7 }, { x: 8, y: 7 },
            { x: 3, y: 6 }, { x: 5, y: 6 }, { x: 7, y: 6 },
            { x: 2, y: 5 }, { x: 4, y: 5 }, { x: 6, y: 5 }, { x: 8, y: 5 },
            { x: 3, y: 4 }, { x: 5, y: 4 }, { x: 7, y: 4 },
            { x: 2, y: 3 }, { x: 4, y: 3 }, { x: 6, y: 3 }, { x: 8, y: 3 },
            { x: 2, y: 2 }, { x: 3, y: 2 }, { x: 4, y: 2 }, { x: 5, y: 2 }, { x: 6, y: 2 }, { x: 7, y: 2 }, { x: 8, y: 2 }
        ];
    }
    
    hasPath(start, finish, obstacles) {
        // BFS to check if there's a path from start to finish
        const obstacleSet = new Set(obstacles.map(obs => `${obs.x},${obs.y}`));
        const visited = new Set();
        const queue = [{ x: start.x, y: start.y, moves: 0 }];
        visited.add(`${start.x},${start.y}`);
        
        const directions = [
            { dx: 0, dy: -1 }, // up
            { dx: 1, dy: 0 },  // right
            { dx: 0, dy: 1 },  // down
            { dx: -1, dy: 0 }  // left
        ];
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.x === finish.x && current.y === finish.y) {
                return { hasPath: true, minMoves: current.moves };
            }
            
            for (const dir of directions) {
                let newX = current.x;
                let newY = current.y;
                
                // Move until hitting obstacle or edge
                while (true) {
                    const nextX = newX + dir.dx;
                    const nextY = newY + dir.dy;
                    
                    if (nextX < 1 || nextX > 9 || nextY < 1 || nextY > 9) {
                        break; // Hit edge
                    }
                    
                    const nextKey = `${nextX},${nextY}`;
                    if (obstacleSet.has(nextKey)) {
                        break; // Hit obstacle
                    }
                    
                    newX = nextX;
                    newY = nextY;
                }
                
                const key = `${newX},${newY}`;
                if (!visited.has(key)) {
                    visited.add(key);
                    queue.push({ x: newX, y: newY, moves: current.moves + 1 });
                }
            }
        }
        
        return { hasPath: false, minMoves: Infinity };
    }
    
    displayPiChessboard() {
        // Remove any existing chessboard
        const existingChessboard = document.getElementById('piChessboard');
        if (existingChessboard) {
            existingChessboard.remove();
        }
        
        // Initialize position tracking
        // Note: x and y are 1-based (1-9), where row 9 = 1 (bottom), row 1 = 9 (top)
        if (!this.chessboardPosition) {
            this.chessboardPosition = { x: 1, y: 9 }; // Start at (1, 1) - column 1, row 9 (bottom-left)
        } else {
            // Reset to starting position
            this.chessboardPosition = { x: 1, y: 9 };
        }
        
        // Generate random obstacles that make it hard but solvable
        this.obstacles = this.generateRandomObstacles();
        
        // Define finish position: (9, 9) = col 9, row 1
        this.finishPosition = { x: 9, y: 1 };
        
        // Create chessboard container
        const chessboardContainer = document.createElement('div');
        chessboardContainer.id = 'piChessboard';
        chessboardContainer.className = 'pi-chessboard-container';
        
        // Create the chessboard HTML
        chessboardContainer.innerHTML = `
            <div class="chessboard-wrapper">
                <div class="chessboard-grid-wrapper">
                    <div class="chessboard-grid" id="chessboardGrid">
                        <!-- Board will be generated here -->
                    </div>
                    <div class="pi-pie" id="piPie">
                        <div class="pie-top">
                        </div>
                        <div class="pie-crust"></div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert the chessboard before the question
        const questionContainer = document.querySelector('.question-container');
        const question = document.getElementById('question');
        questionContainer.insertBefore(chessboardContainer, question);
        
        // Generate the chessboard grid
        this.generateChessboard();
        
        // Position the pie initially at (1, 1) - column 1, row 9
        setTimeout(() => {
            this.updatePiePosition(1, 9);
        }, 100);
        
        // Set up event listeners
        this.setupChessboardControls();
    }
    
    updatePiePosition(col, row) {
        const piPie = document.getElementById('piPie');
        if (!piPie) return;
        
        // Each cell is 50px (450px / 9 cells)
        const cellSize = 50;
        const x = (col - 1) * cellSize + cellSize / 2 - 30; // Center the pie in cell (pie is 60px wide)
        const y = (row - 1) * cellSize + cellSize / 2 - 30;
        
        piPie.style.left = x + 'px';
        piPie.style.top = y + 'px';
        piPie.style.display = 'block';
    }
    
    generateChessboard() {
        const grid = document.getElementById('chessboardGrid');
        if (!grid) return;
        
        grid.innerHTML = '';
        
        // Generate 9x9 grid (1π through 9π)
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                const cell = document.createElement('div');
                cell.className = 'chessboard-cell';
                
                // Convert to 1-based coordinates for checking
                const cellX = col + 1;
                const cellY = row + 1;
                
                // Alternate colors
                if ((row + col) % 2 === 0) {
                    cell.classList.add('light-square');
                } else {
                    cell.classList.add('dark-square');
                }
                
                // Check if this cell is an obstacle
                const isObstacle = this.obstacles.some(obs => obs.x === cellX && obs.y === cellY);
                if (isObstacle) {
                    cell.classList.add('obstacle-cell');
                    const obstacleIcon = document.createElement('div');
                    obstacleIcon.className = 'obstacle-icon';
                    obstacleIcon.textContent = '⬛';
                    cell.appendChild(obstacleIcon);
                }
                
                // Check if this cell is the finish
                if (this.finishPosition.x === cellX && this.finishPosition.y === cellY) {
                    cell.classList.add('finish-cell');
                    const starIcon = document.createElement('div');
                    starIcon.className = 'finish-star';
                    starIcon.textContent = '⭐';
                    cell.appendChild(starIcon);
                }
                
                // Add row labels (vertical - left side)
                if (col === 0) {
                    const label = document.createElement('div');
                    label.className = 'row-label';
                    label.textContent = `${9 - row}`;
                    cell.appendChild(label);
                }
                
                // Add column labels (horizontal - bottom)
                if (row === 8) {
                    const label = document.createElement('div');
                    label.className = 'col-label';
                    label.textContent = `${col + 1}`;
                    cell.appendChild(label);
                }
                
                grid.appendChild(cell);
            }
        }
    }
    
    setupChessboardControls() {
        // Track pressed keys to prevent diagonal movement
        this.pressedKeys = new Set();
        this.isMoving = false;
        
        // Arrow key and WASD controls - move until hitting obstacle or edge
        const arrowKeyHandler = (e) => {
            if (this.currentLevel !== 3) return;
            
            // Track which keys are pressed
            if (e.type === 'keydown') {
                switch(e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        e.preventDefault();
                        this.pressedKeys.add(e.key);
                        break;
                }
                
                // Only move if exactly one direction key is pressed and not already moving
                if (!this.isMoving && this.pressedKeys.size === 1) {
                    let direction = null;
                    const key = Array.from(this.pressedKeys)[0];
                    
                    switch(key) {
                        case 'ArrowUp':
                        case 'w':
                        case 'W':
                            direction = 'up';
                            break;
                        case 'ArrowRight':
                        case 'd':
                        case 'D':
                            direction = 'right';
                            break;
                        case 'ArrowDown':
                        case 's':
                        case 'S':
                            direction = 'down';
                            break;
                        case 'ArrowLeft':
                        case 'a':
                        case 'A':
                            direction = 'left';
                            break;
                    }
                    
                    if (direction) {
                        this.moveUntilObstacle(direction);
                    }
                }
            } else if (e.type === 'keyup') {
                // Remove key from pressed keys when released
                switch(e.key) {
                    case 'ArrowUp':
                    case 'w':
                    case 'W':
                    case 'ArrowRight':
                    case 'd':
                    case 'D':
                    case 'ArrowDown':
                    case 's':
                    case 'S':
                    case 'ArrowLeft':
                    case 'a':
                    case 'A':
                        this.pressedKeys.delete(e.key);
                        break;
                }
            }
        };
        
        // Remove any existing handlers and add new ones
        document.removeEventListener('keydown', this.chessboardKeyHandler);
        document.removeEventListener('keyup', this.chessboardKeyUpHandler);
        this.chessboardKeyHandler = arrowKeyHandler;
        this.chessboardKeyUpHandler = arrowKeyHandler;
        document.addEventListener('keydown', arrowKeyHandler);
        document.addEventListener('keyup', arrowKeyHandler);
    }
    
    moveUntilObstacle(direction) {
        // Prevent multiple simultaneous movements
        if (this.isMoving) return;
        this.isMoving = true;
        
        let newX = this.chessboardPosition.x;
        let newY = this.chessboardPosition.y;
        
        // Move one cell at a time until hitting obstacle or edge
        while (true) {
            let nextX = newX;
            let nextY = newY;
            
            // Calculate next position
            switch(direction) {
                case 'up':
                    nextY = newY - 1;
                    break;
                case 'right':
                    nextX = newX + 1;
                    break;
                case 'down':
                    nextY = newY + 1;
                    break;
                case 'left':
                    nextX = newX - 1;
                    break;
            }
            
            // Check if next position is out of bounds
            if (nextX < 1 || nextX > 9 || nextY < 1 || nextY > 9) {
                break; // Hit the edge
            }
            
            // Check if next position has an obstacle
            if (this.isObstacle(nextX, nextY)) {
                break; // Hit an obstacle
            }
            
            // Move to next position
            newX = nextX;
            newY = nextY;
        }
        
        // Update position
        this.chessboardPosition.x = newX;
        this.chessboardPosition.y = newY;
        this.updatePiePosition(newX, newY);
        
        // Check if reached finish
        if (newX === this.finishPosition.x && newY === this.finishPosition.y) {
            this.reachFinish();
        }
        
        // Reset movement flag after a short delay to allow next movement
        setTimeout(() => {
            this.isMoving = false;
        }, 50);
    }
    
    isObstacle(x, y) {
        return this.obstacles.some(obs => obs.x === x && obs.y === y);
    }
    
    reachFinish() {
        // Level 3 completion when reaching the finish
        this.completeLevel(3);
        setTimeout(() => {
            this.showCustomModal(
                "🎉 Level Complete!",
                "You reached the finish! Level 3 completed!",
                () => this.backToMenu()
            );
        }, 500);
    }
    
    
    
    selectDigit(blank, digit) {
        const index = parseInt(blank.dataset.index);
        this.userAnswers[index] = digit;
        
        // Update the blank with the selected digit
        blank.textContent = digit;
        blank.classList.add('filled');
        blank.classList.remove('clickable-blank'); // Remove clickable class but keep hover functionality
        
        this.updateProgressDisplay();
    }
    
    setupSubmitButton() {
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.onclick = () => this.submitAnswers();
    }
    
    updateProgressDisplay() {
        const progressDisplay = document.getElementById('progressDisplay');
        const filledCount = this.userAnswers.filter(answer => answer !== null).length;
        const totalCount = this.userAnswers.length;
        
        if (filledCount === 0) {
            progressDisplay.textContent = `Fill in the blanks (click or type 0-9) to submit!`;
            progressDisplay.className = 'progress-display';
        } else if (filledCount < totalCount) {
            progressDisplay.textContent = `${filledCount} out of ${totalCount} filled`;
            progressDisplay.className = 'progress-display';
        } else {
            progressDisplay.textContent = `All blanks filled! Ready to submit.`;
            progressDisplay.className = 'progress-display correct';
        }
    }
    
    submitAnswers() {
        const filledCount = this.userAnswers.filter(answer => answer !== null).length;
        const totalCount = this.userAnswers.length;
        
        if (filledCount < totalCount) {
            this.showCustomModal(
                "Incomplete",
                `Please fill in all ${totalCount} blanks before submitting!`
            );
            return;
        }
        
        // Check answers
        let correctCount = 0;
        const blanks = document.querySelectorAll('.blank-hint');
        
        blanks.forEach((blank, index) => {
            const userAnswer = this.userAnswers[index];
            const correctAnswer = blank.dataset.correct;
            const isCorrect = userAnswer === correctAnswer;
            
            if (isCorrect) {
                correctCount++;
                blank.classList.add('correct');
            } else {
                blank.classList.add('incorrect');
            }
        });
        
        // Show results
        const progressDisplay = document.getElementById('progressDisplay');
        progressDisplay.textContent = `${correctCount} out of ${totalCount} correct`;
        progressDisplay.className = `progress-display ${correctCount === totalCount ? 'correct' : 'incorrect'}`;
        
        // Disable submit button
        const submitBtn = document.getElementById('submitBtn');
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitted';
        
        // Check if level completed
        if (correctCount === totalCount) {
            setTimeout(() => {
                this.completeLevel(this.currentLevel);
                if (this.currentLevel === 1) {
                    // Hide the pi bubble after completing level 1
                    this.piBubble.style.display = 'none';
                    this.showCustomModal(
                        "🎉 Congratulations!",
                        "You have passed level 1. You may now continue to the next level.",
                        () => this.backToMenu()
                    );
        } else {
                    this.showCustomModal(
                        "🎉 Level Complete!",
                        `Level ${this.currentLevel} completed! You can now access the next level.`,
                        () => this.backToMenu()
                    );
                }
            }, 500);
        } else {
            // Instead of kicking out, reset the level for retry
            setTimeout(() => {
                this.showCustomModal(
                    "Try Again",
                    `You got ${correctCount} out of ${totalCount} correct. Let's try again!`,
                    () => this.resetCurrentLevel()
                );
            }, 1500);
        }
    }

    generateOptions(correctAnswer, min, max) {
        const options = [correctAnswer];
        
        // Check if the correct answer is in pi format
        const isPiFormat = typeof correctAnswer === 'string' && correctAnswer.includes('π');
        
        if (isPiFormat) {
            // Extract the number from the pi format (e.g., "4π" -> 4)
            const correctNumber = parseInt(correctAnswer.replace('π', ''));
            
            // Generate 3 wrong answers in pi format
            while (options.length < 4) {
                let wrongNumber;
                do {
                    wrongNumber = Math.floor(Math.random() * (max - min + 1)) + min;
                } while (wrongNumber === correctNumber);
                options.push(wrongNumber + 'π');
            }
        } else {
            // Generate 3 wrong answers as numbers
        while (options.length < 4) {
            let wrongAnswer;
            do {
                wrongAnswer = Math.floor(Math.random() * (max - min + 1)) + min;
            } while (options.includes(wrongAnswer));
            options.push(wrongAnswer);
            }
        }
        
        // Shuffle the options
        return this.shuffleArray(options);
    }
    
    shuffleArray(array) {
        const shuffled = [...array]
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    
    displayOptions(options) {
        this.answerOptions.innerHTML = '';
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'answer-btn';
            button.textContent = option;
            button.dataset.answer = option;
            this.answerOptions.appendChild(button);
        });
    }
    
    checkAnswer(selectedButton) {
        const selectedAnswer = parseInt(selectedButton.dataset.answer);
        const isCorrect = selectedAnswer === this.correctAnswer;
        
        // Disable all buttons temporarily
        const allButtons = this.answerOptions.querySelectorAll('.answer-btn');
        allButtons.forEach(btn => btn.disabled = true);
        
        if (isCorrect) {
            selectedButton.classList.add('correct');
            
            if (this.currentLevel === 2) {
                // For Level 2, complete after 3 problems
                if (this.currentProblem >= 3) {
                this.completeLevel(this.currentLevel);
                setTimeout(() => {
                        this.showCustomModal(
                            "🎉 Level Complete!",
                            `Level ${this.currentLevel} completed! You can now access the next level.`,
                            () => this.backToMenu()
                        );
                    }, 1000);
                    return;
                } else {
                    // Move to next problem
                    setTimeout(() => {
                        this.generateQuestion();
                }, 1000);
                return;
                }
            } else if (this.currentLevel === 3) {
                // For Level 3, complete after 5 correct answers
                this.correctAnswerCount = (this.correctAnswerCount || 0) + 1;
                
                if (this.correctAnswerCount >= 5) {
                this.completeLevel(this.currentLevel);
                setTimeout(() => {
                        this.showCustomModal(
                            "🎉 Level Complete!",
                            `Level ${this.currentLevel} completed! You can now access the next level.`,
                            () => this.backToMenu()
                        );
                }, 1000);
                return;
                }
            }
            
            // Show correct feedback
            setTimeout(() => {
                this.generateQuestion();
            }, 1000);
        } else {
            selectedButton.classList.add('incorrect');
            
            // Highlight correct answer
            allButtons.forEach(btn => {
                if (parseInt(btn.dataset.answer) === this.correctAnswer) {
                    btn.classList.add('correct');
                }
            });
            
            // Reset level for retry instead of game over
                setTimeout(() => {
                this.showCustomModal(
                    "Try Again",
                    "That's not quite right. Let's try this level again!",
                    () => this.resetCurrentLevel()
                );
                }, 1500);
        }
        
        // Re-enable buttons after delay
        setTimeout(() => {
            allButtons.forEach(btn => {
                btn.disabled = false;
                btn.classList.remove('correct', 'incorrect');
            });
        }, 1500);
    }
    
    gameOver() {
        this.showCustomModal(
            "Game Over",
            "Better luck next time!",
            () => this.backToMenu()
        );
    }
    
    resetProgress() {
        this.completedLevels = [];
        localStorage.removeItem('completedLevels');
        this.updateLevelButtons();
    }
    
    resetCurrentLevel() {
        // Reset the current level to start over
        if (this.currentLevel === 1) {
            // Reset all user answers
            this.userAnswers = new Array(this.missingDigits.length).fill(null);
            
            // Clear all blanks and reset their appearance
            const blanks = document.querySelectorAll('.blank-hint');
            blanks.forEach(blank => {
                blank.textContent = '_';
                blank.classList.remove('filled', 'correct', 'incorrect');
                blank.classList.add('clickable-blank');
                blank.setAttribute('tabindex', '0'); // Ensure blanks are focusable
            });
            
            // Reset submit button
            const submitBtn = document.getElementById('submitBtn');
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Submit Answers';
            }
            
            // Reset progress display
            this.updateProgressDisplay();
            
            // Regenerate the question to reset everything
            this.generateQuestion();
        } else if (this.currentLevel === 2 || this.currentLevel === 3) {
            // For Level 2 and Level 3, restart the same problem
            this.currentProblem--; // Decrement to stay on the same problem
            this.resetKeyboardInput();
            this.generateQuestion();
        } else {
            // For other levels, just regenerate the question
            this.correctAnswerCount = 0;
            this.generateQuestion();
        }
    }
    
    showCustomModal(title, message, callback = null) {
        const modal = document.getElementById('customModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalMessage = document.getElementById('modalMessage');
        const modalOkBtn = document.getElementById('modalOkBtn');
        
        modalTitle.textContent = title;
        modalMessage.textContent = message;
        modal.style.display = 'flex';
        
        // Remove any existing event listeners
        const newBtn = modalOkBtn.cloneNode(true);
        modalOkBtn.parentNode.replaceChild(newBtn, modalOkBtn);
        
        // Add new event listener
        newBtn.addEventListener('click', () => {
            modal.style.display = 'none';
            if (callback) {
                callback();
            }
        });
        
        // Close on escape key
        const handleEscape = (e) => {
            if (e.key === 'Escape') {
                modal.style.display = 'none';
                if (callback) {
                    callback();
                }
                document.removeEventListener('keydown', handleEscape);
            }
        };
        document.addEventListener('keydown', handleEscape);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Check if we're on a page with game elements before initializing
        const titleScreen = document.getElementById('titleScreen');
        const gameScreen = document.getElementById('gameScreen');
        
        // Only initialize game if we're on the main game page
        if (!titleScreen || !gameScreen) {
            // We're on an About page or other non-game page, skip game initialization
            return;
        }
        
        // Hide browser UI elements
        if (window.location.protocol === 'file:') {
            // Hide address bar if possible (works in some browsers)
            window.scrollTo(0, 1);
        }
        
        // Prevent context menu and text selection
        document.addEventListener('contextmenu', e => e.preventDefault());
        document.addEventListener('selectstart', e => e.preventDefault());
        
        // Disable drag and drop
        document.addEventListener('dragstart', e => e.preventDefault());
        
        // Add fullscreen functionality
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F11' || (e.key === 'f' && e.ctrlKey && e.shiftKey)) {
                e.preventDefault();
                toggleFullscreen();
            }
            if (e.key === 'Escape' && document.fullscreenElement) {
                document.exitFullscreen();
            }
        });
        
        window.game = new MathGame();
    } catch (error) {
        console.error('Error loading game:', error);
        // Only show error on game pages
        const titleScreen = document.getElementById('titleScreen');
        const gameScreen = document.getElementById('gameScreen');
        if (titleScreen && gameScreen) {
            document.body.innerHTML = '<div style="padding: 20px; font-family: Arial;"><h1>Error Loading Game</h1><p>There was an error loading the game. Please check the browser console (F12) for details.</p><p>Error: ' + error.message + '</p></div>';
        }
    }
    
    // Add console command for testing
    window.resetGame = () => {
        window.game.resetProgress();
        console.log('Game progress reset!');
    };
    
    // Add fullscreen toggle function
    window.toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported or blocked');
            });
        } else {
            document.exitFullscreen();
        }
    };
});

// Add some fun particle effects for the title screen
document.addEventListener('DOMContentLoaded', () => {
    const titleAnimation = document.querySelector('.title-animation');
    
    // Only add animation if title animation element exists (only on game page)
    if (!titleAnimation) {
        return;
    }
    
    // Create additional floating elements in corners
    const symbols = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '+', '-', '×', '÷', 'π'];
    for (let i = 0; i < 5; i++) {
        const element = document.createElement('div');
        element.className = 'floating-number';
        element.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        
        // Position in corners and edges, avoiding center area
        const positions = [
            { top: '5%', left: '3%' },
            { top: '5%', right: '3%' },
            { bottom: '5%', left: '3%' },
            { bottom: '5%', right: '3%' },
            { top: '80%', left: '2%' }
        ];
        
        const pos = positions[i % positions.length];
        element.style.top = pos.top;
        element.style.left = pos.left;
        element.style.right = pos.right;
        // Don't override CSS animations - let them use the space bounce animations from CSS
        if (element.textContent === 'π') {
            element.style.color = '#4ecdc4';
            element.style.fontSize = '2.5rem';
        }
        titleAnimation.appendChild(element);
    }
});
