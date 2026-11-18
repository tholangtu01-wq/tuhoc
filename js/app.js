/**
 * tiengtrungdema — Main Application Controller
 * Nền tảng Tự Học Tiếng Trung Cá Nhân Hóa & Lộ Trình Nâng Cấp Tự Động (Checkpoint Exams)
 */

import { VOCABULARY_DATA, RADICALS_DATA, HANZI_CHAR_DETAILS } from "./data/vocabulary.js";
import { EXAM_SUITES } from "./data/exams.js";
import { UserManager, LEVEL_LABELS, TARGET_LABELS } from "./modules/userManager.js";
import { SRSEngine } from "./modules/srs.js";
import { HanziWritingCanvas } from "./modules/writingCanvas.js";
import { SpeechEngine } from "./modules/speechEngine.js";
import { ExamRoom } from "./modules/examRoom.js";
import { ROADMAP_LESSONS, USER_GUIDE_DATA } from "./data/roadmapLessons.js";

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
    this.currentLessonStage = "stage1";

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
    this.initLessonRunner();
    this.initUserGuide();

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

  initDOM() {
    document.getElementById("brandLogoBtn")?.addEventListener("click", () => {
      this.switchTab("tabRoadmap");
    });

    document.getElementById("btnQuickReviewFromRoadmap")?.addEventListener("click", () => {
      this.switchTab("tabSRS");
    });

    document.getElementById("btnHeroUserGuide")?.addEventListener("click", () => {
      const modal = document.getElementById("userGuideModal");
      if (modal) modal.style.display = "flex";
      this.renderUserGuideContent("roadmap");
    });

    document.getElementById("btnOpenUserGuide")?.addEventListener("click", () => {
      const modal = document.getElementById("userGuideModal");
      if (modal) modal.style.display = "flex";
      this.renderUserGuideContent("roadmap");
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
        const currentLevelSelect = document.getElementById("inputCurrentLevel");
        const targetLevelSelect = document.getElementById("inputTargetLevel");

        const name = (nameInput?.value || "").trim() || "Học Viên";
        const currentLevel = currentLevelSelect?.value || "level_0";
        const targetLevel = targetLevelSelect?.value || "target_academic";

        const user = this.userManager.createUser(name, currentLevel, targetLevel, this.selectedAvatar);
        localStorage.setItem("tiengtrungdema_has_onboarded", "true");
        if (onboardingModal) onboardingModal.style.display = "none";

        const curText = LEVEL_LABELS[user.currentLevel] || user.currentLevel;
        const tgtText = TARGET_LABELS[user.targetLevel] || user.targetLevel;
        this.showToast(`Chào mừng ${user.name}! Lộ trình từ [${curText}] tới [${tgtText}] đã sẵn sàng.`);
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

    document.getElementById("btnEditUserProfile")?.addEventListener("click", () => {
      this.openOnboardingModal(true);
    });

    document.getElementById("btnCloseUserSwitchModal")?.addEventListener("click", () => {
      userSwitchModal.style.display = "none";
    });

    document.getElementById("btnAddNewUserFromModal")?.addEventListener("click", () => {
      userSwitchModal.style.display = "none";
      this.openOnboardingModal(false);
    });

    document.getElementById("btnCreateNewUserFromSidebar")?.addEventListener("click", () => {
      this.openOnboardingModal(false);
    });

    // Tự động mở hộp thoại thiết lập cho học viên lần đầu tiên ghé thăm
    const hasOnboarded = localStorage.getItem("tiengtrungdema_has_onboarded");
    if (!hasOnboarded || (this.userManager.currentUser && this.userManager.currentUser.name === "Học Viên" && this.userManager.currentUser.examHistory.length === 0)) {
      this.openOnboardingModal(false);
    }
  }

  openOnboardingModal(isEditing = false) {
    const modal = document.getElementById("onboardingModal");
    if (!modal) return;
    const nameInput = document.getElementById("inputUserName");
    const currentLevelSelect = document.getElementById("inputCurrentLevel");
    const targetLevelSelect = document.getElementById("inputTargetLevel");

    if (this.userManager.currentUser) {
      if (nameInput) nameInput.value = isEditing ? this.userManager.currentUser.name : (this.userManager.currentUser.name === "Học Viên" ? "" : this.userManager.currentUser.name);
      if (currentLevelSelect && this.userManager.currentUser.currentLevel) {
        currentLevelSelect.value = this.userManager.currentUser.currentLevel;
      }
      if (targetLevelSelect && this.userManager.currentUser.targetLevel) {
        targetLevelSelect.value = this.userManager.currentUser.targetLevel;
      }
    }
    modal.style.display = "flex";
  }

  openUserSwitchModal() {
    const modal = document.getElementById("userSwitchModal");
    const list = document.getElementById("userSwitchModalList");
    if (!modal || !list) return;

    list.innerHTML = this.userManager.users.map(u => {
      const isActive = u.id === this.userManager.currentUserId;
      const curTxt = LEVEL_LABELS[u.currentLevel] || u.currentLevel;
      const tgtTxt = TARGET_LABELS[u.targetLevel] || u.targetLevel;
      return `
        <div class="user-switch-card ${isActive ? 'active' : ''}" data-uid="${u.id}">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="font-size: 1.8rem;">${u.avatar}</div>
            <div>
              <div style="font-weight: 800; font-size: 0.95rem;">${u.name} ${isActive ? '<span class="badge-tag badge-hsk" style="font-size: 0.65rem;">ĐANG CHỌN</span>' : ''}</div>
              <div style="font-size: 0.75rem; color: var(--ink-muted);">${curTxt} ➔ ${tgtTxt} • ${u.xp} XP</div>
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
    const curLevelText = LEVEL_LABELS[user.currentLevel] || "Mới bắt đầu";
    const tgtText = TARGET_LABELS[user.targetLevel] || "Học thuật";
    if (targetEl) targetEl.textContent = `${curLevelText} ➔ ${tgtText}`;
    if (streakEl) streakEl.textContent = user.streak;
    if (xpEl) xpEl.textContent = user.xp;

    const greetingAvatarEl = document.getElementById("roadmapGreetingAvatar");
    const greetingNameEl = document.getElementById("roadmapGreetingName");
    const targetDescEl = document.getElementById("roadmapTargetDesc");

    if (greetingAvatarEl) greetingAvatarEl.textContent = user.avatar;
    if (greetingNameEl) greetingNameEl.textContent = `Lộ Trình Học Của ${user.name}`;
    if (targetDescEl) {
      targetDescEl.innerHTML = `
        Lộ trình học tập được thiết kế riêng biệt từ <strong>[${curLevelText}]</strong> hướng tới mục tiêu <strong>[${tgtText}]</strong>.<br>
        Hoàn thành bài tập của chặng và vượt qua bài test kiểm tra để được hệ thống tự động nâng cấp lên chặng tiếp theo!
      `;
    }

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
      const stageData = user.roadmap[s.key] || { unlocked: false, progress: 0, name: s.key, desc: s.desc };
      const isUnlocked = stageData.unlocked;
      const progress = stageData.progress || 0;
      const isGraduated = stageData.passedTest;
      const isReadyForTest = stageData.readyForTest || progress >= 100;

      let badgeHtml = '';
      let actionButtonsHtml = '';

      if (isGraduated) {
        badgeHtml = `<div class="stage-checkpoint-badge" style="background: rgba(34, 197, 94, 0.15); color: var(--success);">✅ ĐÃ TỐT NGHIỆP CHẶNG (ĐẠT TEST)</div>`;
        actionButtonsHtml = `
          <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary btn-sm btn-learn-stage" data-stage="${s.key}">📖 Ôn Tập Bài Học</button>
            <button type="button" class="btn btn-secondary btn-sm btn-take-checkpoint-test" data-stage="${s.key}">📝 Thi Lại (+XP)</button>
          </div>
        `;
      } else if (isReadyForTest) {
        badgeHtml = `<div class="stage-checkpoint-badge">🎯 ĐÃ SẴN SÀNG LÀM BÀI TEST NÂNG CẤP LỘ TRÌNH</div>`;
        actionButtonsHtml = `
          <div style="display: flex; gap: 6px; flex-wrap: wrap; justify-content: flex-end;">
            <button type="button" class="btn btn-secondary btn-sm btn-learn-stage" data-stage="${s.key}">📖 Xem Bài Học</button>
            <button type="button" class="btn btn-checkpoint-exam btn-sm btn-take-checkpoint-test" data-stage="${s.key}">📝 Làm Bài Test Nâng Lộ Trình (+100 XP)</button>
          </div>
        `;
      } else if (isUnlocked) {
        badgeHtml = `<div style="font-size: 0.8rem; color: var(--primary); font-weight: 700; margin-bottom: 4px;">🚀 Đang trong lộ trình học</div>`;
        actionButtonsHtml = `
          <button type="button" class="btn btn-primary btn-sm btn-learn-stage" data-stage="${s.key}">
            📖 Học Bài Học Chặng (+40 XP)
          </button>
        `;
      } else {
        badgeHtml = `<div style="font-size: 0.78rem; color: var(--ink-muted); margin-bottom: 4px;">🔒 Khóa</div>`;
        actionButtonsHtml = `
          <span class="badge-tag" style="background: var(--surface-alt); color: var(--ink-muted); font-size: 0.78rem;">
            Vượt qua bài test chặng trước để mở khóa
          </span>
        `;
      }

      return `
        <div class="stage-card ${isUnlocked ? 'unlocked' : 'locked'} ${isReadyForTest && !isGraduated ? 'stage-ready' : ''}">
          <div class="stage-left">
            <div class="stage-icon-circle">${isGraduated ? '🎓' : (isUnlocked ? s.icon : '🔒')}</div>
            <div class="stage-info">
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h3 style="margin: 0;">${stageData.name}</h3>
                ${badgeHtml}
              </div>
              <p style="margin-top: 4px;">${s.desc}</p>
            </div>
          </div>
          <div class="stage-right">
            <div>
              <div style="font-size: 0.8rem; font-weight: 800; color: var(--ink); text-align: right; margin-bottom: 4px;">
                ${isGraduated ? '100% Hoàn thành' : (isUnlocked ? progress + '%' : 'Chưa mở khóa')}
              </div>
              <div class="stage-progress-bar">
                <div class="stage-progress-fill" style="width: ${progress}%; background: ${isGraduated ? 'var(--success)' : ''};"></div>
              </div>
            </div>
            ${actionButtonsHtml}
          </div>
        </div>
      `;
    }).join("");

    stagesList.querySelectorAll(".btn-learn-stage").forEach(btn => {
      btn.addEventListener("click", () => {
        const stageKey = btn.getAttribute("data-stage");
        this.openStageLesson(stageKey);
      });
    });

    stagesList.querySelectorAll(".btn-take-checkpoint-test").forEach(btn => {
      btn.addEventListener("click", () => {
        const stageKey = btn.getAttribute("data-stage");
        this.startStageCheckpointExam(stageKey);
      });
    });
  }

  startStageCheckpointExam(stageKey) {
    this.switchTab("tabExam");
    const exam = EXAM_SUITES.find(e => e.stageKey === stageKey) || EXAM_SUITES[0];
    if (exam) {
      this.startExam(exam.id);
      this.showToast(`Bắt đầu làm bài test nâng cấp [${exam.title}]. Đạt >= 70% để mở khóa chặng tiếp theo!`);
    }
  }

  // ========================== TAB 2: TỪ ĐIỂN & SỔ TAY ==========================
  initVocabTab() {
    const searchInput = document.getElementById("vocabSearchInput");
    const levelSelect = document.getElementById("levelFilterSelect");
    const categorySelect = document.getElementById("categoryFilterSelect");
    const pills = document.querySelectorAll("#vocabLevelPills .level-pill-btn");

    const render = () => {
      const q = (searchInput?.value || "").trim().toLowerCase();
      const level = levelSelect?.value || "all";
      const cat = categorySelect?.value || "all";
      const notebookIds = this.userManager.currentUser?.notebook || [];

      // Đồng bộ trạng thái active của thanh pills
      pills.forEach(btn => {
        const pLevel = btn.getAttribute("data-level");
        btn.classList.toggle("active", pLevel === level);
      });

      const filtered = VOCABULARY_DATA.filter(item => {
        const matchQuery = !q ||
          item.hanzi.toLowerCase().includes(q) ||
          item.pinyin.toLowerCase().includes(q) ||
          item.hanViet.toLowerCase().includes(q) ||
          item.meaning.toLowerCase().includes(q);

        const matchCat = cat === "all" || item.category === cat;

        let matchLevel = true;
        if (level === "notebook") matchLevel = notebookIds.includes(item.id);
        else if (level === "academic") matchLevel = item.level.includes("Học thuật") || item.level.includes("HSK 6");
        else if (level === "hsk1") matchLevel = item.level.includes("HSK 1");
        else if (level === "hsk2") matchLevel = item.level.includes("HSK 2");
        else if (level === "hsk3") matchLevel = item.level.includes("HSK 3");
        else if (level === "hsk4") matchLevel = item.level.includes("HSK 4");
        else if (level === "hsk5") matchLevel = item.level.includes("HSK 5");
        else if (level === "hsk6") matchLevel = item.level.includes("HSK 6");

        return matchQuery && matchCat && matchLevel;
      });

      this.renderVocabGrid(filtered);
    };

    pills.forEach(btn => {
      btn.addEventListener("click", () => {
        const lvl = btn.getAttribute("data-level");
        if (levelSelect) levelSelect.value = lvl;
        render();
      });
    });

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
        this.speech.speak(
          text,
          () => { btn.textContent = "🔊 Đang phát..."; },
          () => { btn.textContent = "Nghe"; }
        );
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
          this.updateWritingCharDetails(char);
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
      const btn = document.getElementById("btnSpeakCard");
      if (currentItem) {
        this.speech.speak(
          currentItem.hanzi,
          () => { if (btn) btn.textContent = "🔊 Đang đọc..."; },
          () => { if (btn) btn.textContent = "Nghe Phát Âm"; }
        );
      }
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
      ).slice(0, 48);

      selectorList.innerHTML = allUniqueChars.map((ch, idx) => {
        const info = HANZI_CHAR_DETAILS[ch];
        const sub = info ? info.hanViet : "";
        return `
          <button type="button" class="char-btn ${idx === 0 ? 'active' : ''}" data-char="${ch}" title="${sub ? `${ch} (${sub})` : ch}">
            <span class="char-btn-hanzi">${ch}</span>
            <span class="char-btn-sub">${sub}</span>
          </button>
        `;
      }).join("");

      selectorList.querySelectorAll(".char-btn").forEach(btn => {
        btn.addEventListener("click", () => {
          selectorList.querySelectorAll(".char-btn").forEach(b => b.classList.remove("active"));
          btn.classList.add("active");
          const ch = btn.getAttribute("data-char");
          this.writingCanvas.setChar(ch);
          const infoEl = document.getElementById("canvasCharInfo");
          if (infoEl) infoEl.textContent = `Chữ: ${ch}`;
          this.updateWritingCharDetails(ch);
        });
      });

      this.updateWritingCharDetails(allUniqueChars[0] || "研");
    }

    document.getElementById("btnSpeakWritingChar")?.addEventListener("click", () => {
      const ch = this.writingCanvas?.charToPractice || "研";
      const btn = document.getElementById("btnSpeakWritingChar");
      this.speech.speak(
        ch,
        () => { if (btn) btn.textContent = "🔊 Đang đọc..."; },
        () => { if (btn) btn.textContent = "🔊 Nghe Phát Âm"; }
      );
    });

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

  updateWritingCharDetails(ch) {
    const details = HANZI_CHAR_DETAILS[ch] || {
      pinyin: "",
      hanViet: "",
      meaning: "Chữ Hán trong kho từ vựng tiếng Trung",
      radical: "Tra cứu bộ thủ",
      strokes: 1,
      strokeType: "Quy chuẩn bút thuận",
      compounds: ""
    };

    if (!details.pinyin) {
      const matchWord = VOCABULARY_DATA.find(v => v.hanzi.includes(ch));
      if (matchWord) {
        details.meaning = matchWord.meaning;
        details.hanViet = matchWord.hanViet;
        details.radical = matchWord.radical;
      }
    }

    const hanziEl = document.getElementById("detailCharHanzi");
    const pyEl = document.getElementById("detailCharPinyin");
    const hvEl = document.getElementById("detailCharHanViet");
    const meanEl = document.getElementById("detailCharMeaning");
    const radEl = document.getElementById("detailCharRadical");
    const stkEl = document.getElementById("detailCharStrokes");
    const typeEl = document.getElementById("detailCharType");
    const compEl = document.getElementById("detailCharCompounds");

    if (hanziEl) hanziEl.textContent = ch;
    if (pyEl) pyEl.textContent = details.pinyin || "";
    if (hvEl) hvEl.textContent = details.hanViet || "";
    if (meanEl) meanEl.textContent = details.meaning || "";
    if (radEl) radEl.textContent = details.radical || "";
    if (stkEl) stkEl.textContent = details.strokes ? `${details.strokes} nét` : "";
    if (typeEl) typeEl.textContent = details.strokeType || "Kết cấu quy chuẩn";
    if (compEl) compEl.textContent = details.compounds || "";
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

    document.getElementById("btnGoToNextStage")?.addEventListener("click", () => {
      document.getElementById("examResultView").style.display = "none";
      document.getElementById("examActiveView").style.display = "none";
      document.getElementById("examSelectView").style.display = "block";
      this.switchTab("tabRoadmap");
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

    // Xác định xem đề thi này có thuộc chặng nào không
    const stageKey = this.activeExam?.exam?.stageKey || result.stageKey || "";
    result.stageKey = stageKey;

    let promoResult = null;
    const alertEl = document.getElementById("examGraduationAlert");
    const nextStageBtn = document.getElementById("btnGoToNextStage");

    if (result.isPassed && stageKey) {
      promoResult = this.userManager.promoteStage(stageKey);
      if (alertEl) {
        alertEl.style.display = "block";
        alertEl.innerHTML = `
          <div class="graduation-banner">
            <div style="font-size: 2.8rem; margin-bottom: 8px;">🎉 🏆 🎓</div>
            <h3 style="margin: 0 0 8px 0; color: var(--success); font-size: 1.35rem; font-weight: 900;">
              XUẤT SẮC VƯỢT QUA BÀI TEST ĐÁNH GIÁ NÂNG CẤP!
            </h3>
            <p style="margin: 0 0 14px 0; font-size: 0.95rem; color: var(--ink-secondary); line-height: 1.6;">
              ${promoResult?.graduatedAll ? 'Xin chúc mừng! Bạn đã hoàn thành xuất sắc toàn bộ các chặng trong lộ trình Tiếng Trung Học Thuật Chuyên Sâu.' : `Bạn đã mở khóa thành công <strong>${promoResult?.nextStageName}</strong> và được cộng thưởng <strong>+100 XP</strong> danh dự!`}
            </p>
          </div>
        `;
      }
      if (nextStageBtn) {
        nextStageBtn.style.display = "inline-block";
        nextStageBtn.textContent = promoResult?.graduatedAll ? "🎓 Xem Lại Toàn Bộ Lộ Trình" : `🚀 Đi Đến ${promoResult?.nextStageName}`;
      }
      this.showToast(`Chúc mừng! Bạn đã vượt qua bài test và được nâng cấp lộ trình!`);
    } else if (!result.isPassed && stageKey) {
      if (alertEl) {
        alertEl.style.display = "block";
        alertEl.innerHTML = `
          <div style="background: rgba(239, 68, 68, 0.1); border: 2px solid var(--danger); border-radius: var(--radius-lg); padding: 20px 24px; text-align: center;">
            <div style="font-size: 2rem; margin-bottom: 6px;">⚠️</div>
            <h3 style="margin: 0 0 6px 0; color: var(--danger); font-size: 1.2rem; font-weight: 900;">
              CHƯA ĐẠT ĐIỂM NÂNG CẤP LỘ TRÌNH (CẦN >= 70%)
            </h3>
            <p style="margin: 0; font-size: 0.9rem; color: var(--ink-secondary); line-height: 1.5;">
              Điểm số hiện tại của bạn là <strong>${result.scorePercent}%</strong>. Đừng lo lắng! Hãy xem lại giải thích chi tiết các câu sai bên dưới, ôn tập lại bài học rồi làm lại bài test để nâng cấp nhé.
            </p>
          </div>
        `;
      }
      if (nextStageBtn) nextStageBtn.style.display = "none";
    } else {
      if (alertEl) alertEl.style.display = "none";
      if (nextStageBtn) nextStageBtn.style.display = "none";
    }

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

  // ========================== ROADMAP INTERACTIVE LESSONS ==========================
  initLessonRunner() {
    const modal = document.getElementById("roadmapLessonModal");
    document.getElementById("btnCloseLessonModal")?.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });
    document.getElementById("btnCancelLesson")?.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });

    document.getElementById("btnFinishLesson")?.addEventListener("click", () => {
      const stageKey = this.currentLessonStage || "stage1";
      const lesson = ROADMAP_LESSONS[stageKey];
      if (!lesson) return;

      const stage = this.userManager.completeStageLesson(stageKey);
      this.updateUserUI();
      if (modal) modal.style.display = "none";
      this.showToast(`Xuất sắc! Bạn đã hoàn thành toàn bộ bài tập của [${stage?.name || 'chặng này'}] 🎉. Trạng thái bài test nâng cấp đã sẵn sàng!`);
    });
  }

  openStageLesson(stageKey) {
    const lesson = ROADMAP_LESSONS[stageKey];
    if (!lesson) return;
    this.currentLessonStage = stageKey;

    const modal = document.getElementById("roadmapLessonModal");
    const badgeEl = document.getElementById("lessonStageBadge");
    const titleEl = document.getElementById("lessonStageTitle");
    const bodyEl = document.getElementById("lessonModalBody");
    const finishBtn = document.getElementById("btnFinishLesson");

    if (badgeEl) badgeEl.textContent = lesson.badge;
    if (titleEl) titleEl.textContent = lesson.title;
    if (finishBtn) finishBtn.textContent = `Hoàn Thành Bài Học (+${lesson.xpReward} XP)`;

    if (bodyEl) {
      bodyEl.innerHTML = lesson.sections.map((sec, sIdx) => {
        let secHtml = `
          <div class="lesson-section-box">
            <div class="lesson-section-title">${sec.title}</div>
            ${sec.content ? `<div style="font-size: 0.92rem; color: var(--ink-secondary); line-height: 1.6;">${sec.content}</div>` : ''}
        `;

        if (sec.vocabList && sec.vocabList.length > 0) {
          secHtml += `<div style="margin-top: 10px;">` + sec.vocabList.map(v => `
            <div class="lesson-vocab-item">
              <div>
                <span class="hanzi-main hanzi-font" style="font-size: 1.3rem; margin-right: 8px;">${v.hanzi}</span>
                <span style="font-size: 0.95rem; font-weight: 700; color: var(--primary); margin-right: 8px;">${v.pinyin}</span>
                <span style="font-size: 0.85rem; color: var(--ink-muted);">${v.mean}</span>
              </div>
              <button type="button" class="btn btn-secondary btn-sm btn-lesson-speak" data-text="${v.hanzi}" title="Nghe phát âm chuẩn">
                🔊 Nghe
              </button>
            </div>
          `).join("") + `</div>`;
        }

        if (sec.quiz) {
          secHtml += `
            <div style="margin-top: 14px; background: var(--surface); padding: 14px; border-radius: var(--radius-sm); border: 1px solid var(--border);">
              <div style="font-weight: 800; font-size: 0.92rem; margin-bottom: 10px; color: var(--ink);">${sec.quiz.question}</div>
              <div class="lesson-quiz-options" data-sidx="${sIdx}">
                ${sec.quiz.options.map((opt, oIdx) => `
                  <button type="button" class="lesson-quiz-option" data-correct="${opt.correct}" data-oidx="${oIdx}">
                    ${opt.text}
                  </button>
                `).join("")}
              </div>
              <div class="lesson-quiz-explain" style="display: none; font-size: 0.84rem; color: var(--ink-secondary); margin-top: 8px; padding-top: 8px; border-top: 1px dashed var(--border);">
                💡 <strong>Giải thích:</strong> ${sec.quiz.explanation}
              </div>
            </div>
          `;
        }

        secHtml += `</div>`;
        return secHtml;
      }).join("");

      // Gắn sự kiện phát âm
      bodyEl.querySelectorAll(".btn-lesson-speak").forEach(btn => {
        btn.addEventListener("click", () => {
          const txt = btn.getAttribute("data-text");
          this.speech.speak(
            txt,
            () => { btn.textContent = "🔊 Đang đọc..."; },
            () => { btn.textContent = "🔊 Nghe"; }
          );
        });
      });

      // Gắn sự kiện trắc nghiệm
      bodyEl.querySelectorAll(".lesson-quiz-options").forEach(quizWrap => {
        const explainEl = quizWrap.parentElement.querySelector(".lesson-quiz-explain");
        quizWrap.querySelectorAll(".lesson-quiz-option").forEach(optBtn => {
          optBtn.addEventListener("click", () => {
            const isCorrect = optBtn.getAttribute("data-correct") === "true";
            quizWrap.querySelectorAll(".lesson-quiz-option").forEach(b => {
              b.disabled = true;
              if (b.getAttribute("data-correct") === "true") b.classList.add("correct");
            });
            if (!isCorrect) {
              optBtn.classList.add("wrong");
            }
            if (explainEl) explainEl.style.display = "block";
          });
        });
      });
    }

    if (modal) modal.style.display = "flex";
  }

  // ========================== USER GUIDE CONTROLLER ==========================
  initUserGuide() {
    const modal = document.getElementById("userGuideModal");
    document.getElementById("btnCloseUserGuideModal")?.addEventListener("click", () => {
      if (modal) modal.style.display = "none";
    });

    document.querySelectorAll(".guide-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".guide-tab-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const guideKey = btn.getAttribute("data-guide");
        this.renderUserGuideContent(guideKey);
      });
    });
  }

  renderUserGuideContent(guideKey) {
    const box = document.getElementById("guideContentBox");
    if (!box) return;

    const data = USER_GUIDE_DATA[guideKey] || USER_GUIDE_DATA.roadmap;
    box.innerHTML = `
      <h4>${data.title}</h4>
      ${data.content}
    `;
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
    const curTxt = LEVEL_LABELS[user.currentLevel] || user.currentLevel;
    const tgtTxt = TARGET_LABELS[user.targetLevel] || user.targetLevel;
    document.getElementById("profileBigTarget").textContent = `Trình độ: ${curTxt} ➔ Mục tiêu: ${tgtTxt}`;
    document.getElementById("profileCreatedAt").textContent = user.createdAt || "Hôm nay";

    const lvl = this.userManager.getLevelInfo();
    document.getElementById("profileLevelBadge").textContent = `Cấp ${lvl.level}: ${lvl.title}`;
    document.getElementById("profileXPVal").textContent = `${lvl.currentXP} / ${lvl.nextLevelXP} XP`;
    document.getElementById("profileProgressBar").style.width = `${lvl.progressPercent}%`;

    const statusEl = document.getElementById("profileRoadmapStatus");
    if (statusEl && user.roadmap) {
      const unlockedStages = Object.values(user.roadmap).filter(s => s.unlocked);
      const activeStage = unlockedStages[unlockedStages.length - 1] || user.roadmap.stage1;
      const statusText = activeStage.passedTest ? "Đã Tốt Nghiệp Chặng" : (activeStage.readyForTest ? "Đã sẵn sàng thi nâng cấp" : `${activeStage.progress}% tiến độ`);
      statusEl.innerHTML = `Đang học tại <strong>${activeStage.name}</strong> (${statusText}). Vượt qua các bài test nâng cấp để mở khóa chặng tiếp theo.`;
    }

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
