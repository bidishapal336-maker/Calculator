const display = document.getElementById("display");
const history = document.getElementById("history");
const buttons = document.querySelectorAll("button");

let expression = "";
let justCalculated = false;

function updateDisplay() {
    display.value = expression || "0";
}

function isOperator(char) {
    return ["+", "-", "*", "/", "%"].includes(char);
}

function addValue(value) {
    if (justCalculated && !isOperator(value)) {
        expression = "";
        history.textContent = "";
    }
    justCalculated = false;

    if (value === ".") {
        const currentNumber = expression.split(/[+\-*/%]/).pop();
        if (currentNumber.includes(".")) return;

        if (currentNumber === "") {
            expression += "0";
        }
    }

    if (isOperator(value)) {
        if (expression === "") {
            if (value === "-") expression = "-";
            else return;
        } else if (isOperator(expression.slice(-1))) {
            expression = expression.slice(0, -1) + value;
            updateDisplay();
            return;
        }
    }

    expression += value;
    updateDisplay();
}

function clearCalculator() {
    expression = "";
    history.textContent = "";
    justCalculated = false;
    updateDisplay();
}

function deleteLast() {
    if (justCalculated) {
        clearCalculator();
        return;
    }
    expression = expression.slice(0, -1);
    updateDisplay();
}

function calculate() {
    if (!expression) return;

    let exp = expression;

    if (isOperator(exp.slice(-1))) {
        exp = exp.slice(0, -1);
    }

    if (!exp) return;

    // Convert percentage to decimal percentage for normal calculator behavior.
    exp = exp.replace(/(\d+(?:\.\d+)?)%/g, "($1/100)");

    // Only evaluate characters produced by the calculator buttons.
    if (!/^[0-9+\-*/().\s]+$/.test(exp)) {
        display.value = "Error";
        expression = "";
        return;
    }

    try {
        const result = Function('"use strict"; return (' + exp + ')')();

        if (!Number.isFinite(result)) {
            throw new Error("Invalid calculation");
        }

        history.textContent = expression + " =";
        expression = String(Number(result.toFixed(10)));
        display.value = expression;
        justCalculated = true;
    } catch {
        display.value = "Error";
        expression = "";
        justCalculated = true;
    }
}

buttons.forEach(button => {
    button.addEventListener("click", () => {
        const value = button.dataset.value;
        const action = button.dataset.action;

        if (action === "clear") clearCalculator();
        else if (action === "delete") deleteLast();
        else if (action === "calculate") calculate();
        else if (value) addValue(value);
    });
});

// Keyboard support
document.addEventListener("keydown", (event) => {
    const key = event.key;

    if (/^[0-9.]$/.test(key)) {
        addValue(key);
    } else if (["+", "-", "*", "/", "%"].includes(key)) {
        event.preventDefault();
        addValue(key);
    } else if (key === "Enter" || key === "=") {
        event.preventDefault();
        calculate();
    } else if (key === "Backspace") {
        deleteLast();
    } else if (key === "Escape" || key.toLowerCase() === "c") {
        clearCalculator();
    }
});

updateDisplay();
