/**
 * User & Multi-Profile Manager for tiengtrungdema
 * Quản lý người dùng, lộ trình học cá nhân hóa theo trình độ hiện tại & mục tiêu, và bài test nâng cấp
 */

const USERS_STORAGE_KEY = "tiengtrungdema_users_v3";
const CURRENT_USER_ID_KEY = "tiengtrungdema_current_user_id_v3";
const ADMIN_SETTINGS_KEY = "tiengtrungdema_admin_settings_v1";

const encodeUtf8Base64 = (str) => {
  if (typeof Buffer !== "undefined") return Buffer.from(str, "utf8").toString("base64");
  return btoa(unescape(encodeURIComponent(str)));
};

const decodeUtf8Base64 = (b64) => {
  if (typeof Buffer !== "undefined") return Buffer.from(b64, "base64").toString("utf8");
  return decodeURIComponent(escape(atob(b64)));
};

export const LEVEL_LABELS = {
  level_0: "1. Mới bắt đầu (Từ con số 0 / Chưa biết gì)",
  level_hsk1: "2. Căn bản HSK 1 (~150 từ & Pinyin)",
  level_hsk2: "3. Sơ cấp HSK 2 (~300 từ & Giao tiếp thường nhật)",
  level_hsk3: "4. Trung cấp 1 HSK 3 (~600 từ & Đời sống)",
  level_hsk4: "5. Trung cấp 2 HSK 4 (~1,200 từ & Phỏng vấn)",
  level_hsk5: "6. Cao cấp 1 HSK 5 (~2,500 từ & Báo chí)",
  level_hsk6: "7. Cao cấp 2 HSK 6 (~5,000 từ & Thành thạo)",
  level_academic: "8. Học thuật & Luận văn (IMRaD)",
  // Tuong thich nguoc
  "hsk1-2": "2. Căn bản HSK 1 - 2",
  "hsk3-4": "4. Trung cấp HSK 3 - 4",
  "hsk5-6": "6. Cao cấp HSK 5 - 6",
  academic: "8. Học thuật & Luận văn"
};

export const TARGET_LABELS = {
  target_hsk1: "1. Mục tiêu HSK 1 — Nhập môn phát âm & 150 từ vựng",
  target_hsk2: "2. Mục tiêu HSK 2 — Giao tiếp căn bản thường nhật (~300 từ)",
  target_hsk3: "3. Mục tiêu HSK 3 — Tự tin sinh hoạt đời sống & Du lịch (~600 từ)",
  target_hsk4: "4. Mục tiêu HSK 4 — Giao tiếp nâng cao & Phỏng vấn xin việc (~1.200 từ)",
  target_hsk5: "5. Mục tiêu HSK 5 — Đọc báo chí & Làm việc chuyên môn (~2.500 từ)",
  target_hsk6: "6. Mục tiêu HSK 6 — Thành thạo lưu loát, thành ngữ & Biên dịch (~5.000 từ)",
  target_academic: "7. Mục tiêu Học thuật — Nghiên cứu & Luận văn Chuyên ngành (IMRaD)",
  academic: "7. Mục tiêu Học thuật — Nghiên cứu & Luận văn Chuyên ngành (IMRaD)",
  "hsk1-2": "2. Mục tiêu HSK 2 (Giao tiếp thường nhật)",
  "hsk3-4": "4. Mục tiêu HSK 4 (Nâng cao)",
  "hsk5-6": "6. Mục tiêu HSK 6 (Cao cấp)"
};

export class UserManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUserId = this.loadCurrentUserId();
    
    // Nếu chưa có người dùng nào, tạo sẵn học viên mặc định
    if (this.users.length === 0) {
      const defUser = this.createDefaultUser("Học Viên", "level_0", "target_hsk2", "🐼");
      this.users = [defUser];
      this.currentUser = defUser;
      this.currentUserId = defUser.id;
      this.saveUsers();
      this.saveCurrentUserId();
    } else {
      this.currentUser = this.users.find(u => u.id === this.currentUserId) || this.users[0];
      const VALID_AVATARS = ["🐼", "🐉", "🏮", "🀄", "📜", "🥟", "🍵", "🏯"];
      if (this.currentUser && (!this.currentUser.avatar || !VALID_AVATARS.includes(this.currentUser.avatar))) {
        this.currentUser.avatar = "🐼";
      }
      this.currentUserId = this.currentUser ? this.currentUser.id : "";
      this.saveUsers();
      this.saveCurrentUserId();
    }
  }

  createDefaultUser(name = "Học Viên", currentLevel = "level_0", targetLevel = "target_hsk2", avatar = "🐼") {
    const today = new Date().toISOString().slice(0, 10);
    const nowStr = new Date().toLocaleString("vi-VN");

    const roadmap = {
      stage1: {
        key: "stage1",
        name: "Chặng 1: Nhập Môn Pinyin & 214 Bộ Thủ (HSK 1)",
        desc: "4 thanh điệu, quy tắc biến điệu ngữ âm và 214 bộ thủ Hán tự nền tảng",
        progress: 0,
        unlocked: true,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage1"
      },
      stage2: {
        key: "stage2",
        name: "Chặng 2: Nền Tảng HSK 2 & Giao Tiếp Đời Sống",
        desc: "Mẫu câu giao tiếp hàng ngày, ngữ pháp chữ 是, 有/没有 và 300 từ vựng cốt lõi",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage2"
      },
      stage3: {
        key: "stage3",
        name: "Chặng 3: Trung Cấp HSK 3 & Liên Từ Ghép Câu",
        desc: "Đoạn văn sinh hoạt, liên từ logic, so sánh 比, bổ ngữ kết quả và 600 từ vựng",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage3"
      },
      stage4: {
        key: "stage4",
        name: "Chặng 4: Trung Cấp Cao HSK 4 & Câu Chữ 把, Bổ Ngữ",
        desc: "Câu chữ 把, câu chữ 被, bổ ngữ khả năng/xu hướng và thảo luận phỏng vấn",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage4"
      },
      stage5: {
        key: "stage5",
        name: "Chặng 5: Cao Cấp HSK 5 & Đọc Báo Chí, Nghị Luận",
        desc: "Phân tích câu phức nhiều tầng định ngữ, cấu trúc nghị luận xã hội và văn hóa",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage5"
      },
      stage6: {
        key: "stage6",
        name: "Chặng 6: Cao Cấp HSK 6 & Thành Ngữ, Ngữ Pháp Chuyên Sâu",
        desc: "Thành ngữ 4 chữ kinh điển, cấu trúc câu cổ điển, biên phiên dịch lưu loát",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage6"
      },
      stage7: {
        key: "stage7",
        name: "Chặng 7: Tiếng Trung Học Thuật Chuyên Sâu & Luận Văn IMRaD",
        desc: "Cấu trúc luận văn IMRaD chuẩn quốc tế, bảo vệ khóa luận và thuật ngữ nghiên cứu",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage7"
      }
    };

    // Tự động thích ứng lộ trình dựa trên Trình độ hiện tại (currentLevel: 1 -> 6 + Học thuật)
    const levelOrder = ["level_0", "level_hsk1", "level_hsk2", "level_hsk3", "level_hsk4", "level_hsk5", "level_hsk6", "level_academic"];
    let normalizedLevel = currentLevel;
    if (currentLevel === "hsk1-2") normalizedLevel = "level_hsk1";
    if (currentLevel === "hsk3-4") normalizedLevel = "level_hsk3";
    if (currentLevel === "hsk5-6") normalizedLevel = "level_hsk5";
    if (currentLevel === "academic") normalizedLevel = "level_academic";

    const userLevelIdx = Math.max(0, levelOrder.indexOf(normalizedLevel));
    const stageKeys = ["stage1", "stage2", "stage3", "stage4", "stage5", "stage6", "stage7"];

    stageKeys.forEach((sKey, sIdx) => {
      if (sIdx < userLevelIdx) {
        roadmap[sKey].unlocked = true;
        roadmap[sKey].progress = 100;
        roadmap[sKey].completedLesson = true;
        roadmap[sKey].passedTest = true;
      } else if (sIdx === userLevelIdx) {
        roadmap[sKey].unlocked = true;
      }
    });

    const curLabel = LEVEL_LABELS[currentLevel] || currentLevel;
    const tgtLabel = TARGET_LABELS[targetLevel] || targetLevel;

    return {
      id: "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: (name || "Học Viên").trim(),
      currentLevel: currentLevel || "level_0",
      targetLevel: targetLevel || "target_hsk2",
      target: targetLevel || "target_hsk2",
      avatar: avatar || "🐼",
      createdAt: nowStr,
      xp: 50,
      streak: 1,
      lastActiveDate: today,
      roadmap,
      srsCards: {},
      notebook: [],
      examHistory: [],
      activityLogs: [
        {
          timestamp: nowStr,
          action: `Khởi tạo lộ trình từ [${curLabel}] hướng đến [${tgtLabel}]`,
          xpEarned: 50
        }
      ]
    };
  }

  loadUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY) || localStorage.getItem("hanzii_users_v2");
      const users = data ? JSON.parse(data) : [];
      const VALID_AVATARS = ["🐼", "🐉", "🏮", "🀄", "📜", "🥟", "🍵", "🏯"];
      users.forEach(u => {
        if (!u.avatar || !VALID_AVATARS.includes(u.avatar) || u.avatar.includes("\uFFFD")) {
          u.avatar = "🐼";
        }
      });
      return users;
    } catch (e) {
      console.warn("Lỗi khi tải danh sách người dùng:", e);
      return [];
    }
  }

  saveUsers() {
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(this.users));
    } catch (e) {
      console.error("Lỗi khi lưu danh sách người dùng:", e);
    }
  }

  loadCurrentUserId() {
    return localStorage.getItem(CURRENT_USER_ID_KEY) || localStorage.getItem("hanzii_current_user_id_v2") || "";
  }

  saveCurrentUserId() {
    if (this.currentUserId) {
      localStorage.setItem(CURRENT_USER_ID_KEY, this.currentUserId);
    }
  }

  /**
   * Tạo một hồ sơ người học mới với lộ trình cá nhân hóa
   * Hỗ trợ cả hai cú pháp: (name, currentLevel, targetLevel, avatar) hoặc (name, targetLevel, avatar)
   */
  createUser(name, currentLevelOrTarget = "level_0", targetLevel = "target_hsk2", avatar = "🐼") {
    const trimmedName = (name || "Học Viên").trim();
    let curLevel = "level_0";
    let tgtLevel = "target_hsk2";
    let avt = avatar;

    if (typeof currentLevelOrTarget === "string" && currentLevelOrTarget.startsWith("level_")) {
      curLevel = currentLevelOrTarget;
      tgtLevel = targetLevel || "target_hsk2";
      avt = avatar || "🐼";
    } else {
      tgtLevel = currentLevelOrTarget || "target_hsk2";
      avt = (typeof targetLevel === "string" && targetLevel.length <= 4) ? targetLevel : "🐼";
    }

    // Nếu hồ sơ duy nhất hiện tại là "Học Viên" mặc định, cập nhật trực tiếp
    if (this.users.length === 1 && (this.users[0].name === "Học Viên" || this.users[0].name === "Đang tải...") && this.users[0].examHistory.length === 0) {
      const updated = this.createDefaultUser(trimmedName, curLevel, tgtLevel, avt);
      this.users[0] = { ...updated, id: this.users[0].id };
      this.currentUser = this.users[0];
      this.currentUserId = this.users[0].id;
      this.saveUsers();
      this.saveCurrentUserId();
      return this.currentUser;
    }

    const newUser = this.createDefaultUser(trimmedName, curLevel, tgtLevel, avt);
    this.users.push(newUser);
    this.saveUsers();
    this.switchUser(newUser.id);
    this.syncStudentToCloud(newUser);
    return newUser;
  }

  /**
   * Chuyển đổi giữa các người học
   */
  switchUser(userId) {
    const user = this.users.find(u => u.id === userId);
    if (user) {
      this.currentUser = user;
      this.currentUserId = user.id;
      this.saveCurrentUserId();
      this.checkDailyStreak();
      return user;
    }
    return null;
  }

  /**
   * Xóa một hồ sơ người dùng
   */
  deleteUser(userId) {
    this.users = this.users.filter(u => u.id !== userId);
    this.saveUsers();
    if (this.currentUserId === userId) {
      this.currentUser = this.users[0] || null;
      this.currentUserId = this.currentUser ? this.currentUser.id : "";
      this.saveCurrentUserId();
    }
  }

  /**
   * Kiểm tra và duy trì Streak theo ngày cho người dùng hiện tại
   */
  checkDailyStreak() {
    if (!this.currentUser) return;
    const today = new Date().toISOString().slice(0, 10);
    if (this.currentUser.lastActiveDate !== today) {
      const lastDate = new Date(this.currentUser.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.currentUser.streak += 1;
      } else if (diffDays > 1) {
        this.currentUser.streak = 1;
      }
      this.currentUser.lastActiveDate = today;
      this.saveUsers();
    }
  }

  /**
   * Thêm điểm kinh nghiệm và ghi log hoạt động
   */
  addXP(amount, actionDesc) {
    if (!this.currentUser) return;
    this.currentUser.xp += amount;
    const nowStr = new Date().toLocaleString("vi-VN");
    
    this.currentUser.activityLogs.unshift({
      timestamp: nowStr,
      action: actionDesc,
      xpEarned: amount
    });

    if (this.currentUser.activityLogs.length > 50) {
      this.currentUser.activityLogs.pop();
    }

    this.checkRoadmapProgression();
    this.saveUsers();
    this.syncStudentToCloud(this.currentUser);
  }

  checkRoadmapProgression() {
    if (!this.currentUser || !this.currentUser.roadmap) return;
    const xp = this.currentUser.xp;
    const rm = this.currentUser.roadmap;
    if (xp >= 100 && rm.stage2) rm.stage2.unlocked = true;
    if (xp >= 250 && rm.stage3) rm.stage3.unlocked = true;
    if (xp >= 450 && rm.stage4) rm.stage4.unlocked = true;
    if (xp >= 700 && rm.stage5) rm.stage5.unlocked = true;
    if (xp >= 1000 && rm.stage6) rm.stage6.unlocked = true;
    if (xp >= 1400 && rm.stage7) rm.stage7.unlocked = true;
  }

  /**
   * Hoàn thành bài học lý thuyết & bài tập của một chặng trong lộ trình
   */
  completeStageLesson(stageKey) {
    if (!this.currentUser || !this.currentUser.roadmap || !this.currentUser.roadmap[stageKey]) return null;
    const stage = this.currentUser.roadmap[stageKey];
    stage.completedLesson = true;
    stage.progress = 100;
    stage.readyForTest = true;
    this.addXP(40, `Hoàn thành xuất sắc bài tập [${stage.name}]`);
    this.saveUsers();
    return stage;
  }

  /**
   * Nâng cấp lộ trình khi người dùng vượt qua bài test kiểm tra (Checkpoint Test)
   * Di chuyển tuần tự qua 7 chặng từ HSK 1 đến HSK 6 và Học thuật IMRaD
   */
  promoteStage(stageKey) {
    if (!this.currentUser || !this.currentUser.roadmap) return null;
    const stageKeys = ["stage1", "stage2", "stage3", "stage4", "stage5", "stage6", "stage7"];
    const idx = stageKeys.indexOf(stageKey);
    if (idx === -1) return null;

    const currentStage = this.currentUser.roadmap[stageKey];
    currentStage.passedTest = true;
    currentStage.graduated = true;
    currentStage.progress = 100;

    const nextIdx = idx + 1;
    if (nextIdx < stageKeys.length) {
      const nextKey = stageKeys[nextIdx];
      const nextStage = this.currentUser.roadmap[nextKey];
      nextStage.unlocked = true;

      // Nâng cấp trình độ hiện tại liên tục từ HSK 1 đến HSK 6 và Học thuật
      const nextLevelMap = {
        stage2: "level_hsk2",
        stage3: "level_hsk3",
        stage4: "level_hsk4",
        stage5: "level_hsk5",
        stage6: "level_hsk6",
        stage7: "level_academic"
      };
      if (nextLevelMap[nextKey]) {
        this.currentUser.currentLevel = nextLevelMap[nextKey];
      }

      this.addXP(100, `🎉 Vượt qua bài test nâng cấp! Đã mở khóa [${nextStage.name}]`);
      this.saveUsers();
      return {
        graduatedAll: false,
        nextStageKey: nextKey,
        nextStageName: nextStage.name
      };
    } else {
      // Đã tốt nghiệp toàn bộ lộ trình
      this.currentUser.currentLevel = "level_academic";
      this.addXP(200, `🎓 XUẤT SẮC TỐT NGHIỆP TOÀN BỘ LỘ TRÌNH TIẾNG TRUNG HỌC THUẬT!`);
      this.saveUsers();
      return {
        graduatedAll: true,
        message: "Chúc mừng bạn đã hoàn thành trọn vẹn lộ trình học tập chuyên sâu!"
      };
    }
  }

  /**
   * Lưu kết quả thi CBT vào lịch sử của người dùng
   */
  recordExam(examResult) {
    if (!this.currentUser) return;
    const record = {
      examTitle: examResult.examTitle,
      stageKey: examResult.stageKey || "",
      level: examResult.level,
      scorePercent: examResult.scorePercent,
      correctCount: examResult.correctCount,
      totalQuestions: examResult.totalQuestions,
      isPassed: examResult.isPassed,
      certCode: examResult.certCode,
      date: new Date().toLocaleString("vi-VN")
    };

    this.currentUser.examHistory.unshift(record);
    this.addXP(examResult.isPassed ? 80 : 30, `Hoàn thành bài test [${examResult.examTitle}] (${examResult.scorePercent}%)`);
    this.saveUsers();
  }

  /**
   * Đánh dấu / Bỏ đánh dấu từ vựng vào Sổ tay cá nhân
   */
  toggleNotebook(vocabId) {
    if (!this.currentUser) return false;
    const idx = this.currentUser.notebook.indexOf(vocabId);
    let added = false;
    if (idx === -1) {
      this.currentUser.notebook.push(vocabId);
      added = true;
      this.addXP(5, `Thêm từ vựng vào Sổ tay cá nhân`);
    } else {
      this.currentUser.notebook.splice(idx, 1);
    }
    this.saveUsers();
    return added;
  }

  getLevelInfo() {
    if (!this.currentUser) {
      return { level: 1, title: "Học Đồng Nhập Môn", currentXP: 0, nextLevelXP: 100, progressPercent: 0 };
    }
    const xp = this.currentUser.xp;
    const level = Math.floor(Math.sqrt(xp / 100)) + 1;
    const nextLevelXP = Math.pow(level, 2) * 100;
    const currentLevelBaseXP = Math.pow(level - 1, 2) * 100;
    const progressPercent = Math.min(
      100,
      Math.max(0, Math.round(((xp - currentLevelBaseXP) / (nextLevelXP - currentLevelBaseXP)) * 100))
    );

    const titles = [
      "Học Đồng Nhập Môn (初学童子)",
      "Sinh Viên Sơ Cấp (初级生)",
      "Tú Tài Trung Cấp (中级秀才)",
      "Cử Nhân Học Thuật (学术举人)",
      "Tiến Sĩ Thông Thái (博学进士)",
      "Hàn Lâm Viện Sĩ (翰林院士)",
      "Đại Tông Sư Hán Học (汉学大宗师)"
    ];
    const title = titles[Math.min(level - 1, titles.length - 1)];

    return {
      level,
      title,
      currentXP: xp,
      nextLevelXP,
      progressPercent
    };
  }

  /**
   * Lấy thông tin Mục Tiêu Học Tập Hôm Nay (Tự động reset mỗi ngày mới)
   */
  getDailyGoal() {
    if (!this.currentUser) return null;
    const today = new Date().toISOString().slice(0, 10);
    if (!this.currentUser.dailyGoal || this.currentUser.dailyGoal.date !== today) {
      this.currentUser.dailyGoal = {
        date: today,
        flashcard: 0,
        flashcardTarget: 5,
        writing: 0,
        writingTarget: 2,
        speech: 0,
        speechTarget: 3,
        rewardClaimed: false
      };
      this.saveUsers();
    }
    return this.currentUser.dailyGoal;
  }

  /**
   * Cập nhật tiến độ Mục Tiêu Học Tập Hôm Nay & Thưởng +50 XP khi hoàn thành
   */
  recordDailyProgress(type, amount = 1) {
    const goal = this.getDailyGoal();
    if (!goal) return null;
    if (goal[type] !== undefined) {
      goal[type] += amount;
    }
    const isCompleted = (goal.flashcard >= goal.flashcardTarget) &&
                        (goal.writing >= goal.writingTarget) &&
                        (goal.speech >= goal.speechTarget);
    let rewardGranted = false;
    if (isCompleted && !goal.rewardClaimed) {
      goal.rewardClaimed = true;
      this.addXP(50, "🎯 Hoàn thành xuất sắc Mục Tiêu Học Tập Hôm Nay!");
      rewardGranted = true;
    }
    this.saveUsers();
    return { goal, isCompleted, rewardGranted };
  }

  // ========================== CỔNG QUẢN TRỊ & THEO DÕI GIÁO VIÊN ==========================

  getAdminSettings() {
    try {
      const data = localStorage.getItem(ADMIN_SETTINGS_KEY);
      if (data) {
        const parsed = JSON.parse(data);
        return {
          pin: parsed.pin || "8888",
          webhookUrl: parsed.webhookUrl || ""
        };
      }
    } catch (e) {
      console.warn("Lỗi khi tải cài đặt giáo viên:", e);
    }
    return { pin: "8888", webhookUrl: "" };
  }

  saveAdminSettings(settings) {
    try {
      const current = this.getAdminSettings();
      const updated = { ...current, ...settings };
      localStorage.setItem(ADMIN_SETTINGS_KEY, JSON.stringify(updated));
      return updated;
    } catch (e) {
      console.error("Lỗi khi lưu cài đặt giáo viên:", e);
      return null;
    }
  }

  verifyAdminPin(pin) {
    const settings = this.getAdminSettings();
    return String(pin || "").trim() === String(settings.pin).trim();
  }

  changeAdminPin(oldPin, newPin) {
    if (!this.verifyAdminPin(oldPin)) {
      return { success: false, message: "Mã PIN cũ không chính xác!" };
    }
    const cleaned = String(newPin || "").trim();
    if (cleaned.length < 4) {
      return { success: false, message: "Mã PIN mới phải có ít nhất 4 ký tự!" };
    }
    this.saveAdminSettings({ pin: cleaned });
    return { success: true, message: "Đã cập nhật mã PIN Giáo Viên thành công!" };
  }

  setCloudSyncWebhook(url) {
    const cleaned = String(url || "").trim();
    this.saveAdminSettings({ webhookUrl: cleaned });
    return cleaned;
  }

  getCloudSyncWebhook() {
    return this.getAdminSettings().webhookUrl;
  }

  getAllStudentsOverview() {
    return this.users.map(u => {
      const roadmap = u.roadmap || {};
      const stages = Object.keys(roadmap);
      const completedStages = stages.filter(k => roadmap[k].passedTest || roadmap[k].completedLesson).length;
      let currentStageName = "Chặng 1: Nhập Môn";
      for (const k of stages) {
        if (roadmap[k].unlocked) currentStageName = roadmap[k].name;
      }
      const latestExam = (u.examHistory && u.examHistory.length > 0)
        ? u.examHistory[u.examHistory.length - 1]
        : null;
      return {
        id: u.id,
        name: u.name,
        avatar: u.avatar || "🐼",
        currentLevel: u.currentLevel,
        currentLevelLabel: LEVEL_LABELS[u.currentLevel] || u.currentLevel,
        targetLevel: u.targetLevel,
        targetLevelLabel: TARGET_LABELS[u.targetLevel] || u.targetLevel,
        xp: u.xp || 0,
        streak: u.streak || 1,
        createdAt: u.createdAt || "N/A",
        lastActiveDate: u.lastActiveDate || u.createdAt || "N/A",
        completedStages,
        totalStages: 7,
        currentStageName,
        examsCount: u.examHistory ? u.examHistory.length : 0,
        latestExamScore: latestExam ? `${latestExam.score}/${latestExam.total}` : "Chưa thi",
        latestExamTitle: latestExam ? latestExam.examTitle : "",
        latestExamDate: latestExam ? latestExam.date : "",
        srsCount: u.srsCards ? Object.keys(u.srsCards).length : 0,
        notebookCount: u.notebook ? u.notebook.length : 0,
        activityLogs: u.activityLogs || []
      };
    });
  }

  exportStudentsToCSV() {
    const students = this.getAllStudentsOverview();
    const headers = [
      "Họ và Tên",
      "Avatar",
      "Trình Độ Ban Đầu",
      "Mục Tiêu",
      "Điểm XP",
      "Chuỗi Ngày (Streak)",
      "Chặng Đang Học",
      "Số Chặng Đã Xong",
      "Số Đề Thi Đã Nộp",
      "Điểm Thi Gần Nhất",
      "Ngày Học Gần Nhất",
      "Ngày Đăng Ký"
    ];
    
    const escapeCsv = (val) => {
      const s = String(val === undefined || val === null ? "" : val);
      if (s.includes(",") || s.includes('"') || s.includes("\n")) {
        return `"${s.replace(/"/g, '""')}"`;
      }
      return s;
    };

    const rows = students.map(s => [
      escapeCsv(s.name),
      escapeCsv(s.avatar),
      escapeCsv(s.currentLevelLabel),
      escapeCsv(s.targetLevelLabel),
      escapeCsv(s.xp),
      escapeCsv(s.streak),
      escapeCsv(s.currentStageName),
      escapeCsv(`${s.completedStages}/${s.totalStages}`),
      escapeCsv(s.examsCount),
      escapeCsv(s.latestExamScore),
      escapeCsv(s.lastActiveDate),
      escapeCsv(s.createdAt)
    ].join(","));

    return "\uFEFF" + [headers.join(","), ...rows].join("\r\n");
  }

  generateStudentProgressCode(userId = null) {
    const user = userId ? this.users.find(u => u.id === userId) : this.currentUser;
    if (!user) return null;

    const payload = {
      app: "tiengtrungdema",
      type: "student_progress_sync",
      v: "3.3",
      timestamp: new Date().toISOString(),
      student: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        currentLevel: user.currentLevel,
        targetLevel: user.targetLevel,
        xp: user.xp,
        streak: user.streak,
        createdAt: user.createdAt,
        lastActiveDate: user.lastActiveDate,
        roadmap: user.roadmap,
        examHistory: user.examHistory || [],
        activityLogs: (user.activityLogs || []).slice(-15)
      }
    };

    const base64Str = encodeUtf8Base64(JSON.stringify(payload));
    const latestExam = (user.examHistory && user.examHistory.length > 0)
      ? user.examHistory[user.examHistory.length - 1]
      : null;

    const summaryText = 
`🎓 [TIENGTRUNGDEMA - BÁO CÁO TIẾN ĐỘ HỌC TẬP]
👤 Học viên: ${user.name} (${user.avatar})
🎯 Trình độ: ${LEVEL_LABELS[user.currentLevel] || user.currentLevel}
🚀 Mục tiêu: ${TARGET_LABELS[user.targetLevel] || user.targetLevel}
⚡ Điểm XP: ${user.xp} XP | 🔥 Chuỗi ngày: ${user.streak} ngày
📝 Bài thi gần nhất: ${latestExam ? `${latestExam.score}/${latestExam.total} (${latestExam.examTitle})` : "Chưa thi"}
📅 Cập nhật: ${new Date().toLocaleString("vi-VN")}
--------------------------------------
🔑 Mã đồng bộ cho Giáo Viên:
TTDM-SYNC-${base64Str}`;

    return {
      code: `TTDM-SYNC-${base64Str}`,
      summaryText,
      payload
    };
  }

  importStudentProgressCode(rawCode) {
    try {
      if (!rawCode || typeof rawCode !== "string") {
        return { success: false, message: "Mã tiến độ không hợp lệ hoặc đang để trống!" };
      }
      let cleaned = rawCode.trim();
      if (cleaned.includes("TTDM-SYNC-")) {
        const parts = cleaned.split("TTDM-SYNC-");
        cleaned = parts[parts.length - 1].trim().split(/\s+/)[0];
      }
      const jsonStr = decodeUtf8Base64(cleaned);
      const data = JSON.parse(jsonStr);

      if (data.app !== "tiengtrungdema" || !data.student || !data.student.name) {
        return { success: false, message: "Dữ liệu mã không đúng cấu trúc tiengtrungdema!" };
      }

      const s = data.student;
      const existingIndex = this.users.findIndex(u => u.id === s.id || (u.name.toLowerCase() === s.name.toLowerCase() && u.avatar === s.avatar));

      if (existingIndex >= 0) {
        const current = this.users[existingIndex];
        this.users[existingIndex] = {
          ...current,
          ...s,
          xp: Math.max(current.xp || 0, s.xp || 0),
          streak: Math.max(current.streak || 1, s.streak || 1),
          lastActiveDate: s.lastActiveDate || current.lastActiveDate,
          roadmap: { ...(current.roadmap || {}), ...(s.roadmap || {}) },
          examHistory: s.examHistory && s.examHistory.length > 0 ? s.examHistory : (current.examHistory || [])
        };
      } else {
        this.users.push(s);
      }

      this.saveUsers();
      return { success: true, studentName: s.name, isUpdate: existingIndex >= 0 };
    } catch (e) {
      console.error("Lỗi khi nhập mã tiến độ:", e);
      return { success: false, message: "Mã tiến độ bị lỗi hoặc không giải mã được: " + e.message };
    }
  }

  syncStudentToCloud(user = null) {
    const targetUser = user || this.currentUser;
    if (!targetUser) return;
    const webhookUrl = this.getCloudSyncWebhook();
    if (!webhookUrl || !webhookUrl.startsWith("http")) return;

    try {
      const payload = {
        action: "student_progress_ping",
        timestamp: new Date().toLocaleString("vi-VN"),
        id: targetUser.id,
        name: targetUser.name,
        avatar: targetUser.avatar,
        currentLevel: LEVEL_LABELS[targetUser.currentLevel] || targetUser.currentLevel,
        targetLevel: TARGET_LABELS[targetUser.targetLevel] || targetUser.targetLevel,
        xp: targetUser.xp,
        streak: targetUser.streak,
        lastActiveDate: targetUser.lastActiveDate,
        latestExam: (targetUser.examHistory && targetUser.examHistory.length > 0)
          ? targetUser.examHistory[targetUser.examHistory.length - 1]
          : null
      };

      if (typeof fetch !== "undefined") {
        fetch(webhookUrl, {
          method: "POST",
          mode: "no-cors",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        }).catch(() => {});
      }
    } catch (e) {
      // Non-blocking background
    }
  }
}
