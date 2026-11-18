/**
 * Gamification, User Progress & Data Backup Module
 * Quản lý Streak, XP, Level, Nhiệm vụ ngày, Huy hiệu thành tựu và Xuất/Nhập dữ liệu
 */

const STORAGE_KEY = "hanzii_gamification_state_v1";

export class GamificationManager {
  constructor() {
    this.state = this.loadState();
    this.checkDailyReset();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Không thể tải gamification state từ localStorage:", e);
    }

    const today = new Date().toISOString().slice(0, 10);
    return {
      xp: 0,
      streak: 1,
      lastActiveDate: today,
      writingCount: 0,
      speechCount: 0,
      reviewsCount: 0,
      examsCompleted: 0,
      badges: ["start_journey"],
      dailyQuests: {
        date: today,
        reviews: { target: 5, current: 0, completed: false },
        writing: { target: 2, current: 0, completed: false },
        speech: { target: 3, current: 0, completed: false },
        exam: { target: 1, current: 0, completed: false }
      }
    };
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error("Lỗi khi lưu gamification state:", e);
    }
  }

  checkDailyReset() {
    const today = new Date().toISOString().slice(0, 10);
    if (this.state.lastActiveDate !== today) {
      const lastDate = new Date(this.state.lastActiveDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate - lastDate) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        this.state.streak += 1;
      } else if (diffDays > 1) {
        this.state.streak = 1;
      }

      this.state.lastActiveDate = today;
      this.state.dailyQuests = {
        date: today,
        reviews: { target: 5, current: 0, completed: false },
        writing: { target: 2, current: 0, completed: false },
        speech: { target: 3, current: 0, completed: false },
        exam: { target: 1, current: 0, completed: false }
      };

      if (this.state.streak >= 3) this.unlockBadge("streak_3");
      if (this.state.streak >= 7) this.unlockBadge("streak_7");
      this.saveState();
    }
  }

  addXP(amount, reason = "") {
    this.state.xp += amount;
    this.checkBadges();
    this.saveState();
    return {
      newXP: this.state.xp,
      levelInfo: this.getLevelInfo(),
      amount,
      reason
    };
  }

  getLevelInfo() {
    const xp = this.state.xp;
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

  recordAction(type) {
    this.checkDailyReset();

    if (type === "review") {
      this.state.reviewsCount += 1;
      this.state.dailyQuests.reviews.current += 1;
      if (this.state.dailyQuests.reviews.current >= this.state.dailyQuests.reviews.target) {
        this.state.dailyQuests.reviews.completed = true;
      }
      this.addXP(10, "Ôn tập thẻ từ vựng");
    } else if (type === "writing") {
      this.state.writingCount += 1;
      this.state.dailyQuests.writing.current += 1;
      if (this.state.dailyQuests.writing.current >= this.state.dailyQuests.writing.target) {
        this.state.dailyQuests.writing.completed = true;
      }
      this.addXP(20, "Luyện viết chữ Hán");
    } else if (type === "speech") {
      this.state.speechCount += 1;
      this.state.dailyQuests.speech.current += 1;
      if (this.state.dailyQuests.speech.current >= this.state.dailyQuests.speech.target) {
        this.state.dailyQuests.speech.completed = true;
      }
      this.addXP(30, "Luyện phát âm giọng nói");
    } else if (type === "exam") {
      this.state.examsCompleted += 1;
      this.state.dailyQuests.exam.current += 1;
      if (this.state.dailyQuests.exam.current >= this.state.dailyQuests.exam.target) {
        this.state.dailyQuests.exam.completed = true;
      }
      this.addXP(50, "Hoàn thành đề thi HSK");
    }

    this.checkBadges();
    this.saveState();
  }

  checkBadges() {
    if (this.state.writingCount >= 5) this.unlockBadge("calligrapher_5");
    if (this.state.speechCount >= 5) this.unlockBadge("orator_5");
    if (this.state.reviewsCount >= 10) this.unlockBadge("scholar_10");
    if (this.state.examsCompleted >= 1) this.unlockBadge("exam_pass");
  }

  unlockBadge(badgeId) {
    if (!this.state.badges.includes(badgeId)) {
      this.state.badges.push(badgeId);
      this.saveState();
    }
  }

  getAllBadges() {
    const definitions = [
      { id: "start_journey", name: "Khởi Đầu Vạn Dặm", desc: "Bắt đầu hành trình học tiếng Trung", icon: "🌱" },
      { id: "calligrapher_5", name: "Nét Bút Rồng Bay", desc: "Luyện viết chuẩn từ 5 chữ Hán", icon: "✍️" },
      { id: "orator_5", name: "Giọng Bắc Kinh Chuẩn", desc: "Luyện phát âm giọng nói thành công 5 từ", icon: "🎙️" },
      { id: "scholar_10", name: "Học Giả Uyên Bác", desc: "Ôn tập trên 10 lượt thẻ SRS", icon: "📚" },
      { id: "streak_3", name: "Kiên Trì 3 Ngày", desc: "Học liên tục 3 ngày không gián đoạn", icon: "🔥" },
      { id: "streak_7", name: "Chiến Binh Tuần Lễ", desc: "Học liên tục 7 ngày liên tiếp", icon: "⚡" },
      { id: "exam_pass", name: "Thủ Khoa Đăng Khoa", desc: "Vượt qua bài thi thử HSK học thuật", icon: "🏆" }
    ];

    return definitions.map(def => ({
      ...def,
      unlocked: this.state.badges.includes(def.id)
    }));
  }

  exportBackup() {
    const allData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      gamification: this.state,
      srs: localStorage.getItem("hanzii_srs_state_v1")
    };
    const jsonString = JSON.stringify(allData, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `hanzii-pro-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  importBackup(jsonString) {
    try {
      const data = JSON.parse(jsonString);
      if (data.gamification) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data.gamification));
        this.state = data.gamification;
      }
      if (data.srs) {
        localStorage.setItem("hanzii_srs_state_v1", typeof data.srs === "string" ? data.srs : JSON.stringify(data.srs));
      }
      return { success: true };
    } catch (e) {
      return { success: false, error: e.message };
    }
  }
}
