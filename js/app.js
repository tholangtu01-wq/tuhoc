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
    this.selectedAvatar = "🐼";
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
    this.initMobileBottomNav();
    this.initKeyboardShortcuts();
    this.initTeacherPortal();

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

    const currentLevelSelect = document.getElementById("inputCurrentLevel");
    const targetLevelSelect = document.getElementById("inputTargetLevel");

    const levelRankMap = {
      level_0: 0,
      level_hsk1: 1,
      level_hsk2: 2,
      level_hsk3: 3,
      level_hsk4: 4,
      level_hsk5: 5,
      level_hsk6: 6,
      level_academic: 7
    };

    const targetRankMap = {
      target_hsk1: 1,
      target_hsk2: 2,
      target_hsk3: 3,
      target_hsk4: 4,
      target_hsk5: 5,
      target_hsk6: 6,
      target_academic: 7
    };

    const nextTargetMap = {
      level_0: "target_hsk2",
      level_hsk1: "target_hsk2",
      level_hsk2: "target_hsk3",
      level_hsk3: "target_hsk4",
      level_hsk4: "target_hsk5",
      level_hsk5: "target_hsk6",
      level_hsk6: "target_academic",
      level_academic: "target_academic"
    };

    this.syncLevelOptions = () => {
      if (!currentLevelSelect || !targetLevelSelect) return;
      const curVal = currentLevelSelect.value;
      const curRank = levelRankMap[curVal] ?? 0;
      const curTgtVal = targetLevelSelect.value;
      const curTgtRank = targetRankMap[curTgtVal] ?? 2;

      // Cập nhật trạng thái các lựa chọn mục tiêu
      Array.from(targetLevelSelect.options).forEach(opt => {
        const optRank = targetRankMap[opt.value] ?? 1;
        const cleanText = opt.text.replace(" (✓ Đã đạt)", "");
        if (optRank <= curRank && optRank < 7) {
          opt.disabled = true;
          opt.text = cleanText + " (✓ Đã đạt)";
        } else {
          opt.disabled = false;
          opt.text = cleanText;
        }
      });

      // Nếu mục tiêu hiện tại thấp hơn hoặc bằng trình độ hiện tại, tự động chuyển lên mục tiêu tiếp theo hợp lý
      if (curTgtRank <= curRank) {
        targetLevelSelect.value = nextTargetMap[curVal] || "target_academic";
      }
    };

    if (currentLevelSelect) {
      currentLevelSelect.addEventListener("change", () => {
        this.syncLevelOptions();
      });
    }

    const onboardingForm = document.getElementById("onboardingForm");
    if (onboardingForm) {
      onboardingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const nameInput = document.getElementById("inputUserName");

        const name = (nameInput?.value || "").trim() || "Học Viên";
        const currentLevel = currentLevelSelect?.value || "level_0";
        const targetLevel = targetLevelSelect?.value || "target_hsk2";

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
      this.selectedAvatar = this.userManager.currentUser.avatar || "🐼";
    } else {
      this.selectedAvatar = "🐼";
    }

    // Cập nhật trạng thái hiển thị của các nút avatar văn hóa Trung Hoa
    document.querySelectorAll(".avatar-choice-btn").forEach(btn => {
      if (btn.getAttribute("data-avatar") === this.selectedAvatar) {
        btn.classList.add("selected");
      } else {
        btn.classList.remove("selected");
      }
    });

    if (typeof this.syncLevelOptions === "function") {
      this.syncLevelOptions();
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

    const VALID_AVATARS = ["🐼", "🐉", "🏮", "🀄", "📜", "🥟", "🍵", "🏯"];
    const displayAvatar = (user.avatar && VALID_AVATARS.includes(user.avatar)) ? user.avatar : "🐼";

    if (avatarEl) avatarEl.textContent = displayAvatar;
    if (nameEl) nameEl.textContent = user.name;
    const curLevelText = LEVEL_LABELS[user.currentLevel] || "Mới bắt đầu";
    const tgtText = TARGET_LABELS[user.targetLevel] || "Học thuật";
    if (targetEl) targetEl.textContent = `${curLevelText} ➔ ${tgtText}`;
    if (streakEl) streakEl.textContent = user.streak;
    if (xpEl) xpEl.textContent = user.xp;

    const greetingAvatarEl = document.getElementById("roadmapGreetingAvatar");
    const greetingNameEl = document.getElementById("roadmapGreetingName");
    const targetDescEl = document.getElementById("roadmapTargetDesc");

    if (greetingAvatarEl) greetingAvatarEl.textContent = displayAvatar;
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

    // Đồng bộ trạng thái active trên thanh Bottom Nav điện thoại
    document.querySelectorAll(".mobile-nav-btn").forEach(btn => {
      const bTab = btn.getAttribute("data-tab");
      btn.classList.toggle("active", bTab === tabId);
    });

    document.querySelectorAll(".tab-pane").forEach(pane => {
      pane.classList.toggle("active", pane.id === tabId);
    });

    // Cuộn nhẹ lên đầu trang khi chuyển tab trên màn hình điện thoại
    if (typeof window !== "undefined" && window.innerWidth <= 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

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

    this.renderDailyGoal();

    document.getElementById("roadmapGreetingAvatar").textContent = user.avatar;
    document.getElementById("roadmapGreetingName").textContent = `Lộ Trình Học Của ${user.name}`;

    const stagesList = document.getElementById("roadmapStagesList");
    if (!stagesList) return;

    const stages = [
      { key: "stage1", icon: "🌱", targetTab: "tabVocab", desc: "Nắm vững 4 thanh điệu, quy tắc phiên âm Pinyin và 214 Bộ thủ Hán tự nền tảng (HSK 1)." },
      { key: "stage2", icon: "🗣️", targetTab: "tabVocab", desc: "Giao tiếp hàng ngày, ngữ pháp câu chữ 是, 有/没有 và 300 từ vựng cốt lõi (HSK 2)." },
      { key: "stage3", icon: "📚", targetTab: "tabVocab", desc: "Đoạn văn sinh hoạt, cấu trúc so sánh 比, liên từ ghép câu và 600 từ vựng (HSK 3)." },
      { key: "stage4", icon: "💼", targetTab: "tabVocab", desc: "Câu chữ 把, câu bị động 被, bổ ngữ khả năng/xu hướng và thảo luận phỏng vấn (HSK 4)." },
      { key: "stage5", icon: "📰", targetTab: "tabVocab", desc: "Đọc báo chí, nghị luận xã hội, câu phức nhiều tầng định ngữ và từ vựng HSK 5." },
      { key: "stage6", icon: "🖋️", targetTab: "tabVocab", desc: "Thành ngữ 4 chữ kinh điển, cấu trúc câu cổ điển, biên phiên dịch lưu loát (HSK 6)." },
      { key: "stage7", icon: "🎓", targetTab: "tabVocab", desc: "Cấu trúc luận văn khoa học IMRaD chuẩn quốc tế, bảo vệ khóa luận và thuật ngữ nghiên cứu." }
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

  renderDailyGoal() {
    const goal = this.userManager.getDailyGoal();
    if (!goal) return;

    const fcCountEl = document.getElementById("taskProgressFlashcard");
    const wrCountEl = document.getElementById("taskProgressWriting");
    const spCountEl = document.getElementById("taskProgressSpeech");
    const badgeEl = document.getElementById("dailyGoalStatusBadge");

    const itemFc = document.getElementById("taskItemFlashcard");
    const itemWr = document.getElementById("taskItemWriting");
    const itemSp = document.getElementById("taskItemSpeech");

    if (fcCountEl) fcCountEl.textContent = `${Math.min(goal.flashcard, goal.flashcardTarget)}/${goal.flashcardTarget}`;
    if (wrCountEl) wrCountEl.textContent = `${Math.min(goal.writing, goal.writingTarget)}/${goal.writingTarget}`;
    if (spCountEl) spCountEl.textContent = `${Math.min(goal.speech, goal.speechTarget)}/${goal.speechTarget}`;

    const fcDone = goal.flashcard >= goal.flashcardTarget;
    const wrDone = goal.writing >= goal.writingTarget;
    const spDone = goal.speech >= goal.speechTarget;

    if (itemFc) itemFc.classList.toggle("completed", fcDone);
    if (itemWr) itemWr.classList.toggle("completed", wrDone);
    if (itemSp) itemSp.classList.toggle("completed", spDone);

    if (fcDone && wrDone && spDone) {
      if (badgeEl) {
        badgeEl.textContent = "✅ ĐÃ HOÀN THÀNH (+50 XP)";
        badgeEl.className = "badge-tag badge-hsk";
      }
    } else {
      const completedCount = (fcDone ? 1 : 0) + (wrDone ? 1 : 0) + (spDone ? 1 : 0);
      if (badgeEl) {
        badgeEl.textContent = `Đang thực hiện (${completedCount}/3)`;
        badgeEl.className = "badge-tag badge-academic";
      }
    }
  }

  // ========================== TAB 2: TỪ ĐIỂN & SỔ TAY ==========================
  updateVocabPillsCount() {
    const counts = {
      all: VOCABULARY_DATA.length,
      hsk1: VOCABULARY_DATA.filter(v => v.level === "HSK 1").length,
      hsk2: VOCABULARY_DATA.filter(v => v.level === "HSK 2").length,
      hsk3: VOCABULARY_DATA.filter(v => v.level === "HSK 3").length,
      hsk4: VOCABULARY_DATA.filter(v => v.level === "HSK 4").length,
      hsk5: VOCABULARY_DATA.filter(v => v.level === "HSK 5").length,
      academic: VOCABULARY_DATA.filter(v => v.level.includes("Học thuật") || v.level.includes("HSK 6")).length,
      notebook: (this.userManager.currentUser?.notebook || []).length
    };
    const setEl = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = val;
    };
    setEl("countPillAll", counts.all);
    setEl("countPillHsk1", counts.hsk1);
    setEl("countPillHsk2", counts.hsk2);
    setEl("countPillHsk3", counts.hsk3);
    setEl("countPillHsk4", counts.hsk4);
    setEl("countPillHsk5", counts.hsk5);
    setEl("countPillAcademic", counts.academic);
    setEl("countPillNotebook", counts.notebook);
  }

  initVocabTab() {
    this.updateVocabPillsCount();
    const searchInput = document.getElementById("vocabSearchInput");
    const levelSelect = document.getElementById("levelFilterSelect");
    const categorySelect = document.getElementById("categoryFilterSelect");
    const pills = document.querySelectorAll("#vocabLevelPills .level-pill-btn");

    if (categorySelect) {
      const currentVal = categorySelect.value || "all";
      const uniqueCats = Array.from(new Set(VOCABULARY_DATA.map(v => v.category))).sort();
      categorySelect.innerHTML = `<option value="all">Tất cả chủ đề (${uniqueCats.length} chủ đề)</option>` +
        uniqueCats.map(cat => `<option value="${cat}">${cat}</option>`).join("");
      if (uniqueCats.includes(currentVal) || currentVal === "all") {
        categorySelect.value = currentVal;
      }
    }

    document.querySelectorAll("#vocabStudyModesBar .study-mode-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("#vocabStudyModesBar .study-mode-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const mode = btn.getAttribute("data-mode");
        const grid = document.getElementById("vocabGrid");
        if (grid) {
          grid.classList.remove("mode-hide-pinyin", "mode-hide-meaning");
          if (mode === "hide-pinyin") {
            grid.classList.add("mode-hide-pinyin");
            this.showToast("Chế độ Ẩn Pinyin: Bấm vào vùng mờ để tự kiểm tra cách đọc!");
          } else if (mode === "hide-meaning") {
            grid.classList.add("mode-hide-meaning");
            this.showToast("Chế độ Ẩn Nghĩa: Bấm vào vùng mờ để tự kiểm tra ý nghĩa!");
          } else {
            this.showToast("Đã hiển thị đầy đủ thông tin từ vựng");
          }
        }
      });
    });

    const render = () => {
      this.updateVocabPillsCount();
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
      const charsHtml = Array.from(item.hanzi).map(ch => 
        `<span class="vocab-char-link" data-char="${ch}" title="Bấm vào chữ '${ch}' để chuyển sang bảng tập viết">${ch}</span>`
      ).join("");
      return `
        <div class="vocab-card" data-id="${item.id}">
          <div>
            <div class="vocab-card-header">
              <div>
                <div class="hanzi-main hanzi-font">${charsHtml}</div>
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

    grid.querySelectorAll(".vocab-char-link").forEach(span => {
      span.addEventListener("click", () => {
        const ch = span.getAttribute("data-char");
        this.switchTab("tabWriting");
        if (this.writingCanvas) {
          this.writingCanvas.setChar(ch);
          const infoEl = document.getElementById("canvasCharInfo");
          if (infoEl) infoEl.textContent = `Chữ: ${ch}`;
          this.updateWritingCharDetails(ch);
        }
      });
    });

    // Bấm vào vùng mờ để lật mở nhanh Pinyin hoặc Nghĩa (Flash-Quiz Mode)
    grid.querySelectorAll(".pinyin-line span:first-child, .meaning-text").forEach(el => {
      el.addEventListener("click", () => {
        el.classList.toggle("revealed");
      });
    });

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

    document.getElementById("btnSpeakCardExample")?.addEventListener("click", (e) => {
      e.stopPropagation();
      const currentItem = this.getCurrentSRSCardItem();
      const btn = document.getElementById("btnSpeakCardExample");
      if (currentItem && currentItem.exampleZh) {
        this.speech.speak(
          currentItem.exampleZh,
          () => { if (btn) btn.textContent = "🔊 Đang đọc..."; },
          () => { if (btn) btn.textContent = "🔊 Nghe Câu Ví Dụ"; }
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

    // Ghi nhận tiến độ Mục Tiêu Học Tập Hôm Nay
    const res = this.userManager.recordDailyProgress("flashcard", 1);
    if (res?.rewardGranted) {
      this.showToast("🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc Mục Tiêu Học Tập Hôm Nay (+50 XP)");
    }

    this.updateUserUI();
    this.renderDailyGoal();

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
    const searchInput = document.getElementById("inputSearchWritingChar");
    const levelSelect = document.getElementById("selectWritingLevel");

    const renderWritingChars = (level = "all", query = "") => {
      if (!selectorList) return;

      let filteredVocab = VOCABULARY_DATA;
      if (level && level !== "all") {
        filteredVocab = VOCABULARY_DATA.filter(v => v.level === level);
      }

      let chars = Array.from(new Set(filteredVocab.flatMap(v => v.hanzi.split(""))));

      if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        chars = chars.filter(ch => {
          if (ch.includes(q)) return true;
          const info = HANZI_CHAR_DETAILS[ch];
          if (info) {
            if (info.pinyin.toLowerCase().includes(q)) return true;
            if (info.hanViet.toLowerCase().includes(q)) return true;
            if (info.meaning.toLowerCase().includes(q)) return true;
          }
          return false;
        });
      }

      if (chars.length === 0) {
        selectorList.innerHTML = `<div style="font-size: 0.82rem; color: var(--ink-muted); padding: 14px; text-align: center; width: 100%;">Không tìm thấy chữ Hán nào phù hợp</div>`;
        return;
      }

      selectorList.innerHTML = chars.map((ch, idx) => {
        let sub = "";
        const info = HANZI_CHAR_DETAILS[ch];
        if (info && info.hanViet) {
          sub = info.hanViet.split("/")[0].trim();
        } else {
          const matchWord = VOCABULARY_DATA.find(v => v.hanzi.includes(ch));
          if (matchWord) {
            const pos = matchWord.hanzi.indexOf(ch);
            const hvSyllables = matchWord.hanViet.split(/\s+/);
            sub = (pos >= 0 && pos < hvSyllables.length) ? hvSyllables[pos] : matchWord.meaning.slice(0, 4);
          }
        }

        const isCurrent = (this.writingCanvas?.charToPractice === ch) || (idx === 0 && !this.writingCanvas?.charToPractice);
        return `
          <button type="button" class="char-btn ${isCurrent ? 'active' : ''}" data-char="${ch}" title="${sub ? `${ch} (${sub})` : ch}">
            <span class="char-btn-hanzi">${ch}</span>
            <span class="char-btn-sub">${sub || 'Chữ Hán'}</span>
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
    };

    if (selectorList) {
      renderWritingChars("all", "");

      if (searchInput) {
        searchInput.addEventListener("input", () => {
          renderWritingChars(levelSelect?.value || "all", searchInput.value);
        });
      }

      if (levelSelect) {
        levelSelect.addEventListener("change", () => {
          renderWritingChars(levelSelect.value, searchInput?.value || "");
        });
      }

      this.updateWritingCharDetails("研");
    }

    // Chọn ngòi bút viết thon gọn (Bút bi 0.5mm, Bút gel 0.7mm, Bút lông 1.0mm)
    document.querySelectorAll(".btn-pen-type").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-pen-type").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const penType = btn.getAttribute("data-pen") || "ballpoint";
        if (this.writingCanvas) {
          this.writingCanvas.setPenType(penType);
          this.writingCanvas.render();
        }
        const penNames = {
          ballpoint: "Bút bi thanh 0.5mm (Nét mảnh, đều như viết tập sách)",
          gel: "Bút gel học sinh 0.7mm (Thon gọn, có độ nhấn nhẹ)",
          brush: "Bút lông nhỏ 1.0mm (Nét thanh đậm linh hoạt)"
        };
        this.showToast(`Đã chuyển ngòi bút: ${penNames[penType] || penType}`);
      });
    });

    document.getElementById("btnSpeakWritingChar")?.addEventListener("click", () => {
      const ch = this.writingCanvas?.charToPractice || "研";
      const btn = document.getElementById("btnSpeakWritingChar");
      this.speech.speak(
        ch,
        () => { if (btn) btn.textContent = "🔊 Đang đọc..."; },
        () => { if (btn) btn.textContent = "🔊 Nghe Phát Âm"; }
      );
    });

    document.getElementById("btnToggleExpandCanvas")?.addEventListener("click", () => {
      this.toggleCanvasExpanded();
    });

    document.getElementById("btnToggleGhost")?.addEventListener("click", () => {
      this.writingCanvas.toggleGhost();
      const btn = document.getElementById("btnToggleGhost");
      if (btn) btn.textContent = `Mẫu Nét Mờ: ${this.writingCanvas.showGhost ? 'BẬT' : 'TẮT'}`;
    });

    document.getElementById("btnAnimateStrokes")?.addEventListener("click", () => {
      const btn = document.getElementById("btnAnimateStrokes");
      if (btn) btn.textContent = "⏳ Đang chạy...";
      this.writingCanvas.playStrokeAnimation(() => {
        if (btn) btn.textContent = "▶ Nét Mẫu";
      });
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

      // Ghi nhận tiến độ Mục Tiêu Học Tập Hôm Nay
      const res = this.userManager.recordDailyProgress("writing", 1);
      if (res?.rewardGranted) {
        this.showToast("🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc Mục Tiêu Học Tập Hôm Nay (+50 XP)");
      }

      this.updateUserUI();
      this.renderDailyGoal();
      this.showToast("Xuất sắc! Đã hoàn thành luyện viết 1 chữ Hán (+20 XP)");
    });
  }

  toggleCanvasExpanded() {
    const panel = document.querySelector(".canvas-panel");
    const btn = document.getElementById("btnToggleExpandCanvas");
    if (!panel) return;
    const isExpanded = panel.classList.toggle("expanded");
    if (btn) btn.textContent = isExpanded ? "🗗 Thu Nhỏ" : "⛶ Phóng To";
    if (this.writingCanvas) {
      setTimeout(() => this.writingCanvas.handleResize(), 80);
    }
    this.showToast(isExpanded ? "Đã phóng to bảng viết (Tối ưu cho iPad & Laptop)" : "Đã đưa bảng viết về kích thước mặc định");
  }

  updateWritingCharDetails(ch) {
    let details = HANZI_CHAR_DETAILS[ch];
    if (!details) {
      const matchWord = VOCABULARY_DATA.find(v => v.hanzi.includes(ch));
      if (matchWord) {
        const pos = matchWord.hanzi.indexOf(ch);
        const hvParts = matchWord.hanViet.split(/\s+/);
        const pyParts = matchWord.pinyin.split(/\s+/);
        details = {
          pinyin: (pos >= 0 && pos < pyParts.length) ? pyParts[pos] : matchWord.pinyin,
          hanViet: (pos >= 0 && pos < hvParts.length) ? hvParts[pos] : matchWord.hanViet,
          meaning: matchWord.meaning,
          radical: matchWord.radical,
          strokes: 5,
          strokeType: "Quy chuẩn bút thuận",
          compounds: `${matchWord.hanzi} (${matchWord.pinyin} - ${matchWord.meaning})`
        };
      } else {
        details = {
          pinyin: "pīnyīn",
          hanViet: "Hán Việt",
          meaning: "Chữ Hán trong kho dữ liệu luyện viết",
          radical: "Tra cứu bộ thủ",
          strokes: 5,
          strokeType: "Quy chuẩn bút thuận",
          compounds: `${ch} (Đang cập nhật từ ghép)`
        };
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

    document.querySelectorAll(".btn-speed-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        document.querySelectorAll(".btn-speed-toggle").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        const rate = parseFloat(btn.getAttribute("data-rate")) || 1.0;
        this.speech.setSpeechRate(rate);
        this.showToast(`Đã đổi tốc độ phát âm: ${rate === 0.75 ? "🐢 Chậm rãi 0.75x" : "🐇 Tự nhiên 1.0x"}`);
      });
    });

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
              
              // Ghi nhận tiến độ Mục Tiêu Học Tập Hôm Nay
              const res = this.userManager.recordDailyProgress("speech", 1);
              if (res?.rewardGranted) {
                this.showToast("🎉 Chúc mừng! Bạn đã hoàn thành xuất sắc Mục Tiêu Học Tập Hôm Nay (+50 XP)");
              }

              this.updateUserUI();
              this.renderDailyGoal();
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

    const meaningEl = document.getElementById("speechTargetMeaning");
    if (meaningEl) {
      meaningEl.textContent = `[${item.partOfSpeech || 'Từ vựng'}] ${item.meaning}`;
    }

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

    const VALID_AVATARS = ["🐼", "🐉", "🏮", "🀄", "📜", "🥟", "🍵", "🏯"];
    const displayAvatar = (user.avatar && VALID_AVATARS.includes(user.avatar)) ? user.avatar : "🐼";
    document.getElementById("profileBigAvatar").textContent = displayAvatar;
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

  // ========================== MULTI-DEVICE OPTIMIZATIONS (MOBILE / IPAD / LAPTOP) ==========================
  initMobileBottomNav() {
    // Điều hướng nhanh bằng thanh Bottom Nav ngón tay cái trên điện thoại
    document.querySelectorAll(".mobile-nav-btn[data-tab]").forEach(btn => {
      btn.addEventListener("click", () => {
        const targetId = btn.getAttribute("data-tab");
        if (targetId) this.switchTab(targetId);
      });
    });

    const menuModal = document.getElementById("mobileMenuModal");
    const openMenuBtn = document.getElementById("btnOpenMobileMenu");
    const closeMenuBtn = document.getElementById("btnCloseMobileMenu");

    openMenuBtn?.addEventListener("click", () => {
      if (menuModal) menuModal.style.display = "flex";
    });

    closeMenuBtn?.addEventListener("click", () => {
      if (menuModal) menuModal.style.display = "none";
    });

    menuModal?.addEventListener("click", (e) => {
      if (e.target === menuModal) menuModal.style.display = "none";
    });

    // Các mục chức năng mở rộng trong Menu di động
    document.querySelectorAll(".mobile-menu-item[data-tab]").forEach(item => {
      item.addEventListener("click", () => {
        const targetId = item.getAttribute("data-tab");
        if (menuModal) menuModal.style.display = "none";
        if (targetId) this.switchTab(targetId);
      });
    });

    document.getElementById("btnMobileGuide")?.addEventListener("click", () => {
      if (menuModal) menuModal.style.display = "none";
      const guideModal = document.getElementById("userGuideModal");
      if (guideModal) guideModal.style.display = "flex";
      this.renderUserGuideContent("roadmap");
    });

    document.getElementById("btnMobileTheme")?.addEventListener("click", () => {
      if (menuModal) menuModal.style.display = "none";
      document.getElementById("btnToggleTheme")?.click();
    });
  }

  initKeyboardShortcuts() {
    const shortcutsModal = document.getElementById("shortcutsModal");
    document.getElementById("btnOpenShortcuts")?.addEventListener("click", () => {
      this.openShortcutsModal();
    });

    document.getElementById("btnCloseShortcutsModal")?.addEventListener("click", () => {
      if (shortcutsModal) shortcutsModal.style.display = "none";
    });

    shortcutsModal?.addEventListener("click", (e) => {
      if (e.target === shortcutsModal) shortcutsModal.style.display = "none";
    });

    window.addEventListener("keydown", (e) => {
      // Bỏ qua khi người dùng đang nhập văn bản trong ô input, textarea hoặc select
      const activeTag = document.activeElement ? document.activeElement.tagName.toLowerCase() : "";
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") {
        if (e.key === "Escape") {
          document.activeElement.blur();
        }
        return;
      }

      const activeTabPane = document.querySelector(".tab-pane.active");
      const activeTabId = activeTabPane ? activeTabPane.id : "";

      // Phím tắt tìm kiếm tức thì: "/"
      if (e.key === "/" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.switchTab("tabVocab");
        const searchInput = document.getElementById("vocabSearchInput");
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
        }
        return;
      }

      // Phím tắt mở bảng tra cứu phím tắt: "?"
      if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        e.preventDefault();
        this.openShortcutsModal();
        return;
      }

      // Phím tắt chuyển nhanh Tab 1-7: Alt + 1..7
      if (e.altKey && e.key >= "1" && e.key <= "7") {
        e.preventDefault();
        const tabList = ["tabRoadmap", "tabVocab", "tabSRS", "tabWriting", "tabSpeech", "tabExam", "tabProfile"];
        const target = tabList[parseInt(e.key, 10) - 1];
        if (target) this.switchTab(target);
        return;
      }

      // Phím tắt trên Tab Flashcards (SRS SM-2)
      if (activeTabId === "tabSRS") {
        if (e.code === "Space" || e.key === "Enter") {
          e.preventDefault();
          document.getElementById("flashcardWrap")?.click();
          return;
        }
        if (["1", "2", "3", "4"].includes(e.key)) {
          e.preventDefault();
          const rating = parseInt(e.key, 10) - 1;
          this.handleSRSReview(rating);
          return;
        }
        if (e.key.toLowerCase() === "p" || e.key.toLowerCase() === "a") {
          e.preventDefault();
          document.getElementById("btnSpeakCard")?.click();
          return;
        }
      }

      // Phím tắt trên Tab Luyện Viết
      if (activeTabId === "tabWriting" && this.writingCanvas) {
        if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
          e.preventDefault();
          this.writingCanvas.undo();
          return;
        }
        if (e.key === "Delete" || e.key.toLowerCase() === "c") {
          e.preventDefault();
          this.writingCanvas.clear();
          return;
        }
        if (e.key.toLowerCase() === "g") {
          e.preventDefault();
          document.getElementById("btnToggleGhost")?.click();
          return;
        }
        if (e.key.toLowerCase() === "m") {
          e.preventDefault();
          document.getElementById("btnToggleGrid")?.click();
          return;
        }
        if (e.key.toLowerCase() === "b") {
          e.preventDefault();
          const pens = ["ballpoint", "gel", "brush"];
          const curIdx = pens.indexOf(this.writingCanvas.penType);
          const nextPen = pens[(curIdx + 1) % pens.length];
          const targetBtn = document.querySelector(`.btn-pen-type[data-pen="${nextPen}"]`);
          targetBtn?.click();
          return;
        }
        if (e.key.toLowerCase() === "f") {
          e.preventDefault();
          this.toggleCanvasExpanded();
          return;
        }
        if (e.key.toLowerCase() === "p") {
          e.preventDefault();
          document.getElementById("btnSpeakWritingChar")?.click();
          return;
        }
      }
    });
  }

  openShortcutsModal() {
    const modal = document.getElementById("shortcutsModal");
    if (modal) modal.style.display = "flex";
  }

  // ========================== CỔNG QUẢN TRỊ & THEO DÕI GIÁO VIÊN ==========================
  initTeacherPortal() {
    const authModal = document.getElementById("teacherAuthModal");
    const dashModal = document.getElementById("teacherDashboardModal");
    const authForm = document.getElementById("teacherAuthForm");
    const pinInput = document.getElementById("inputTeacherPin");

    const openAuth = () => {
      if (pinInput) pinInput.value = "";
      if (authModal) authModal.style.display = "flex";
      setTimeout(() => pinInput?.focus(), 100);
    };

    document.getElementById("btnOpenTeacherPortal")?.addEventListener("click", openAuth);
    document.getElementById("btnOpenTeacherPortalFromProfile")?.addEventListener("click", openAuth);
    document.getElementById("btnCloseTeacherAuthModal")?.addEventListener("click", () => {
      if (authModal) authModal.style.display = "none";
    });

    authForm?.addEventListener("submit", (e) => {
      e.preventDefault();
      const pin = pinInput?.value || "";
      if (this.userManager.verifyAdminPin(pin)) {
        if (authModal) authModal.style.display = "none";
        if (dashModal) dashModal.style.display = "flex";
        this.renderTeacherDashboard();
        this.showToast("🔓 Đã mở Bảng Quản Trị Giáo Viên thành công!");
      } else {
        this.showToast("❌ Mã PIN Giáo Viên không chính xác!");
        if (pinInput) {
          pinInput.value = "";
          pinInput.focus();
        }
      }
    });

    document.getElementById("btnCloseTeacherDashboardModal")?.addEventListener("click", () => {
      if (dashModal) dashModal.style.display = "none";
    });

    // Search and filter
    document.getElementById("teacherSearchInput")?.addEventListener("input", () => {
      this.renderTeacherDashboard();
    });
    document.getElementById("teacherFilterTarget")?.addEventListener("change", () => {
      this.renderTeacherDashboard();
    });

    // Export CSV
    document.getElementById("btnTeacherExportCSV")?.addEventListener("click", () => {
      const csvStr = this.userManager.exportStudentsToCSV();
      const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `tiengtrungdema-danh-sach-hoc-vien-${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
      this.showToast("📊 Đã xuất file Excel (CSV) danh sách cả lớp!");
    });

    // Import student code
    document.getElementById("btnTeacherImportCode")?.addEventListener("click", () => {
      const code = prompt("Dán Mã Tiến Độ do học viên gửi (Bắt đầu bằng TTDM-SYNC-...):");
      if (!code) return;
      const res = this.userManager.importStudentProgressCode(code);
      if (res.success) {
        this.showToast(`✅ Đã nạp thành công tiến độ của học viên: ${res.studentName}!`);
        this.renderTeacherDashboard();
      } else {
        alert(res.message);
      }
    });

    // Change PIN
    document.getElementById("btnTeacherChangePin")?.addEventListener("click", () => {
      const oldPin = prompt("Nhập mã PIN Giáo Viên hiện tại:");
      if (!oldPin) return;
      const newPin = prompt("Nhập mã PIN mới (ít nhất 4 ký tự):");
      if (!newPin) return;
      const res = this.userManager.changeAdminPin(oldPin, newPin);
      if (res.success) {
        this.showToast("🔑 " + res.message);
      } else {
        alert(res.message);
      }
    });

    // Cloud settings
    const cloudModal = document.getElementById("teacherCloudModal");
    const webhookInput = document.getElementById("inputTeacherWebhook");
    document.getElementById("btnTeacherCloudSettings")?.addEventListener("click", () => {
      if (webhookInput) webhookInput.value = this.userManager.getCloudSyncWebhook() || "";
      if (cloudModal) cloudModal.style.display = "flex";
    });
    document.getElementById("btnCloseTeacherCloudModal")?.addEventListener("click", () => {
      if (cloudModal) cloudModal.style.display = "none";
    });
    document.getElementById("btnCancelTeacherCloud")?.addEventListener("click", () => {
      if (cloudModal) cloudModal.style.display = "none";
    });
    document.getElementById("btnSaveTeacherCloud")?.addEventListener("click", () => {
      const url = webhookInput?.value || "";
      this.userManager.setCloudSyncWebhook(url);
      if (cloudModal) cloudModal.style.display = "none";
      this.showToast("☁️ Đã lưu thiết lập đồng bộ Google Sheets!");
    });

    // Student share progress modal
    const shareModal = document.getElementById("studentShareModal");
    const shareTextarea = document.getElementById("studentShareTextarea");
    let currentShareObj = null;

    document.getElementById("btnShareStudentProgress")?.addEventListener("click", () => {
      currentShareObj = this.userManager.generateStudentProgressCode();
      if (!currentShareObj) return;
      if (shareTextarea) shareTextarea.value = currentShareObj.summaryText;
      if (shareModal) shareModal.style.display = "flex";
    });

    document.getElementById("btnCloseStudentShareModal")?.addEventListener("click", () => {
      if (shareModal) shareModal.style.display = "none";
    });

    document.getElementById("btnCopyStudentCodeOnly")?.addEventListener("click", () => {
      if (currentShareObj && currentShareObj.code) {
        navigator.clipboard.writeText(currentShareObj.code).then(() => {
          this.showToast("🔑 Đã sao chép mã đồng bộ vào bộ nhớ tạm!");
        }).catch(() => {
          shareTextarea.select();
          document.execCommand("copy");
          this.showToast("🔑 Đã sao chép mã!");
        });
      }
    });

    document.getElementById("btnCopyStudentFullReport")?.addEventListener("click", () => {
      if (currentShareObj && currentShareObj.summaryText) {
        navigator.clipboard.writeText(currentShareObj.summaryText).then(() => {
          this.showToast("📋 Đã sao chép toàn bộ báo cáo gửi qua Zalo!");
        }).catch(() => {
          shareTextarea.select();
          document.execCommand("copy");
          this.showToast("📋 Đã sao chép báo cáo!");
        });
      }
    });

    // Student detail modal close
    document.getElementById("btnCloseStudentDetailModal")?.addEventListener("click", () => {
      const detailModal = document.getElementById("teacherStudentDetailModal");
      if (detailModal) detailModal.style.display = "none";
    });
  }

  renderTeacherDashboard() {
    const list = this.userManager.getAllStudentsOverview();
    const searchVal = (document.getElementById("teacherSearchInput")?.value || "").trim().toLowerCase();
    const targetFilter = document.getElementById("teacherFilterTarget")?.value || "all";

    // Stats
    const totalStudents = list.length;
    const totalXP = list.reduce((acc, s) => acc + (s.xp || 0), 0);
    const totalExams = list.reduce((acc, s) => acc + (s.examsCount || 0), 0);
    const topStudent = [...list].sort((a, b) => (b.xp || 0) - (a.xp || 0))[0];

    const statTotalEl = document.getElementById("teacherStatTotalStudents");
    const statXpEl = document.getElementById("teacherStatTotalXP");
    const statExamsEl = document.getElementById("teacherStatTotalExams");
    const statTopEl = document.getElementById("teacherStatTopStudent");

    if (statTotalEl) statTotalEl.textContent = totalStudents;
    if (statXpEl) statXpEl.textContent = totalXP.toLocaleString() + " XP";
    if (statExamsEl) statExamsEl.textContent = totalExams;
    if (statTopEl) {
      statTopEl.textContent = topStudent ? `${topStudent.avatar} ${topStudent.name} (${topStudent.xp} XP)` : "Chưa có";
    }

    // Filter
    const filtered = list.filter(s => {
      const matchName = s.name.toLowerCase().includes(searchVal);
      const matchTarget = targetFilter === "all" || s.targetLevel === targetFilter;
      return matchName && matchTarget;
    });

    const tbody = document.getElementById("teacherStudentsTableBody");
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; padding: 24px; color: var(--ink-muted);">Không tìm thấy học viên nào phù hợp</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((s, idx) => {
      return `
        <tr>
          <td style="font-weight: 700; color: var(--ink-muted);">${idx + 1}</td>
          <td>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-size: 1.4rem;">${s.avatar}</span>
              <div>
                <strong style="color: var(--ink-base);">${s.name}</strong>
                <div style="font-size: 0.72rem; color: var(--ink-muted);">ID: ${s.id.slice(-6)}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="font-size: 0.8rem; font-weight: 600;">${s.targetLevelLabel}</div>
            <div style="font-size: 0.72rem; color: var(--ink-muted);">${s.currentLevelLabel}</div>
          </td>
          <td>
            <span class="teacher-student-badge">
              📍 ${s.currentStageName.split(":")[0]} (${s.completedStages}/7)
            </span>
          </td>
          <td>
            <strong style="color: var(--gold);">${s.xp.toLocaleString()} XP</strong>
          </td>
          <td>
            <span style="color: var(--primary); font-weight: 700;">🔥 ${s.streak} ngày</span>
          </td>
          <td>
            <div style="font-weight: 700;">${s.latestExamScore}</div>
            <div style="font-size: 0.72rem; color: var(--ink-muted);">${s.latestExamTitle || ""}</div>
          </td>
          <td style="font-size: 0.78rem; color: var(--ink-secondary);">
            ${s.lastActiveDate}
          </td>
          <td style="text-align: center;">
            <button type="button" class="btn btn-secondary btn-sm btn-teacher-view-detail" data-uid="${s.id}" style="padding: 4px 8px; font-size: 0.78rem;">
              👁️ Chi Tiết
            </button>
          </td>
        </tr>
      `;
    }).join("");

    tbody.querySelectorAll(".btn-teacher-view-detail").forEach(btn => {
      btn.addEventListener("click", () => {
        const uid = btn.getAttribute("data-uid");
        this.openStudentDetailModal(uid);
      });
    });
  }

  openStudentDetailModal(uid) {
    const user = this.userManager.users.find(u => u.id === uid);
    if (!user) return;
    const modal = document.getElementById("teacherStudentDetailModal");
    if (!modal) return;

    document.getElementById("detailStudentAvatar").textContent = user.avatar || "🐼";
    document.getElementById("detailStudentName").textContent = user.name;
    document.getElementById("detailStudentSub").textContent = `${LEVEL_LABELS[user.currentLevel] || user.currentLevel} ➔ ${TARGET_LABELS[user.targetLevel] || user.targetLevel}`;
    document.getElementById("detailStudentXP").textContent = (user.xp || 0) + " XP";
    document.getElementById("detailStudentStreak").textContent = (user.streak || 1) + " Ngày";
    document.getElementById("detailStudentCreated").textContent = user.createdAt || "--";

    // 7 Stages Roadmap
    const roadmapListEl = document.getElementById("detailStudentRoadmapList");
    if (roadmapListEl) {
      const roadmap = user.roadmap || {};
      const stages = [
        { k: "stage1", n: "Chặng 1: Nhập Môn Pinyin & 214 Bộ Thủ" },
        { k: "stage2", n: "Chặng 2: Nền Tảng HSK 2 & Giao Tiếp Đời Sống" },
        { k: "stage3", n: "Chặng 3: Trung Cấp HSK 3 & Liên Từ Ghép Câu" },
        { k: "stage4", n: "Chặng 4: Nâng Cao HSK 4 & Ngữ Pháp Chuyên Sâu" },
        { k: "stage5", n: "Chặng 5: Báo Chí HSK 5 & Văn Phong Trang Trọng" },
        { k: "stage6", n: "Chặng 6: Thành Thạo HSK 6 & Biên Phiên Dịch" },
        { k: "stage7", n: "Chặng 7: Học Thuật & Luận Văn Chuyên Ngành (IMRaD)" }
      ];

      roadmapListEl.innerHTML = stages.map(st => {
        const data = roadmap[st.k];
        let statusTag = `<span style="color: var(--ink-muted);">🔒 Khóa</span>`;
        if (data && data.passedTest) {
          statusTag = `<span style="color: var(--secondary); font-weight: 700;">✅ Hoàn Thành</span>`;
        } else if (data && data.unlocked) {
          statusTag = `<span style="color: var(--gold-dark); font-weight: 700;">📖 Đang Học</span>`;
        }
        return `
          <div style="display: flex; justify-content: space-between; align-items: center; background: var(--surface-alt); padding: 8px 12px; border-radius: var(--radius-sm); font-size: 0.82rem;">
            <span>${st.n}</span>
            <span>${statusTag}</span>
          </div>
        `;
      }).join("");
    }

    // Exam History
    const examListEl = document.getElementById("detailStudentExamList");
    if (examListEl) {
      const exams = user.examHistory || [];
      if (exams.length === 0) {
        examListEl.innerHTML = `<div style="font-size: 0.82rem; color: var(--ink-muted); font-style: italic;">Học viên chưa làm bài kiểm tra nào.</div>`;
      } else {
        examListEl.innerHTML = exams.map(ex => {
          return `
            <div style="display: flex; justify-content: space-between; padding: 8px 12px; border-bottom: 1px solid var(--border); font-size: 0.82rem;">
              <div>
                <strong>${ex.examTitle}</strong>
                <div style="font-size: 0.72rem; color: var(--ink-muted);">${ex.date}</div>
              </div>
              <div style="text-align: right;">
                <span style="font-weight: 800; color: ${ex.passed ? 'var(--secondary)' : 'var(--primary)'};">${ex.score}/${ex.total}</span>
                <div style="font-size: 0.72rem;">${ex.passed ? 'Đạt' : 'Chưa đạt'}</div>
              </div>
            </div>
          `;
        }).join("");
      }
    }

    // Activity Logs
    const logsEl = document.getElementById("detailStudentLogsList");
    if (logsEl) {
      const logs = (user.activityLogs || []).slice(-10).reverse();
      if (logs.length === 0) {
        logsEl.innerHTML = `<div>Chưa có nhật ký hoạt động.</div>`;
      } else {
        logsEl.innerHTML = logs.map(l => {
          return `
            <div style="display: flex; justify-content: space-between; padding: 4px 0; border-bottom: 1px dashed var(--border);">
              <span>${l.action}</span>
              <span style="color: var(--ink-muted); font-size: 0.75rem;">${l.timestamp}</span>
            </div>
          `;
        }).join("");
      }
    }

    modal.style.display = "flex";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  window.app = new AppController();
});
