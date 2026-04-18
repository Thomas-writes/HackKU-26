(function () {
  const data = window.LEVEL_DATA;
  if (!data) return;

  const el = {
    track: document.getElementById("track"),
    title: document.getElementById("levelTitle"),
    intro: document.getElementById("intro"),
    mcqs: document.getElementById("mcqs"),
    mcqBtn: document.getElementById("checkMcq"),
    mcqFeedback: document.getElementById("mcqFeedback"),
    finalPrompt: document.getElementById("finalPrompt"),
    finalInputLabel: document.getElementById("finalInputLabel"),
    finalInput: document.getElementById("finalInput"),
    finalBtn: document.getElementById("checkFinal"),
    finalResult: document.getElementById("finalResult"),
    prevLink: document.getElementById("prevLink"),
    nextLink: document.getElementById("nextLink")
  };

  el.track.textContent = data.track + " - " + data.level;
  el.title.textContent = data.title;
  el.intro.textContent = data.intro;
  el.finalPrompt.textContent = data.final.prompt;
  el.finalInputLabel.textContent = data.final.label;

  if (data.prev) el.prevLink.href = data.prev; else el.prevLink.style.display = "none";
  if (data.next) el.nextLink.href = data.next; else el.nextLink.style.display = "none";

  data.mcqs.forEach((q, i) => {
    const wrap = document.createElement("div");
    wrap.className = "mcq-item";

    const qEl = document.createElement("p");
    qEl.className = "mcq-q";
    qEl.textContent = (i + 1) + ". " + q.q;
    wrap.appendChild(qEl);

    q.options.forEach((opt, idx) => {
      const label = document.createElement("label");
      label.className = "option";
      const input = document.createElement("input");
      input.type = "radio";
      input.name = "q-" + i;
      input.value = String(idx);
      label.appendChild(input);
      label.appendChild(document.createTextNode(opt));
      wrap.appendChild(label);
    });

    el.mcqs.appendChild(wrap);
  });

  let mcqPassed = false;

  el.mcqBtn.addEventListener("click", () => {
    let correct = 0;
    const lines = [];

    data.mcqs.forEach((q, i) => {
      const picked = document.querySelector('input[name="q-' + i + '"]:checked');
      if (!picked) {
        lines.push("Q" + (i + 1) + ": No answer selected.");
        return;
      }
      if (Number(picked.value) === q.answer) {
        correct += 1;
        lines.push("Q" + (i + 1) + ": Correct. " + q.explain);
      } else {
        lines.push("Q" + (i + 1) + ": Not quite. " + q.explain);
      }
    });

    mcqPassed = correct >= Math.ceil(data.mcqs.length * 0.67);
    el.mcqFeedback.innerHTML = "<strong>Score: " + correct + "/" + data.mcqs.length + "</strong><br>" + lines.join("<br>");

    if (mcqPassed) {
      el.finalBtn.disabled = false;
      el.finalResult.textContent = "Final section unlocked. Fill out the tax field below.";
      el.finalResult.className = "result success";
    } else {
      el.finalBtn.disabled = true;
      el.finalResult.textContent = "You need at least 67% on MCQs to unlock the final section fill.";
      el.finalResult.className = "result warn";
    }
  });

  const normalize = (v) => String(v || "").trim().toLowerCase().replace(/\$/g, "").replace(/,/g, "").replace(/\s+/g, " ");

  el.finalBtn.addEventListener("click", () => {
    if (!mcqPassed) {
      el.finalResult.textContent = "Complete MCQs first.";
      el.finalResult.className = "result warn";
      return;
    }

    const attempt = normalize(el.finalInput.value);
    const acceptable = data.final.answers.map(normalize);

    if (acceptable.includes(attempt)) {
      el.finalResult.textContent = "Section complete. Nice work, this field is correct.";
      el.finalResult.className = "result success";
    } else {
      el.finalResult.textContent = "Almost there. Expected answer hint: " + data.final.hint;
      el.finalResult.className = "result warn";
    }
  });
})();
