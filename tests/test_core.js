/**
 * Automated Verification Suite for tiengtrungdema (Multi-User & Personalized Roadmap)
 */

import assert from "node:assert";
import { VOCABULARY_DATA, RADICALS_DATA } from "../js/data/vocabulary.js";
import { EXAM_SUITES } from "../js/data/exams.js";
import { UserManager } from "../js/modules/userManager.js";
import { SRSEngine } from "../js/modules/srs.js";
import { SpeechEngine } from "../js/modules/speechEngine.js";

// Mock localStorage for Node.js test environment
const mockStorage = {};
global.localStorage = {
  getItem: (k) => mockStorage[k] || null,
  setItem: (k, v) => { mockStorage[k] = String(v); },
  removeItem: (k) => { delete mockStorage[k]; },
  clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); }
};
global.window = {
  addEventListener: () => {},
  removeEventListener: () => {},
  devicePixelRatio: 1
};

console.log("=== BẮT ĐẦU KIỂM THỬ TIENGTRUNGDEMA (MULTI-USER & ROADMAP) ===");

// 1. Kiểm thử Kho Từ Vựng Học Thuật
console.log("1. Kiểm tra tính toàn vẹn của Kho Từ Vựng Hanzii...");
assert(VOCABULARY_DATA.length >= 25, `Cần ít nhất 25 mục từ vựng, hiện có: ${VOCABULARY_DATA.length}`);
for (const item of VOCABULARY_DATA) {
  assert(item.id && item.hanzi && item.pinyin && item.hanViet && item.meaning, `Từ ${item.id} thiếu thông tin cốt lõi`);
}
console.log(`   -> [PASS] Toàn bộ ${VOCABULARY_DATA.length} mục từ vựng đều đạt chuẩn 100%`);

// 2. Kiểm thử UserManager (Tạo người dùng, chuyển đổi hồ sơ, lộ trình, nhật ký)
console.log("2. Kiểm tra Hệ thống Đa Người Dùng (UserManager)...");
const userManager = new UserManager();

// Tạo học viên 1
const user1 = userManager.createUser("Nguyễn Văn An", "academic", "👨‍🎓");
assert.strictEqual(user1.name, "Nguyễn Văn An");
assert.strictEqual(user1.target, "academic");
assert.strictEqual(user1.xp, 50); // Khởi tạo 50 XP
assert.strictEqual(user1.roadmap.stage1.unlocked, true);
assert.strictEqual(userManager.currentUser.id, user1.id);

// Tạo học viên 2
const user2 = userManager.createUser("Trần Thị Mai", "hsk3-4", "👩‍🎓");
assert.strictEqual(user2.name, "Trần Thị Mai");
assert.strictEqual(userManager.users.length, 2);
assert.strictEqual(userManager.currentUser.id, user2.id);

// Chuyển đổi lại sang học viên 1
userManager.switchUser(user1.id);
assert.strictEqual(userManager.currentUser.name, "Nguyễn Văn An");

// Thêm XP và kiểm tra mở khóa lộ trình
userManager.addXP(400, "Hoàn thành bài thi thử HSK");
assert.strictEqual(userManager.currentUser.xp, 450);
assert.strictEqual(userManager.currentUser.roadmap.stage2.unlocked, true);
assert.strictEqual(userManager.currentUser.roadmap.stage3.unlocked, true);
assert(userManager.currentUser.activityLogs.length >= 2);
console.log("   -> [PASS] Hệ thống đa người dùng, cách ly dữ liệu và mở khóa lộ trình hoạt động xuất sắc");

// 3. Kiểm thử SRS Engine gắn liền với Hồ sơ cá nhân
console.log("3. Kiểm tra thuật toán SRS SM-2 cá nhân hóa...");
const srs = new SRSEngine(VOCABULARY_DATA, userManager);
const firstVocabId = VOCABULARY_DATA[0].id;

const reviewedCard = srs.reviewCard(firstVocabId, 2);
assert.strictEqual(reviewedCard.reps, 1);
assert.strictEqual(reviewedCard.interval, 1);
assert(userManager.currentUser.srsCards[firstVocabId], "Thẻ phải được lưu vào hồ sơ cá nhân của người dùng");

// Chuyển sang user 2 và kiểm tra thẻ của user 2 độc lập hoàn toàn
userManager.switchUser(user2.id);
const srsUser2 = new SRSEngine(VOCABULARY_DATA, userManager);
const user2CardState = srsUser2.getCardState(firstVocabId);
assert.strictEqual(user2CardState.reps, 0, "Hồ sơ của user 2 phải độc lập và chưa học từ này");
console.log("   -> [PASS] Thuật toán SRS cách ly dữ liệu độc lập giữa các học viên");

// 4. Kiểm thử Speech Engine Levenshtein
console.log("4. Kiểm tra thuật toán so khớp âm ngữ...");
const speechEngine = new SpeechEngine();
const sim = speechEngine.calculateSimilarity("研究", "研究");
assert.strictEqual(sim, 1.0);
console.log("   -> [PASS] So khớp giọng nói chuẩn xác");

// 5. Kiểm thử Bài Học Chặng, Checkpoint Exams & Nâng Cấp Lộ Trình 7 Chặng (HSK 1 -> 6 + Học Thuật)
console.log("5. Kiểm tra tính năng Lộ Trình 7 Chặng (HSK 1 đến 6 & Học Thuật)...");
assert(EXAM_SUITES.length >= 7, `Cần có đủ 7 đề thi cho 7 chặng, hiện có: ${EXAM_SUITES.length}`);
assert(EXAM_SUITES.find(e => e.stageKey === "stage1"), "Thiếu đề thi cho chặng 1");
assert(EXAM_SUITES.find(e => e.stageKey === "stage6"), "Thiếu đề thi cho chặng 6");
assert(EXAM_SUITES.find(e => e.stageKey === "stage7"), "Thiếu đề thi cho chặng 7");

const testLearner = userManager.createUser("Lê Văn Nam", "level_0", "target_academic", "🧑‍🏫");
assert.strictEqual(testLearner.roadmap.stage1.unlocked, true);
assert.strictEqual(testLearner.roadmap.stage2.unlocked, false);
assert.strictEqual(testLearner.roadmap.stage7.unlocked, false);

// Hoàn thành bài học chặng 1
userManager.completeStageLesson("stage1");
assert.strictEqual(testLearner.roadmap.stage1.completedLesson, true);
assert.strictEqual(testLearner.roadmap.stage1.readyForTest, true);

// Nâng cấp sau khi đạt bài test chặng 1
const promoResult = userManager.promoteStage("stage1");
assert.strictEqual(promoResult.nextStageKey, "stage2");
assert.strictEqual(testLearner.roadmap.stage1.passedTest, true);
assert.strictEqual(testLearner.roadmap.stage2.unlocked, true);
assert.strictEqual(testLearner.currentLevel, "level_hsk2");

// Kiểm tra học viên đăng ký với trình độ sẵn có (Ví dụ HSK 3)
const intermediateLearner = userManager.createUser("Hoàng Long", "level_hsk3", "target_hsk6", "👨‍🎓");
assert.strictEqual(intermediateLearner.roadmap.stage1.progress, 100, "Chặng 1 phải hoàn thành");
assert.strictEqual(intermediateLearner.roadmap.stage2.progress, 100, "Chặng 2 phải hoàn thành");
assert.strictEqual(intermediateLearner.roadmap.stage3.progress, 100, "Chặng 3 phải hoàn thành");
assert.strictEqual(intermediateLearner.roadmap.stage4.unlocked, true, "Chặng 4 phải được mở khóa cho học viên HSK 3");

console.log("   -> [PASS] Cơ chế lộ trình 7 chặng (1 tới 6 + Học thuật), tự thích ứng và nâng cấp hoạt động hoàn hảo");

// 6. Kiểm thử Cấu hình Bút Viết Thon Gọn (Vở Tập Sách Học Sinh)
console.log("6. Kiểm tra cấu hình Bút Viết Thon Gọn...");
import { HanziWritingCanvas } from "../js/modules/writingCanvas.js";
const mockCanvas = {
  getContext: () => new Proxy({}, {
    get: (target, prop) => {
      if (typeof prop === "string" && !target[prop]) {
        target[prop] = () => {};
      }
      return target[prop];
    },
    set: (target, prop, val) => {
      target[prop] = val;
      return true;
    }
  }),
  getBoundingClientRect: () => ({ width: 320, height: 320, left: 0, top: 0 }),
  addEventListener: () => {}
};

const writing = new HanziWritingCanvas(mockCanvas, { penType: "ballpoint" });
assert.strictEqual(writing.penType, "ballpoint");
assert(writing.baseInkWidth <= 3.0, "Ngòi bút bi thanh mảnh học sinh phải <= 3.0px");

writing.setPenType("gel");
assert.strictEqual(writing.penType, "gel");
assert(writing.baseInkWidth <= 3.5, "Ngòi bút gel học sinh phải <= 3.5px");

console.log("   -> [PASS] Cấu hình nét chữ viết tay thon gọn mô phỏng vở tập sách hoạt động chính xác 100%");

// 7. Kiểm thử Tối Ưu Hóa Đa Nền Tảng (iPad, Mobile, Laptop)
console.log("7. Kiểm tra Tối Ưu Hóa Đa Thiết Bị (Orientation, Resize & Pressure Scaling)...");
// Kiểm tra khả năng co giãn nét vẽ khi xoay màn hình thiết bị
writing.strokes = [
  [{ x: 100, y: 100, pressure: 0.8, time: 1000 }, { x: 150, y: 150, pressure: 0.9, time: 1050 }]
];
assert.strictEqual(writing.strokes.length, 1);
assert.strictEqual(writing.strokes[0][0].x, 100);

// Giả lập xoay màn hình iPad từ 320px sang 480px (tỷ lệ 1.5x)
mockCanvas.getBoundingClientRect = () => ({ width: 480, height: 480, left: 0, top: 0 });
writing.handleResize();
assert.strictEqual(writing.displayWidth, 480);
assert.strictEqual(writing.strokes[0][0].x, 150, "Tọa độ nét vẽ phải tự động nhân tỷ lệ 1.5x khi xoay màn hình");

console.log("   -> [PASS] Nét vẽ tự động căn chỉnh tỷ lệ chính xác khi xoay màn hình hoặc đổi kích thước");

console.log("=== TẤT CẢ 7 BỘ KIỂM THỬ ĐỀU ĐẠT CHUẨN 100% ===");
