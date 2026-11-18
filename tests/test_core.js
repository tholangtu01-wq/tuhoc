/**
 * Automated Verification Suite for Hanzii Pro
 * Kiểm thử tính đúng đắn của dữ liệu từ vựng, thuật toán SRS SM-2, hệ thống đề thi CBT và Gamification
 */

import assert from "node:assert";
import { VOCABULARY_DATA, RADICALS_DATA } from "../js/data/vocabulary.js";
import { EXAM_SUITES } from "../js/data/exams.js";
import { SRSEngine } from "../js/modules/srs.js";
import { GamificationManager } from "../js/modules/gamification.js";
import { SpeechEngine } from "../js/modules/speechEngine.js";

// Mock localStorage for Node.js test environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = {};

console.log("=== BẮT ĐẦU KIỂM THỬ HANZII PRO ===");

// 1. Kiểm thử Kho Từ Vựng Học Thuật
console.log("1. Kiểm tra tính toàn vẹn của Kho Từ Vựng Hanzii...");
assert(VOCABULARY_DATA.length >= 25, `Cần ít nhất 25 mục từ vựng, hiện có: ${VOCABULARY_DATA.length}`);

for (const item of VOCABULARY_DATA) {
  assert(item.id, "Mỗi từ phải có id");
  assert(item.hanzi && item.hanzi.length > 0, `Từ ${item.id} thiếu chữ Hán`);
  assert(item.pinyin && item.pinyin.length > 0, `Từ ${item.id} thiếu Pinyin`);
  assert(item.hanViet && item.hanViet.length > 0, `Từ ${item.id} thiếu Âm Hán Việt`);
  assert(item.meaning && item.meaning.length > 0, `Từ ${item.id} thiếu Nghĩa`);
  assert(item.level && item.level.length > 0, `Từ ${item.id} thiếu Cấp độ`);
  assert(item.radical && item.radical.length > 0, `Từ ${item.id} thiếu Bộ thủ`);
  assert(item.exampleZh && item.exampleZh.length > 0, `Từ ${item.id} thiếu ví dụ tiếng Trung`);
  assert(item.examplePinyin && item.examplePinyin.length > 0, `Từ ${item.id} thiếu ví dụ Pinyin`);
  assert(item.exampleVi && item.exampleVi.length > 0, `Từ ${item.id} thiếu dịch nghĩa tiếng Việt`);
}
console.log(`   -> [PASS] Toàn bộ ${VOCABULARY_DATA.length} mục từ vựng đều đạt chuẩn 100%`);

// 2. Kiểm thử Bộ thủ Hanzii
console.log("2. Kiểm tra danh sách Bộ thủ Hanzii...");
assert(RADICALS_DATA.length >= 10, "Danh sách bộ thủ phải có ít nhất 10 bộ");
for (const rad of RADICALS_DATA) {
  assert(rad.char && rad.name && rad.meaning, `Bộ thủ ${rad.char} không đầy đủ thông tin`);
}
console.log(`   -> [PASS] ${RADICALS_DATA.length} bộ thủ chuẩn xác`);

// 3. Kiểm thử Thuật toán Lặp lại Ngắt quãng SM-2 (SRS)
console.log("3. Kiểm tra thuật toán SM-2 SRS...");
const srs = new SRSEngine(VOCABULARY_DATA);
const firstCardId = VOCABULARY_DATA[0].id;

// Initial state
const statsInit = srs.getStats();
assert.strictEqual(statsInit.total, VOCABULARY_DATA.length);
assert.strictEqual(statsInit.due, VOCABULARY_DATA.length);

// Đánh giá Tốt (Quality 2) lần đầu
const card1 = srs.reviewCard(firstCardId, 2);
assert.strictEqual(card1.reps, 1);
assert.strictEqual(card1.interval, 1);

// Đánh giá Tốt (Quality 2) lần 2
const card2 = srs.reviewCard(firstCardId, 2);
assert.strictEqual(card2.reps, 2);
assert.strictEqual(card2.interval, 3);

// Đánh giá Dễ (Quality 3) lần 3
const card3 = srs.reviewCard(firstCardId, 3);
assert.strictEqual(card3.reps, 3);
assert(card3.interval > 3, "Interval sau mức Dễ phải lớn hơn 3 ngày");
assert(card3.easeFactor >= 2.5, "EaseFactor phải tăng hoặc duy trì");

// Đánh giá Quên (Quality 0)
const cardReset = srs.reviewCard(firstCardId, 0);
assert.strictEqual(cardReset.reps, 0, "Reps phải bị reset về 0 khi quên");
assert.strictEqual(cardReset.interval, 1, "Interval phải reset về 1 ngày");
console.log("   -> [PASS] Thuật toán SM-2 tính toán khoảng cách ngày và ease factor chuẩn xác");

// 4. Kiểm thử Đề thi Chuẩn HSK CBT
console.log("4. Kiểm tra ngân hàng đề thi HSK...");
assert(EXAM_SUITES.length >= 2, "Cần ít nhất 2 bộ đề thi");
for (const suite of EXAM_SUITES) {
  assert(suite.id && suite.title && suite.durationMinutes > 0, "Thông tin đề thi không đầy đủ");
  assert(suite.questions.length > 0, "Đề thi phải có câu hỏi");
  for (const q of suite.questions) {
    assert(q.id && q.prompt && q.explanation, "Câu hỏi thiếu prompt hoặc explanation");
    if (q.type === "choice") {
      const hasCorrect = q.options.some(opt => opt.correct === true);
      assert(hasCorrect, `Câu hỏi ${q.id} không có đáp án đúng!`);
    }
  }
}
console.log("   -> [PASS] Ngân hàng đề thi đạt chuẩn");

// 5. Kiểm thử Gamification & Level
console.log("5. Kiểm tra hệ thống Gamification, XP & Quests...");
const gamification = new GamificationManager();
gamification.state.xp = 0;
const lvl1 = gamification.getLevelInfo();
assert.strictEqual(lvl1.level, 1);

gamification.addXP(450);
const lvlLatter = gamification.getLevelInfo();
assert(lvlLatter.level > 1, "Sau 450 XP phải lên cấp lớn hơn 1");

gamification.recordAction("writing");
assert.strictEqual(gamification.state.writingCount, 1);
console.log("   -> [PASS] Hệ thống Level, XP và Quests hoạt động hoàn hảo");

// 6. Kiểm thử Levenshtein Distance trong SpeechEngine
console.log("6. Kiểm tra thuật toán so khớp giọng nói SpeechEngine...");
const speechEngine = new SpeechEngine();
const sim100 = speechEngine.calculateSimilarity("研究", "研究");
assert.strictEqual(sim100, 1.0, "Hai chuỗi giống nhau phải có độ tương đồng 100%");

const simDiff = speechEngine.calculateSimilarity("研究", "分析");
assert(simDiff < 0.5, "Hai chuỗi khác nhau độ tương đồng phải thấp");
console.log("   -> [PASS] Thuật toán so khớp âm ngữ hoạt động chính xác");

console.log("=== TẤT CẢ CÁC BÀI KIỂM THỬ ĐỀU ĐẠT CHUẨN THÀNH CÔNG! ===");
