/**
 * Hanzii Pro — Main Application Controller
 * Điều khiển toàn bộ vòng đời ứng dụng, các tab học tập, âm thanh, luyện viết và thi thử HSK
 */

import { VOCABULARY_DATA, RADICALS_DATA } from "./data/vocabulary.js";
import { EXAM_SUITES } from "./data/exams.js";
import { SRSEngine } from "./modules/srs.js";
import { HanziWritingCanvas } from "./modules/writingCanvas.js";
import { SpeechEngine } from "./modules/speechEngine.js";
import { ExamRoom } from "./modules/examRoom.js";
import { GamificationManager } from "./modules/gamification.js";

class AppController {
  constructor() {
    this.srs = new SRSEngine(VOCABULARY_DATA);
    this.speech = new SpeechEngine();
    this.gamification = new GamificationManager();
    this.activeExam = null;
    this.currentDueCards = [];
    this.currentCardIndex = 0;
    this.speechTargetIndex = 0;

    this.initDOM();
    this.initTabs();
    this.initTheme();
    this.initVocabTab();
    this.initSRSTab();
    this.initWritingTab();
    this.initSpeechTab();
    this.initExamTab();
    this.initGamificationTab();
    this.initPWA();
    this.updateGlobalBadges();
  }

  showToast(message) {
    const container = document.getElementById("toastContainer");
    if (!container) return;
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      setTimeout(() => toast.remove(), 300);
    }, 2800);
  }

  initDOM() {
    // Tốc độ đọc
    const speechRateSelect = document.getElementById("speechRateSelect");
    if (speechRateSelect) {
      speechRateSelect.addEventListener("change", (e) => {
        this.speech.setSpeechRate(e.target.value);
        this.showToast(`Đã đổi tốc độ giọng đọc: ${e.target.value}x`);
      });
    }

    // Nút chuyển sang tab SRS từ banner
    const btnStartSRS = document.getElementById("btnStartSRSFromVocab");
    if (btnStartSRS) {
      btnStartSRS.addEventListener("click", () => this.switchTab("tabSRS"));
    }
  }

  initTheme() {
    const btn = document.getElementById("btnToggleTheme");
    const currentTheme = localStorage.getItem("hanzii_theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);

    if (btn) {
      btn.addEventListener("click", () => {
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("hanzii_theme", theme);
        this.showToast(`Đã chuyển sang giao diện ${theme === "dark" ? "Tối" : "Sáng"}`);
      });
    }
  }

  initTabs() {
    const tabs = document.querySelectorAll(".tab-btn");
    tabs.forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-tab");
        this.switchTab(targetId);
      });
    });
  }

  switchTab(tabId) {
    document.querySelectorAll(".tab-btn").forEach(btn => {
      const isActive = btn.getAttribute("data-tab") === tabId;
      btn.classList.toggle("active", isActive);
      btn.setAttribute("aria-selected", isActive);
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === tabId);
    });

    // Kích hoạt lại canvas nếu chuyển sang tab writing
    if (tabId === "tabWriting" && this.writingCanvas) {
      setTimeout(() => this.writingCanvas.initCanvas(), 100);
    }
    // Cập nhật thống kê gamification khi sang tab gamification
    if (tabId === "tabGamification") {
      this.renderGamificationDashboard();
    }
    // Cập nhật SRS khi sang tab SRS
    if (tabId === "tabSRS") {
      this.updateSRSView();
    }
  }

  updateGlobalBadges() {
    const streakEl = document.getElementById("streakCount");
    const xpEl = document.getElementById("xpCount");
    if (streakEl) streakEl.textContent = this.gamification.state.streak;
    if (xpEl) xpEl.textContent = this.gamification.state.xp;
  }

  // ========================== TAB 1: TỪ ĐIỂN & HỌC THUẬT ==========================
  initVocabTab() {
    const searchInput = document.getElementById("vocabSearchInput");
    const levelSelect = document.getElementById("levelFilterSelect");
    const categorySelect = document.getElementById("categoryFilterSelect");

    const render = () => {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const level = levelSelect?.value || "all";
      const cat = categorySelect?.value || "all";

      const filtered = VOCABULARY_DATA.filter(item => {
        const matchQuery = !q ||
          item.hanzi.toLowerCase().includes(q) ||
          item.pinyin.toLowerCase().includes(q) ||
          item.hanViet.toLowerCase().includes(q) ||
          item.meaning.toLowerCase().includes(q);

        const matchCat = cat === "all" || item.category === cat;

        let matchLevel = true;
        if (level === "academic") matchLevel = item.level.includes("Học thuật");
        else if (level === "hsk1-3") matchLevel = item.level.includes("HSK 1") || item.level.includes("HSK 2") || item.level.includes("HSK 3");
        else if (level === "hsk4-5") matchLevel = item.level.includes("HSK 4") || item.level.includes("HSK 5");
        else if (level === "hsk6") matchLevel = item.level.includes("HSK 6");

        return matchQuery && matchCat && matchLevel;
      });

      this.renderVocabGrid(filtered);
    };

    if (searchInput) searchInput.addEventListener("input", render);
    if (levelSelect) levelSelect.addEventListener("change", render);
    if (categorySelect) categorySelect.addEventListener("change", render);

    render();
  }

  renderVocabGrid(items) {
    const grid = document.getElementById("vocabGrid");
    if (!grid) return;

    if (items.length === 0) {
      grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 40px; color: var(--ink-muted);">
          🔍 Không tìm thấy từ vựng học thuật nào phù hợp với bộ lọc tìm kiếm.
        </div>
      `;
      return;
    }

    grid.innerHTML = items.map(item => `
      <div class="vocab-card" data-id="${item.id}">
        <div>
          <div class="vocab-card-header">
            <div>
              <div class="hanzi-main hanzi-font">${item.hanzi}</div>
              <div style="font-size: 0.8rem; color: var(--ink-muted);">Phồn thể: ${item.traditional}</div>
            </div>
            <div class="hanzi-badges">
              <span class="badge-tag ${item.level.includes('Học thuật') ? 'badge-academic' : 'badge-hsk'}">${item.level}</span>
              <span class="badge-tag" style="background-color: var(--surface-alt); color: var(--ink-secondary); font-size: 0.68rem;">${item.category}</span>
            </div>
          </div>

          <div class="pinyin-line">
            <span>${item.pinyin}</span>
            <span class="hanviet-pill">${item.hanViet}</span>
          </div>

          <div class="meaning-text">
            <strong>[${item.partOfSpeech}]</strong> ${item.meaning}
          </div>

          <div class="vocab-meta-box">
            <div><strong>Bộ thủ:</strong> ${item.radical} (${item.strokeCount} nét)</div>
            <div style="margin-top: 4px;"><strong>Chiết tự:</strong> ${item.etymology}</div>
          </div>

          <div class="example-box">
            <div class="example-zh hanzi-font">${item.exampleZh}</div>
            <div class="example-py">${item.examplePinyin}</div>
            <div class="example-vi">${item.exampleVi}</div>
          </div>
        </div>

        <div class="card-action-bar">
          <button type="button" class="btn btn-secondary btn-sm btn-speak" data-text="${item.hanzi}" title="Nghe phát âm chuẩn">
            🔊 Nghe
          </button>
          <button type="button" class="btn btn-secondary btn-sm btn-goto-write" data-char="${item.hanzi[0]}" title="Tập viết chữ này">
            ✍️ Tập Viết
          </button>
          <button type="button" class="btn btn-secondary btn-sm btn-goto-speech" data-id="${item.id}" title="Luyện đọc giọng nói">
            🎙️ Luyện Đọc
          </button>
        </div>
      </div>
    `).join("");

    // Gắn sự kiện các nút trên từng thẻ
    grid.querySelectorAll(".btn-speak").forEach(btn => {
      btn.addEventListener("click", () => {
        const text = btn.getAttribute("data-text");
        this.speech.speak(text);
      });
    });

    grid.querySelectorAll(".btn-goto-write").forEach(btn => {
      btn.addEventListener("click", () => {
        const char = btn.getAttribute("data-char");
        this.switchTab("tabWriting");
        if (this.writingCanvas) {
          this.writingCanvas.setChar(char);
          const infoEl = document.getElementById("canvasCharInfo");
          if (infoEl) infoEl.textContent = `Chữ: ${char}`;
        }
      });
    });

    grid.querySelectorAll(".btn-goto-speech").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const idx = VOCABULARY_DATA.findIndex(v => v.id === id);
        if (idx !== -1) {
          this.speechTargetIndex = idx;
          this.switchTab("tabSpeech");
          this.renderSpeechTarget();
        }
      });
    });
  }

  // ========================== TAB 2: FLASHCARD SRS SM-2 ==========================
  initSRSTab() {
    const wrap = document.getElementById("flashcardWrap");
    if (wrap) {
      wrap.addEventListener("click", () => {
        wrap.classList.toggle("flipped");
      });
    }

    const speakBtn = document.getElementById("btnSpeakCard");
    if (speakBtn) {
      speakBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const currentItem = this.getCurrentSRSCardItem();
        if (currentItem) {
          this.speech.speak(currentItem.hanzi);
        }
      });
    }

    // Các nút đánh giá SM-2 (0..3)
    document.querySelectorAll(".srs-buttons-bar button").forEach(btn => {
      btn.addEventListener("click", () => {
        const rating = parseInt(btn.getAttribute("data-rating"), 10);
        this.handleSRSReview(rating);
      });
    });
  }

  getCurrentSRSCardItem() {
    if (this.currentDueCards.length === 0) return null;
    const cardState = this.currentDueCards[this.currentCardIndex % this.currentDueCards.length];
    return VOCABULARY_DATA.find(v => v.id === cardState.id) || VOCABULARY_DATA[0];
  }

  updateSRSView() {
    const stats = this.srs.getStats();
    document.getElementById("srsStatTotal").textContent = stats.total;
    document.getElementById("srsStatDue").textContent = stats.due;
    document.getElementById("srsStatLearning").textContent = stats.learning;
    document.getElementById("srsStatMastered").textContent = stats.mastered;

    this.currentDueCards = this.srs.getDueCards();
    if (this.currentDueCards.length === 0) {
      // Nếu không còn thẻ nào đến hạn hôm nay, đưa toàn bộ danh sách vào để ôn tự do
      this.currentDueCards = this.srs.cards;
    }

    const item = this.getCurrentSRSCardItem();
    if (!item) return;

    // Reset lật thẻ
    const wrap = document.getElementById("flashcardWrap");
    if (wrap) wrap.classList.remove("flipped");

    // Điền dữ liệu mặt trước
    document.getElementById("fcFrontLevel").textContent = item.level;
    document.getElementById("fcFrontHanzi").textContent = item.hanzi;
    document.getElementById("fcFrontHanViet").textContent = item.hanViet;

    // Điền dữ liệu mặt sau
    document.getElementById("fcBackPinyin").textContent = item.pinyin;
    document.getElementById("fcBackHanViet").textContent = item.hanViet;
    document.getElementById("fcBackMeaning").textContent = item.meaning;
    document.getElementById("fcBackRadical").textContent = item.radical;
    document.getElementById("fcBackEtymology").textContent = item.etymology;
    document.getElementById("fcBackExampleZh").textContent = item.exampleZh;
    document.getElementById("fcBackExamplePy").textContent = item.examplePinyin;
    document.getElementById("fcBackExampleVi").textContent = item.exampleVi;
  }

  handleSRSReview(quality) {
    const currentItem = this.getCurrentSRSCardItem();
    if (!currentItem) return;

    this.srs.reviewCard(currentItem.id, quality);
    this.gamification.recordAction("review");
    this.updateGlobalBadges();

    const qualityNames = ["Quên (1 ngày)", "Khó", "Tốt", "Dễ"];
    this.showToast(`Đã ghi nhận [${qualityNames[quality]}]: +10 XP`);

    this.currentCardIndex += 1;
    this.updateSRSView();
  }

  // ========================== TAB 3: LUYỆN VIẾT BÚT THUẬN ==========================
  initWritingTab() {
    const canvasEl = document.getElementById("hanziCanvas");
    if (!canvasEl) return;

    this.writingCanvas = new HanziWritingCanvas(canvasEl, {
      char: "研",
      showGhost: true,
      gridType: "mi"
    });

    // Populate char list
    const selectorList = document.getElementById("charSelectorList");
    if (selectorList) {
      const allUniqueChars = Array.from(
        new Set(VOCABULARY_DATA.flatMap(v => v.hanzi.split("")))
      ).slice(0, 32);

      selectorList.innerHTML = allUniqueChars.map((ch, idx) => `
        <button type="button" class="char-btn ${idx === 0 ? 'active' : ''}" data-char="${ch}">${ch}</button>
      `).join("");

      selectorList.querySelectorAll(".char-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          selectorList.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const ch = btn.getAttribute("data-char");
          this.writingCanvas.setChar(ch);
          const infoEl = document.getElementById("canvasCharInfo");
          if (infoEl) infoEl.textContent = `Chữ: ${ch}`;
        });
      });
    }

    // Toggle ghost
    const btnGhost = document.getElementById("btnToggleGhost");
    if (btnGhost) {
      btnGhost.addEventListener("click", () => {
        this.writingCanvas.toggleGhost();
        btnGhost.textContent = `👁️ Mẫu Nét Mờ: ${this.writingCanvas.showGhost ? 'BẬT' : 'TẮT'}`;
      });
    }

    // Toggle grid
    const btnGrid = document.getElementById("btnToggleGrid");
    if (btnGrid) {
      btnGrid.addEventListener("click", () => {
        this.writingCanvas.gridType = this.writingCanvas.gridType === "mi" ? "tian" : "mi";
        this.writingCanvas.render();
        btnGrid.textContent = `📐 Lưới: ${this.writingCanvas.gridType === "mi" ? 'Mễ tự (米)' : 'Điền tự (田)'}`;
      });
    }

    // Undo & Clear
    document.getElementById("btnUndoStroke")?.addEventListener("click", () => this.writingCanvas.undo());
    document.getElementById("btnClearCanvas")?.addEventListener("click", () => this.writingCanvas.clear());

    // Hoàn thành luyện viết
    document.getElementById("btnCompleteWriting")?.addEventListener("click", () => {
      this.gamification.recordAction("writing");
      this.updateGlobalBadges();
      this.showToast("Xuất sắc! Đã hoàn thành 1 chữ Hán (+20 XP)");
    });
  }

  // ========================== TAB 4: PHÁT ÂM & GIỌNG NÓI ==========================
  initSpeechTab() {
    this.renderSpeechTarget();

    document.getElementById("btnPlaySpeechTarget")?.addEventListener("click", () => {
      const item = VOCABULARY_DATA[this.speechTargetIndex];
      if (item) this.speech.speak(item.hanzi);
    });

    document.getElementById("btnNextSpeechTarget")?.addEventListener("click", () => {
      this.speechTargetIndex = (this.speechTargetIndex + 1) % VOCABULARY_DATA.length;
      this.renderSpeechTarget();
    });

    const btnRecord = document.getElementById("btnRecordVoice");
    if (btnRecord) {
      btnRecord.addEventListener("click", () => {
        const item = VOCABULARY_DATA[this.speechTargetIndex];
        if (!item) return;

        btnRecord.textContent = "🔴 Đang nghe... Hãy nói!";
        btnRecord.classList.add("btn-teal");

        this.speech.evaluatePronunciation(
          item.hanzi,
          (result) => {
            btnRecord.textContent = "🎙️ Bấm Micro Luyện Đọc";
            btnRecord.classList.remove("btn-teal");
            this.renderSpeechResult(result);

            if (result.isMatched) {
              this.gamification.recordAction("speech");
              this.updateGlobalBadges();
              this.showToast("Phát âm tuyệt vời! +30 XP");
            }
          },
          (errorMsg) => {
            btnRecord.textContent = "🎙️ Bấm Micro Luyện Đọc";
            btnRecord.classList.remove("btn-teal");
            this.showToast("⚠️ " + errorMsg);
          }
        );
      });
    }
  }

  renderSpeechTarget() {
    const item = VOCABULARY_DATA[this.speechTargetIndex];
    if (!item) return;

    document.getElementById("speechTargetHanzi").textContent = item.hanzi;
    document.getElementById("speechTargetPinyin").textContent = item.pinyin;
    document.getElementById("speechTargetHanViet").textContent = item.hanViet;

    const resultBox = document.getElementById("speechResultBox");
    if (resultBox) resultBox.style.display = "none";
  }

  renderSpeechResult(res) {
    const box = document.getElementById("speechResultBox");
    if (!box) return;
    box.style.display = "block";

    const badge = document.getElementById("speechMatchBadge");
    if (badge) {
      badge.textContent = `Độ khớp: ${res.similarity}%`;
      badge.className = `badge-tag ${res.isMatched ? 'badge-hsk' : 'badge-academic'}`;
    }

    document.getElementById("speechTranscriptLine").innerHTML = `
      Máy nghe nhận diện được: <strong>${res.transcript || '(Không rõ)'}</strong>
    `;
    document.getElementById("speechFeedbackText").textContent = res.feedback;
  }

  // ========================== TAB 5: PHÒNG THI HSK CBT ==========================
  initExamTab() {
    this.renderExamSuitesList();

    document.getElementById("btnSubmitExam")?.addEventListener("click", () => {
      if (this.activeExam) {
        if (confirm("Bạn có chắc chắn muốn nộp bài thi ngay bây giờ không?")) {
          this.activeExam.submit();
        }
      }
    });

    document.getElementById("btnBackToExams")?.addEventListener("click", () => {
      document.getElementById("examResultView").style.display = "none";
      document.getElementById("examActiveView").style.display = "none";
      document.getElementById("examSelectView").style.display = "block";
    });
  }

  renderExamSuitesList() {
    const container = document.getElementById("examSuitesList");
    if (!container) return;

    container.innerHTML = EXAM_SUITES.map(exam => `
      <div class="vocab-card">
        <div>
          <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
            <span class="badge-tag badge-academic">${exam.level}</span>
            <span style="font-size: 0.8rem; color: var(--ink-muted); font-weight: 600;">⏱️ ${exam.durationMinutes} Phút</span>
          </div>
          <h3 style="font-size: 1.1rem; font-weight: 800; margin-bottom: 8px;">${exam.title}</h3>
          <p style="font-size: 0.85rem; color: var(--ink-secondary); margin-bottom: 16px;">
            ${exam.description}
          </p>
          <div style="font-size: 0.8rem; color: var(--ink-muted); margin-bottom: 16px;">
            Số lượng: <strong>${exam.questions.length} câu hỏi</strong> • Điểm đạt: <strong>≥ ${exam.passScorePercent}%</strong>
          </div>
        </div>
        <button type="button" class="btn btn-primary btn-start-exam" data-id="${exam.id}">
          Vào Thi Ngay
        </button>
      </div>
    `).join("");

    container.querySelectorAll(".btn-start-exam").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const suite = EXAM_SUITES.find(s => s.id === id);
        if (suite) this.startExam(suite);
      });
    });
  }

  startExam(suite) {
    document.getElementById("examSelectView").style.display = "none";
    document.getElementById("examResultView").style.display = "none";
    document.getElementById("examActiveView").style.display = "block";

    document.getElementById("activeExamTitle").textContent = suite.title;
    document.getElementById("activeExamLevel").textContent = suite.level;

    this.activeExam = new ExamRoom(suite, (result) => {
      this.handleExamCompleted(result);
    });

    const timerEl = document.getElementById("examTimerDisplay");
    this.activeExam.start((remainingSecs) => {
      if (timerEl) timerEl.textContent = this.activeExam.formatTime(remainingSecs);
    });

    this.renderExamQuestions(suite.questions);
  }

  renderExamQuestions(questions) {
    const container = document.getElementById("examQuestionsContainer");
    if (!container) return;

    container.innerHTML = questions.map((q, qIndex) => {
      if (q.type === "choice") {
        return `
          <div class="question-card" data-qid="${q.id}">
            <div class="question-title">
              <strong>Câu ${qIndex + 1}:</strong> ${q.prompt}
            </div>
            <div class="option-list">
              ${q.options.map((opt, optIdx) => `
                <button type="button" class="option-btn" data-qid="${q.id}" data-opt="${optIdx}">
                  <span style="font-weight: 700;">${String.fromCharCode(65 + optIdx)}.</span>
                  <span>${opt.text}</span>
                </button>
              `).join("")}
            </div>
          </div>
        `;
      } else if (q.type === "reorder") {
        return `
          <div class="question-card" data-qid="${q.id}">
            <div class="question-title">
              <strong>Câu ${qIndex + 1}:</strong> ${q.prompt}
            </div>
            <p style="font-size: 0.85rem; color: var(--ink-muted); margin-bottom: 12px;">Bấm chọn các cụm từ theo đúng thứ tự câu:</p>
            <div class="reorder-pool" style="display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 12px;" data-qid="${q.id}">
              ${q.items.map((item, itemIdx) => `
                <button type="button" class="btn btn-secondary btn-sm btn-reorder-item" data-idx="${itemIdx}">
                  ${item}
                </button>
              `).join("")}
            </div>
            <div class="reorder-selected" style="min-height: 40px; background-color: var(--surface-alt); border-radius: var(--radius-md); padding: 8px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" data-qid="${q.id}">
              <span style="font-size: 0.8rem; color: var(--ink-muted);">Thứ tự đã chọn: (Trống)</span>
            </div>
          </div>
        `;
      }
      return "";
    }).join("");

    // Sự kiện chọn đáp án trắc nghiệm
    container.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const opt = parseInt(btn.getAttribute("data-opt"), 10);
        this.activeExam.setAnswer(qid, opt);

        container.querySelectorAll(`.option-btn[data-qid="${qid}"]`).forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });

    // Sự kiện sắp xếp câu reorder
    container.querySelectorAll(".reorder-pool").forEach(pool => {
      const qid = pool.getAttribute("data-qid");
      const selectedBox = container.querySelector(`.reorder-selected[data-qid="${qid}"]`);
      let userOrder = [];

      pool.querySelectorAll(".btn-reorder-item").forEach(itemBtn => {
        itemBtn.addEventListener("click", () => {
          const idx = parseInt(itemBtn.getAttribute("data-idx"), 10);
          if (!userOrder.includes(idx)) {
            userOrder.push(idx);
            itemBtn.style.opacity = "0.4";
            itemBtn.style.pointerEvents = "none";
            this.activeExam.setAnswer(qid, [...userOrder]);

            const q = this.activeExam.exam.questions.find(item => item.id === qid);
            selectedBox.innerHTML = userOrder.map(i => `
              <span class="badge-tag badge-academic" style="font-size: 0.85rem;">${q.items[i]}</span>
            `).join(" ");
          }
        });
      });
    });
  }

  handleExamCompleted(result) {
    document.getElementById("examActiveView").style.display = "none";
    document.getElementById("examResultView").style.display = "block";

    document.getElementById("certExamTitle").textContent = result.examTitle;
    document.getElementById("certExamLevel").textContent = result.level;
    document.getElementById("certExamScore").textContent = `${result.scorePercent}% (${result.correctCount}/${result.totalQuestions} Câu)`;
    document.getElementById("certExamStatus").textContent = result.isPassed ? "ĐẠT (PASSED)" : "CHƯA ĐẠT (RETAKE REQUIRED)";
    document.getElementById("certExamStatus").style.color = result.isPassed ? "var(--success)" : "var(--danger)";
    document.getElementById("certExamHash").textContent = result.certCode;

    this.gamification.recordAction("exam");
    this.updateGlobalBadges();

    // Render review
    const reviewContainer = document.getElementById("examReviewContainer");
    if (reviewContainer) {
      reviewContainer.innerHTML = `
        <h3 style="font-weight: 800; margin-bottom: 16px;">Chi Tiết Giải Thích Từng Câu Hỏi:</h3>
        ${result.details.map((d, idx) => `
          <div class="question-card" style="border-left: 4px solid ${d.isCorrect ? 'var(--success)' : 'var(--danger)'};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <strong>Câu ${idx + 1}: ${d.question.prompt}</strong>
              <span class="badge-tag" style="background-color: ${d.isCorrect ? 'var(--success-soft)' : 'var(--primary-soft)'}; color: ${d.isCorrect ? 'var(--success)' : 'var(--danger)'}; font-weight: 700;">
                ${d.isCorrect ? '✓ Đúng' : '✗ Sai'}
              </span>
            </div>
            <div style="font-size: 0.85rem; color: var(--ink-secondary); background-color: var(--surface-alt); padding: 10px; border-radius: var(--radius-sm); margin-top: 8px;">
              💡 <strong>Giải thích:</strong> ${d.explanation}
            </div>
          </div>
        `).join("")}
      `;
    }
  }

  // ========================== TAB 6: GAMIFICATION & SAO LƯU ==========================
  initGamificationTab() {
    this.renderGamificationDashboard();

    document.getElementById("btnExportBackup")?.addEventListener("click", () => {
      this.gamification.exportBackup();
      this.showToast("Đã tải xuống file sao lưu JSON an toàn!");
    });

    const importInput = document.getElementById("btnImportBackupInput");
    if (importInput) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          const res = this.gamification.importBackup(evt.target.result);
          if (res.success) {
            this.showToast("Đã khôi phục dữ liệu thành công!");
            this.updateGlobalBadges();
            this.renderGamificationDashboard();
          } else {
            this.showToast("⚠️ Lỗi định dạng file: " + res.error);
          }
        };
        reader.readAsText(file);
      });
    }
  }

  renderGamificationDashboard() {
    const lvl = this.gamification.getLevelInfo();
    document.getElementById("dashboardLevelBadge").textContent = `Cấp ${lvl.level}`;
    document.getElementById("dashboardLevelTitle").textContent = lvl.title;
    document.getElementById("dashboardXPVal").textContent = `${lvl.currentXP} XP`;
    document.getElementById("dashboardNextLevelVal").textContent = `Mục tiêu Cấp tiếp theo: ${lvl.nextLevelXP} XP`;
    document.getElementById("dashboardProgressBar").style.width = `${lvl.progressPercent}%`;

    // Quests
    const questsList = document.getElementById("dailyQuestsList");
    if (questsList) {
      const q = this.gamification.state.dailyQuests;
      questsList.innerHTML = `
        <div class="quest-item">
          <div>
            <strong>Ôn tập thẻ từ vựng (SRS)</strong>
            <div style="font-size: 0.75rem; color: var(--ink-muted);">Tiến độ: ${q.reviews.current}/${q.reviews.target} thẻ</div>
          </div>
          <span class="badge-tag ${q.reviews.completed ? 'badge-hsk' : ''}">${q.reviews.completed ? '✓ Hoàn thành (+10 XP)' : 'Chưa xong'}</span>
        </div>
        <div class="quest-item">
          <div>
            <strong>Luyện viết chữ Hán trên canvas</strong>
            <div style="font-size: 0.75rem; color: var(--ink-muted);">Tiến độ: ${q.writing.current}/${q.writing.target} chữ</div>
          </div>
          <span class="badge-tag ${q.writing.completed ? 'badge-hsk' : ''}">${q.writing.completed ? '✓ Hoàn thành (+20 XP)' : 'Chưa xong'}</span>
        </div>
        <div class="quest-item">
          <div>
            <strong>Luyện phát âm giọng nói chuẩn zh-CN</strong>
            <div style="font-size: 0.75rem; color: var(--ink-muted);">Tiến độ: ${q.speech.current}/${q.speech.target} từ</div>
          </div>
          <span class="badge-tag ${q.speech.completed ? 'badge-hsk' : ''}">${q.speech.completed ? '✓ Hoàn thành (+30 XP)' : 'Chưa xong'}</span>
        </div>
        <div class="quest-item">
          <div>
            <strong>Hoàn thành 1 bài thi HSK</strong>
            <div style="font-size: 0.75rem; color: var(--ink-muted);">Tiến độ: ${q.exam.current}/${q.exam.target} đề</div>
          </div>
          <span class="badge-tag ${q.exam.completed ? 'badge-hsk' : ''}">${q.exam.completed ? '✓ Hoàn thành (+50 XP)' : 'Chưa xong'}</span>
        </div>
      `;
    }

    // Badges
    const badgesGrid = document.getElementById("badgesGrid");
    if (badgesGrid) {
      const allBadges = this.gamification.getAllBadges();
      badgesGrid.innerHTML = allBadges.map(b => `
        <div class="badge-card ${b.unlocked ? '' : 'locked'}">
          <div class="badge-icon">${b.icon}</div>
          <h4 style="font-size: 0.95rem; font-weight: 700;">${b.name}</h4>
          <p style="font-size: 0.75rem; color: var(--ink-muted);">${b.desc}</p>
          <span class="badge-tag ${b.unlocked ? 'badge-hsk' : ''}" style="font-size: 0.7rem; margin-top: 4px;">
            ${b.unlocked ? 'ĐÃ MỞ KHÓA' : 'CHƯA MỞ'}
          </span>
        </div>
      `).join("");
    }
  }

  // ========================== PWA INSTALLATION ==========================
  initPWA() {
    let deferredPrompt = null;
    const installBtn = document.getElementById("btnInstallApp");

    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      deferredPrompt = e;
      if (installBtn) {
        installBtn.style.display = "inline-flex";
        installBtn.addEventListener("click", async () => {
          installBtn.style.display = "none";
          deferredPrompt.prompt();
          const { outcome } = await deferredPrompt.userChoice;
          console.log(`User response to install prompt: ${outcome}`);
          deferredPrompt = null;
        });
      }
    });

    window.addEventListener("appinstalled", () => {
      this.showToast("Cài đặt Hanzii Pro thành công!");
    });
  }
}

// Khởi chạy ứng dụng
document.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
