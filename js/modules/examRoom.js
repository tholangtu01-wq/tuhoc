/**
 * HSK & Academic Chinese Exam Room (Phòng thi CBT Trực tuyến)
 * Bộ đếm giờ thực, chấm điểm tự động, giải thích chi tiết đáp án & Cấp chứng nhận kết quả
 */

export class ExamRoom {
  constructor(examData, onCompleteCallback) {
    this.exam = examData;
    this.onComplete = onCompleteCallback;
    this.answers = {}; // { questionId: selectedIndex / orderArray }
    this.timeRemaining = examData.durationMinutes * 60; // giây
    this.timerInterval = null;
    this.isSubmitted = false;
  }

  start(onTickCallback) {
    this.timerInterval = setInterval(() => {
      this.timeRemaining -= 1;
      if (onTickCallback) onTickCallback(this.timeRemaining);

      if (this.timeRemaining <= 0) {
        this.submit();
      }
    }, 1000);
  }

  stop() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  setAnswer(questionId, answer) {
    if (this.isSubmitted) return;
    this.answers[questionId] = answer;
  }

  formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  }

  submit() {
    if (this.isSubmitted) return;
    this.isSubmitted = true;
    this.stop();

    let correctCount = 0;
    const totalQuestions = this.exam.questions.length;
    const details = [];

    for (const q of this.exam.questions) {
      let isCorrect = false;
      const userAns = this.answers[q.id];

      if (q.type === "choice") {
        if (typeof userAns === "number" && q.options[userAns]?.correct) {
          isCorrect = true;
        }
      } else if (q.type === "reorder") {
        if (Array.isArray(userAns) && JSON.stringify(userAns) === JSON.stringify(q.correctOrder)) {
          isCorrect = true;
        }
      }

      if (isCorrect) correctCount += 1;

      details.push({
        question: q,
        userAns,
        isCorrect,
        explanation: q.explanation
      });
    }

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = scorePercent >= this.exam.passScorePercent;
    const certCode = "HSK-" + Math.random().toString(36).substring(2, 8).toUpperCase() + "-" + Date.now().toString(36).toUpperCase();

    const result = {
      examTitle: this.exam.title,
      level: this.exam.level,
      totalQuestions,
      correctCount,
      scorePercent,
      isPassed,
      certCode,
      timestamp: new Date().toISOString(),
      details
    };

    if (this.onComplete) {
      this.onComplete(result);
    }

    return result;
  }
}
