import playSound from "./sound.js";

export default class Question {
  constructor(quiz, container, onQuizEnd) {
    this.quiz = quiz;
    this.container = container;
    this.onQuizEnd = onQuizEnd;
    this.questionData = quiz.getCurrentQuestion();
    this.index = quiz.currentQuestionIndex;

    this.question = this.decodeHtml(this.questionData.question);
    this.correctAnswer = this.decodeHtml(this.questionData.correct_answer);
    this.category = this.decodeHtml(this.questionData.category);
    this.difficulty = this.questionData.difficulty;

    const self = this;
    this.wrongAnswers = this.questionData.incorrect_answers.map(
      function (text) {
        return self.decodeHtml(text);
      },
    );

    this.allAnswers = this.shuffleAnswers();

    this.answered = false;
    this.timerInterval = null;
    this.timeRemaining = 15;
  }

  decodeHtml(html) {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.documentElement.textContent;
  }

  shuffleAnswers() {
    const arrayShuffle = [...this.wrongAnswers, this.correctAnswer];
    for (let i = arrayShuffle.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arrayShuffle[i], arrayShuffle[j]] = [arrayShuffle[j], arrayShuffle[i]];
    }
    return arrayShuffle;
  }

  getProgress() {
    return Math.round(((this.index + 1) / this.quiz.numberOfQuestions) * 100);
  }

  displayQuestion() {
    const progressPercentage = this.getProgress();

    const questionCard = `
<div class="game-card question-card" role="region" aria-label="Round 1 of 5">
  <div class="xp-bar-container">
    <div class="xp-bar-header">
      <span class="xp-label">
        <i class="fa-solid fa-bolt"></i> Progress
      </span>
      <span class="xp-value">Round ${this.index + 1}/${this.quiz.numberOfQuestions}</span>
    </div>
    <div class="xp-bar">
      <div
        class="xp-bar-fill"
        style="width: ${progressPercentage}%"
        role="progressbar"
        aria-valuenow="${progressPercentage}"
        aria-valuemin="0"
        aria-valuemax="100"
      ></div>
    </div>
  </div>

  <div class="stats-row">
    <div class="stat-badge category">
      <i class="fa-solid fa-bookmark"></i>
      <span>${this.category}</span>
    </div>
    <div class="stat-badge difficulty easy">
      <i class="fa-solid fa-face-smile"></i>
      <span>${this.difficulty}</span>
    </div>
    <div
      class="stat-badge timer warning"
      aria-live="polite"
      aria-label="Time remaining"
    >
      <i class="fa-solid fa-stopwatch"></i>
      <span class="timer-value">${this.timeRemaining}</span>
    </div>
    <div class="stat-badge counter">
      <i class="fa-solid fa-gamepad"></i>
      <span> ${this.index + 1}/${this.quiz.numberOfQuestions}</span>
    </div>
  </div>

  <h2 class="question-text" id="questionText">
   ${this.question}
  </h2>

  <div class="answers-grid" role="listbox" aria-labelledby="questionText">
    <button
      class="answer-btn"
      role="option"
      tabindex="0"
      data-index="0"
      data-answer="${this.allAnswers[0]}"
      aria-label="Answer 1: ${this.allAnswers[0]}". Press 1 to select."
    >
      <span class="answer-key">1</span>
      <span class="answer-text">${this.allAnswers[0]}"</span>
    </button>

    <button
      class="answer-btn"
      role="option"
      tabindex="0"
      data-index="1"
      data-answer="${this.allAnswers[1]}"
      aria-label="Answer 2: ${this.allAnswers[1]}. Press 2 to select."
    >
      <span class="answer-key">2</span>
      <span class="answer-text">${this.allAnswers[1]}</span>
    </button>

    <button
      class="answer-btn"
      role="option"
      tabindex="0"
      data-index="2"
      data-answer="${this.allAnswers[2]}"
      aria-label="Answer 3: ${this.allAnswers[2]}. Press 3 to select."
    >
      <span class="answer-key">3</span>
      <span class="answer-text">${this.allAnswers[2]}</span>
    </button>

    <button
      class="answer-btn"
      role="option"
      tabindex="0"
      data-index="3"
      data-answer="${this.allAnswers[3]}"
      aria-label="Answer 4: ${this.allAnswers[3]}. Press 4 to select."
    >
      <span class="answer-key">4</span>
      <span class="answer-text">${this.allAnswers[3]}</span>
    </button>
  </div>
<div id="timeUpContainer"></div>
  <p class="keyboard-hint">
    <i class="fa-regular fa-keyboard"></i> Press 1-4 to select
  </p>
  <div class="score-panel">
    <div class="score-item">
      <div class="score-item-label">Score</div>
      <div class="score-item-value">${this.quiz.score}</div>
    </div>
  </div>
</div>
    `;

    this.container.innerHTML = questionCard;

    this.addEventListeners();

    this.startTimer();
  }

  addEventListeners() {
    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach((button) => {
      button.addEventListener("click", () => {
        this.checkAnswer(button);
      });
    });

    this.handleKeyboard = (e) => {
      if (
        e.key === "1" ||
        e.key === "2" ||
        e.key === "3" ||
        e.key === "4"
      ) {
        const index = parseInt(e.key) - 1;
        this.checkAnswer(buttons[index]);
      }
    };

    document.addEventListener("keydown", this.handleKeyboard);
  }

  removeEventListeners() {
    document.removeEventListener("keydown", this.handleKeyboard);
  }

  startTimer() {
    const timerDisplay = document.querySelector(".timer-value");
    const timerContainer = document.querySelector(".stat-badge.timer");

    if (timerDisplay) {
      timerDisplay.textContent = this.timeRemaining;
    }

    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 1;

      if (timerDisplay) {
        timerDisplay.textContent = this.timeRemaining;
      }

      if (this.timeRemaining <= 5 && this.timeRemaining > 0) {
        playSound("tick");
      }

      if (this.timeRemaining <= 10 && timerContainer) {
        timerContainer.classList.add("warning");
      }

      if (this.timeRemaining <= 0) {
        this.stopTimer();
        this.handleTimeUp();
      }
    }, 1000);
  }

  stopTimer() {
    clearInterval(this.timerInterval);
  }

  handleTimeUp() {
    this.answered = true;
    this.removeEventListeners();

    playSound("timeUp");

    const timeUpContainer = document.getElementById("timeUpContainer");
    if (timeUpContainer) {
      timeUpContainer.innerHTML = `<div class="time-up-message">
      <i class="fa-solid fa-clock"></i> TIME'S UP!
    </div>`;
    }

    this.highlightCorrectAnswer();
    this.animateQuestion(1500);
  }

  checkAnswer(choiceElement) {
    if (this.answered) return;
    this.answered = true;

    this.stopTimer();

    const selectedAnswer = choiceElement.getAttribute("data-answer");
    const correctAnswer = this.correctAnswer;

    if (selectedAnswer.toLowerCase() === correctAnswer.toLowerCase()) {
      choiceElement.classList.add("correct");
      this.quiz.incrementScore();
      playSound("correct");
    } else {
      choiceElement.classList.add("wrong");
      this.highlightCorrectAnswer();
      playSound("wrong");
    }

    const allButtons = document.querySelectorAll(".answer-btn");
    allButtons.forEach((btn) => {
      if (btn !== choiceElement) {
        btn.classList.add("disabled");
      }
    });

    this.animateQuestion(0);
  }

  highlightCorrectAnswer() {
    const buttons = document.querySelectorAll(".answer-btn");

    buttons.forEach((button) => {
      if (
        button.getAttribute("data-answer").toLowerCase() ===
        this.correctAnswer.toLowerCase()
      ) {
        button.classList.add("correct-reveal");
      }
    });
  }

  getNextQuestion() {
    const quizNextQuestion = this.quiz.nextQuestion();

    if (quizNextQuestion === true) {
      const newNextQuestion = new Question(
        this.quiz,
        this.container,
        this.onQuizEnd,
      );
      newNextQuestion.displayQuestion();
    } else {
      this.container.innerHTML = this.quiz.endQuiz();

      const playAgainBtn = document.querySelector(".btn-restart");

      if (playAgainBtn) {
        playAgainBtn.addEventListener("click", () => {
          window.location.reload();
        });
      }
    }
  }

  animateQuestion(duration) {
    setTimeout(() => {
      const card = document.querySelector(".question-card");
      if (card) {
        card.classList.add("exit");
      }
      setTimeout(() => {
        this.getNextQuestion();
      }, duration);
    }, 1500);
  }
}
