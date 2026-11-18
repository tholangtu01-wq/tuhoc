/**
 * tiengtrungdema — Main Application Controller
 * Tích hợp hệ thống bảo mật Mã Truy Cập (Access Gate), đa người dùng và lộ trình riêng biệt
 */

import { VOCABULARY_DATA, RADICALS_DATA } from "./data/vocabulary.js";
import { EXAM_SUITES } from "./data/exams.js";
import { UserManager } from "./modules/userManager.js";
import { SRSEngine } from "./modules/srs.js";
import { HanziWritingCanvas } from "./modules/writingCanvas.js";
import { SpeechEngine } from "./modules/speechEngine.js";
import { ExamRoom } from "./modules/examRoom.js";

const DEFAULT_ACCESS_KEYS = ["tiengtrungdema", "dema2026", "dema888"];

class AppController {
  constructor() {
    this.userManager = new UserManager();
    this.srs = new SRSEngine(VOCABULARY_DATA, this.userManager);
    this.speech = new SpeechEngine();
    this.activeExam = null;
    this.currentDueCards = [];
    this.currentCardIndex = 0;
    this.speechTargetIndex = 0;
    this.selectedAvatar = "👨‍🎓";

    this.initAccessGate();
    this.initDOM();
    this.initTheme();
    this.initUserSystem();
    this.initTabs();
    this.initRoadmapTab();
    this.initVocabTab();
    this.initSRSTab();
    this.initWritingTab();
    this.initSpeechTab();
    this.initExamTab();
    this.initProfileTab();

    this.updateUserUI();
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

  // ========================== ACCESS GATE (BẢO MẬT TRUY CẬP) ==========================
  initAccessGate() {
    const overlay = document.getElementById("accessGateOverlay");
    const form = document.getElementById("accessGateForm");
    const errorEl = document.getElementById("accessGateError");
    const inputKey = document.getElementById("inputAccessKey");

    const getMasterKey = () => localStorage.getItem("tiengtrungdema_master_key") || "tiengtrungdema";
    const isGranted = localStorage.getItem("tiengtrungdema_access_granted") === "true";

    const updateCurrentKeyDisplay = () => {
      const displayKeyEl = document.getElementById("displayCurrentAccessKey");
      if (displayKeyEl) displayKeyEl.value = getMasterKey();
    };

    if (!isGranted) {
      if (overlay) overlay.style.display = "flex";
    } else {
      if (overlay) overlay.style.display = "none";
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const entered = (inputKey?.value || "").trim();
        const masterKey = getMasterKey();

        if (entered === masterKey || DEFAULT_ACCESS_KEYS.includes(entered.toLowerCase())) {
          localStorage.setItem("tiengtrungdema_access_granted", "true");
          if (overlay) overlay.style.display = "none";
          this.showToast("Xác thực mã truy cập thành công! Chào mừng bạn.");
          updateCurrentKeyDisplay();
        } else {
          if (errorEl) errorEl.style.display = "block";
          if (inputKey) {
            inputKey.value = "";
            inputKey.focus();
          }
        }
      });
    }

    // Khóa ứng dụng
    const lockApp = () => {
      localStorage.removeItem("tiengtrungdema_access_granted");
      if (errorEl) errorEl.style.display = "none";
      if (inputKey) inputKey.value = "";
      if (overlay) overlay.style.display = "flex";
      this.showToast("Đã khóa ứng dụng bảo mật.");
    };

    document.getElementById("btnLockApp")?.addEventListener("click", lockApp);
    document.getElementById("btnLockAppFromProfile")?.addEventListener("click", lockApp);

    // Đổi mã truy cập
    document.getElementById("btnChangeAccessKey")?.addEventListener("click", () => {
      const newKey = prompt("Nhập Mã Truy Cập Mới (chỉ những ai biết mã này mới được vào app):", getMasterKey());
      if (newKey && newKey.trim().length >= 3) {
        localStorage.setItem("tiengtrungdema_master_key", newKey.trim());
        updateCurrentKeyDisplay();
        this.showToast(`Đã đổi mã truy cập mới thành: "${newKey.trim()}"`);
      } else if (newKey !== null) {
        alert("Mã truy cập phải có ít nhất 3 ký tự!");
      }
    });

    updateCurrentKeyDisplay();
  }

  initDOM() {
    document.getElementById("brandLogoBtn")?.addEventListener("click", () => {
      this.switchTab("tabRoadmap");
    });

    document.getElementById("btnQuickReviewFromRoadmap")?.addEventListener("click", () => {
      this.switchTab("tabSRS");
    });
  }

  initTheme() {
    const btn = document.getElementById("btnToggleTheme");
    const currentTheme = localStorage.getItem("tiengtrungdema_theme") || "light";
    document.documentElement.setAttribute("data-theme", currentTheme);

    if (btn) {
      btn.addEventListener("click", () => {
        const theme = document.documentElement.getAttribute("data-theme") === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("tiengtrungdema_theme", theme);
        this.showToast(`Đã chuyển sang giao diện ${theme === "dark" ? "Tối" : "Sáng"}`);
      });
    }
  }

  // ========================== USER PROFILE SYSTEM ==========================
  initUserSystem() {
    const onboardingModal = document.getElementById("onboardingModal");
    const userSwitchModal = document.getElementById("userSwitchModal");

    document.querySelectorAll(".avatar-choice-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".avatar-choice-btn").forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
        this.selectedAvatar = btn.getAttribute("data-avatar");
      });
    });

    const onboardingForm = document.getElementById("onboardingForm");
    if (onboardingForm) {
      onboardingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("inputUserName");
        const targetSelect = document.getElementById("inputUserTarget");
        const name = (nameInput?.value || "").trim();
        const target = targetSelect?.value || "academic";

        if (!name) return;

        const user = this.userManager.createUser(name, target, this.selectedAvatar);
        onboardingModal.style.display = "none";
        this.showToast(`Chào mừng ${user.name}! Lộ trình học của bạn đã sẵn sàng.`);
        this.updateUserUI();
        this.switchTab("tabRoadmap");
      });
    }

    document.getElementById("btnOpenUserSwitch")?.addEventListener("click", () => {
      this.openUserSwitchModal();
    });

    document.getElementById("btnSwitchUserFromProfile")?.addEventListener("click", () => {
      this.openUserSwitchModal();
    });

    document.getElementById("btnCloseUserSwitchModal")?.addEventListener("click", () => {
      userSwitchModal.style.display = "none";
    });

    document.getElementById("btnAddNewUserFromModal")?.addEventListener("click", () => {
      userSwitchModal.style.display = "none";
      this.openOnboardingModal();
    });

    document.getElementById("btnCreateNewUserFromSidebar")?.addEventListener("click", () => {
      this.openOnboardingModal();
    });

    if (!this.userManager.currentUser) {
      this.openOnboardingModal();
    }
  }

  openOnboardingModal() {
    const modal = document.getElementById("onboardingModal");
    if (!modal) return;
    const nameInput = document.getElementById("inputUserName");
    if (nameInput) nameInput.value = "";
    modal.style.display = "flex";
  }

  openUserSwitchModal() {
    const modal = document.getElementById("userSwitchModal");
    const list = document.getElementById("userSwitchModalList");
    if (!modal || !list) return;

    list.innerHTML = this.userManager.users.map(u => {
      const isActive = u.id === this.userManager.currentUserId;
      const targetLabels = {
        academic: "Học thuật & Nghiên cứu",
        "hsk1-2": "HSK 1-2 Căn bản",
        "hsk3-4": "HSK 3-4 Trung cấp",
        "hsk5-6": "HSK 5-6 Nâng cao"
      };
      return `
        <div class="user-switch-card ${isActive ? 'active' : ''}" data-uid="${u.id}">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 1.8rem;">${u.avatar}</div>
            <div>
              <div style="font-weight: 800; font-size: 0.95rem;">${u.name} ${isActive ? '<span class="badge-tag badge-hsk" style="font-size: 0.65rem;">ĐANG CHỌN</span>' : ''}</div>
              <div style="font-size: 0.75rem; color: var(--ink-muted);">${targetLabels[u.target] || u.target} • ${u.xp} XP</div>
            </div>
          </div>
          <div>
            ${!isActive ? `<button type="button" class="btn btn-secondary btn-sm btn-delete-user" data-uid="${u.id}" title="Xóa người học này" style="color: var(--danger);">🗑️</button>` : ''}
          </div>
        </div>
      `;
    }).join("");

    list.querySelectorAll(".user-switch-card").forEach(card => {
      card.addEventListener("click", (e) => {
        if (e.target.closest(".btn-delete-user")) return;
        const uid = card.getAttribute("data-uid");
        this.userManager.switchUser(uid);
        modal.style.display = "none";
        this.showToast(`Đã chuyển sang hồ sơ của ${this.userManager.currentUser.name}`);
        this.updateUserUI();
      });
    });

    list.querySelectorAll(".btn-delete-user").forEach(btn => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const uid = btn.getAttribute("data-uid");
        if (confirm("Bạn có chắc chắn muốn xóa hồ sơ học viên này không?")) {
          this.userManager.deleteUser(uid);
          this.openUserSwitchModal();
          this.updateUserUI();
        }
      });
    });

    modal.style.display = "flex";
  }

  updateUserUI() {
    const user = this.userManager.currentUser;
    if (!user) return;

    const avatarEl = document.getElementById("topbarUserAvatar");
    const nameEl = document.getElementById("topbarUserName");
    const targetEl = document.getElementById("topbarUserTarget");
    const streakEl = document.getElementById("streakCount");
    const xpEl = document.getElementById("xpCount");

    if (avatarEl) avatarEl.textContent = user.avatar;
    if (nameEl) nameEl.textContent = user.name;
    const targetNames = {
      academic: "Lộ trình Học thuật",
      "hsk1-2": "Lộ trình HSK 1-2",
      "hsk3-4": "Lộ trình HSK 3-4",
      "hsk5-6": "Lộ trình HSK 5-6"
    };
    if (targetEl) targetEl.textContent = targetNames[user.target] || "Lộ trình Cá nhân";
    if (streakEl) streakEl.textContent = user.streak;
    if (xpEl) xpEl.textContent = user.xp;

    this.renderRoadmap();
    this.renderProfile();
  }

  // ========================== TABS NAVIGATION ==========================
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

    if (tabId === "tabWriting" && this.writingCanvas) {
      setTimeout(() => this.writingCanvas.initCanvas(), 100);
    }
    if (tabId === "tabSRS") {
      this.updateSRSView();
    }
    if (tabId === "tabProfile") {
      this.renderProfile();
    }
    if (tabId === "tabRoadmap") {
      this.renderRoadmap();
    }
  }

  // ========================== TAB 1: ROADMAP CÁ NHÂN HÓA ==========================
  initRoadmapTab() {
    this.renderRoadmap();
  }

  renderRoadmap() {
    const user = this.userManager.currentUser;
    if (!user) return;

    document.getElementById("roadmapGreetingAvatar").textContent = user.avatar;
    document.getElementById("roadmapGreetingName").textContent = `Lộ Trình Học Của ${user.name}`;

    const stagesList = document.getElementById("roadmapStagesList");
    if (!stagesList) return;

    const stages = [
      { key: "stage1", icon: "🌱", targetTab: "tabVocab", desc: "Nắm vững 4 thanh điệu, quy tắc phiên âm Pinyin và 214 Bộ thủ Hán tự nền tảng." },
      { key: "stage2", icon: "🗣️", targetTab: "tabVocab", desc: "Giao tiếp hàng ngày, ngữ pháp cơ bản và 300 từ vựng cốt lõi HSK 1 - 2." },
      { key: "stage3", icon: "📚", targetTab: "tabVocab", desc: "Đọc hiểu đoạn văn trung cấp, liên từ học thuật và 600 từ vựng HSK 3 - 4." },
      { key: "stage4", icon: "📰", targetTab: "tabVocab", desc: "Đọc báo chí, nghị luận xã hội và mở rộng 1200 từ vựng nâng cao HSK 5." },
      { key: "stage5", icon: "🎓", targetTab: "tabVocab", desc: "Viết luận văn khoa học, bảo vệ khóa luận và thuật ngữ nghiên cứu chuyên sâu." }
    ];

    stagesList.innerHTML = stages.map(s => {
      const stageData = user.roadmap[s.key];
      const isUnlocked = stageData.unlocked;
      const progress = stageData.progress || 0;

      return `
        <div class="stage-card ${isUnlocked ? 'unlocked' : 'locked'}">
          <div class="stage-left">
            <div class="stage-icon-circle">${isUnlocked ? s.icon : '🔒'}</div>
            <div class="stage-info">
              <h3>${stageData.name}</h3>
              <p>${s.desc}</p>
            </div>
          </div>
          <div class="stage-right">
            <div>
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--ink); text-align: right; margin-bottom: 4px;">
                ${isUnlocked ? progress + '%' : 'Chưa mở khóa'}
              </div>
              <div class="stage-progress-bar">
                <div class="stage-progress-fill" style="width: ${progress}%;"></div>
              </div>
            </div>
            ${isUnlocked ? `
              <button type="button" class="btn btn-primary btn-sm btn-learn-stage" data-tab="${s.targetTab}">
                Học Ngay
              </button>
            ` : `
              <span class="badge-tag" style="background: var(--surface-alt); color: var(--ink-muted);">Cần thêm XP</span>
            `}
          </div>
        </div>
      `;
    }).join("");

    stagesList.querySelectorAll(".btn-learn-stage").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-tab");
        this.switchTab(tab);
      });
    });
  }

  // ========================== TAB 2: TỪ ĐIỂN & SỔ TAY ==========================
  initVocabTab() {
    const searchInput = document.getElementById("vocabSearchInput");
    const levelSelect = document.getElementById("levelFilterSelect");
    const categorySelect = document.getElementById("categoryFilterSelect");

    const render = () => {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const level = levelSelect?.value || "all";
      const cat = categorySelect?.value || "all";
      const notebookIds = this.userManager.currentUser?.notebook || [];

      const filtered = VOCABULARY_DATA.filter(item => {
        const matchQuery = !q ||
          item.hanzi.toLowerCase().includes(q) ||
          item.pinyin.toLowerCase().includes(q) ||
          item.hanViet.toLowerCase().includes(q) ||
          item.meaning.toLowerCase().includes(q);

        const matchCat = cat === "all" || item.category === cat;

        let matchLevel = true;
        if (level === "notebook") matchLevel = notebookIds.includes(item.id);
        else if (level === "academic") matchLevel = item.level.includes("Học thuật");
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
        <div style="grid-column: 1/-1; text-align: center; padding: 48px; color: var(--ink-muted);">
          Không tìm thấy từ vựng học thuật nào phù hợp với bộ lọc hiện tại.
        </div>
      `;
      return;
    }

    const notebook = this.userManager.currentUser?.notebook || [];

    grid.innerHTML = items.map(item => {
      const inNotebook = notebook.includes(item.id);
      return `
        <div class="vocab-card" data-id="${item.id}">
          <div>
            <div class="vocab-card-header">
              <div>
                <div class="hanzi-main hanzi-font">${item.hanzi}</div>
                <div style="font-size: 0.8rem; color: var(--ink-muted);">Phồn thể: ${item.traditional}</div>
              </div>
              <div class="hanzi-badges">
                <button type="button" class="btn btn-secondary btn-sm btn-toggle-notebook" data-id="${item.id}" title="${inNotebook ? 'Bỏ lưu' : 'Lưu vào sổ tay cá nhân'}">
                  ${inNotebook ? '★ Đã Lưu' : '☆ Lưu Sổ Tay'}
                </button>
                <span class="badge-tag ${item.level.includes('Học thuật') ? 'badge-academic' : 'badge-hsk'}">${item.level}</span>
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
              Nghe
            </button>
            <button type="button" class="btn btn-secondary btn-sm btn-goto-write" data-char="${item.hanzi[0]}" title="Tập viết chữ này">
              Tập Viết
            </button>
            <button type="button" class="btn btn-secondary btn-sm btn-goto-speech" data-id="${item.id}" title="Luyện đọc giọng nói">
              Luyện Đọc
            </button>
          </div>
        </div>
      `;
    }).join("");

    grid.querySelectorAll(".btn-toggle-notebook").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-id");
        const added = this.userManager.toggleNotebook(id);
        this.showToast(added ? "Đã lưu từ vào Sổ tay cá nhân (+5 XP)" : "Đã bỏ lưu khỏi Sổ tay");
        this.updateUserUI();
        this.initVocabTab();
      });
    });

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

  // ========================== TAB 3: FLASHCARDS SRS SM-2 ==========================
  initSRSTab() {
    const wrap = document.getElementById("flashcardWrap");
    if (wrap) {
      wrap.addEventListener("click", () => {
        wrap.classList.toggle("flipped");
      });
    }

    document.getElementById("btnSpeakCard")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const currentItem = this.getCurrentSRSCardItem();
      if (currentItem) this.speech.speak(currentItem.hanzi);
    });

    document.querySelectorAll(".srs-buttons-bar button").forEach(btn => {
      btn.addEventListener("click", () => {
        const rating = parseInt(btn.getAttribute("data-rating"), 10);
        this.handleSRSReview(rating);
      });
    });
  }

  getCurrentSRSCardItem() {
    if (this.currentDueCards.length === 0) return null;
    const item = this.currentDueCards[this.currentCardIndex % this.currentDueCards.length];
    return item || VOCABULARY_DATA[0];
  }

  updateSRSView() {
    const stats = this.srs.getStats();
    document.getElementById("srsStatTotal").textContent = stats.total;
    document.getElementById("srsStatDue").textContent = stats.due;
    document.getElementById("srsStatLearning").textContent = stats.learning;
    document.getElementById("srsStatMastered").textContent = stats.mastered;

    this.currentDueCards = this.srs.getDueCards();
    if (this.currentDueCards.length === 0) {
      this.currentDueCards = VOCABULARY_DATA;
    }

    const item = this.getCurrentSRSCardItem();
    if (!item) return;

    const wrap = document.getElementById("flashcardWrap");
    if (wrap) wrap.classList.remove("flipped");

    document.getElementById("fcFrontLevel").textContent = item.level;
    document.getElementById("fcFrontHanzi").textContent = item.hanzi;
    document.getElementById("fcFrontHanViet").textContent = item.hanViet;

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
    this.userManager.addXP(10, `Ôn tập thẻ SRS: ${currentItem.hanzi} (${currentItem.hanViet})`);
    this.updateUserUI();

    const qualityNames = ["Quên (1 ngày)", "Khó", "Tốt", "Dễ"];
    this.showToast(`Đã ghi nhận [${qualityNames[quality]}]: +10 XP`);

    this.currentCardIndex += 1;
    this.updateSRSView();
  }

  // ========================== TAB 4: LUYỆN VIẾT BÚT THUẬN ==========================
  initWritingTab() {
    const canvasEl = document.getElementById("hanziCanvas");
    if (!canvasEl) return;

    this.writingCanvas = new HanziWritingCanvas(canvasEl, {
      char: "研",
      showGhost: true,
      gridType: "mi"
    });

    const selectorList = document.getElementById("charSelectorList");
    if (selectorList) {
      const allUniqueChars = Array.from(
        new Set(VOCABULARY_DATA.flatMap(v => v.hanzi.split("")))
      ).slice(0, 36);

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

    document.getElementById("btnToggleGhost")?.addEventListener("click", () => {
      this.writingCanvas.toggleGhost();
      const btn = document.getElementById("btnToggleGhost");
      if (btn) btn.textContent = `Mẫu Nét Mờ: ${this.writingCanvas.showGhost ? 'BẬT' : 'TẮT'}`;
    });

    document.getElementById("btnToggleGrid")?.addEventListener("click", () => {
      this.writingCanvas.gridType = this.writingCanvas.gridType === "mi" ? "tian" : "mi";
      this.writingCanvas.render();
      const btn = document.getElementById("btnToggleGrid");
      if (btn) btn.textContent = `Lưới: ${this.writingCanvas.gridType === "mi" ? 'Mễ tự (米)' : 'Điền tự (田)'}`;
    });

    document.getElementById("btnUndoStroke")?.addEventListener("click", () => this.writingCanvas.undo());
    document.getElementById("btnClearCanvas")?.addEventListener("click", () => this.writingCanvas.clear());

    document.getElementById("btnCompleteWriting")?.addEventListener("click", () => {
      this.userManager.addXP(20, `Luyện viết chữ Hán: ${this.writingCanvas.charToPractice}`);
      this.updateUserUI();
      this.showToast("Xuất sắc! Đã hoàn thành luyện viết 1 chữ Hán (+20 XP)");
    });
  }

  // ========================== TAB 5: PHÁT ÂM AI ==========================
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

        btnRecord.textContent = "Đang nghe... Hãy phát âm!";
        btnRecord.classList.add("btn-teal");

        this.speech.evaluatePronunciation(
          item.hanzi,
          (result) => {
            btnRecord.textContent = "Bấm Micro Luyện Đọc";
            btnRecord.classList.remove("btn-teal");
            this.renderSpeechResult(result);

            if (result.isMatched) {
              this.userManager.addXP(30, `Luyện phát âm chuẩn: ${item.hanzi} (${result.similarity}%)`);
              this.updateUserUI();
              this.showToast("Phát âm rất chuẩn xác! +30 XP");
            }
          },
          (errorMsg) => {
            btnRecord.textContent = "Bấm Micro Luyện Đọc";
            btnRecord.classList.remove("btn-teal");
            this.showToast("Lỗi: " + errorMsg);
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

  // ========================== TAB 6: PHÒNG THI CBT HSK ==========================
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
            <span style="font-size: 0.8rem; color: var(--ink-muted); font-weight: 700;">Thời gian: ${exam.durationMinutes} Phút</span>
          </div>
          <h3 style="font-size: 1.15rem; font-weight: 800; margin-bottom: 8px;">${exam.title}</h3>
          <p style="font-size: 0.88rem; color: var(--ink-secondary); margin-bottom: 16px;">
            ${exam.description}
          </p>
          <div style="font-size: 0.82rem; color: var(--ink-muted); margin-bottom: 16px;">
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
                  <span style="font-weight: 800;">${String.fromCharCode(65 + optIdx)}.</span>
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
            <div class="reorder-selected" style="min-height: 44px; background-color: var(--surface-alt); border-radius: var(--radius-md); padding: 10px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;" data-qid="${q.id}">
              <span style="font-size: 0.8rem; color: var(--ink-muted);">Thứ tự đã chọn: (Trống)</span>
            </div>
          </div>
        `;
      }
      return "";
    }).join("");

    container.querySelectorAll(".option-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const qid = btn.getAttribute("data-qid");
        const opt = parseInt(btn.getAttribute("data-opt"), 10);
        this.activeExam.setAnswer(qid, opt);

        container.querySelectorAll(`.option-btn[data-qid="${qid}"]`).forEach(b => b.classList.remove("selected"));
        btn.classList.add("selected");
      });
    });

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

    const userName = this.userManager.currentUser?.name || "Học Viên tiengtrungdema";
    document.getElementById("certStudentName").textContent = userName;
    document.getElementById("certExamTitle").textContent = result.examTitle;
    document.getElementById("certExamLevel").textContent = result.level;
    document.getElementById("certExamScore").textContent = `${result.scorePercent}% (${result.correctCount}/${result.totalQuestions} Câu)`;
    document.getElementById("certExamStatus").textContent = result.isPassed ? "ĐẠT (PASSED)" : "CHƯA ĐẠT (RETAKE REQUIRED)";
    document.getElementById("certExamStatus").style.color = result.isPassed ? "var(--success)" : "var(--danger)";
    document.getElementById("certExamHash").textContent = result.certCode;

    this.userManager.recordExam(result);
    this.updateUserUI();

    const reviewContainer = document.getElementById("examReviewContainer");
    if (reviewContainer) {
      reviewContainer.innerHTML = `
        <h3 style="font-weight: 800; margin-bottom: 16px;">Chi Tiết Giải Thích Từng Câu Hỏi:</h3>
        ${result.details.map((d, idx) => `
          <div class="question-card" style="border-left: 4px solid ${d.isCorrect ? 'var(--success)' : 'var(--danger)'};">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <strong>Câu ${idx + 1}: ${d.question.prompt}</strong>
              <span class="badge-tag" style="background-color: ${d.isCorrect ? 'var(--success-soft)' : 'var(--primary-soft)'}; color: ${d.isCorrect ? 'var(--success)' : 'var(--danger)'}; font-weight: 800;">
                ${d.isCorrect ? 'Đúng' : 'Sai'}
              </span>
            </div>
            <div style="font-size: 0.88rem; color: var(--ink-secondary); background-color: var(--surface-alt); padding: 12px; border-radius: var(--radius-sm); margin-top: 8px;">
              <strong>Giải thích:</strong> ${d.explanation}
            </div>
          </div>
        `).join("")}
      `;
    }
  }

  // ========================== TAB 7: HỒ SƠ & BẢO MẬT ==========================
  initProfileTab() {
    this.renderProfile();

    document.getElementById("btnExportUserBackup")?.addEventListener("click", () => {
      const dataStr = JSON.stringify(this.userManager.users, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tiengtrungdema-backup-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast("Đã tải xuống file sao lưu hồ sơ JSON!");
    });

    const importInput = document.getElementById("btnImportUserBackupInput");
    if (importInput) {
      importInput.addEventListener("change", (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (evt) => {
          try {
            const parsed = JSON.parse(evt.target.result);
            if (Array.isArray(parsed) && parsed.length > 0) {
              this.userManager.users = parsed;
              this.userManager.currentUserId = parsed[0].id;
              this.userManager.currentUser = parsed[0];
              this.userManager.saveUsers();
              this.userManager.saveCurrentUserId();
              this.showToast("Đã khôi phục danh sách người dùng thành công!");
              this.updateUserUI();
            } else {
              this.showToast("File sao lưu không hợp lệ.");
            }
          } catch (err) {
            this.showToast("Lỗi đọc file: " + err.message);
          }
        };
        reader.readAsText(file);
      });
    }
  }

  renderProfile() {
    const user = this.userManager.currentUser;
    if (!user) return;

    document.getElementById("profileBigAvatar").textContent = user.avatar;
    document.getElementById("profileBigName").textContent = user.name;
    const targets = {
      academic: "Học thuật & Nghiên cứu Khoa học",
      "hsk1-2": "HSK 1-2 Căn bản",
      "hsk3-4": "HSK 3-4 Trung cấp",
      "hsk5-6": "HSK 5-6 Nâng cao"
    };
    document.getElementById("profileBigTarget").textContent = `Mục tiêu: ${targets[user.target] || user.target}`;
    document.getElementById("profileCreatedAt").textContent = user.createdAt || "Hôm nay";

    const lvl = this.userManager.getLevelInfo();
    document.getElementById("profileLevelBadge").textContent = `Cấp ${lvl.level}: ${lvl.title}`;
    document.getElementById("profileXPVal").textContent = `${lvl.currentXP} / ${lvl.nextLevelXP} XP`;
    document.getElementById("profileProgressBar").style.width = `${lvl.progressPercent}%`;

    const historyBody = document.getElementById("profileExamHistoryTableBody");
    if (historyBody) {
      if (user.examHistory.length === 0) {
        historyBody.innerHTML = `<tr><td colspan="4" style="text-align: center; color: var(--ink-muted); padding: 18px;">Bạn chưa thực hiện bài thi thử CBT nào. Hãy vào tab "Phòng Thi CBT HSK" để làm bài thi đầu tiên!</td></tr>`;
      } else {
        historyBody.innerHTML = user.examHistory.map(h => `
          <tr>
            <td>${h.date}</td>
            <td><strong>${h.examTitle}</strong></td>
            <td><strong style="color: ${h.isPassed ? 'var(--success)' : 'var(--danger)'};">${h.scorePercent}% (${h.correctCount}/${h.totalQuestions})</strong></td>
            <td><span class="badge-tag ${h.isPassed ? 'badge-hsk' : 'badge-academic'}">${h.isPassed ? 'ĐẠT' : 'CHƯA ĐẠT'}</span></td>
          </tr>
        `).join("");
      }
    }

    const logsList = document.getElementById("profileActivityLogsList");
    if (logsList) {
      if (user.activityLogs.length === 0) {
        logsList.innerHTML = `<div class="activity-log-item" style="color: var(--ink-muted);">Chưa có hoạt động nào được ghi nhận.</div>`;
      } else {
        logsList.innerHTML = user.activityLogs.map(log => `
          <div class="activity-log-item">
            <div>
              <strong>${log.action}</strong>
              <div style="font-size: 0.75rem; color: var(--ink-muted);">${log.timestamp}</div>
            </div>
            <span class="badge-tag badge-hsk">+${log.xpEarned} XP</span>
          </div>
        `).join("");
      }
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
