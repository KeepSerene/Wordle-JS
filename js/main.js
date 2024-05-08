import { dictionary, targetedWords } from "./words.js";

const wordLength = 5;
const flipAnimationDuration = 500;
const danceAnimationDuration = 500;
const alertContainer = document.querySelector("[data-alert-container]");
const guessGridEl = document.querySelector("[data-guess-grid]");
const keyboardEl = document.querySelector("[data-keyboard]");

// Get a secret word for each day
const initialDate = new Date(2024, 0, 1);
const msOffset = Date.now() - initialDate;
const dayOffset = msOffset / 1000 / 60 / 60 / 24;
const secretWord = targetedWords[Math.floor(dayOffset)];
console.log(secretWord);

// Handle splash screen interactions
const splashScrBtnEl = document.querySelector("[data-splash-btn]");

splashScrBtnEl.addEventListener("click", () => {
  splashScrBtnEl.parentElement.style.opacity = "0";

  setTimeout(() => {
    splashScrBtnEl.parentElement.classList.add("hidden");
    handleUserInteraction();
  }, 310);
});

// Handle user interactions
function handleUserInteraction() {
  document.addEventListener("click", handleMouseClick);
  document.addEventListener("keydown", handleKeyPress);
}

function preventUserInteraction() {
  document.removeEventListener("click", handleMouseClick);
  document.removeEventListener("keydown", handleKeyPress);
}

function handleMouseClick(event) {
  if (event.target.matches("[data-key]")) {
    insertLetter(event.target.dataset.key);
    return;
  }

  if (event.target.matches("[data-enter]")) {
    submitGuess();
    return;
  }

  if (event.target.matches("[data-delete]")) {
    deleteLetter();
    return;
  }
}

function handleKeyPress(event) {
  if (event.key === "Enter") {
    submitGuess();
    return;
  }

  if (event.key === "Backspace" || event.key === "Delete") {
    deleteLetter();
    return;
  }

  if (event.key.match(/^[a-z]$/)) {
    insertLetter(event.key);
    return;
  }
}

function insertLetter(key) {
  const emptyTileEl = guessGridEl.querySelector(".tile:not([data-letter])");
  const activeTiles = getActiveTiles();

  if (activeTiles.length >= wordLength) return;

  emptyTileEl.dataset.letter = key.toLowerCase();
  emptyTileEl.dataset.state = "active";
  emptyTileEl.innerText = key;
}

const getActiveTiles = () =>
  guessGridEl.querySelectorAll("[data-state='active']");

function submitGuess() {
  const activeTiles = [...getActiveTiles()];

  if (activeTiles.length !== wordLength) {
    showAlert("Not enough letters!");
    shakeTile(activeTiles);
    return;
  }

  const guess = activeTiles.reduce(
    (word, activeTile) => word + activeTile.dataset.letter,
    ""
  );

  if (!dictionary.includes(guess)) {
    showAlert("Not in word-list!");
    shakeTile(activeTiles);
    return;
  }

  preventUserInteraction();
  activeTiles.forEach((...params) => flipTile(...params, guess));
}

function deleteLetter() {
  const activeTiles = getActiveTiles();
  const currentActiveTile = activeTiles[activeTiles.length - 1];

  if (currentActiveTile == null) return;

  delete currentActiveTile.dataset.letter;
  delete currentActiveTile.dataset.state;
  currentActiveTile.innerText = "";
}

function showAlert(msg, alertDuration = 1000) {
  const alertEl = document.createElement("div");
  alertEl.classList.add("alert");
  alertEl.innerText = msg;
  alertContainer.prepend(alertEl);

  if (alertDuration == null) return;

  setTimeout(() => {
    alertEl.classList.add("hide");

    alertEl.addEventListener("transitionend", () => alertEl.remove());
  }, alertDuration);
}

function shakeTile(activeTiles) {
  activeTiles.forEach((activeTile) => {
    activeTile.classList.add("shake");

    activeTile.addEventListener(
      "animationend",
      () => activeTile.classList.remove("shake"),
      { once: true }
    );
  });
}

function flipTile(activeTile, index, activeTiles, guess) {
  const letter = activeTile.dataset.letter;
  const key = keyboardEl.querySelector(`.key[data-key="${letter}"i]`);

  setTimeout(
    () => activeTile.classList.add("flip"),
    (index * flipAnimationDuration) / 2
  );

  activeTile.addEventListener(
    "transitionend",
    () => {
      activeTile.classList.remove("flip");

      if (secretWord[index] === letter) {
        activeTile.dataset.state = "correct";
        key.classList.add("correct");
      } else if (secretWord.includes(letter)) {
        activeTile.dataset.state = "wrong-location";
        key.classList.add("wrong-location");
      } else {
        activeTile.dataset.state = "wrong";
        key.classList.add("wrong");
      }

      if (index === activeTiles.length - 1) {
        activeTile.addEventListener(
          "transitionend",
          () => {
            handleUserInteraction();
            validateGuess(activeTiles, guess);
          },
          { once: true }
        );
      }
    },
    { once: true }
  );
}

function validateGuess(activeTiles, guess) {
  if (guess === secretWord) {
    showAlert("🎊Congrats, you guessed it!🎊", 5000);
    danceTile(activeTiles);
    preventUserInteraction();
    return;
  }

  const remainingTiles = guessGridEl.querySelectorAll(
    ".tile:not([data-letter])"
  );

  if (remainingTiles.length === 0) {
    showAlert(`💩${secretWord.toUpperCase()}! Come back tomorrow.💩`, 6000);
    preventUserInteraction();
  }
}

function danceTile(activeTiles) {
  activeTiles.forEach((activeTile, index) => {
    setTimeout(() => {
      activeTile.classList.add("dance");

      activeTile.addEventListener(
        "animationend",
        () => activeTile.classList.remove("dance"),
        { once: true }
      );
    }, (index * danceAnimationDuration) / 5);
  });
}
