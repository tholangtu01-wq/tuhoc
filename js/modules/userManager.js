/**
 * User & Multi-Profile Manager for tiengtrungdema
 * Quản lý người dùng, lộ trình học cá nhân hóa theo trình độ hiện tại & mục tiêu, và bài test nâng cấp
 */

const USERS_STORAGE_KEY = "tiengtrungdema_users_v3";
const CURRENT_USER_ID_KEY = "tiengtrungdema_current_user_id_v3";

export const LEVEL_LABELS = {
  level_0: "Mới bắt đầu (Bắt đầu từ con số 0)",
  level_hsk1: "Căn bản (HSK 1 - 2)",
  level_hsk3: "Trung cấp (HSK 3 - 4)",
  level_hsk5: "Cao cấp (HSK 5)",
  level_academic: "Học thuật & Luận văn (HSK 6)"
};

export const TARGET_LABELS = {
  target_hsk2: "HSK 2 (Giao tiếp thường nhật)",
  target_hsk4: "HSK 4 (Giao tiếp công việc & phỏng vấn)",
  target_hsk6: "HSK 6 (Cao cấp & Báo chí lưu loát)",
  target_academic: "Học thuật & Luận văn Chuyên ngành (IMRaD)",
  academic: "Học thuật & Luận văn Chuyên ngành (IMRaD)",
  "hsk1-2": "HSK 1 - 2 (Căn bản)",
  "hsk3-4": "HSK 3 - 4 (Trung cấp)",
  "hsk5-6": "HSK 5 - 6 (Cao cấp)"
};

export class UserManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUserId = this.loadCurrentUserId();
    
    // Nếu chưa có người dùng nào, tạo sẵn học viên mặc định
    if (this.users.length === 0) {
      const defUser = this.createDefaultUser("Học Viên", "level_0", "target_academic", "👨‍🎓");
      this.users = [defUser];
      this.currentUser = defUser;
      this.currentUserId = defUser.id;
      this.saveUsers();
      this.saveCurrentUserId();
    } else {
      this.currentUser = this.users.find(u => u.id === this.currentUserId) || this.users[0];
      this.currentUserId = this.currentUser ? this.currentUser.id : "";
      this.saveCurrentUserId();
    }
  }

  createDefaultUser(name = "Học Viên", currentLevel = "level_0", targetLevel = "target_academic", avatar = "👨‍🎓") {
    const today = new Date().toISOString().slice(0, 10);
    const nowStr = new Date().toLocaleString("vi-VN");

    const roadmap = {
      stage1: {
        key: "stage1",
        name: "Chặng 1: Nhập Môn Pinyin & 214 Bộ Thủ",
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
        name: "Chặng 2: Nền Tảng HSK 1-2 & Giao Tiếp",
        desc: "Mẫu câu giao tiếp hàng ngày, ngữ pháp chữ 是, 有/没有 và 300 từ vựng",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage2"
      },
      stage3: {
        key: "stage3",
        name: "Chặng 3: Trung Cấp HSK 3-4 & Ngữ Pháp",
        desc: "Đoạn văn trung cấp, câu chữ 把, bổ ngữ kết quả và liên từ logic",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage3"
      },
      stage4: {
        key: "stage4",
        name: "Chặng 4: Cao Cấp HSK 5 & Đọc Báo Chí",
        desc: "Phân tích câu phức nhiều tầng định ngữ, cấu trúc nghị luận xã hội",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage4"
      },
      stage5: {
        key: "stage5",
        name: "Chặng 5: Học Thuật & Luận Văn Chuyên Sâu",
        desc: "Cấu trúc luận văn IMRaD chuẩn quốc tế, bảo vệ khóa luận và thuật ngữ nghiên cứu",
        progress: 0,
        unlocked: false,
        completedLesson: false,
        readyForTest: false,
        passedTest: false,
        checkpointExamId: "exam-stage5"
      }
    };

    // Tự động thích ứng lộ trình dựa trên Trình độ hiện tại (currentLevel)
    if (currentLevel === "level_hsk1" || currentLevel === "hsk1-2") {
      roadmap.stage1.unlocked = true;
      roadmap.stage1.progress = 100;
      roadmap.stage1.completedLesson = true;
      roadmap.stage1.passedTest = true;
      roadmap.stage2.unlocked = true;
    } else if (currentLevel === "level_hsk3" || currentLevel === "hsk3-4") {
      roadmap.stage1.unlocked = true;
      roadmap.stage1.progress = 100;
      roadmap.stage1.passedTest = true;
      roadmap.stage2.unlocked = true;
      roadmap.stage2.progress = 100;
      roadmap.stage2.passedTest = true;
      roadmap.stage3.unlocked = true;
    } else if (currentLevel === "level_hsk5" || currentLevel === "hsk5-6") {
      roadmap.stage1.unlocked = true;
      roadmap.stage1.progress = 100;
      roadmap.stage1.passedTest = true;
      roadmap.stage2.unlocked = true;
      roadmap.stage2.progress = 100;
      roadmap.stage2.passedTest = true;
      roadmap.stage3.unlocked = true;
      roadmap.stage3.progress = 100;
      roadmap.stage3.passedTest = true;
      roadmap.stage4.unlocked = true;
    }

    const curLabel = LEVEL_LABELS[currentLevel] || currentLevel;
    const tgtLabel = TARGET_LABELS[targetLevel] || targetLevel;

    return {
      id: "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: (name || "Học Viên").trim(),
      currentLevel: currentLevel || "level_0",
      targetLevel: targetLevel || "target_academic",
      target: targetLevel || "target_academic",
      avatar: avatar || "👨‍🎓",
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
      return data ? JSON.parse(data) : [];
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
  createUser(name, currentLevelOrTarget = "level_0", targetLevel = "target_academic", avatar = "👨‍🎓") {
    const trimmedName = (name || "Học Viên").trim();
    let curLevel = "level_0";
    let tgtLevel = "target_academic";
    let avt = avatar;

    if (typeof currentLevelOrTarget === "string" && currentLevelOrTarget.startsWith("level_")) {
      curLevel = currentLevelOrTarget;
      tgtLevel = targetLevel || "target_academic";
      avt = avatar || "👨‍🎓";
    } else {
      tgtLevel = currentLevelOrTarget || "target_academic";
      avt = (typeof targetLevel === "string" && targetLevel.length <= 4) ? targetLevel : "👨‍🎓";
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
  }

  checkRoadmapProgression() {
    if (!this.currentUser || !this.currentUser.roadmap) return;
    const xp = this.currentUser.xp;
    const rm = this.currentUser.roadmap;
    if (xp >= 150 && rm.stage2) rm.stage2.unlocked = true;
    if (xp >= 400 && rm.stage3) rm.stage3.unlocked = true;
    if (xp >= 750 && rm.stage4) rm.stage4.unlocked = true;
    if (xp >= 1200 && rm.stage5) rm.stage5.unlocked = true;
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
   */
  promoteStage(stageKey) {
    if (!this.currentUser || !this.currentUser.roadmap) return null;
    const stageKeys = ["stage1", "stage2", "stage3", "stage4", "stage5"];
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

      // Nâng cấp trình độ hiện tại
      const nextLevelMap = {
        stage2: "level_hsk1",
        stage3: "level_hsk3",
        stage4: "level_hsk5",
        stage5: "level_academic"
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
}
