/**
 * SM-2 Spaced Repetition System (SRS) Module
 * Tích hợp sâu với Hồ sơ người dùng (User Profile) cá nhân hóa
 */

export class SRSEngine {
  constructor(initialVocabList = [], userManager = null) {
    this.initialVocabList = initialVocabList;
    this.userManager = userManager;
  }

  getUserCards() {
    if (this.userManager && this.userManager.currentUser) {
      if (!this.userManager.currentUser.srsCards) {
        this.userManager.currentUser.srsCards = {};
      }
      return this.userManager.currentUser.srsCards;
    }
    return {};
  }

  getCardState(vocabId) {
    const cards = this.getUserCards();
    if (cards[vocabId]) return cards[vocabId];

    return {
      id: vocabId,
      reps: 0,
      interval: 0,
      easeFactor: 2.5,
      lastReviewed: null,
      dueDate: Date.now()
    };
  }

  getDueCards() {
    const now = Date.now();
    return this.initialVocabList.filter(item => {
      const state = this.getCardState(item.id);
      return !state.dueDate || state.dueDate <= now;
    });
  }

  getStats() {
    const now = Date.now();
    let dueCount = 0;
    let learningCount = 0;
    let masteredCount = 0;

    for (const item of this.initialVocabList) {
      const state = this.getCardState(item.id);
      if (!state.dueDate || state.dueDate <= now) dueCount++;
      if (state.reps >= 3) {
        masteredCount++;
      } else {
        learningCount++;
      }
    }

    return {
      total: this.initialVocabList.length,
      due: dueCount,
      learning: learningCount,
      mastered: masteredCount
    };
  }

  reviewCard(vocabId, quality) {
    const card = { ...this.getCardState(vocabId) };
    const now = Date.now();
    const dayMs = 24 * 60 * 60 * 1000;

    let { reps, interval, easeFactor } = card;

    if (quality === 0) {
      reps = 0;
      interval = 1;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (quality === 1) {
      interval = Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(1.3, easeFactor - 0.15);
    } else if (quality === 2) {
      if (reps === 0) interval = 1;
      else if (reps === 1) interval = 3;
      else interval = Math.round(interval * easeFactor);
      reps += 1;
    } else if (quality === 3) {
      if (reps === 0) interval = 3;
      else if (reps === 1) interval = 6;
      else interval = Math.round(interval * easeFactor * 1.35);
      reps += 1;
      easeFactor = Math.min(3.0, easeFactor + 0.15);
    }

    card.reps = reps;
    card.interval = interval;
    card.easeFactor = easeFactor;
    card.lastReviewed = now;
    card.dueDate = now + interval * dayMs;

    if (this.userManager && this.userManager.currentUser) {
      this.userManager.currentUser.srsCards[vocabId] = card;
      this.userManager.saveUsers();
    }

    return card;
  }
}
