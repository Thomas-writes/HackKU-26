(function () {
  const data = window.LEVEL_DATA;
  if (!data) return;

  const panelList = document.querySelectorAll(".grid .card");
  const questionCard = panelList[0];
  const finalCard = panelList[1];
  const mainElement = document.querySelector(".main");
  const gridSection = document.querySelector(".grid");

  questionCard.classList.add("question-card");
  finalCard.classList.add("tax-form-card");

  const questionHeading = questionCard.querySelector("h2");
  const questionStage = questionCard.querySelector("#mcqs");
  const questionAction = questionCard.querySelector("#checkMcq");
  const questionFeedback = questionCard.querySelector("#mcqFeedback");
  questionAction.classList.add("primary-action");

  const el = {
    track: document.getElementById("track"),
    title: document.getElementById("levelTitle"),
    intro: document.getElementById("intro"),
    prevLink: document.getElementById("prevLink"),
    nextLink: document.getElementById("nextLink")
  };

  el.track.textContent = data.track + " - " + data.level;
  el.title.textContent = data.title;
  el.intro.textContent = data.intro;

  const goblinHud = document.createElement("section");
  goblinHud.className = "goblin-hud pixel-panel";
  goblinHud.innerHTML = `
    <div class="goblin-banner">
      <div>
        <p class="goblin-kicker">BOSS GOBLIN</p>
        <p class="goblin-caption">One heart disappears for every correct answer.</p>
      </div>
      <div class="goblin-health" id="goblinHealth"></div>
    </div>
    <div class="goblin-battlefield">
      <div class="goblin-art" id="goblinArt" aria-hidden="true">
        <span class="goblin-flash"></span>
        <span class="goblin-ear goblin-ear-left"></span>
        <span class="goblin-ear goblin-ear-right"></span>
        <span class="goblin-eye goblin-eye-left"></span>
        <span class="goblin-eye goblin-eye-right"></span>
        <span class="goblin-nose"></span>
        <span class="goblin-mouth"></span>
      </div>
      <div class="goblin-status">
        <p class="goblin-counter" id="goblinCounter"></p>
        <p class="goblin-caption goblin-caption-tight">Crack his armor by clearing every question.</p>
      </div>
    </div>
  `;

  if (mainElement && gridSection) {
    mainElement.insertBefore(goblinHud, gridSection);
  }

  const goblinHealth = goblinHud.querySelector("#goblinHealth");
  const goblinArt = goblinHud.querySelector("#goblinArt");
  const goblinFlash = goblinHud.querySelector(".goblin-flash");
  const goblinCounter = goblinHud.querySelector("#goblinCounter");
  const swordLayer = document.createElement("div");
  swordLayer.className = "sword-layer";
  swordLayer.style.zIndex = "9999";
  document.body.appendChild(swordLayer);

  if (data.prev) {
    el.prevLink.href = data.prev;
  } else {
    el.prevLink.style.display = "none";
  }

  if (data.next) {
    el.nextLink.href = data.next;
  } else {
    el.nextLink.style.display = "none";
  }

  const steps = data.mcqs.map((question, index) => ({ type: "mcq", question, index }));
  const letters = ["A", "B", "C", "D"];
  const totalHearts = steps.length + 1;
  const normalizedFinalAnswers = (data.final.answers || []).map((answer) => String(answer || "").trim().toLowerCase().replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, " "));
  const hintList = Array.isArray(data.final.hints) && data.final.hints.length
    ? data.final.hints.slice()
    : [
        data.final.hint || "Read the line label carefully.",
        "Check the number directly from the document section.",
        "Answer: " + (data.final.answers && data.final.answers[0] ? data.final.answers[0] : "")
      ].filter(Boolean);

  let currentStepIndex = 0;
  let selectedAnswerIndex = null;
  let stepSolved = false;
  let wrongAttempts = new Set();
  let finalHintIndex = 0;
  let finalSubmitted = false;
  let finalInput = null;
  let finalAction = null;
  let finalResult = null;
  let hintButton = null;
  let hintOutput = null;
  let goblinHealthRemaining = totalHearts;

  const renderGoblinHealth = () => {
    goblinHealth.innerHTML = "";
    for (let index = 0; index < totalHearts; index += 1) {
      const heart = document.createElement("span");
      heart.className = index < goblinHealthRemaining ? "goblin-heart" : "goblin-heart lost";
      heart.textContent = "♥";
      goblinHealth.appendChild(heart);
    }
    goblinCounter.textContent = `${goblinHealthRemaining} / ${totalHearts} hearts left`;
  };

  const playSwordStrike = (fromElement) => {
    if (!fromElement || !goblinArt || !swordLayer) return;

    const fromRect = fromElement.getBoundingClientRect();
    const targetRect = goblinArt.getBoundingClientRect();
    const layerRect = swordLayer.getBoundingClientRect();
    const startX = fromRect.left - layerRect.left + fromRect.width / 2;
    const startY = fromRect.top - layerRect.top + fromRect.height / 2;
    const endX = targetRect.left - layerRect.left + targetRect.width / 2;
    const endY = targetRect.top - layerRect.top + targetRect.height / 2;
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    const dx = endX - startX;
    const dy = endY - startY;

    const sword = document.createElement("span");
    sword.className = "goblin-sword";
    sword.style.left = `${startX}px`;
    sword.style.top = `${startY}px`;
    sword.style.transform = `rotate(${angle}deg)`;
    sword.innerHTML = `
      <span class="goblin-sword-blade"></span>
      <span class="goblin-sword-guard"></span>
      <span class="goblin-sword-hilt"></span>
    `;
    swordLayer.appendChild(sword);

    void sword.offsetWidth;
    sword.animate(
      [
        { transform: `translate(0, 0) rotate(${angle}deg)` },
        { transform: `translate(${dx * 0.55}px, ${dy * 0.55}px) rotate(${angle + 10}deg)` },
        { transform: `translate(${dx}px, ${dy}px) rotate(${angle - 18}deg)` }
      ],
      { duration: 420, easing: "steps(4, end)", fill: "forwards" }
    );

    window.setTimeout(() => {
      sword.remove();
    }, 560);
  };

  const damageGoblin = () => {
    goblinHealthRemaining = Math.max(0, goblinHealthRemaining - 1);
    renderGoblinHealth();
    goblinFlash.classList.remove("active");
    void goblinFlash.offsetWidth;
    goblinFlash.classList.add("active");
    goblinArt.classList.remove("hurt");
    void goblinArt.offsetWidth;
    goblinArt.classList.add("hurt");
    window.setTimeout(() => {
      goblinFlash.classList.remove("active");
      goblinArt.classList.remove("hurt");
    }, 520);
    if (goblinHealthRemaining === 0) {
      goblinArt.classList.add("defeated");
    }
  };

  renderGoblinHealth();

  const normalize = (value) => String(value || "").trim().toLowerCase().replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, " ");

  const showQuestionCard = () => {
    questionCard.hidden = false;
    finalCard.hidden = true;
  };

  const showFinalCard = () => {
    questionCard.hidden = true;
    finalCard.hidden = false;
  };

  const clearQuestionFeedback = () => {
    questionFeedback.textContent = "";
    questionFeedback.className = "feedback";
  };

  const updateQuestionChoiceStates = (step) => {
    questionStage.querySelectorAll(".choice-row").forEach((row, rowIndex) => {
      row.disabled = stepSolved;
      row.classList.toggle("selected", !stepSolved && rowIndex === selectedAnswerIndex);
      row.classList.toggle("correct", stepSolved && rowIndex === step.question.answer);
      row.classList.toggle("wrong", !stepSolved && wrongAttempts.has(rowIndex));
      row.setAttribute("aria-pressed", !stepSolved && rowIndex === selectedAnswerIndex ? "true" : "false");
    });
  };

  const setPrimaryAction = (label, disabled) => {
    questionAction.textContent = label;
    questionAction.disabled = disabled;
  };

  const renderQuestionStep = () => {
    showQuestionCard();
    const step = steps[currentStepIndex];
    questionHeading.textContent = `Question ${currentStepIndex + 1} of ${steps.length}`;
    questionStage.innerHTML = "";
    clearQuestionFeedback();
    wrongAttempts = new Set();

    const shell = document.createElement("section");
    shell.className = "question-shell";

    const prompt = document.createElement("p");
    prompt.className = "question-prompt";
    prompt.textContent = step.question.q;

    const guidance = document.createElement("p");
    guidance.className = "question-guidance";
    guidance.textContent = "Choose one answer, then confirm it from the bar below.";

    const options = document.createElement("div");
    options.className = "choice-grid";

    step.question.options.forEach((option, optionIndex) => {
      const row = document.createElement("button");
      row.type = "button";
      row.className = "choice-row";
      row.setAttribute("aria-pressed", "false");

      const bubble = document.createElement("span");
      bubble.className = "choice-bubble";
      bubble.textContent = letters[optionIndex] || String(optionIndex + 1);

      const copy = document.createElement("span");
      copy.className = "choice-copy";
      copy.textContent = option;

      row.append(bubble, copy);
      row.addEventListener("click", () => {
        if (stepSolved) return;
        selectedAnswerIndex = optionIndex;
        updateQuestionChoiceStates(step);
        questionAction.disabled = false;
      });
      options.appendChild(row);
    });

    const actionRow = document.createElement("div");
    actionRow.className = "action-row";
    actionRow.appendChild(questionAction);

    shell.append(prompt, guidance, options, actionRow);
    questionStage.appendChild(shell);

    selectedAnswerIndex = null;
    stepSolved = false;
    setPrimaryAction(currentStepIndex === steps.length - 1 ? "Confirm Final Question" : "Confirm Answer", true);
    questionAction.onclick = confirmQuestionStep;
  };

  const confirmQuestionStep = () => {
    const step = steps[currentStepIndex];
    if (selectedAnswerIndex === null) return;

    const isCorrect = selectedAnswerIndex === step.question.answer;

    if (!isCorrect) {
      wrongAttempts.add(selectedAnswerIndex);
      updateQuestionChoiceStates(step);
      questionFeedback.className = "feedback warn";
      questionFeedback.innerHTML = "<strong>Incorrect.</strong> Try another answer.";
      questionAction.disabled = selectedAnswerIndex === null;
      questionAction.onclick = confirmQuestionStep;
      return;
    }

    stepSolved = true;
    updateQuestionChoiceStates(step);
    damageGoblin();
    playSwordStrike(questionStage.querySelectorAll(".choice-row")[selectedAnswerIndex]);

    questionFeedback.className = "feedback success";
    questionFeedback.innerHTML = `<strong>Correct.</strong> ${step.question.explain}`;

    setPrimaryAction(currentStepIndex === steps.length - 1 ? "Proceed to Final" : "Next Question", false);
    questionAction.onclick = goNextStep;
  };

  const buildFinalCard = () => {
    const docTitle = data.final.documentTitle || data.title;
    const docSubtitle = data.final.documentSubtitle || `${data.track} section replica`;

    finalCard.innerHTML = `
      <div class="tax-doc-shell">
        <div class="tax-doc-banner">
          <span class="tax-doc-brand">TAX DOCUMENT</span>
          <span class="tax-doc-form">SECTION REPLICA</span>
        </div>
        <div class="tax-doc-paper">
          <div class="tax-doc-header">
            <p class="tax-doc-title">${docTitle}</p>
            <p class="tax-doc-subtitle">${docSubtitle}</p>
          </div>
          <div class="tax-doc-section">
            <div class="tax-doc-line">
              <span class="tax-doc-line-number">01</span>
              <span class="tax-doc-line-copy">${data.final.prompt}</span>
            </div>
            <div class="tax-doc-line tax-doc-line-entry">
              <span class="tax-doc-line-number">02</span>
              <div class="tax-doc-entry-body">
                <label class="tax-doc-entry-label" for="finalInput">${data.final.label}</label>
                <input id="finalInput" type="text" placeholder="Type on the form line..." />
              </div>
            </div>
          </div>
          <div class="tax-doc-receipt">Type directly into the highlighted line to complete the section.</div>
        </div>
        <div class="tax-doc-footer">
          <div class="tax-doc-bottom-row">
            <button class="btn hint-btn" id="hintBtn" type="button">Hint</button>
            <button class="btn primary-action" id="checkFinal" type="button">Confirm Entry</button>
          </div>
          <div class="hint-stack" id="hintStack"></div>
          <p class="result" id="finalResult">Fill the field below, then confirm your entry.</p>
        </div>
      </div>
    `;

    finalInput = finalCard.querySelector("#finalInput");
    finalAction = finalCard.querySelector("#checkFinal");
    finalResult = finalCard.querySelector("#finalResult");
    hintButton = finalCard.querySelector("#hintBtn");
    hintOutput = finalCard.querySelector("#hintStack");

    finalInput.value = "";
    finalInput.disabled = false;
    finalAction.disabled = true;
    finalAction.textContent = "Confirm Entry";
    finalResult.textContent = "Fill the field below, then confirm your entry.";
    finalResult.className = "result";
    finalSubmitted = false;
    finalHintIndex = 0;
    hintOutput.innerHTML = "";

    finalInput.oninput = () => {
      if (!finalSubmitted) {
        finalAction.disabled = finalInput.value.trim().length === 0;
      }
    };

    hintButton.onclick = showNextHint;
    finalAction.onclick = confirmFinalStep;
  };

  const showNextHint = () => {
    if (hintList.length === 0 || !hintOutput) return;

    const hintIndex = Math.min(finalHintIndex, hintList.length - 1);
    const note = document.createElement("div");
    note.className = "hint-note";
    note.textContent = hintList[hintIndex];
    hintOutput.appendChild(note);

    if (finalHintIndex < hintList.length - 1) {
      finalHintIndex += 1;
    } else if (hintButton) {
      hintButton.disabled = true;
    }
  };

  const confirmFinalStep = () => {
    if (finalSubmitted) return;

    const attempt = normalize(finalInput.value);
    const isCorrect = normalizedFinalAnswers.includes(attempt);

    if (!isCorrect) {
      finalResult.className = "result warn";
      finalResult.innerHTML = "<strong>Incorrect.</strong> Try again or use the hint button.";
      finalInput.focus();
      return;
    }

    finalSubmitted = true;
    damageGoblin();
    playSlash(finalInput);

    finalInput.disabled = true;
    finalAction.textContent = data.next ? "Next Level" : "Back to Roadmap";
    finalAction.disabled = false;
    finalAction.onclick = () => {
      window.location.href = data.next || "../roadmap.html";
    };

    finalResult.className = "result success";
    finalResult.innerHTML = "<strong>Correct.</strong> You filled the section accurately.";
  };

  const goNextStep = () => {
    currentStepIndex += 1;
    if (currentStepIndex >= steps.length) {
      buildFinalCard();
      showFinalCard();
      return;
    }

    renderQuestionStep();
  };

  questionAction.onclick = confirmQuestionStep;
  renderQuestionStep();
})();
