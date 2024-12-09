const API_BASE_URL = 'https://opentdb.com/api.php?amount=10';

let questions = [];
let currentQuestionIndex = 0;
let score = 0;
let selectedAnswers = []; // Store selected answers for each question

// DOM Elements
const categorySelect = document.getElementById('category');
const difficultySelect = document.getElementById('difficulty');
const startButton = document.getElementById('start-btn');
const questionContainer = document.getElementById('ques-container');
const questionElement = document.getElementById('ques');
const questionNumber = document.getElementById('ques-number');
const answerButtonsElement = document.getElementById('answer-btns');
const prevButton = document.getElementById('prev-btn');
const nextButton = document.getElementById('next-btn');
const submitButton = document.getElementById('submit-btn');
const navigationButtons = document.getElementById('navigation-buttons');
const scoreContainer = document.getElementById('score-container');
const selectionContainer = document.getElementById('ques-selection-container');

// Hide navigation buttons initially
navigationButtons.classList.add('hide');

// Fetch questions based on user preferences
async function fetchQuestions() {
    const category = categorySelect.value;
    const difficulty = difficultySelect.value;
    const url = `${API_BASE_URL}&category=${category}&difficulty=${difficulty}&type=multiple`;

    try {
        const response = await fetch(url);
        const data = await response.json();
        questions = data.results;
        startQuiz();
    } catch (error) {
        console.error("Error fetching quiz questions:", error);
    }
}

// Initialize the quiz
function startQuiz() {
    startButton.classList.add('hide');
    selectionContainer.classList.add('hide');
    questionContainer.classList.remove('hide');
    navigationButtons.classList.remove('hide');
    submitButton.classList.add('hide');
    scoreContainer.classList.add('hide');
    currentQuestionIndex = 0;
    score = 0;
    selectedAnswers = []; // Clear the selected answers array
    showQuestion();
}

// Show a question
function showQuestion() {
    resetState();
    const questionData = questions[currentQuestionIndex];
    questionNumber.innerText = `Question: ${currentQuestionIndex + 1} of ${questions.length}`;
    questionElement.innerHTML = decodeHTML(questionData.question);

    const answers = [...questionData.incorrect_answers, questionData.correct_answer];
    shuffleArray(answers);

    answers.forEach((answer, index) => {
        const button = document.createElement('button');
        button.innerText = decodeHTML(answer);
        button.classList.add('btn');
        button.addEventListener('click', () => selectAnswer(button, answer === questionData.correct_answer, index));
        answerButtonsElement.appendChild(button);

        // If there is a previously selected answer, mark it
        if (selectedAnswers[currentQuestionIndex] !== undefined && selectedAnswers[currentQuestionIndex] === index) {
            button.classList.add('selected');
            if (answer === questionData.correct_answer) {
                button.classList.add('correct');
            } else if (answer !== questionData.correct_answer) {
                button.classList.add('wrong');
            }
        }
    });

    prevButton.classList.toggle('disabled', currentQuestionIndex === 0);
    nextButton.classList.toggle('disabled', currentQuestionIndex === questions.length - 1);
    submitButton.classList.toggle('hide', currentQuestionIndex !== questions.length - 1);
    navigationButtons.classList.toggle('hide', currentQuestionIndex === questions.length - 1);
}

// Reset state for next question
function resetState() {
    while (answerButtonsElement.firstChild) {
        answerButtonsElement.removeChild(answerButtonsElement.firstChild);
    }
}

// Handle answer selection
function selectAnswer(button, isCorrect, index) {
    // Store the selected answer index
    selectedAnswers[currentQuestionIndex] = index;

    if (isCorrect) {
        score++;
        button.classList.add('correct');
    } else {
        button.classList.add('wrong');
        // Highlight correct answer with green if user selected wrong answer
        const correctAnswer = questions[currentQuestionIndex].correct_answer;
        Array.from(answerButtonsElement.children).forEach((btn, btnIndex) => {
            const answerText = decodeHTML(questions[currentQuestionIndex].incorrect_answers[btnIndex] || correctAnswer);
            if (answerText === correctAnswer) {
                btn.classList.add('thisCorrect');
            }
        });
    }

    Array.from(answerButtonsElement.children).forEach(btn => btn.disabled = true); // Disable all buttons
}

// Show the previous question
function showPreviousQuestion() {
    if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        showQuestion();
    }
}

// Show the next question
function showNextQuestion() {
    if (currentQuestionIndex < questions.length - 1) {
        currentQuestionIndex++;
        showQuestion();
    }
}

// Display the final score
function showScore() {
    questionContainer.classList.add('hide');
    navigationButtons.classList.add('hide');
    submitButton.classList.add('hide');
    scoreContainer.classList.remove('hide');
    scoreContainer.innerText = `⭐ You scored ${score} out of ${questions.length} ⭐`;
    startButton.innerText = 'Restart';
    startButton.classList.remove('hide');
    selectionContainer.classList.remove('hide');
}

// Utility functions
function decodeHTML(html) {
    const txt = document.createElement("textarea");
    txt.innerHTML = html;
    return txt.value;
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// Event Listeners
startButton.addEventListener('click', fetchQuestions);
prevButton.addEventListener('click', showPreviousQuestion);
nextButton.addEventListener('click', showNextQuestion);
submitButton.addEventListener('click', showScore);
