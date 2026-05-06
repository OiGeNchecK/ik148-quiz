let currentLang = "uk";
let currentTab = "learn";
let currentExercise = 0;
let answers = {};
let correctCount = 0;
let showingResults = false;

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function init() {
    setupLangButtons();
    setupTabs();
    setupModal();
    setupNav();
    render();
}

function setupLangButtons() {
    $$(".lang-selector button").forEach((btn) => {
        btn.addEventListener("click", () => {
            $$(".lang-selector button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentLang = btn.dataset.lang;
            render();
        });
    });
}

function setupTabs() {
    $$(".tabs button").forEach((btn) => {
        btn.addEventListener("click", () => {
            $$(".tabs button").forEach((b) => b.classList.remove("active"));
            btn.classList.add("active");
            currentTab = btn.dataset.tab;
            $$(".tab-content").forEach((s) => s.classList.remove("active"));
            $(`#${currentTab}`).classList.add("active");
            showingResults = false;
            render();
        });
    });
}

function setupModal() {
    $("#modal-close").addEventListener("click", closeModal);
    $("#explanation-modal").addEventListener("click", (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

function setupNav() {
    $("#btn-prev").addEventListener("click", () => {
        if (showingResults) {
            showingResults = false;
            currentExercise = EXERCISES.length - 1;
            renderExercise();
            return;
        }
        if (currentExercise > 0) {
            currentExercise--;
            renderExercise();
        }
    });
    $("#btn-next").addEventListener("click", () => {
        if (currentExercise < EXERCISES.length - 1) {
            currentExercise++;
            renderExercise();
        } else {
            showingResults = true;
            renderResults();
        }
    });
}

function closeModal() {
    $("#explanation-modal").classList.remove("open");
}

function openModal(exercise) {
    const s = UI_STRINGS[currentLang];
    $("#modal-title").textContent = s.modalTitle;
    const correctAnswer = exercise.options[exercise.correct];
    $("#modal-body").innerHTML = `
        <div class="correct-answer">✓ ${correctAnswer}</div>
        <div class="explanation-text">${exercise.explanation[currentLang]}</div>
    `;
    $("#explanation-modal").classList.add("open");
}

function render() {
    const s = UI_STRINGS[currentLang];
    $("#tab-learn").textContent = s.tabLearn;
    $("#tab-practice").textContent = s.tabPractice;
    $("#tab-prepositions").textContent = s.tabPrepositions;

    renderLearn();
    if (showingResults) {
        renderResults();
    } else {
        renderExercise();
    }
    renderPrepositions();
}

function renderLearn() {
    const s = UI_STRINGS[currentLang];
    const lang = currentLang;

    const examplesHtml = LEARN_EXAMPLES.map((ex) => `
        <div class="example">
            ${ex.de}
            <div class="translation">${ex.translation[lang]}</div>
        </div>
    `).join("");

    $("#learn").innerHTML = `
        <div class="grammar-card">
            <h2>${s.learnTitle}</h2>
            <p>${s.learnIntro}</p>

            <h3>${s.articleTableTitle}</h3>
            <div class="table-wrap">
                <table class="grammar-table">
                    <thead><tr>${ARTICLE_TABLE.headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
                    <tbody>
                        ${ARTICLE_TABLE.rows.map((row, i) => `
                            <tr>${row.map((cell, j) => `<td${i === 1 && j > 0 ? ' class="highlight"' : ""}>${cell}</td>`).join("")}</tr>
                        `).join("")}
                    </tbody>
                </table>
            </div>

            <h3>${s.nounEndingsTitle}</h3>
            <p>${s.nounEndingsText}</p>
            <p>${s.nounEndingsEs}</p>

            <h3>${s.nWeakTitle}</h3>
            <p>${s.nWeakText}</p>

            <h3>${s.examplesTitle}</h3>
            ${examplesHtml}
        </div>
    `;
}

function renderExercise() {
    const s = UI_STRINGS[currentLang];
    const ex = EXERCISES[currentExercise];
    const answer = answers[currentExercise];
    const answered = answer !== undefined;

    correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
    $("#score").textContent = `${s.score}: ${correctCount} / ${EXERCISES.length}`;
    $("#progress-fill").style.width = `${(Object.keys(answers).length / EXERCISES.length) * 100}%`;

    const isLast = currentExercise === EXERCISES.length - 1;
    $("#exercise-counter").textContent = `${currentExercise + 1} / ${EXERCISES.length}`;
    $("#btn-prev").disabled = currentExercise === 0;
    $("#btn-next").textContent = isLast ? "📊" : "→";
    $("#btn-next").disabled = false;

    const parts = ex.sentence.split("___");
    let blankClass = "";
    let blankText = "___";
    if (answered) {
        blankClass = answer.isCorrect ? "correct" : "wrong";
        blankText = answer.selected;
    }

    const optionsHtml = ex.options.map((opt, i) => {
        let cls = "";
        if (answered) {
            if (i === answer.selectedIndex && answer.isCorrect) cls = "selected-correct";
            else if (i === answer.selectedIndex && !answer.isCorrect) cls = "selected-wrong";
            if (i === ex.correct && !answer.isCorrect) cls = "show-correct";
        }
        return `<button class="${cls}" ${answered ? "disabled" : ""} data-index="${i}">${opt}</button>`;
    }).join("");

    $("#exercise-area").innerHTML = `
        <div class="exercise-card">
            <div class="question-label">${s.questionLabel}</div>
            <div class="sentence">${parts[0]}<span class="blank ${blankClass}">${blankText}</span>${parts[1] || ""}</div>
            <div class="options">${optionsHtml}</div>
            <button class="explain-btn ${answered ? "visible" : ""}" id="explain-btn">${s.explain}</button>
        </div>
    `;

    if (!answered) {
        $$("#exercise-area .options button").forEach((btn) => {
            btn.addEventListener("click", () => handleAnswer(btn));
        });
    }

    const explainBtn = $("#explain-btn");
    if (explainBtn) {
        explainBtn.addEventListener("click", () => openModal(ex));
    }
}

function handleAnswer(btn) {
    const index = parseInt(btn.dataset.index);
    const ex = EXERCISES[currentExercise];
    const isCorrect = index === ex.correct;

    answers[currentExercise] = {
        selectedIndex: index,
        selected: ex.options[index],
        isCorrect,
    };

    renderExercise();
}

function renderResults() {
    const s = UI_STRINGS[currentLang];
    correctCount = Object.values(answers).filter((a) => a.isCorrect).length;
    const total = EXERCISES.length;
    const answered = Object.keys(answers).length;
    const pct = Math.round((correctCount / total) * 100);

    let verdict = s.resultsTryAgain;
    if (pct >= 90) verdict = s.resultsExcellent;
    else if (pct >= 60) verdict = s.resultsGood;

    const rowsHtml = EXERCISES.map((ex, i) => {
        const ans = answers[i];
        const correctOpt = ex.options[ex.correct];
        let statusIcon, rowClass, userAnswerHtml;

        if (!ans) {
            statusIcon = "⬜";
            rowClass = "result-skipped";
            userAnswerHtml = `<span class="result-skipped-label">${s.resultsSkipped}</span>`;
        } else if (ans.isCorrect) {
            statusIcon = "✅";
            rowClass = "result-correct";
            userAnswerHtml = `<span class="result-user-correct">${ans.selected}</span>`;
        } else {
            statusIcon = "❌";
            rowClass = "result-wrong";
            userAnswerHtml = `<span class="result-user-wrong">${ans.selected}</span>`;
        }

        const sentenceDisplay = ex.sentence.replace("___", `<b>${correctOpt}</b>`);

        return `
            <div class="result-row ${rowClass}">
                <div class="result-row-header">
                    <span class="result-num">${i + 1}</span>
                    <span class="result-icon">${statusIcon}</span>
                    <span class="result-sentence">${sentenceDisplay}</span>
                </div>
                ${!ans || !ans.isCorrect ? `
                <div class="result-row-detail">
                    ${ans ? `<span class="result-label">${s.resultsYourAnswer}</span> ${userAnswerHtml}` : userAnswerHtml}
                    ${ans && !ans.isCorrect ? `<span class="result-label">${s.resultsCorrectAnswer}</span> <span class="result-correct-val">${correctOpt}</span>` : ""}
                </div>` : ""}
            </div>
        `;
    }).join("");

    $("#score").textContent = `${s.score}: ${correctCount} / ${total}`;
    $("#progress-fill").style.width = "100%";
    $("#exercise-counter").textContent = `${answered} / ${total}`;
    $("#btn-prev").disabled = false;
    $("#btn-next").disabled = true;
    $("#btn-next").textContent = "→";

    $("#exercise-area").innerHTML = `
        <div class="results-card">
            <h2 class="results-title">${s.resultsTitle}</h2>
            <div class="results-score-big">
                <div class="results-circle">
                    <span class="results-pct">${pct}%</span>
                    <span class="results-fraction">${correctCount} ${s.resultsOf} ${total}</span>
                </div>
                <div class="results-verdict">${verdict}</div>
            </div>
            <div class="results-actions">
                <button class="results-btn restart-btn" id="results-restart">${s.resultsRestartBtn}</button>
            </div>
            <div class="results-list">${rowsHtml}</div>
        </div>
    `;

    $("#results-restart").addEventListener("click", () => {
        answers = {};
        correctCount = 0;
        currentExercise = 0;
        showingResults = false;
        renderExercise();
    });
}

function renderPrepositions() {
    const s = UI_STRINGS[currentLang];
    const lang = currentLang;

    const cardsHtml = PREPOSITIONS.map((prep) => {
        const examplesHtml = prep.examples.map((ex) => `
            <div class="example">
                ${ex.de}
                <div class="translation">${ex.tr[lang]}</div>
            </div>
        `).join("");

        return `
            <div class="prep-card">
                <h3>${prep.word}</h3>
                <div class="prep-meaning">${prep.meaning[lang]}</div>
                <div class="prep-examples">${examplesHtml}</div>
            </div>
        `;
    }).join("");

    $("#prepositions").innerHTML = `
        <div class="grammar-card">
            <h2>${s.prepTitle}</h2>
            <p style="margin-bottom:16px">${s.prepIntro}</p>
        </div>
        ${cardsHtml}
    `;
}

document.addEventListener("DOMContentLoaded", init);
