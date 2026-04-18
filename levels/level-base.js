(function () {
  const data = window.LEVEL_DATA;
  if (!data) return;

  const panelList = document.querySelectorAll(".grid .card");
  const questionCard = panelList[0];
  const finalCard = panelList[1];
  const mainElement = document.querySelector(".main");
  const gridSection = document.querySelector(".grid");
  const pageElement = document.querySelector(".page");
  const progressKey = "taxquest-progress-v1";

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
  const topRoadmapLink = document.querySelector('.nav-links .pixel-link');

  const roadmapKey = data.file.startsWith("w2-")
    ? "w2"
    : data.file.startsWith("self1099-")
      ? "self1099"
      : data.file.startsWith("investor1099b-")
        ? "investor1099b"
        : "";
  const roadmapUrl = roadmapKey ? `../roadmap.html?track=${roadmapKey}` : "../roadmap.html";
  const attackType = roadmapKey === "self1099" ? "fireball" : "sword";

  if (topRoadmapLink) {
    topRoadmapLink.href = roadmapUrl;
  }

  el.track.textContent = data.track + " - " + data.level;
  el.title.textContent = data.title;
  el.intro.textContent = data.intro;

  const goblinHud = document.createElement("section");
  goblinHud.className = "goblin-hud pixel-panel";
  goblinHud.innerHTML = `
    <div class="goblin-banner">
      <p class="goblin-kicker">BOSS GOBLIN</p>
    </div>
    <div class="goblin-battlefield">
      <div class="goblin-health" id="goblinHealth"></div>
      <div class="goblin-art" id="goblinArt" aria-hidden="true">
        <span class="goblin-flash"></span>
        <span class="goblin-ear goblin-ear-left"></span>
        <span class="goblin-ear goblin-ear-right"></span>
        <span class="goblin-eye goblin-eye-left"></span>
        <span class="goblin-eye goblin-eye-right"></span>
        <span class="goblin-nose"></span>
        <span class="goblin-mouth"></span>
      </div>
    </div>
  `;

  if (pageElement) {
    pageElement.appendChild(goblinHud);
  }

  const goblinHealth = goblinHud.querySelector("#goblinHealth");
  const goblinArt = goblinHud.querySelector("#goblinArt");
  const goblinFlash = goblinHud.querySelector(".goblin-flash");
  const attackLayer = document.createElement("div");
  attackLayer.className = "sword-layer";
  attackLayer.style.zIndex = "9999";
  document.body.appendChild(attackLayer);

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
  };

  const getAttackVectors = (fromElement) => {
    if (!fromElement || !goblinArt || !attackLayer) return null;

    const fromRect = fromElement.getBoundingClientRect();
    const targetRect = goblinArt.getBoundingClientRect();
    const layerRect = attackLayer.getBoundingClientRect();
    const startX = fromRect.left - layerRect.left + fromRect.width / 2;
    const startY = fromRect.top - layerRect.top + fromRect.height / 2;
    const endX = targetRect.left - layerRect.left + targetRect.width / 2;
    const endY = targetRect.top - layerRect.top + targetRect.height / 2;
    const angle = Math.atan2(endY - startY, endX - startX) * 180 / Math.PI;
    const dx = endX - startX;
    const dy = endY - startY;

    return { startX, startY, endX, endY, angle, dx, dy };
  };

  const playSwordStrike = (_fromElement, onImpact) => {
    if (!goblinArt || !attackLayer) return;
    const targetRect = goblinArt.getBoundingClientRect();
    const layerRect = attackLayer.getBoundingClientRect();
    const startX = targetRect.left - layerRect.left - 14;
    const startY = targetRect.top - layerRect.top + targetRect.height * 0.46;

    const sword = document.createElement("span");
    sword.className = "goblin-sword";
    sword.style.left = `${startX}px`;
    sword.style.top = `${startY}px`;
    sword.innerHTML = `<img class="goblin-sword-img" src="../imgs/w2-sword.svg" alt="" aria-hidden="true" />`;
    attackLayer.appendChild(sword);

    void sword.offsetWidth;
    sword.animate(
      [
        { transform: "translate(0, 0) rotate(-48deg)", opacity: 0.95 },
        { transform: "translate(16px, -2px) rotate(-6deg)", opacity: 1 },
        { transform: "translate(30px, 0) rotate(28deg)", opacity: 0.94 }
      ],
      { duration: 260, easing: "steps(3, end)", fill: "forwards" }
    );

    window.setTimeout(() => {
      if (onImpact) onImpact();
    }, 140);

    window.setTimeout(() => {
      sword.remove();
    }, 340);
  };

  const playFireball = (fromElement, onImpact) => {
    const vectors = getAttackVectors(fromElement);
    if (!vectors) return;
    const { startX, startY, dx, dy } = vectors;

    const fireball = document.createElement("span");
    fireball.className = "goblin-fireball";
    fireball.style.left = `${startX}px`;
    fireball.style.top = `${startY}px`;
    fireball.innerHTML = `
      <span class="goblin-fireball-core"></span>
      <span class="goblin-fireball-trail"></span>
    `;
    attackLayer.appendChild(fireball);

    fireball.animate(
      [
        { transform: "translate(0, 0) scale(0.8)", opacity: 0.95 },
        { transform: `translate(${dx * 0.6}px, ${dy * 0.6}px) scale(1.1)`, opacity: 1 },
        { transform: `translate(${dx}px, ${dy}px) scale(1.35)`, opacity: 0.8 }
      ],
      { duration: 460, easing: "steps(4, end)", fill: "forwards" }
    );

    window.setTimeout(() => {
      if (onImpact) onImpact();
      fireball.classList.add("impact");
    }, 360);

    window.setTimeout(() => {
      fireball.remove();
    }, 620);
  };

  const playAttack = (fromElement, onImpact) => {
    if (attackType === "fireball") {
      playFireball(fromElement, onImpact);
      return;
    }
    playSwordStrike(fromElement, onImpact);
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

  const readProgress = () => {
    try {
      return JSON.parse(window.localStorage.getItem(progressKey) || "{}");
    } catch (_err) {
      return {};
    }
  };

  const saveProgress = (progress) => {
    try {
      window.localStorage.setItem(progressKey, JSON.stringify(progress));
    } catch (_err) {
      // Ignore quota/storage errors in private mode.
    }
  };

  const markLevelCompleted = () => {
    if (!data.file) return;
    const progress = readProgress();
    progress[data.file] = {
      completed: true,
      completedAt: Date.now()
    };
    saveProgress(progress);
  };

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
    playAttack(questionStage.querySelectorAll(".choice-row")[selectedAnswerIndex], damageGoblin);

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
    markLevelCompleted();
    playAttack(finalInput, damageGoblin);

    finalInput.disabled = true;
    finalAction.textContent = data.next ? "Next Level" : "Back to Roadmap";
    finalAction.disabled = false;
    finalAction.onclick = () => {
      window.location.href = data.next || roadmapUrl;
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
