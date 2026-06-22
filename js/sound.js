const sounds = {
  correct: new Audio("https://www.myinstants.com/media/sounds/correct.mp3"),
  wrong: new Audio("https://www.myinstants.com/media/sounds/wrong-answer.mp3"),
  gameOver: new Audio(
    "https://actions.google.com/sounds/v1/cartoon/wood_plank_flicks.ogg",
  ),
  tick: new Audio("https://actions.google.com/sounds/v1/alarms/beep_short.ogg"),
  timeUp: new Audio("https://actions.google.com/sounds/v1/cartoon/pop.ogg") 
};

function playSound(soundName) {
  const audio = sounds[soundName];
  if (audio) {
    audio.currentTime = 0;
    audio.play();
  }
}

export default playSound;
