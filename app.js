let currentLang = "uk";
let currentTab = "learn";
let currentExercise = 0;
let answers = {};
let correctCount = 0;

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
        if (currentExercise > 0) {
            currentExercise--;
            renderExercise();
        }
    });
    $("#btn-next").addEventListener("click", () => {
        if (currentExercise < EXERCISES.length - 1) {
            currentExercise++;
            renderExercise();
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
    renderExercise();
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
    $("#exercise-counter").textContent = `${currentExercise + 1} / ${EXERCISES.length}`;
    $("#btn-prev").disabled = currentExercise === 0;
    $("#btn-next").disabled = currentExercise === EXERCISES.length - 1;

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
