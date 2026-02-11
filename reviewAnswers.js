// Route protection
if (!localStorage.getItem("currentUserEmail")) {
  location.replace("signin.html");
}



// Get exam data
const currentUserEmail = localStorage.getItem("currentUserEmail");
const questions = JSON.parse(localStorage.getItem("examQuestions") || "[]");

if (questions.length === 0) {
  document.querySelector(".container").innerHTML = `
    <div style="text-align: center; color: white; padding: 60px 20px;">
      <div style="font-size: 72px; margin-bottom: 20px;">📝</div>
      <h2>No Exam Data Found</h2>
      <p style="opacity: 0.9; margin: 20px 0;">Please take an exam first to view your answers.</p>
      <a href="start-exam.html" style="display: inline-block; padding: 12px 24px; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; text-decoration: none; border-radius: 30px; margin-top: 20px; font-weight: 600;">Start Exam</a>
    </div>
  `;
} else {
  displayReview();
}

function displayReview() {
  let correctCount = 0;
  let incorrectCount = 0;
  
  const reviewContainer = document.getElementById("questionsReview");
  
  questions.forEach((question, index) => {
    const userAnswer = localStorage.getItem(`question_${currentUserEmail}_${index}`);
    const isCorrect = userAnswer !== null && Number(userAnswer) === question.correctAnswer;
    
    if (isCorrect) {
      correctCount++;
    } else if (userAnswer !== null) {
      incorrectCount++;
    }
    
    const questionItem = document.createElement("div");
    questionItem.className = "question-item";
    
    // Create choices HTML with proper escaping
    let choicesHTML = "";
    question.choices.forEach((choice, choiceIndex) => {
      const isCorrectAnswer = choiceIndex === question.correctAnswer;
      const isUserAnswer = userAnswer !== null && Number(userAnswer) === choiceIndex;
      const isWrongAnswer = isUserAnswer && !isCorrect;
      
      let choiceClass = "choice-item";
      let badgeHTML = "";
      
      // Escape HTML to prevent rendering issues
      const safeChoice = escapeHtml(choice);
      
      if (isCorrectAnswer) {
        choiceClass += " correct-answer";
        badgeHTML = '<span class="choice-badge correct">✓ Correct Answer</span>';
      }
      
      if (isUserAnswer) {
        if (isWrongAnswer) {
          choiceClass += " wrong-answer";
          badgeHTML = '<span class="choice-badge wrong">✗ Your Answer (Wrong)</span>';
        } else {
          badgeHTML = '<span class="choice-badge your">✓ Your Answer (Correct)</span>';
        }
      }
      
      choicesHTML += `
        <div class="${choiceClass}">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <span>${safeChoice}</span>
            ${badgeHTML}
          </div>
        </div>
      `;
    });
    
    const statusClass = isCorrect ? "correct" : (userAnswer !== null ? "incorrect" : "unanswered");
    const statusIcon = isCorrect ? "✓" : (userAnswer !== null ? "✗" : "⊘");
    const statusText = isCorrect ? "Correct" : (userAnswer !== null ? "Incorrect" : "Not Answered");
    
    // Escape question text
    const safeQuestion = escapeHtml(question.question);
    
    questionItem.innerHTML = `
      <div class="question-header">
        <div class="question-number">
          <i class="fa-solid fa-circle-question"></i>
          Question ${index + 1}
        </div>
        <div class="question-status ${statusClass}">
          ${statusIcon} ${statusText}
        </div>
      </div>
      <div class="question-text">${safeQuestion}</div>
      <div class="choices-list">
        ${choicesHTML}
      </div>
    `;
    
    reviewContainer.appendChild(questionItem);
  });
  
  // Update summary stats
  document.getElementById("correctCount").textContent = correctCount;
  document.getElementById("incorrectCount").textContent = incorrectCount;
  document.getElementById("totalQuestions").textContent = questions.length;
  
  // Animate counters
  animateCounter("correctCount", correctCount);
  animateCounter("incorrectCount", incorrectCount);
  animateCounter("totalQuestions", questions.length);
}

// Helper function to escape HTML special characters
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function animateCounter(elementId, targetValue) {
  const element = document.getElementById(elementId);
  let currentValue = 0;
  const increment = Math.ceil(targetValue / 30);
  const duration = 1000;
  const stepTime = duration / (targetValue / increment);
  
  const timer = setInterval(() => {
    currentValue += increment;
    if (currentValue >= targetValue) {
      currentValue = targetValue;
      clearInterval(timer);
    }
    element.textContent = currentValue;
  }, stepTime);
}
