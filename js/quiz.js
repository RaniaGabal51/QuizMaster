import playSound from "./sound.js";

export default class Quiz {

  constructor(playerName, numberOfQuestions, category, difficulty) {
    this.playerName = playerName;
    this.numberOfQuestions = numberOfQuestions;
    this.category = category;
    this.difficulty = difficulty;

    this.score = 0;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }

  buildApiUrl() {
    let url = `https://opentdb.com/api.php?amount=${this.numberOfQuestions}`;
    if (this.category) {
      url += `&category=${this.category}`;
    }
    if (this.difficulty) {
      url += `&difficulty=${this.difficulty}`;
    }

    return url;
  }

  async getQuestions() {
    let url = this.buildApiUrl();

    let response = await fetch(url);

    if (!response.ok) {
      throw new Error("Network response was not ok");
    }

    const data = await response.json();

    if (data.response_code === 0) {
      this.questions = data.results;
      return this.questions;
    }
  }

  incrementScore() {
    this.score += 1;
  }

  getCurrentQuestion() {
    if (this.currentQuestionIndex < this.questions.length) {
      return this.questions[this.currentQuestionIndex];
    } else {
      return null;
    }
  }

  nextQuestion() {
    this.currentQuestionIndex += 1;
    if (this.currentQuestionIndex < this.questions.length) {
      return true;
    } else {
      return false;
    }
  }

  isComplete() {
    if (this.currentQuestionIndex >= this.questions.length) {
      return true;
    }
  }

  getScorePercentage() {
    return Math.round((this.score / this.numberOfQuestions) * 100);
  }

  saveHighScore() {
    let highScores = this.getHighScores();

    const newScore = {
      name: this.playerName,
      score: this.score,
      total: this.numberOfQuestions,
      percentage: this.getScorePercentage(),
      difficulty: this.difficulty,
      date: new Date().toLocaleDateString(),
    };

    highScores.push(newScore);

    highScores.sort(function (a, b) {
      return b.percentage - a.percentage;
    });

    highScores = highScores.slice(0, 10);

    localStorage.setItem("quizHighScores", JSON.stringify(highScores));
  }

  getHighScores() {
    try {
      const scores = localStorage.getItem("quizHighScores");

      return JSON.parse(scores) || [];
    } catch {
      return [];
    }
  }

  isHighScore() {
    if (this.getScorePercentage() === 0) {
      return false;
    }
    const highScores = this.getHighScores();
    if (highScores.length < 10) {
      return true;
    }

    const lowestScore = highScores[highScores.length - 1];

    if (this.getScorePercentage() > lowestScore.percentage) {
      return true;
    } else {
      return false;
    }
  }

  endQuiz() {
    playSound("gameOver");
    const percentage = this.getScorePercentage();
    const isNewHighScore = this.isHighScore();

    if (isNewHighScore) {
      this.saveHighScore();
    }

    const highScores = this.getHighScores();

    let leaderboardRows = "";
    
    highScores.forEach((player, index) => {
      let medalClass = "";

      if (index === 0) {
        medalClass = "gold";
      } else if (index === 1) {
        medalClass = "silver";
      } else if (index === 2) {
        medalClass = "bronze";
      }

      leaderboardRows += `
        <li class="leaderboard-item ${medalClass}">
          <span class="leaderboard-rank">#${index + 1}</span>
          <span class="leaderboard-name">${player.name}</span>
          <span class="leaderboard-score">${player.percentage}%</span>
        </li>
      `;
    });

  return `
      <div class="game-card results-card" role="dialog" aria-labelledby="gameResult">
        <h2 id="gameResult" class="results-title">Quiz Complete!</h2>
        <p class="results-score-display">${this.score}/${this.numberOfQuestions}</p>
        <p class="results-percentage">${percentage}% Accuracy</p>
        
        ${isNewHighScore ? `<div class="new-record-badge"><i class="fa-solid fa-star"></i> New High Score!</div>` : ""}
        
        <div class="leaderboard">
          <h4 class="leaderboard-title">
            <i class="fa-solid fa-trophy"></i> Leaderboard
          </h4>
          <ul class="leaderboard-list">
            ${leaderboardRows}
          </ul>
        </div>
        
        <div class="action-buttons">
          <button class="btn-restart" aria-label="Play again">
            <i class="fa-solid fa-rotate-right"></i> Play Again
          </button>
        </div>
      </div>
    `;
  }
}
