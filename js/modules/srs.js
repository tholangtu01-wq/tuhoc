/**
 * SM-2 Spaced Repetition System (SRS) Module
 * Thuật toán lặp lại ngắt quãng SM-2 tối ưu hóa trí nhớ dài hạn từ vựng tiếng Trung
 */

const STORAGE_KEY = "hanzii_srs_state_v1";

export class SRSEngine {
  constructor(initialVocabList = []) {
    this.initialVocabList = initialVocabList;
    this.cards = this.loadState();
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Hợp nhất dữ liệu đã lưu với danh sách từ vựng gốc
        return this.mergeWithVocab(parsed);
      }
    } catch (e) {
      console.warn("Không thể tải trạng thái SRS từ localStorage:", e);
    }
    return this.initializeCards();
  }

  initializeCards() {
    const now = Date.now();
    return this.initialVocabList.map(item => ({
      id: item.id,
      reps: 0,
      interval: 0, // số ngày
      easeFactor: 2.5,
      lastReviewed: null,
      dueDate: now, // sẵn sàng học ngay
      history: []
    }));
  }

  mergeWithVocab(savedCards) {
    const cardMap = new Map(savedCards.map(c => [c.id, c]));
    const now = Date.now();
    return this.initialVocabList.map(item => {
      if (cardMap.has(item.id)) {
        return cardMap.get(item.id);
      }
      return {
        id: item.id,
        reps: 0,
        interval: 0,
        easeFactor: 2.5,
        lastReviewed: null,
        dueDate: now,
        history: []
      };
    });
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.cards));
    } catch (e) {
      console.error("Lỗi khi lưu SRS state vào localStorage:", e);
    }
  }

  /**
   * Lấy danh sách các thẻ đến hạn cần ôn tập hôm nay
   */
  getDueCards() {
    const now = Date.now();
    return this.cards.filter(c => c.dueDate <= now);
  }

  /**
   * Thống kê tổng quan tiến độ trí nhớ
   */
  getStats() {
    const now = Date.now();
    let dueCount = 0;
    let learningCount = 0; // reps < 3
    let masteredCount = 0; // reps >= 3

    for (const c of this.cards) {
      if (c.dueDate <= now) dueCount++;
      if (c.reps >= 3) {
        masteredCount++;
      } else {
        learningCount++;
      }
    }

    return {
      total: this.cards.length,
      due: dueCount,
      learning: learningCount,
      mastered: masteredCount
    };
  }

  /**
   * Cập nhật thẻ theo đánh giá người học (Quality: 0=Quên, 1=Khó, 2=Tốt, 3=Dễ)
   */
  reviewCard(cardId, quality) {
    const card = this.cards.find(c => c.id === cardId);
    if (!card) return null;

    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let { reps, interval, easeFactor } = card;

    if (quality === 0) {
      // Quên hẳn (Again)
      reps = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (quality === 1) {
      // Khó (Hard)
      interval = Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (quality === 2) {
      // Tốt (Good)
      if (reps === 0) {
        interval = 1;
      } else if (reps === 1) {
        interval = 3;
      } else {
        interval = Math.round(interval * easeFactor);
      }
      reps += 1;
    } else if (quality === 3) {
      // Dễ (Easy)
      if (reps === 0) {
        interval = 3;
      } else if (reps === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor * 1.35);
      }
      reps += 1;
      easeFactor = Math.min(3.0, easeFactor + 0.15);
    }

    card.reps = reps;
    card.interval = interval;
    card.easeFactor = easeFactor;
    card.lastReviewed = now;
    card.dueDate = now + interval * dayMs;
    card.history.push({ timestamp: now, quality, interval });

    this.saveState();
    return card;
  }

  resetAll() {
    this.cards = this.initializeCards();
    this.saveState();
  }
}
