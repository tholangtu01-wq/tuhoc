/**
 * User & Multi-Profile Manager for Hanzii Pro
 * Quản lý đa người dùng, lộ trình học cá nhân hóa và lịch sử học tập riêng biệt
 */

const USERS_STORAGE_KEY = "hanzii_users_v2";
const CURRENT_USER_ID_KEY = "hanzii_current_user_id_v2";

export class UserManager {
  constructor() {
    this.users = this.loadUsers();
    this.currentUserId = this.loadCurrentUserId();
    
    // Nếu chưa có người dùng nào, tạo sẵn hoặc yêu cầu tạo mới
    if (this.users.length === 0) {
      this.currentUser = null;
    } else {
      this.currentUser = this.users.find(u => u.id === this.currentUserId) || this.users[0];
      this.currentUserId = this.currentUser.id;
      this.saveCurrentUserId();
    }
  }

  loadUsers() {
    try {
      const data = localStorage.getItem(USERS_STORAGE_KEY);
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
    return localStorage.getItem(CURRENT_USER_ID_KEY) || "";
  }

  saveCurrentUserId() {
    if (this.currentUserId) {
      localStorage.setItem(CURRENT_USER_ID_KEY, this.currentUserId);
    }
  }

  /**
   * Tạo một hồ sơ người học mới với lộ trình cá nhân hóa
   */
  createUser(name, target = "academic", avatar = "👨‍🎓") {
    const today = new Date().toISOString().slice(0, 10);
    const nowStr = new Date().toLocaleString("vi-VN");
    
    const newUser = {
      id: "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6),
      name: name.trim(),
      target, // 'academic', 'hsk1-2', 'hsk3-4', 'hsk5-6'
      avatar,
      createdAt: nowStr,
      xp: 0,
      streak: 1,
      lastActiveDate: today,
      // Lộ trình học 5 chặng cá nhân hóa
      roadmap: {
        stage1: { name: "Chặng 1: Nhập Môn Pinyin & 214 Bộ Thủ", progress: 0, unlocked: true },
        stage2: { name: "Chặng 2: Nền Tảng HSK 1-2 & Giao Tiếp", progress: 0, unlocked: false },
        stage3: { name: "Chặng 3: Trung Cấp HSK 3-4 & Ngữ Pháp", progress: 0, unlocked: false },
        stage4: { name: "Chặng 4: Cao Cấp HSK 5 & Đọc Báo Chí", progress: 0, unlocked: false },
        stage5: { name: "Chặng 5: Học Thuật & Luận Văn Chuyên Sâu", progress: 0, unlocked: false }
      },
      // Thẻ SRS riêng biệt
      srsCards: {},
      // Sổ tay từ vựng yêu thích
      notebook: [],
      // Lịch sử thi CBT HSK
      examHistory: [],
      // Nhật ký hoạt động chi tiết
      activityLogs: [
        {
          timestamp: nowStr,
          action: "Khởi tạo tài khoản học viên và kích hoạt Lộ trình học",
          xpEarned: 50
        }
      ]
    };

    newUser.xp += 50; // Thưởng 50 XP khởi đầu
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

    // Giới hạn tối đa 50 nhật ký gần nhất
    if (this.currentUser.activityLogs.length > 50) {
      this.currentUser.activityLogs.pop();
    }

    this.checkRoadmapProgression();
    this.saveUsers();
  }

  /**
   * Cập nhật tiến độ mở khóa các chặng lộ trình
   */
  checkRoadmapProgression() {
    if (!this.currentUser) return;
    const xp = this.currentUser.xp;
    const rm = this.currentUser.roadmap;

    // Chặng 1: 0 - 150 XP
    rm.stage1.progress = Math.min(100, Math.round((xp / 150) * 100));
    
    // Mở khóa Chặng 2 khi qua 150 XP
    if (xp >= 150) {
      rm.stage2.unlocked = true;
      rm.stage2.progress = Math.min(100, Math.round(((xp - 150) / 250) * 100));
    }
    
    // Mở khóa Chặng 3 khi qua 400 XP
    if (xp >= 400) {
      rm.stage3.unlocked = true;
      rm.stage3.progress = Math.min(100, Math.round(((xp - 400) / 350) * 100));
    }

    // Mở khóa Chặng 4 khi qua 750 XP
    if (xp >= 750) {
      rm.stage4.unlocked = true;
      rm.stage4.progress = Math.min(100, Math.round(((xp - 750) / 450) * 100));
    }

    // Mở khóa Chặng 5 khi qua 1200 XP
    if (xp >= 1200) {
      rm.stage5.unlocked = true;
      rm.stage5.progress = Math.min(100, Math.round(((xp - 1200) / 600) * 100));
    }
  }

  /**
   * Lưu kết quả thi CBT vào lịch sử của người dùng
   */
  recordExam(examResult) {
    if (!this.currentUser) return;
    const record = {
      examTitle: examResult.examTitle,
      level: examResult.level,
      scorePercent: examResult.scorePercent,
      correctCount: examResult.correctCount,
      totalQuestions: examResult.totalQuestions,
      isPassed: examResult.isPassed,
      certCode: examResult.certCode,
      date: new Date().toLocaleString("vi-VN")
    };

    this.currentUser.examHistory.unshift(record);
    this.addXP(examResult.isPassed ? 80 : 30, `Hoàn thành đề thi [${examResult.examTitle}] với điểm số ${examResult.scorePercent}%`);
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
