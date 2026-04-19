const fs = require('fs');
const path = require('path');

const outDir = process.cwd();

const css = `:root {
  --bg-deep: #101820;
  --bg-mid: #1f2a44;
  --panel: #162033;
  --panel-hi: #22324f;
  --pixel-green: #5ff26e;
  --pixel-mint: #acf39d;
  --pixel-yellow: #ffd447;
  --pixel-cyan: #39d5ff;
  --pixel-orange: #ff9153;
  --pixel-red: #ff5f6d;
  --ink: #f5f7ff;
  --muted: #b8c2dd;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  min-height: 100vh;
  background:
    radial-gradient(circle at 20% 10%, #2f4d7a 0%, transparent 36%),
    radial-gradient(circle at 80% 30%, #1f9f9f 0%, transparent 31%),
    linear-gradient(180deg, var(--bg-mid) 0%, var(--bg-deep) 100%);
  color: var(--ink);
  font-family: 'Press Start 2P', cursive;
  letter-spacing: 0.4px;
  overflow-x: hidden;
}

.scanlines {
  position: fixed;
  inset: 0;
  pointer-events: none;
  opacity: 0.11;
  background-image: linear-gradient(to bottom, transparent 50%, rgba(255, 255, 255, 0.12) 50%);
  background-size: 100% 4px;
  z-index: 2;
}

.page {
  max-width: 1040px;
  margin: 0 auto;
  padding: 22px 16px 48px;
  position: relative;
  z-index: 3;
}

.pixel-panel {
  border: 4px solid #000;
  box-shadow: 0 8px 0 #000, 0 0 0 4px var(--panel-hi) inset;
  background: var(--panel);
}

.topbar {
  padding: 14px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}

.brand {
  font-family: "Press Start 2P", cursive;
  color: var(--pixel-green);
  font-size: clamp(0.72rem, 2.1vw, 0.95rem);
  line-height: 1.5;
}

.nav-links {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.pixel-link {
  text-decoration: none;
  color: #000;
  font-family: "Press Start 2P", cursive;
  font-size: 0.5rem;
  border: 3px solid #000;
  box-shadow: 0 4px 0 #000;
  background: var(--pixel-yellow);
  padding: 8px;
}

.pixel-link.alt {
  background: var(--pixel-cyan);
}

.main {
  padding: 16px;
}

.hero-card {
  border: 4px solid #000;
  background: linear-gradient(180deg, #2a3f62 0%, #1f2f49 100%);
  box-shadow: 0 6px 0 #000;
  padding: 16px;
  margin-bottom: 14px;
}

.track {
  font-family: "Press Start 2P", cursive;
  color: var(--pixel-yellow);
  font-size: 0.64rem;
  line-height: 1.6;
  margin-bottom: 8px;
}

.hero-title {
  font-family: "Press Start 2P", cursive;
  font-size: clamp(0.65rem, 2vw, 0.88rem);
  line-height: 1.7;
  margin-bottom: 10px;
}

.hero-intro {
  color: var(--muted);
  font-size: 1.3rem;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 14px;
}

.card {
  border: 4px solid #000;
  box-shadow: 0 6px 0 #000;
  background: #22324f;
  padding: 14px;
}

.card h2 {
  font-family: "Press Start 2P", cursive;
  font-size: 0.6rem;
  line-height: 1.7;
  margin-bottom: 10px;
  color: var(--pixel-mint);
}

.mcq-item {
  border: 3px solid #000;
  box-shadow: 0 4px 0 #000;
  background: #1a2740;
  padding: 10px;
  margin-bottom: 10px;
}

.mcq-q {
  font-size: 1.25rem;
  color: var(--ink);
  margin-bottom: 8px;
}

.option {
  display: block;
  border: 2px solid #000;
  background: #355383;
  margin-top: 6px;
  padding: 7px;
  cursor: pointer;
  font-size: 1.2rem;
}

.option input {
  margin-right: 7px;
}

.btn {
  border: 3px solid #000;
  box-shadow: 0 4px 0 #000;
  background: var(--pixel-orange);
  color: #000;
  font-family: "Press Start 2P", cursive;
  font-size: 0.5rem;
  padding: 10px;
  cursor: pointer;
}

.btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.feedback {
  margin-top: 10px;
  font-size: 1.18rem;
  color: var(--muted);
}

.feedback strong {
  color: var(--pixel-green);
}

.final-wrap {
  display: grid;
  gap: 8px;
}

.final-wrap label {
  font-size: 1.2rem;
}

.final-wrap input {
  width: 100%;
  border: 3px solid #000;
  box-shadow: 0 4px 0 #000;
  background: #eaf0ff;
  color: #111827;
  font-family: 'Press Start 2P', cursive;
  font-size: 1.35rem;
  padding: 8px;
}

.result {
  min-height: 30px;
  color: var(--muted);
  font-size: 1.2rem;
}

.result.success {
  color: var(--pixel-green);
}

.result.warn {
  color: var(--pixel-yellow);
}

.foot {
  margin-top: 14px;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

@media (max-width: 720px) {
  .hero-intro,
  .mcq-q,
  .option,
  .feedback,
  .final-wrap label,
  .final-wrap input,
  .result {
    font-size: 1.1rem;
  }
}
`;

const js = `(function () {
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

  const normalize = (v) => String(v || "").trim().toLowerCase().replace(/\\$/g, "").replace(/,/g, "").replace(/\\s+/g, " ");

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
`;

const levels = [
  { file: 'w2-level-1.html', track: 'W-2 Employees', level: 'Level 1', title: 'W-2 Box 1: Taxable Wages', intro: 'Box 1 on Form W-2 shows your taxable federal wages after certain pre-tax reductions. This number is usually lower than gross pay if you contributed to pre-tax benefits.', mcqs: [ { q: 'What does Box 1 primarily represent?', options: ['Taxable federal wages', 'State refund amount', 'Total tax owed'], answer: 0, explain: 'Box 1 is taxable wages for federal income tax.' }, { q: 'Why might Box 1 be less than your gross salary?', options: ['Pre-tax deductions reduce taxable wages', 'A payroll error always occurred', 'Because of federal credits'], answer: 0, explain: 'Pre-tax benefits can reduce Box 1 amount.' }, { q: 'Which document section would use Box 1?', options: ['Income section', 'Dependents section', 'Signature line'], answer: 0, explain: 'Wages feed into your income section.' } ], final: { prompt: 'Fill in the value for taxable wages from W-2 Box 1.', label: 'Enter Box 1 taxable wages:', answers: ['$18400', '18400', '18,400'], hint: 'Use 18,400 for this lesson sample.' } },
  { file: 'w2-level-2.html', track: 'W-2 Employees', level: 'Level 2', title: 'W-2 Box 2: Federal Withholding', intro: 'Box 2 reports federal income tax already withheld from your paychecks. It is a payment toward your tax bill, not extra income.', mcqs: [ { q: 'Box 2 is best described as:', options: ['A payment already made to IRS', 'Your yearly bonus amount', 'A tax credit'], answer: 0, explain: 'Withholding is tax prepaid through payroll.' }, { q: 'Higher Box 2 withholding generally means:', options: ['More tax already paid in', 'Higher gross wages automatically', 'No need to file'], answer: 0, explain: 'It reflects prepaid federal tax, not filing exemption.' }, { q: 'Where is Box 2 used in filing?', options: ['Payments/withholding section', 'Deductions list only', 'Address section'], answer: 0, explain: 'Withholding offsets tax owed in payment section.' } ], final: { prompt: 'Enter the federal withholding amount from W-2 Box 2.', label: 'Enter Box 2 withholding:', answers: ['$1550', '1550', '1,550'], hint: 'Use 1,550 for this lesson sample.' } },
  { file: 'w2-level-3.html', track: 'W-2 Employees', level: 'Level 3', title: 'W-2 Box 12: Code D Retirement Deferral', intro: 'Box 12 with Code D usually reports employee 401(k) deferrals. These contributions are often pre-tax for federal income tax and can explain lower Box 1 wages.', mcqs: [ { q: 'Code D in Box 12 usually means:', options: ['401(k) elective deferrals', 'Medical insurance total', 'State tax refund'], answer: 0, explain: 'Code D is commonly traditional 401(k) deferral.' }, { q: 'Do Code D amounts generally increase Box 1 taxable wages?', options: ['No, they often reduce taxable wages', 'Yes, always', 'Only for state return'], answer: 0, explain: 'Traditional deferrals can reduce federal taxable wages.' }, { q: 'Why does this field matter?', options: ['It helps explain taxable wage differences', 'It determines filing status', 'It replaces Social Security number'], answer: 0, explain: 'It clarifies why gross and taxable wages differ.' } ], final: { prompt: 'Record the Code D amount from Box 12 in the retirement info field.', label: 'Enter Box 12 Code D amount:', answers: ['$1200', '1200', '1,200'], hint: 'Use 1,200 for this lesson sample.' } },
  { file: 'w2-level-4.html', track: 'W-2 Employees', level: 'Level 4', title: 'W-2 Box 17: State Income Tax Withheld', intro: 'Box 17 reports state income tax withheld by your employer. This is important when preparing your state return and reconciling payments.', mcqs: [ { q: 'Box 17 applies to which return most directly?', options: ['State return', 'Corporate return', 'Property tax return'], answer: 0, explain: 'Box 17 is state withholding.' }, { q: 'State withholding is:', options: ['Tax already paid to state', 'A deduction expense', 'Federal refund'], answer: 0, explain: 'It is prepaid state tax.' }, { q: 'If Box 17 is blank, you should:', options: ['Verify paystubs/state details', 'Assume state tax is zero forever', 'Skip filing automatically'], answer: 0, explain: 'You should confirm your state tax facts.' } ], final: { prompt: 'Enter the state tax withheld amount from Box 17.', label: 'Enter Box 17 amount:', answers: ['$620', '620', '620.00'], hint: 'Use 620 for this lesson sample.' } },
  { file: 'w2-level-5.html', track: 'W-2 Employees', level: 'Level 5 Boss', title: 'W-2 Summary Checkpoint', intro: 'Before filing, verify that Box 1 wages, Box 2 federal withholding, and state withholding fields were entered correctly. This prevents common refund/balance mistakes.', mcqs: [ { q: 'Best final habit before filing:', options: ['Recheck imported W-2 boxes', 'Delete all withholding fields', 'Change values to round numbers'], answer: 0, explain: 'Verification catches key errors.' }, { q: 'Withholding fields impact:', options: ['Balance due or refund', 'Your SSN', 'Your filing deadline date'], answer: 0, explain: 'Payments directly affect your result.' }, { q: 'W-2 transcription errors can cause:', options: ['IRS/state mismatch notices', 'Automatic filing extension', 'Guaranteed audit'], answer: 0, explain: 'Mismatches may trigger notices.' } ], final: { prompt: 'Final W-2 boss fill: enter combined withholding (federal + state).', label: 'Enter Box 2 + Box 17 total:', answers: ['2170', '$2170', '2,170'], hint: '1,550 + 620 = 2,170 for this sample.' } },
  { file: 'self1099-level-1.html', track: '1099 Self-Employed', level: 'Level 1', title: '1099-NEC Box 1: Nonemployee Compensation', intro: 'Form 1099-NEC Box 1 reports payments made to you as an independent contractor. This usually belongs on Schedule C as business income.', mcqs: [ { q: '1099-NEC Box 1 is usually treated as:', options: ['Business income on Schedule C', 'Tax withholding', 'Interest income'], answer: 0, explain: 'Nonemployee compensation is business income.' }, { q: 'Who commonly receives 1099-NEC?', options: ['Freelancers/contractors', 'Only W-2 employees', 'Retirees only'], answer: 0, explain: 'Contract workers typically receive it.' }, { q: 'Missing one 1099-NEC can cause:', options: ['Income mismatch notices', 'Lower audit risk automatically', 'No issue if under 100k'], answer: 0, explain: 'Reported payer income should be included.' } ], final: { prompt: 'Enter total nonemployee compensation from 1099-NEC Box 1.', label: 'Enter Box 1 amount:', answers: ['$9600', '9600', '9,600'], hint: 'Use 9,600 for this lesson sample.' } },
  { file: 'self1099-level-2.html', track: '1099 Self-Employed', level: 'Level 2', title: 'Schedule C Expenses: Ordinary and Necessary', intro: 'Schedule C allows business deductions that are ordinary and necessary for your trade. Personal expenses are not deductible business expenses.', mcqs: [ { q: 'A deductible business expense is generally:', options: ['Ordinary and necessary', 'Any personal purchase', 'Always 100% meals'], answer: 0, explain: 'IRS standard is ordinary and necessary.' }, { q: 'Business and personal expenses should be:', options: ['Separated clearly', 'Combined for convenience', 'Estimated only'], answer: 0, explain: 'Clear separation supports accurate returns.' }, { q: 'Why track receipts?', options: ['Support deduction claims', 'Increase gross income', 'Avoid filing'], answer: 0, explain: 'Records support deduction accuracy.' } ], final: { prompt: 'Enter deductible expenses for this lesson sample.', label: 'Enter total expenses:', answers: ['$2100', '2100', '2,100'], hint: 'Use 2,100 for this lesson sample.' } },
  { file: 'self1099-level-3.html', track: '1099 Self-Employed', level: 'Level 3', title: 'Schedule C Net Profit', intro: 'Schedule C net profit is business income minus deductible expenses. This value flows to other parts of the return and is a core number for self-employed filers.', mcqs: [ { q: 'Net profit formula is:', options: ['Income - expenses', 'Expenses - income', 'Income + withholding'], answer: 0, explain: 'Subtract deductible expenses from business income.' }, { q: 'Net profit usually appears after:', options: ['Summarizing all allowable expenses', 'Entering dependents', 'Calculating state sales tax'], answer: 0, explain: 'You need expense totals first.' }, { q: 'Net profit feeds into:', options: ['Income and SE tax calculations', 'Only mailing address', 'Refund routing number'], answer: 0, explain: 'It drives both income and self-employment tax.' } ], final: { prompt: 'Compute and enter net profit using sample values: income 9,600 and expenses 2,100.', label: 'Enter net profit:', answers: ['$7500', '7500', '7,500'], hint: '9,600 - 2,100 = 7,500.' } },
  { file: 'self1099-level-4.html', track: '1099 Self-Employed', level: 'Level 4', title: 'Schedule SE Basics', intro: 'Self-employment tax generally covers Social Security and Medicare for self-employed income. Estimated calculations often start from Schedule C net profit.', mcqs: [ { q: 'Self-employment tax is primarily for:', options: ['Social Security and Medicare', 'State sales tax', 'Property tax'], answer: 0, explain: 'SE tax funds Social Security/Medicare systems.' }, { q: 'SE tax applies most directly to:', options: ['Net self-employment earnings', 'W-2 withholding only', 'Tax credits only'], answer: 0, explain: 'It is based on self-employment earnings.' }, { q: 'Half of SE tax may be:', options: ['Deductible adjustment', 'Added as penalty', 'Moved to dependents'], answer: 0, explain: 'There is an adjustment for half of SE tax.' } ], final: { prompt: 'Enter the lesson SE tax estimate based on provided worksheet value.', label: 'Enter SE tax estimate:', answers: ['$1148', '1148', '1,148'], hint: 'Use 1,148 from the sample worksheet.' } },
  { file: 'self1099-level-5.html', track: '1099 Self-Employed', level: 'Level 5 Boss', title: 'Estimated Tax Payment Planning', intro: 'Many self-employed filers make quarterly estimated payments. These payments reduce underpayment risk and spread tax liability throughout the year.', mcqs: [ { q: 'Quarterly payments help avoid:', options: ['Underpayment penalties', 'Filing status changes', 'Need for records'], answer: 0, explain: 'They reduce underpayment risk.' }, { q: 'Estimated payments are usually made:', options: ['Four times per year', 'Once every five years', 'Only at tax deadline'], answer: 0, explain: 'Typical schedule is quarterly.' }, { q: 'Payment amount planning should use:', options: ['Income/profit projections', 'Random estimates', 'Neighbor tax totals'], answer: 0, explain: 'Use your own projected earnings and tax.' } ], final: { prompt: 'Enter one quarterly payment amount if annual estimated tax is 4,000.', label: 'Enter one quarter amount:', answers: ['$1000', '1000', '1,000'], hint: '4,000 / 4 = 1,000.' } },
  { file: 'investor1099b-level-1.html', track: '1099-B Investors', level: 'Level 1', title: '1099-B Proceeds and Basis', intro: 'Form 1099-B reports gross proceeds from sales and often includes cost basis data. Gain or loss depends on proceeds minus basis and adjustments.', mcqs: [ { q: 'Basic gain/loss starts with:', options: ['Proceeds - basis', 'Basis - proceeds always gain', 'Withholding - proceeds'], answer: 0, explain: 'Start with proceeds minus basis.' }, { q: 'Cost basis usually means:', options: ['What you paid for investment', 'Current market cap', 'Federal withholding total'], answer: 0, explain: 'Basis is your investment cost (plus adjustments).' }, { q: 'Why check imported basis?', options: ['Missing basis can distort tax', 'It changes filing status', 'It sets refund direct deposit'], answer: 0, explain: 'Incorrect basis leads to wrong gains/losses.' } ], final: { prompt: 'Enter gain/loss for sample sale: proceeds 5,200, basis 4,900.', label: 'Enter gain/loss amount:', answers: ['$300', '300', '+300'], hint: '5,200 - 4,900 = 300 gain.' } },
  { file: 'investor1099b-level-2.html', track: '1099-B Investors', level: 'Level 2', title: 'Holding Period: Short vs Long Term', intro: 'Investment sales are short-term if held 1 year or less and long-term if held more than 1 year. The classification affects tax rates and reporting buckets.', mcqs: [ { q: 'Held 8 months is usually:', options: ['Short-term', 'Long-term', 'Tax-exempt'], answer: 0, explain: '8 months is short-term.' }, { q: 'Held 18 months is usually:', options: ['Long-term', 'Short-term', 'Always wash sale'], answer: 0, explain: 'More than one year is long-term.' }, { q: 'Why separate short/long sales?', options: ['Different rate treatment and forms', 'Required for filing status', 'Only for brokerage fees'], answer: 0, explain: 'Classification affects tax treatment.' } ], final: { prompt: 'Classify a lot held 14 months.', label: 'Enter classification:', answers: ['long-term', 'long term', 'lt'], hint: 'More than 12 months means long-term.' } },
  { file: 'investor1099b-level-3.html', track: '1099-B Investors', level: 'Level 3', title: 'Form 8949 Category Codes', intro: 'Form 8949 uses categories (A-F) based on whether basis was reported to IRS and holding period type. Correct category placement improves reporting accuracy.', mcqs: [ { q: 'Category A generally means:', options: ['Short-term, basis reported', 'Long-term, basis not reported', 'Crypto only'], answer: 0, explain: 'Category A is short-term with basis reported.' }, { q: 'Why does category selection matter?', options: ['It determines where sale is reported', 'It sets your filing status', 'It removes need for basis'], answer: 0, explain: 'Wrong category can misreport transaction type.' }, { q: 'Form 8949 details then roll into:', options: ['Schedule D', 'Schedule C', 'Form W-4'], answer: 0, explain: 'Totals flow to Schedule D.' } ], final: { prompt: 'Enter category for short-term sale with basis reported.', label: 'Enter category letter:', answers: ['A', 'a'], hint: 'Use category A.' } },
  { file: 'investor1099b-level-4.html', track: '1099-B Investors', level: 'Level 4', title: 'Wash Sale Adjustment Basics', intro: 'A wash sale can defer a loss if substantially identical securities are repurchased in the wash window. Brokers may report wash adjustments on 1099-B.', mcqs: [ { q: 'A wash sale generally does what to a loss?', options: ['Defers/disallows current deduction', 'Doubles the loss deduction', 'Creates withholding credit'], answer: 0, explain: 'Loss may be deferred under wash sale rules.' }, { q: 'Wash sale data may appear on:', options: ['1099-B adjustments column', 'W-2 Box 1', 'Schedule E only'], answer: 0, explain: 'Broker statements often include wash adjustments.' }, { q: 'Ignoring wash adjustments can:', options: ['Overstate deductible losses', 'Increase basis always correctly', 'Reduce need for Form 8949'], answer: 0, explain: 'It can misstate allowable loss.' } ], final: { prompt: 'Enter allowed loss if original loss is 600 and wash adjustment is 400 deferred.', label: 'Enter currently allowed loss:', answers: ['$200', '200', '-200'], hint: 'Allowed now is 200 loss.' } },
  { file: 'investor1099b-level-5.html', track: '1099-B Investors', level: 'Level 5 Boss', title: 'Schedule D Net Capital Result', intro: 'Schedule D summarizes short-term and long-term totals from Form 8949. Final net capital gain or loss is used in overall tax calculation.', mcqs: [ { q: 'Schedule D mainly summarizes:', options: ['Capital gains/loss totals', 'W-2 withholding only', 'Dependent credits only'], answer: 0, explain: 'It rolls up capital transaction totals.' }, { q: 'Form 8949 feeds into:', options: ['Schedule D', 'W-9', 'Form 941'], answer: 0, explain: '8949 details flow to Schedule D summary.' }, { q: 'Final net capital result affects:', options: ['Taxable income and tax result', 'Mailing address', 'Filing deadline month'], answer: 0, explain: 'Net gains/losses affect return outcome.' } ], final: { prompt: 'Enter net result if short-term is +300 and long-term is -100.', label: 'Enter net capital result:', answers: ['$200', '200', '+200'], hint: '300 + (-100) = 200 net gain.' } }
];

levels.forEach((level, index) => {
  level.prev = index > 0 ? levels[index - 1].file : '';
  level.next = index < levels.length - 1 ? levels[index + 1].file : '';
});

const pageHtml = (item) => `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${item.track} ${item.level} | TaxQuest</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  <link rel="stylesheet" href="level-base.css" />
</head>
<body>
  <div class="scanlines"></div>
  <div class="page">
    <header class="topbar pixel-panel">
      <div class="brand">TAXQUEST LEVEL MODE</div>
      <nav class="nav-links">
        <a class="pixel-link" href="../roadmap.html">Back to Roadmap</a>
        <a class="pixel-link alt" href="index.html">All Levels</a>
      </nav>
    </header>

    <main class="main pixel-panel">
      <section class="hero-card">
        <p class="track" id="track"></p>
        <h1 class="hero-title" id="levelTitle"></h1>
        <p class="hero-intro" id="intro"></p>
      </section>

      <section class="grid">
        <article class="card">
          <h2>Knowledge Check (2-3 MCQs)</h2>
          <div id="mcqs"></div>
          <button id="checkMcq" class="btn" type="button">Check Multiple Choice</button>
          <p id="mcqFeedback" class="feedback"></p>
        </article>

        <article class="card">
          <h2>Final Section Fill</h2>
          <p class="mcq-q" id="finalPrompt"></p>
          <div class="final-wrap">
            <label id="finalInputLabel" for="finalInput"></label>
            <input id="finalInput" type="text" placeholder="Type your answer..." />
            <button id="checkFinal" class="btn" type="button" disabled>Check Final Answer</button>
            <p id="finalResult" class="result">Complete MCQs first to unlock this section.</p>
          </div>
        </article>
      </section>

      <footer class="foot">
        <a id="prevLink" class="pixel-link alt" href="#">Previous Level</a>
        <a id="nextLink" class="pixel-link" href="#">Next Level</a>
      </footer>
    </main>
  </div>

  <script>window.LEVEL_DATA = ${JSON.stringify(item)};</script>
  <script type="module" src="level-base.js"></script>
</body>
</html>`;

const levelBaseCssPath = path.join(outDir, 'level-base.css');
const levelBaseJsPath = path.join(outDir, 'level-base.js');
if (!fs.existsSync(levelBaseCssPath)) {
  fs.writeFileSync(levelBaseCssPath, css, 'utf8');
}
if (!fs.existsSync(levelBaseJsPath)) {
  fs.writeFileSync(levelBaseJsPath, js, 'utf8');
}
levels.forEach((item) => {
  fs.writeFileSync(path.join(outDir, item.file), pageHtml(item), 'utf8');
});

const listItems = levels.map((l) => `<li><a href="${l.file}">${l.track} - ${l.level}: ${l.title}</a></li>`).join('\n');
const indexHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>TaxQuest Level Index</title>
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap" rel="stylesheet" />
  <style>
    body { background:#101820; color:#f5f7ff; font-family:'Press Start 2P', cursive; margin:0; padding:20px; }
    .wrap { max-width:900px; margin:0 auto; border:4px solid #000; box-shadow:0 8px 0 #000; background:#162033; padding:16px; }
    h1 { font-family:"Press Start 2P", cursive; color:#5ff26e; font-size:0.9rem; line-height:1.7; }
    p { font-size:1.3rem; color:#b8c2dd; }
    ul { padding-left:18px; }
    li { margin:8px 0; font-size:1.2rem; }
    a { color:#39d5ff; }
    .home { display:inline-block; margin-top:10px; color:#000; background:#ffd447; border:3px solid #000; box-shadow:0 4px 0 #000; padding:8px; text-decoration:none; font-family:"Press Start 2P", cursive; font-size:0.52rem; }
  </style>
</head>
<body>
  <main class="wrap">
    <h1>TaxQuest Level Pages</h1>
    <p>Each level includes an info dump, 2-3 multiple choice questions, and a final section-fill question.</p>
    <ul>${listItems}</ul>
    <a class="home" href="../roadmap.html">Back to Roadmap</a>
  </main>
</body>
</html>`;
const levelIndexPath = path.join(outDir, 'index.html');
if (!fs.existsSync(levelIndexPath)) {
  fs.writeFileSync(levelIndexPath, indexHtml, 'utf8');
}
console.log(`Generated ${levels.length} level pages plus shared assets.`);
