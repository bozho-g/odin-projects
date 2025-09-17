function getComputerChoice() {
    let values = ["rock", "paper", "scissors"];
    let randomIndex = Math.floor(Math.random() * 3);

    return values[randomIndex];
}

function getHumanChoice() {
    return prompt("Enter your choice");
}

function playGame() {
    let computerScore = 0;
    let humanScore = 0;

    let humanChoice;
    let computerChoice;

    for (let i = 0; i < 5; i++) {
        humanChoice = getHumanChoice().toLocaleLowerCase();
        computerChoice = getComputerChoice();

        let result = playRound(humanChoice, computerChoice);

        if (result == "human") {
            humanScore++;
            console.log(`You win! ${humanChoice} beats ${computerChoice}`);
        } else if (result == "computer") {
            computerScore++;
            console.log(`Computer wins! ${computerChoice} beats ${humanChoice}`);
        } else {
            console.log("It's a tie!");
        }
    }

    if (humanScore > computerScore) {
        console.log(`Game over! You win ${humanScore} to ${computerScore}`);
    } else if (computerScore > humanScore) {
        console.log(`Game over! Computer wins ${computerScore} to ${humanScore}`);
    } else {
        console.log("Game over! It's a tie.");
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

let playBtn = document.querySelector("#play");
playBtn.addEventListener("click", playGame);