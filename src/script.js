"use strict";

const { log } = console;

const audio = new Audio(
    `${location.origin}${location.pathname}assets/audios/click.mp3`,
  ),
  playClickAudio = () => {
    audio.currentTime = 0;
    audio.play();
  };

const formatNumber = (num, option = {}) => {
  const { maximumFractionDigits = 3, useGrouping = true } = option;

  const numericValue = Number(num);
  if (isNaN(numericValue)) throw new TypeError("Input must be a valid number.");

  const threshold = 1 / Math.pow(10, maximumFractionDigits); // O.001
  if (Math.abs(numericValue) < threshold) return "0";

  const roundedNum = Number(numericValue.toFixed(maximumFractionDigits)),
    [integerPart, decimalPart] = roundedNum.toString().split("."),
    formattedInteger = useGrouping
      ? integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
      : integerPart,
    formattedDecimal =
      decimalPart && decimalPart.length > 0 ? `.${decimalPart}` : "";

  return formattedInteger + formattedDecimal;
};

const calculator = {
  input: "",
  get displayedInput() {
    return this.input
      .replaceAll("O", "0")
      .replaceAll("＋", " ＋ ")
      .replaceAll("–", " – ")
      .replaceAll("✕", " X ")
      .replaceAll("÷", " ÷ ")
      .replace(/(\d+)(\.\d+)?/g, (match, integerPart, decimalPart) =>
        decimalPart?.slice(1).length > 6
          ? formatNumber(match, { maximumFractionDigits: 6 })
          : match,
      );
  },
  get expression() {
    return this.input
      .replaceAll("O", "0")
      .replaceAll("＋", "+")
      .replaceAll("–", "-")
      .replaceAll("✕", "*")
      .replaceAll("÷", "/")
      .replaceAll("%", "/100");
  },
  get result() {
    if (!/[0-9]/.test(this.expression)) return 0;
    const result = new Function(
      `return ${
        "+-*/".includes(this.expression.at(-1))
          ? this.expression.slice(0, -1)
          : this.expression
      }`,
    )();
    return formatNumber(result, { maximumFractionDigits: 4 });
  },
};

const preventDefault = (e) => e.preventDefault();
document.addEventListener("selectstart", preventDefault);
document.addEventListener("dragstart", preventDefault);
document.addEventListener("contextmenu", preventDefault);

const displayedInput = document.querySelector("#input"),
  displayedResult = document.querySelector("#result"),
  rootStyles = getComputedStyle(document.documentElement),
  duration = Number(
    rootStyles.getPropertyValue("--duration").trim().split("s")[0],
  ),
  updateView = () => {
    displayedInput.textContent = calculator.displayedInput;
    displayedResult.textContent = calculator.result;
    const length = calculator.result.length;
    if (length > 15)
      return (displayedResult.style.fontSize = "var(--font-size-result-xs)");
    if (length > 11)
      return (displayedResult.style.fontSize = "var(--font-size-result-sm)");
    if (length > 7)
      return (displayedResult.style.fontSize = "var(--font-size-result-md)");
    displayedResult.removeAttribute("style");
  };

updateView();

document.body.addEventListener("pointerdown", async (e) => {
  if (!e.target.parentElement.classList.contains("buttons-container")) return;
  playClickAudio();
  if (displayedResult.classList.contains("animate")) return;

  const button = e.target,
    text = button.textContent, // ＋ – ✕ ÷ % O
    lastInput = calculator.input.at(-1);

  if (!calculator.input && button.classList.contains("light") && text !== "–")
    return;
  if (button.classList.contains("clear")) {
    [displayedInput, displayedResult].forEach((el) =>
      el.classList.add("animate"),
    );
    await new Promise((resolve) =>
      setTimeout(() => {
        calculator.input = "";
        [displayedInput, displayedResult].forEach((el) =>
          el.classList.remove("animate"),
        );
        resolve();
      }, duration * 1000),
    );
  } else if (button.classList.contains("delete")) {
    if (calculator.input === "O.") calculator.input = "";
    else if (calculator.input.slice(-2) === "O.")
      calculator.input = calculator.input.slice(0, -2);
    else calculator.input = calculator.input.slice(0, -1);
  } else if (button.classList.contains("equals")) {
    calculator.input = calculator.result.replaceAll(",", "");
  } else if (text === ".") {
    if (lastInput === "." || /\d+\.\d+$/.test(calculator.input)) return;
    if (!lastInput || "＋–✕÷".includes(lastInput)) calculator.input += "O.";
    else if (lastInput === "%") calculator.input += "✕O.";
    else calculator.input += text;
  } else if (
    (".＋–✕÷".includes(lastInput) && "＋–✕÷%".includes(text)) ||
    (/(?<=[＋–✕÷])O$/.test(calculator.input) &&
      (/^[0-9]$/.test(text) || text === "O"))
  ) {
    if (calculator.input === "–") calculator.input = "";
    else calculator.input = calculator.input.slice(0, -1) + text;
  } else if (lastInput === "%" && (/^[0-9]$/.test(text) || text === "O")) {
    calculator.input += `✕${text}`;
  } else if (!lastInput && text === "O") {
    return;
  } else {
    calculator.input += text;
  }

  updateView();
});
