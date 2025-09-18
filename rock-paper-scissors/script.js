function getComputerChoice() {
    let values = ["rock", "paper", "scissors"];
    let randomIndex = Math.floor(Math.random() * 3);

    return values[randomIndex];
}

function getHumanChoice(e) {
    if (e.target.tagName == "BUTTON") {
        playGame(e.target.textContent.toLowerCase());
    }
}

let computerScore = 0;
let humanScore = 0;

function playGame(humanChoice) {
    let computerChoice;
    computerChoice = getComputerChoice();

    let result = playRound(humanChoice, computerChoice);

    const resultDiv = document.querySelector(".results");
    const scoreBoardDiv = document.querySelector(".scoreboard");

    if (result == "human") {
        humanScore++;
        resultDiv.textContent = `You win! ${humanChoice} beats ${computerChoice}`;
    } else if (result == "computer") {
        computerScore++;
        resultDiv.textContent = `Computer wins! ${computerChoice} beats ${humanChoice}`;
    } else {
        resultDiv.textContent = "It's a tie!";
    }

    if (humanScore >= 5 || computerScore >= 5) {
        buttons.style.display = "none";
        scoreBoardDiv.textContent = `Game over! ${humanScore >= 5 ? "You win!" : "Computer wins!"}`;
    } else {
        scoreBoardDiv.textContent = `Computer ${computerScore} - ${humanScore} You`;
    }

    function playRound(humanChoice, computerChoice) {
        if (computerChoice == humanChoice) {
            return;
        }

        if ((humanChoice === "rock" && computerChoice === "scissors") ||
            (humanChoice === "scissors" && computerChoice === "paper") ||
            (humanChoice === "paper" && computerChoice === "rock")) {
            return "human";
        }

        return "computer";
    }
}

const buttons = document.querySelector(".buttons");
buttons.addEventListener("click", getHumanChoice);