const input = document.querySelector("#input");
const buttons = document.querySelector(".buttons");

const availableKeys = [
    "%", "/", "7", "8", "9", "*", "×",
    "4", "5", "6", "-", "1", "2", "3", "+", "÷",
    "0", ".", "C", "=", "AC", "Backspace", "Enter"
];

let currentInput = "0";
let accumulator = null;
let operator = null;
let divideByZero = false;
let isDecimal = false;
let shouldResetInput = false;
let isEvaluated = false;

let userInput;

function updateInputValue(e) {
    if (e.type === 'keydown') {
        if (e.key === 'NumpadEnter') {
            e.key = 'Enter';
        }

        if (e.key === 'Enter') {
            e.preventDefault();
        }
    }

    userInput = e.type == "keydown" ? e.key : e.target.innerText;

    if (!availableKeys.includes(userInput)) {
        return;
    }

    if (divideByZero && userInput != "AC") {
        return;
    }

    if (userInput == "AC" || userInput == "C" || userInput == "Backspace") {
        deleteState(userInput);
    }

    if (isEvaluated) {
        deleteState("AC");
    }

    if (Number.isInteger(+userInput)) {
        manageNumber();
    }

    if (userInput == ".") {
        manageDecimal();
    }

    if (isOperator(userInput)) {
        if (userInput == "/") {
            e.preventDefault();
        }

        if (operator !== null && shouldResetInput) {
            operator = userInput;
            return;
        }

        shouldResetInput = true;
        isDecimal = false;

        if (userInput == "%") {
            if (operator === "+" || operator === "-") {
                currentInput = calculate(accumulator, "*", Number(currentInput) / 100);
            } else if (operator === "×" || operator === "*" || operator === "÷" || operator === "/") {
                currentInput = (Number(currentInput) / 100).toString();
            } else {
                currentInput = (Number(currentInput) / 100).toString();
            }

            shouldResetInput = false;
            isDecimal = currentInput.includes(".");
        } else if (operator === null) {
            operator = userInput;
            accumulator = currentInput;
        } else {
            currentInput = calculate(accumulator, operator, currentInput);
            accumulator = currentInput;
            operator = userInput;
        }
    }

    if ((userInput == "Enter" || userInput == "=") && !shouldResetInput) {
        isEvaluated = true;
        currentInput = calculate(accumulator, operator, currentInput);
    }

    input.value = currentInput;
}

function manageDecimal() {
    if (shouldResetInput && !isDecimal) {
        currentInput = "0.";
        isDecimal = true;
        return;
    }

    if (userInput == "." && !isDecimal) {
        currentInput += ".";
        isDecimal = true;
        return;
    }
}

function manageNumber() {
    if (shouldResetInput && isDecimal) {
        currentInput += userInput;
        shouldResetInput = false;
        return;
    }

    if (shouldResetInput) {
        currentInput = userInput;
        shouldResetInput = false;
        return;
    }

    if (currentInput == "0") {
        currentInput = userInput;
        return;
    }

    currentInput += userInput;
}

function deleteState(option) {
    switch (option) {
        case "AC":
            currentInput = "0";
            accumulator = null;
            operator = null;
            divideByZero = false;
            shouldResetInput = false;
            isDecimal = false;
            isEvaluated = false;
            break;
        case "C":
        case "Backspace":
            if (isEvaluated) {
                deleteState("AC");
                return;
            }

            if (input.value.length == 1) {
                currentInput = "0";
                accumulator;
                return;
            }

            if (currentInput.at(-1) == ".") {
                isDecimal = false;
            }

            currentInput = currentInput.slice(0, -1);
            return;
        default:
            break;
    }
}

function calculate(accumulator, operator, input = "") {
    accumulator = Number(accumulator);
    input = Number(input);

    let result = 0;

    switch (operator) {
        case "+":
            result = accumulator + input;
            break;
        case "-":
            result = accumulator - input;
            break;
        case "×":
        case "*":
            result = accumulator * input;
            break;
        case "%":
            result = accumulator / 100;
            break;
        case "÷":
        case "/":
            if (input === 0) {
                divideByZero = true;
                return "Error";
            }

            result = accumulator / input;
            break;
    }

    return result.toLocaleString();
}

const operators = new Set(["+", "-", "×", "*", "÷", "/", "%"]);
function isOperator(op) {
    return operators.has(op);
}

buttons.addEventListener("click", updateInputValue);
window.addEventListener("keydown", updateInputValue);
