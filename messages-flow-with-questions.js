/**
 * Webflow Messages Flow Component with Questions
 * Handles the chatbot-style message flow + questions using existing Webflow content
 */

class WebflowMessagesFlowWithQuestions {
    constructor() {
        this.tabsContainer = document.querySelector('[summary-engine="tabs"]');
        if (!this.tabsContainer) {
            console.warn('WebflowMessagesFlowWithQuestions: No tabs container found');
            return;
        }
        
        this.config = {
            typingDuration: 1500,
            messageAnimationDuration: 400,
        };
        
        this.animatingTabs = new Set();
        this.completedTabs = new Set();
        this.lastCallTime = 0;
        this.windowIsOpen = false;
        this.usedQuestions = new Set(); // Track used questions per session
        
        this.init();
    }
    
    init() {
        console.log('WebflowMessagesFlowWithQuestions initialized');
        this.initializeAllTabs();
    }
    
    // Hide all messages initially
    initializeAllTabs() {
        const allTabPanes = this.tabsContainer.querySelectorAll('[summary-engine^="tab-"]');
        allTabPanes.forEach(tabPane => {
            const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
            const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
            
            messages.forEach(message => {
                const dots = message.querySelector('.summary-engine_message-dots');
                const text = message.querySelector('.summary-engine_company-message-text');
                
                if (dots) dots.style.display = 'flex';
                if (text) text.style.display = 'none';
                message.style.display = 'none';
            });
            
            // Hide all questions and answers initially
            this.hideAllQuestionsAndAnswers(tabPane, tabNumber);
        });
        console.log('WebflowMessagesFlowWithQuestions: All messages hidden initially');
    }
    
    // Hide all questions and answers for a tab
    hideAllQuestionsAndAnswers(tabPane, tabNumber) {
        console.log('WebflowMessagesFlowWithQuestions: Hiding all questions and answers for tab:', tabNumber);
        
        // Hide questions container
        const questionsContainer = tabPane.querySelector(`[summary-engine="tab-${tabNumber}-tags"]`);
        if (questionsContainer) {
            questionsContainer.style.display = 'none';
            console.log('WebflowMessagesFlowWithQuestions: Hidden questions container');
        }
        
        // Hide all client questions
        const clientQuestions = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-tag-"][summary-engine$="-questions"]`);
        console.log('WebflowMessagesFlowWithQuestions: Found client questions:', clientQuestions.length);
        clientQuestions.forEach(element => {
            element.style.display = 'none';
        });
        
        // Hide all answers
        const answers = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-tag-"][summary-engine$="-answer"]`);
        console.log('WebflowMessagesFlowWithQuestions: Found answers:', answers.length);
        answers.forEach(element => {
            element.style.display = 'none';
        });
    }
    
    // Main method to start messages flow for a tab
    startMessagesFlow(tabNumber) {
        const now = Date.now();
        console.log('WebflowMessagesFlowWithQuestions: startMessagesFlow called for tab:', tabNumber);
        
        if (!this.windowIsOpen) {
            console.log('WebflowMessagesFlowWithQuestions: Window not open, skipping');
            return;
        }
        
        if (now - this.lastCallTime < 150) {
            console.log('WebflowMessagesFlowWithQuestions: Debouncing rapid calls');
            return;
        }
        this.lastCallTime = now;
        
        // If already completed, show all messages
        if (this.completedTabs.has(tabNumber)) {
            console.log('WebflowMessagesFlowWithQuestions: Tab already completed, showing all messages');
            const tabPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
            if (tabPane) this.showAllMessages(tabPane);
            return;
        }
        
        // If already animating, don't interrupt
        if (this.animatingTabs.has(tabNumber)) {
            console.log('WebflowMessagesFlowWithQuestions: Already animating this tab, not interrupting');
            return;
        }
        
        const tabPane = this.tabsContainer.querySelector(`[summary-engine="tab-${tabNumber}"]`);
        if (!tabPane) {
            console.warn(`WebflowMessagesFlowWithQuestions: Tab ${tabNumber} not found`);
            return;
        }
        
        const tabType = tabPane.getAttribute('summary-tab');
        console.log('WebflowMessagesFlowWithQuestions: Tab type:', tabType);
        
        if (tabType === 'static') {
            this.showStaticContent(tabPane);
        } else if (tabType === 'dynamic') {
            console.log('WebflowMessagesFlowWithQuestions: Dynamic tab, starting animation flow');
            this.animatingTabs.add(tabNumber);
            this.hideAllMessages(tabPane);
            this.startFlow(tabPane, tabNumber);
        }
    }
    
    // Show static content immediately
    showStaticContent(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        
        messages.forEach(message => {
            const dots = message.querySelector('.summary-engine_message-dots');
            const text = message.querySelector('.summary-engine_company-message-text');
            
            if (dots) dots.style.display = 'none';
            if (text) text.style.display = 'block';
            message.style.display = 'block';
        });
    }
    
    // Show all messages immediately (for completed tabs)
    showAllMessages(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        
        console.log('WebflowMessagesFlowWithQuestions: showAllMessages called for tab:', tabNumber);
        console.log('WebflowMessagesFlowWithQuestions: Showing', messages.length, 'messages');
        
        messages.forEach((message, index) => {
            console.log('WebflowMessagesFlowWithQuestions: Showing message', index + 1);
            const dots = message.querySelector('.summary-engine_message-dots');
            const text = message.querySelector('.summary-engine_company-message-text');
            
            if (dots) dots.style.display = 'none';
            if (text) text.style.display = 'block';
            message.style.display = 'block';
        });
        
        // Also show questions if they exist
        this.showQuestions(tabPane, tabNumber);
    }
    
    // Hide all messages in a tab
    hideAllMessages(tabPane) {
        const tabNumber = tabPane.getAttribute('summary-engine').replace('tab-', '');
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        
        console.log('WebflowMessagesFlowWithQuestions: Hiding messages:', messages.length);
        messages.forEach((message, index) => {
            console.log('WebflowMessagesFlowWithQuestions: Hiding message', index + 1);
            const dots = message.querySelector('.summary-engine_message-dots');
            const text = message.querySelector('.summary-engine_company-message-text');
            
            if (dots) {
                dots.style.display = 'flex';
                dots.style.opacity = '1';
            }
            if (text) {
                text.style.display = 'none';
                text.style.opacity = '0';
            }
            message.style.display = 'none';
        });
    }
    
    // Start the message flow
    startFlow(tabPane, tabNumber) {
        const messages = tabPane.querySelectorAll(`[summary-engine^="tab-${tabNumber}-message-"]`);
        console.log('WebflowMessagesFlowWithQuestions: Starting flow with messages:', messages.length);
        
        if (messages.length === 0) {
            console.log('WebflowMessagesFlowWithQuestions: No messages found, ending flow');
            this.animatingTabs.delete(tabNumber);
            return;
        }
        
        this.showMessageWithFlow(tabPane, messages, 0, tabNumber);
    }
    
    // Show message with dots animation flow
    showMessageWithFlow(tabPane, messages, messageIndex, tabNumber) {
        if (messageIndex >= messages.length) {
            // All messages shown, now show questions
            this.showQuestions(tabPane, tabNumber);
            return;
        }
        
        const currentMessage = messages[messageIndex];
        
        // Show dots animation first
        this.showDotsAnimation(currentMessage, () => {
            // Then show the message
            this.showMessage(currentMessage, () => {
                // Move to next message
                this.showMessageWithFlow(tabPane, messages, messageIndex + 1, tabNumber);
            });
        });
    }
    
    // Show dots animation
    showDotsAnimation(currentMessage, callback) {
        const dotsElement = currentMessage.querySelector('.summary-engine_message-dots');
        const textElement = currentMessage.querySelector('.summary-engine_company-message-text');
        
        if (dotsElement && textElement) {
            // Show message container
            currentMessage.style.display = 'block';
            
            // Show dots, hide text
            dotsElement.style.display = 'flex';
            dotsElement.style.opacity = '1';
            textElement.style.display = 'none';
            textElement.style.opacity = '0';
            
            // Start dots animation
            const dots = dotsElement.querySelectorAll('.summary-engine_message-dot');
            dots.forEach((dot, index) => {
                dot.style.animation = `typing 1.5s infinite ${index * 0.2}s`;
            });
            
            // Hide dots after animation duration
            setTimeout(() => {
                dots.forEach(dot => {
                    dot.style.animation = 'none';
                });
                if (callback) callback();
            }, this.config.typingDuration);
        }
    }
    
    // Show a message with animation
    showMessage(messageElement, callback) {
        const dotsElement = messageElement.querySelector('.summary-engine_message-dots');
        const textElement = messageElement.querySelector('.summary-engine_company-message-text');
        
        if (dotsElement && textElement) {
            // Hide dots, show text
            dotsElement.style.display = 'none';
            textElement.style.display = 'block';
            textElement.style.opacity = '0';
            textElement.style.transform = 'translateY(10px)';
            textElement.style.transition = 'all 0.4s ease-out';
            
            // Animate text in
            requestAnimationFrame(() => {
                textElement.style.opacity = '1';
                textElement.style.transform = 'translateY(0)';
            });
        }
        
        if (callback) {
            setTimeout(callback, this.config.messageAnimationDuration);
        }
    }
    
    // Show questions after messages are complete
    showQuestions(tabPane, tabNumber) {
        const questionsContainer = tabPane.querySelector(`[summary-engine="tab-${tabNumber}-tags"]`);
        console.log('WebflowMessagesFlowWithQuestions: Looking for questions container:', `[summary-engine="tab-${tabNumber}-tags"]`);
        console.log('WebflowMessagesFlowWithQuestions: Found questions container:', questionsContainer);
        
        if (!questionsContainer) {
            console.log('WebflowMessagesFlowWithQuestions: No questions container found for tab:', tabNumber);
            this.completedTabs.add(tabNumber);
            this.animatingTabs.delete(tabNumber);
            return;
        }
        
        const questions = questionsContainer.querySelectorAll(`[summary-engine^="tab-${tabNumber}-tag-"]`);
        console.log('WebflowMessagesFlowWithQuestions: Looking for questions with selector:', `[summary-engine^="tab-${tabNumber}-tag-"]`);
        console.log('WebflowMessagesFlowWithQuestions: Found questions:', questions.length);
        
        if (questions.length === 0) {
            console.log('WebflowMessagesFlowWithQuestions: No questions found for tab:', tabNumber);
            this.completedTabs.add(tabNumber);
            this.animatingTabs.delete(tabNumber);
            return;
        }
        
        console.log('WebflowMessagesFlowWithQuestions: Showing questions for tab:', tabNumber);
        
        // Show questions container
        questionsContainer.style.display = 'flex';
        questionsContainer.style.opacity = '0';
        questionsContainer.style.transform = 'translateY(10px)';
        questionsContainer.style.transition = 'all 0.4s ease-out';
        
        // Animate questions in
        requestAnimationFrame(() => {
            questionsContainer.style.opacity = '1';
            questionsContainer.style.transform = 'translateY(0)';
        });
        
        // Add click handlers to questions
        questions.forEach(question => {
            question.addEventListener('click', () => {
                this.handleQuestionClick(tabPane, question, tabNumber);
            });
        });
        
        // Mark tab as completed (questions are now interactive)
        this.completedTabs.add(tabNumber);
        this.animatingTabs.delete(tabNumber);
    }
    
    // Handle question click
    handleQuestionClick(tabPane, clickedQuestion, tabNumber) {
        const questionAttribute = clickedQuestion.getAttribute('summary-engine');
        const questionText = clickedQuestion.textContent.trim();
        
        if (this.usedQuestions.has(questionAttribute)) {
            console.log('WebflowMessagesFlowWithQuestions: Question already used:', questionAttribute);
            return;
        }
        
        console.log('WebflowMessagesFlowWithQuestions: Question clicked:', questionAttribute);
        this.usedQuestions.add(questionAttribute);
        
        // Hide all questions
        this.hideQuestions(tabPane, tabNumber, () => {
            // Show client question
            this.showClientQuestion(tabPane, questionAttribute, () => {
                // Show dots animation
                this.showTypingDots(tabPane, () => {
                    // Show answer
                    this.showAnswer(tabPane, questionAttribute, () => {
                        // Show remaining questions
                        this.showRemainingQuestions(tabPane, tabNumber);
                    });
                }, tabNumber);
            });
        });
    }
    
    // Hide questions with animation
    hideQuestions(tabPane, tabNumber, callback) {
        const questionsContainer = tabPane.querySelector(`[summary-engine="tab-${tabNumber}-tags"]`);
        if (!questionsContainer) {
            if (callback) callback();
            return;
        }
        
        questionsContainer.style.transition = 'all 0.3s ease-out';
        questionsContainer.style.opacity = '0';
        questionsContainer.style.transform = 'translateY(-10px)';
        
        setTimeout(() => {
            questionsContainer.style.display = 'none';
            if (callback) callback();
        }, 300);
    }
    
    // Show client question
    showClientQuestion(tabPane, questionAttribute, callback) {
        const clientQuestion = tabPane.querySelector(`[summary-engine="${questionAttribute}-questions"]`);
        if (!clientQuestion) {
            console.log('WebflowMessagesFlowWithQuestions: No client question found for:', questionAttribute);
            if (callback) callback();
            return;
        }
        
        console.log('WebflowMessagesFlowWithQuestions: Showing client question:', questionAttribute);
        
        // Show client question
        clientQuestion.style.display = 'block';
        clientQuestion.style.opacity = '0';
        clientQuestion.style.transform = 'translateY(10px)';
        clientQuestion.style.transition = 'all 0.4s ease-out';
        
        requestAnimationFrame(() => {
            clientQuestion.style.opacity = '1';
            clientQuestion.style.transform = 'translateY(0)';
        });
        
        if (callback) {
            setTimeout(callback, 400);
        }
    }
    
    // Show typing dots
    showTypingDots(tabPane, callback, tabNumber) {
        // Create typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'summary-engine_company-message';
        typingIndicator.innerHTML = `
            <div class="summary-engine_avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="100%" viewBox="0 0 12 12" fill="none" class="summary-engine_avatar-icon">
                    <rect y="10.9352" width="15.465" height="1.5" transform="rotate(-45 0 10.9352)" fill="currentColor"></rect>
                    <rect y="0.000244141" width="10.935" height="1.5" fill="currentColor"></rect>
                    <path d="M10.5 12.0001V2.55762L12 4.05774V12.0001H10.5Z" fill="currentColor"></path>
                </svg>
            </div>
            <div class="summary-engine_company-message-wrapper">
                <div class="summary-engine_message-dots">
                    <div class="summary-engine_message-dot is-1"></div>
                    <div class="summary-engine_message-dot is-2"></div>
                    <div class="summary-engine_message-dot is-3"></div>
                </div>
            </div>
        `;
        
        // Insert before questions container
        const questionsContainer = tabPane.querySelector(`[summary-engine="tab-${tabNumber}-tags"]`);
        if (questionsContainer) {
            tabPane.insertBefore(typingIndicator, questionsContainer);
        } else {
            tabPane.appendChild(typingIndicator);
        }
        
        // Start dots animation
        const dots = typingIndicator.querySelectorAll('.summary-engine_message-dot');
        dots.forEach((dot, index) => {
            dot.style.animation = `typing 1.5s infinite ${index * 0.2}s`;
        });
        
        setTimeout(() => {
            typingIndicator.remove();
            if (callback) callback();
        }, this.config.typingDuration);
    }
    
    // Show answer
    showAnswer(tabPane, questionAttribute, callback) {
        const answerElement = tabPane.querySelector(`[summary-engine="${questionAttribute}-answer"]`);
        if (!answerElement) {
            console.log('WebflowMessagesFlowWithQuestions: No answer found for:', questionAttribute);
            if (callback) callback();
            return;
        }
        
        console.log('WebflowMessagesFlowWithQuestions: Showing answer for:', questionAttribute);
        
        // Show answer
        answerElement.style.display = 'block';
        answerElement.style.opacity = '0';
        answerElement.style.transform = 'translateY(10px)';
        answerElement.style.transition = 'all 0.4s ease-out';
        
        requestAnimationFrame(() => {
            answerElement.style.opacity = '1';
            answerElement.style.transform = 'translateY(0)';
        });
        
        if (callback) {
            setTimeout(callback, 400);
        }
    }
    
    // Show remaining questions
    showRemainingQuestions(tabPane, tabNumber) {
        const questionsContainer = tabPane.querySelector(`[summary-engine="tab-${tabNumber}-tags"]`);
        if (!questionsContainer) return;
        
        const allQuestions = questionsContainer.querySelectorAll(`[summary-engine^="tab-${tabNumber}-tag-"]`);
        const remainingQuestions = Array.from(allQuestions).filter(q => 
            !this.usedQuestions.has(q.getAttribute('summary-engine'))
        );
        
        if (remainingQuestions.length === 0) {
            console.log('WebflowMessagesFlowWithQuestions: No remaining questions for tab:', tabNumber);
            return;
        }
        
        // Clear container and add only remaining questions
        questionsContainer.innerHTML = '';
        remainingQuestions.forEach(question => {
            questionsContainer.appendChild(question);
            question.addEventListener('click', () => {
                this.handleQuestionClick(tabPane, question, tabNumber);
            });
        });
        
        // Show questions container
        questionsContainer.style.display = 'flex';
        questionsContainer.style.opacity = '0';
        questionsContainer.style.transform = 'translateY(10px)';
        questionsContainer.style.transition = 'all 0.4s ease-out';
        
        requestAnimationFrame(() => {
            questionsContainer.style.opacity = '1';
            questionsContainer.style.transform = 'translateY(0)';
        });
    }
    
    // Public methods
    startTabMessages(tabNumber) {
        this.startMessagesFlow(tabNumber);
    }
    
    setWindowOpen(isOpen) {
        this.windowIsOpen = isOpen;
        console.log('WebflowMessagesFlowWithQuestions: Window state set to:', isOpen);
    }
    
    resetCompletedTabs() {
        this.completedTabs.clear();
        this.animatingTabs.clear();
        this.usedQuestions.clear();
        this.windowIsOpen = false;
        console.log('WebflowMessagesFlowWithQuestions: Reset completed tabs and window state');
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('[summary-engine="tabs"]')) {
        window.webflowMessagesFlowWithQuestions = new WebflowMessagesFlowWithQuestions();
    }
});
