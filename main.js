let questions = [];
let currentIndex = 0;
let score = 0;
let userAnswers = [];
let timer;
let username = "";



function shuffleArray(array) {
  return array.sort(() => Math.random() - 0.5);
}


function startQuiz() {
 username = document.getElementById("username").value.trim();
  if (!username) return alert("Please enter your name!");


  fetch("questions.json")
    .then(res => res.json())
    .then(data => {
      // Shuffle question order
      questions = shuffleArray(data.map(q => {
        // Clone and shuffle options
        const options = [...q.options];
        const correctAnswerText = options[q.answer];
        const shuffledOptions = shuffleArray(options);

        return {
          question: q.question,
          options: shuffledOptions,
          correctAnswer: correctAnswerText
        };
      }));

      document.getElementById("start-screen").classList.add("d-none");
      document.getElementById("quiz-screen").classList.remove("d-none");
      showQuestion();
    });
}









function showQuestion() {
  resetTimer();

  const q = questions[currentIndex];
  document.getElementById("question").innerText = `Q${currentIndex + 1}: ${q.question}`;
  
  const optionsDiv = document.getElementById("options");
  optionsDiv.innerHTML = "";
  q.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "list-group-item list-group-item-action";
    btn.innerText = opt;
    btn.onclick = () => selectAnswer(i);
    optionsDiv.appendChild(btn);
  });

  startTimer();
}

function selectAnswer(selectedIndex) {
  clearInterval(timer);

  const currentQ = questions[currentIndex];
  const selectedText = currentQ.options[selectedIndex];
  const isCorrect = selectedText === currentQ.correctAnswer;

  userAnswers.push({
    ...currentQ,
    selected: selectedText,
    isCorrect
  });

  if (isCorrect) score++;

  currentIndex++;
  if (currentIndex < questions.length) {
    showQuestion();
  } else {
    showScore();
  }
}


function startTimer() {
  let time = 30;
  document.getElementById("timer").innerText = time;

  timer = setInterval(() => {
    time--;
    document.getElementById("timer").innerText = time;
    if (time === 0) {
      clearInterval(timer);
      selectAnswer(-1); // no answer selected
    }
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  document.getElementById("timer").innerText = "30";
}

function showScore() {

  document.getElementById("quiz-screen").classList.add("d-none");
  document.getElementById("result-screen").classList.remove("d-none");
  document.getElementById("user").innerText = username;
  document.getElementById("score").innerText = `${score} out of ${questions.length}`;

  if (userAnswers.length === questions.length){
    const newUser = { name: username, time: Date.now() };
    let users = JSON.parse(localStorage.getItem("quizUsers")) || [];
    users.push(newUser);
    if (users.length > 5) users = users.slice(-5); // Keep last 5
    localStorage.setItem("quizUsers", JSON.stringify(users));
  }



}




function showResults() {
  document.getElementById("result-screen").classList.add("d-none");
  document.getElementById("review-screen").classList.remove("d-none");

  const reviewDiv = document.getElementById("review-list");
  reviewDiv.innerHTML = "";

  userAnswers.forEach((q, i) => {
    const div = document.createElement("div");
    div.className = "mb-3 border p-3 rounded";

   
    const selectedText = q.selected || "Not Answered";

    div.innerHTML = `
      <strong>Q${i + 1}:</strong> ${q.question}<br>
      <strong>Your Answer:</strong> ${selectedText} <br>
      <strong>Correct Answer:</strong> ${q.correctAnswer} <br>
      <span class="${q.isCorrect ? 'text-success' : 'text-danger'}">
        ${q.isCorrect ? 'Correct ✅' : 'Wrong ❌'}
      </span>
    `;
    reviewDiv.appendChild(div);
  });
}






// Show Last 5 Users (7-day expiry)
window.addEventListener("DOMContentLoaded", () => {
  const userList = document.getElementById("user-list");
  let users = JSON.parse(localStorage.getItem("quizUsers")) || [];

  const now = Date.now();
  const OneDays = 2 * 60 * 1000;
  // Remove old entries
  users = users.filter(u => now - u.time <= OneDays);
  localStorage.setItem("quizUsers", JSON.stringify(users));

  if (userList) {
    userList.innerHTML = "";
    if (users.length === 0) {
      userList.innerHTML = `<li class="list-group-item text-muted">No users yet.</li>`;
    } else {
      users.slice().reverse().forEach(u => {
        const li = document.createElement("li");
        li.className = "list-group-item";
        const date = new Date(u.time).toLocaleDateString();
        li.textContent = `${u.name} (Attempted on ${date})`;
        userList.appendChild(li);
      });
    }
  }
});


