/**
 * ============================================
 * MAIN ENTRY POINT (index.js)
 * ============================================
 *
 * This file is the starting point of your application.
 * It handles:
 * - Getting DOM elements
 * - Form validation
 * - Starting the quiz
 * - Loading/error states
 *
 * DOM ELEMENTS TO GET:
 * - quizOptionsForm: #quizOptions
 * - playerNameInput: #playerName
 * - categoryInput: #categoryMenu
 * - difficultyOptions: #difficultyOptions
 * - questionsNumber: #questionsNumber
 * - startQuizBtn: #startQuiz
 * - questionsContainer: .questions-container
 *
 * FUNCTIONS TO IMPLEMENT:
 * - showLoading() - Display loading spinner
 * - hideLoading() - Remove loading spinner
 * - showError(message) - Display error card
 * - validateForm() - Check if form is valid
 * - showFormError(message) - Show error on form
 * - resetToStart() - Reset to initial state
 * - startQuiz() - Main function to start quiz
 */

// ============================================
// TODO: Get DOM Element References
// ============================================
// Use document.getElementById() and document.querySelector()

// ============================================
// TODO: Create variable to store current quiz
// ============================================
// let currentQuiz = null;

// ============================================
// TODO: Create showLoading() function
// ============================================
// Set questionsContainer.innerHTML to loading HTML
// See index.html for the HTML structure

// ============================================
// TODO: Create hideLoading() function
// ============================================
// Find and remove the loading overlay

// ============================================
// TODO: Create showError(message) function
// ============================================
// Set questionsContainer.innerHTML to error HTML
// Include the message parameter in the display
// Add click listener to retry button that calls resetToStart()

// ============================================
// TODO: Create validateForm() function
// ============================================
// Return object: { isValid: boolean, error: string | null }
// Check:
// 1. questionsNumber has a value
// 2. Value is >= 1 (minimum questions)
// 3. Value is <= 50 (maximum questions)

// ============================================
// TODO: Create showFormError(message) function
// ============================================
// Create error div with class 'form-error'
// Insert before the start button
// Remove after 3 seconds with fade effect

// ============================================
// TODO: Create resetToStart() function
// ============================================
// 1. Clear questionsContainer
// 2. Reset form values
// 3. Show the form (remove 'hidden' class)
// 4. Set currentQuiz = null

// ============================================
// TODO: Create async startQuiz() function
// ============================================
// This is the main function, called when Start button is clicked
//
// Steps:
// 1. Validate the form
// 2. If not valid, show error and return
// 3. Get form values:
//    - playerName (use 'Player' if empty)
//    - category
//    - difficulty
//    - numberOfQuestions
// 4. Create new Quiz instance
// 5. Hide the form (add 'hidden' class)
// 6. Show loading spinner
// 7. Try to fetch questions:
//    - await currentQuiz.getQuestions()
//    - Hide loading
//    - Check if questions exist
//    - Create first Question and display it
// 8. Catch any errors:
//    - Hide loading
//    - Show error message

// ============================================
// TODO: Add Event Listeners
// ============================================
// 1. startQuizBtn click -> call startQuiz()
// 2. questionsNumber keydown -> if Enter, call startQuiz()

import Quiz from "./quiz.js";
import Question from "./Question.js";

const quizOptions = document.getElementById("quizOptions");
const playerName = document.getElementById("playerName");
const categoryMenu = document.getElementById("categoryMenu");
const difficultyOptions = document.getElementById("difficultyOptions");
const questionsNumber = document.getElementById("questionsNumber");
const startQuizBtn = document.getElementById("startQuiz");
const questionsContainer = document.querySelector(".questions-container");

let currentQuiz = null;

startQuizBtn.addEventListener("click", function (e) {
  e.preventDefault();
  startQuiz();
});

questionsNumber.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    startQuiz();
  }
});

function showLoading() {
  const loading = `<div class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-text">Loading Questions...</p>
    </div>`;
  questionsContainer.innerHTML = loading;
}

function hideLoading() {
  questionsContainer.innerHTML = "";
}

function showError() {
  questionsContainer.innerHTML = `    
    <div class="game-card error-card">
      <div class="error-icon">
        <i class="fa-solid fa-triangle-exclamation"></i>
      </div>
      <h3 class="error-title">Oops! Something went wrong</h3>
      <p class="error-message">Failed to load questions. Please try again.</p>
      <button class="btn-play retry-btn">
        <i class="fa-solid fa-rotate-right"></i> Try Again
      </button>
    </div>
    `;

  document.querySelector(".retry-btn").addEventListener("click", resetToStart);
}

function validateForm() {
  let messageError;
  if (!questionsNumber.value) {
    return (messageError = `Please enter the number of questions.`);
  } else if (questionsNumber.value > 50) {
    return (messageError = `Maximum 50 questions allowed.`);
  } else if (questionsNumber.value <= 0) {
    return (messageError = `Minimum 1 question required.`);
  }
}

function showFormError(message) {
  const errorDiv = document.createElement("div");

  errorDiv.className = "form-error";

  errorDiv.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> ${message}`;

  quizOptions.insertBefore(errorDiv, startQuizBtn);

  setTimeout(() => {
    errorDiv.remove();
  }, 3000);
}

function resetToStart() {
  quizOptions.reset();

  questionsContainer.innerHTML = "";

  quizOptions.classList.remove("hidden");

  currentQuiz = null;
}

async function startQuiz() {
  const error = validateForm();

  if (error) {
    showFormError(error);
    return;
  }

  if (!playerName.value) {
    playerName.value = "Player";
  }

  const categorySelectEl = document.getElementById("categorySelect");
  const difficultySelectEl = document.getElementById("difficultySelect");

  const catValue = categorySelectEl
    ? categorySelectEl.getAttribute("data-value")
    : "";
  const diffValue = difficultySelectEl
    ? difficultySelectEl.getAttribute("data-value")
    : "easy";

  quizOptions.classList.add("hidden");
  showLoading();

  try {
    currentQuiz = new Quiz(
      playerName.value,
      questionsNumber.value,
      catValue,
      diffValue,
    );

    await currentQuiz.getQuestions();

    hideLoading();

    if (!currentQuiz.questions || currentQuiz.questions.length === 0) {
      showError();
      return;
    }

    const question = new Question(currentQuiz, questionsContainer);
    question.displayQuestion();

  } catch {
    hideLoading();
    showError();
  }
}
