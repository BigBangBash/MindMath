(() => {
  "use strict";

  /* ------------------------------------------------------------
   * Globale Konfiguration (wird beim Start aus dem Formular gelesen)
   * ---------------------------------------------------------- */
  let settings = {
    count: 10,
    displayTime: 3000, // ms
    min: 1,
    max: 9,
    operations: ["+"]
  };

  /* ------------------------------------------------------------
   * Zustand (wird bei jedem Durchlauf zurückgesetzt)
   * ---------------------------------------------------------- */
  let sum = 0;
  let count = 0;
  let lastNumber = null;

  function resetState() {
    sum = 0;
    count = 0;
    lastNumber = null;
  }

  /* ------------------------------------------------------------
   * Hilfsfunktionen
   * ---------------------------------------------------------- */
  function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  function randomDifferentNumber(min, max, previous) {
    let n;
    do {
      n = randomNumber(min, max);
    } while (n === previous);
    return n;
  }

  function randomOperation(ops) {



    const i = Math.floor(Math.random() * ops.length);
    return ops[i];
  }

  function opSymbol(op) {
    switch (op) {
      case "+":
      case "-":
        return op;
      case "*":
        return "×";
      case "/":
        return "÷";
      default:
        return op;
    }
  }

  /* ------------------------------------------------------------
   * Anzeige‑Routine
   * ---------------------------------------------------------- */
  function displayNextTerm(numberDiv, inputSection, answerInput) {
    if (count >= settings.count) {
      // Alle Terme fertig → Eingabe
      numberDiv.classList.add("hidden");
      inputSection.classList.remove("hidden");
      answerInput.focus();
      return;
    }

    let displayText;
    let num;

    if (count === 0) {
      // Erster Term: nur Zahl
      num = randomDifferentNumber(settings.min, settings.max, lastNumber);
      sum = num;
      displayText = String(num);
    } else {
      // Weitere Terme: Operator + Zahl
      const op = randomOperation(settings.operations);

      // Division darf nicht durch 0 teilen
      if (op === "/") {
        num = randomDifferentNumber(Math.max(1, settings.min), settings.max, lastNumber);
      } else {
        num = randomDifferentNumber(settings.min, settings.max, lastNumber);
      }

      switch (op) {
        case "+":
          sum += num;
          break;
        case "-":
          sum -= num;
          break;
        case "*":
          sum *= num;
          break;
        case "/":
          sum /= num; // Ergebnis kann Kommazahl sein
          break;
      }

      displayText = `${opSymbol(op)} ${num}`;
    }

    lastNumber = num;
    numberDiv.textContent = displayText;
    numberDiv.classList.remove("hidden");
    count++;

    // Nach Anzeigedauer blenden, 1 s pausieren
    setTimeout(() => {
      numberDiv.textContent = "";
      setTimeout(() => displayNextTerm(numberDiv, inputSection, answerInput), 100); // feste Lücke 1 s
    }, settings.displayTime);
  }

  /* ------------------------------------------------------------
   * Initialisierung
   * ---------------------------------------------------------- */
  function init() {
    const configForm = document.getElementById("configForm");
    const numberDiv = document.getElementById("number");
    const inputSection = document.getElementById("input-section");
    const answerInput = document.getElementById("answer");
    const checkBtn = document.getElementById("checkBtn");
    const resultDiv = document.getElementById("result");

    // Start/Config‑Formular übermitteln
    configForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Einstellungen auslesen
      settings.count = parseInt(document.getElementById("count").value, 10);
      settings.displayTime = parseInt(document.getElementById("displayTime").value, 10) * 1000; // s → ms
      settings.min = parseInt(document.getElementById("minNumber").value, 10);
      settings.max = parseInt(document.getElementById("maxNumber").value, 10);
      settings.operations = Array.from(
        configForm.querySelectorAll("input[name='ops']:checked")
      ).map((el) => el.value);

      if (settings.operations.length === 0) {
        alert("Bitte mindestens eine Rechenoperation auswählen.");
        return;
      }

      // UI vorbereiten
      resetState();
      configForm.classList.add("hidden");
      resultDiv.textContent = "";
      numberDiv.textContent = "Start";
      numberDiv.classList.remove("hidden");

      // Erste Zahl/Operator nach 1 s anzeigen
      setTimeout(() => displayNextTerm(numberDiv, inputSection, answerInput), 1000);
    });

    /* --- Prüfen‑Button‑Handler ---------------------------------- */
    checkBtn.addEventListener("click", () => {
      const userAnswer = Number(answerInput.value);
      const tolerance = 1e-3; // für Kommazahlen

      if (Number.isNaN(userAnswer)) {
        resultDiv.textContent = "Bitte eine Zahl eingeben.";
        return;
      }

      if (Math.abs(userAnswer - sum) < tolerance) {
        resultDiv.textContent = "✅ Richtig! Gute Arbeit.";
      } else {
        resultDiv.textContent = `❌ Falsch. Die korrekte Lösung ist ${sum}.`;
      }

      // Nach 3 s zurück zum Konfigurations‑Bildschirm
      setTimeout(() => {
        inputSection.classList.add("hidden");
        answerInput.value = "";
        configForm.classList.remove("hidden");
        numberDiv.classList.add("hidden");
      }, 1000);
    });
  

  answerInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();   // verhindert ein ungewolltes Formular-Submit
      checkBtn.click();     // löst denselben Code aus wie der Button
    }
  });
}

  document.addEventListener("DOMContentLoaded", init);
})();
