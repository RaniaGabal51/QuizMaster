import Quiz from "./quiz.js";
import Question from "./question.js";

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
