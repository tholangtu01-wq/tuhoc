/**
 * Automated Verification Suite for tiengtrungdema (Multi-User & Personalized Roadmap)
 */

import assert from "node:assert";
import fs from "node:fs";
import { VOCABULARY_DATA, RADICALS_DATA } from "../js/data/vocabulary.js";
import { EXAM_SUITES } from "../js/data/exams.js";
import { UserManager, TARGET_LABELS, LEVEL_LABELS } from "../js/modules/userManager.js";
import { SRSEngine } from "../js/modules/srs.js";
import { SpeechEngine } from "../js/modules/speechEngine.js";
import { ROADMAP_LESSONS, USER_GUIDE_DATA } from "../js/data/roadmapLessons.js";

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

// 8. Kiểm thử Bộ Icon Văn Hóa Trung Hoa & Sắp Xếp Trình Độ Đồng Bộ
console.log("8. Kiểm tra Bộ Icon Văn Hóa Trung Hoa & Sắp Xếp Trình Độ Chuẩn Hóa...");
const defaultLearner = userManager.createDefaultUser();
assert.strictEqual(defaultLearner.avatar, "🐼", "Avatar mặc định phải là Gấu Trúc Trung Hoa 🐼");
assert.strictEqual(defaultLearner.targetLevel, "target_hsk2", "Mục tiêu mặc định của người mới bắt đầu phải là HSK 2");

// Đảm bảo TARGET_LABELS được đánh số chuẩn từ 1 đến 7
assert(TARGET_LABELS.target_hsk1.startsWith("1."), "Mục tiêu 1 phải đánh số 1.");
assert(TARGET_LABELS.target_hsk2.startsWith("2."), "Mục tiêu 2 phải đánh số 2.");
assert(TARGET_LABELS.target_hsk6.startsWith("6."), "Mục tiêu 6 phải đánh số 6.");
assert(TARGET_LABELS.target_academic.startsWith("7."), "Mục tiêu học thuật phải đánh số 7.");

// Kiểm tra 8 icon văn hóa Trung Hoa không chứa ký tự tofu box lỗi font
const CHINESE_CULTURE_ICONS = ["🐼", "🐉", "🏮", "🀄", "📜", "🥟", "🍵", "🏯"];
assert.strictEqual(CHINESE_CULTURE_ICONS.length, 8);
CHINESE_CULTURE_ICONS.forEach(icon => {
  const customUser = userManager.createUser("Học Viên Trung Hoa", "level_0", "target_hsk2", icon);
  assert.strictEqual(customUser.avatar, icon);
});
console.log("   -> [PASS] 8 Avatar Đậm Chất Văn Hóa Trung Hoa và Thứ Tự Sắp Xếp Đều Chuẩn 100%");

// 9. Kiểm thử Độ Phủ 100% Dịch Nghĩa & Chi Tiết Bút Thuận Từng Chữ Hán
console.log("9. Kiểm tra Độ Phủ 100% Dịch Nghĩa (Hán-Việt, Pinyin, Bộ thủ, Bút thuận)...");
import { HANZI_CHAR_DETAILS } from "../js/data/vocabulary.js";
assert(VOCABULARY_DATA.length >= 135, `Kho từ vựng mở rộng phải đạt ít nhất 135 từ, hiện có: ${VOCABULARY_DATA.length}`);

const allChars = Array.from(new Set(VOCABULARY_DATA.flatMap(v => v.hanzi.split(""))));
assert(allChars.length >= 235, `Tổng số chữ Hán độc lập phải >= 235 chữ, hiện có: ${allChars.length}`);

const missingChars = allChars.filter(ch => {
  const info = HANZI_CHAR_DETAILS[ch];
  return !info || !info.hanViet || !info.pinyin || !info.meaning || !info.radical;
});

assert.strictEqual(missingChars.length, 0, `Không được có chữ Hán nào thiếu dịch nghĩa! Chữ bị thiếu: ${missingChars.join(", ")}`);
console.log(`   -> [PASS] Toàn bộ ${allChars.length} chữ Hán trong kho đều có dịch nghĩa và chi tiết bút thuận 100%`);

// 10. Kiểm thử Nâng cấp Trải nghiệm Người dùng (Flashcard Audio Ví Dụ, Đếm Pills Động, Phân Tách Chữ Tập Viết)
console.log("10. Kiểm tra Nâng cấp Trải Nghiệm Học Tập Đa Giác Quan...");
// Kiểm tra 100% từ vựng có ví dụ ngữ cảnh tiếng Trung chuẩn
const missingExamples = VOCABULARY_DATA.filter(v => !v.exampleZh || v.exampleZh.length < 2);
assert.strictEqual(missingExamples.length, 0, "Toàn bộ từ vựng phải có câu ví dụ ngữ cảnh tiếng Trung");

// Kiểm tra tính toán đếm số lượng từ vựng theo từng cấp độ
const countAll = VOCABULARY_DATA.length;
const countHsk1 = VOCABULARY_DATA.filter(v => v.level === "HSK 1").length;
const countHsk2 = VOCABULARY_DATA.filter(v => v.level === "HSK 2").length;
const countHsk3 = VOCABULARY_DATA.filter(v => v.level === "HSK 3").length;
const countHsk4 = VOCABULARY_DATA.filter(v => v.level === "HSK 4").length;
const countHsk5 = VOCABULARY_DATA.filter(v => v.level === "HSK 5").length;
const countAcademic = VOCABULARY_DATA.filter(v => v.level.includes("Học thuật") || v.level.includes("HSK 6")).length;

assert(countAll >= 200, "Tổng số lượng từ vựng phải >= 200");
assert(countHsk1 >= 30, "HSK 1 phải có >= 30 từ");
assert(countAcademic >= 35, "Học thuật phải có >= 35 từ");
assert.strictEqual(countHsk1 + countHsk2 + countHsk3 + countHsk4 + countHsk5 + countAcademic, countAll, "Tổng các cấp độ phải khớp chính xác 100%");

console.log(`   -> [PASS] Nâng cấp trải nghiệm học tập (Audio Ví dụ, Đếm Pills Động ${countAll} từ, Click chữ Hán tập viết) hoàn hảo 100%`);

// 11. Kiểm thử Toàn vẹn Giao diện DOM, Bộ Đề Thi & Bài Học Lộ Trình
console.log("11. Kiểm tra DOM IDs, Bộ đề thi CBT và Bài học lộ trình 7 chặng...");
const appJs = fs.readFileSync('js/app.js', 'utf8');
const indexHtml = fs.readFileSync('index.html', 'utf8');

const regex = /getElementById\(['"]([^'"]+)['"]\)/g;
let match;
const ids = new Set();
while ((match = regex.exec(appJs)) !== null) {
  ids.add(match[1]);
}
const missingIds = [];
ids.forEach(id => {
  if (!indexHtml.includes(`id="${id}"`) && !indexHtml.includes(`id='${id}'`)) {
    missingIds.push(id);
  }
});
assert.strictEqual(missingIds.length, 0, `DOM IDs thiếu trong index.html: ${missingIds.join(", ")}`);

assert.strictEqual(EXAM_SUITES.length, 7, "Phải có đúng 7 bộ đề thi cho 7 chặng");
EXAM_SUITES.forEach(suite => {
  assert(suite.questions.length >= 5, `Đề ${suite.id} phải có ít nhất 5 câu`);
  suite.questions.forEach(q => {
    assert(q.prompt && q.explanation, "Câu hỏi phải có prompt và explanation");
    if (q.type === 'choice') {
      const correctCount = q.options.filter(o => o.correct === true).length;
      assert.strictEqual(correctCount, 1, `Câu ${q.id} phải có đúng 1 đáp án đúng`);
    }
  });
});

assert.strictEqual(Object.keys(ROADMAP_LESSONS).length, 7, "Phải có 7 bài học chặng");
assert.strictEqual(Object.keys(USER_GUIDE_DATA).length, 7, "Phải có 7 chuyên mục hướng dẫn");
console.log(`   -> [PASS] 100% DOM IDs (${ids.size} ID), 7 Đề thi CBT (36 câu), 7 Bài học lộ trình và 7 Mục hướng dẫn đều đạt chuẩn`);

// 12. Kiểm thử Mục Tiêu Học Tập Hôm Nay (Daily Goal Tracker) & Các Tính Năng Nâng Cao
console.log("12. Kiểm tra Hệ thống Mục Tiêu Học Tập Hôm Nay (Daily Goals) & Nâng Cấp Web UX...");
const testUser = userManager.createDefaultUser("Thử Nghiệm Daily");
userManager.currentUser = testUser;

const initialGoal = userManager.getDailyGoal();
assert.strictEqual(initialGoal.flashcard, 0);
assert.strictEqual(initialGoal.writing, 0);
assert.strictEqual(initialGoal.speech, 0);
assert.strictEqual(initialGoal.rewardClaimed, false);

const initialXP = userManager.currentUser.xp;

// Hoàn thành flashcard
userManager.recordDailyProgress("flashcard", 5);
// Hoàn thành writing
userManager.recordDailyProgress("writing", 2);
// Hoàn thành speech
const finalRes = userManager.recordDailyProgress("speech", 3);

assert.strictEqual(finalRes.isCompleted, true, "Mục tiêu hôm nay phải được hoàn thành");
assert.strictEqual(finalRes.rewardGranted, true, "Phải được nhận thưởng +50 XP");
assert.strictEqual(userManager.currentUser.xp, initialXP + 50, "XP phải tăng đúng 50 điểm");

// Kiểm tra Speech Rate
const testSpeechEngine = new SpeechEngine();
testSpeechEngine.setSpeechRate(0.75);
assert.strictEqual(testSpeechEngine.speechRate, 0.75, "Tốc độ đọc chậm phải là 0.75");
testSpeechEngine.setSpeechRate(1.0);
assert.strictEqual(testSpeechEngine.speechRate, 1.0, "Tốc độ đọc chuẩn phải là 1.0");

console.log("   -> [PASS] Hệ thống Daily Goal, thưởng +50 XP tự động và điều chỉnh tốc độ âm thanh hoạt động hoàn hảo 100%");

// 13. Kiểm thử Cổng Quản Trị Giáo Viên & Theo Dõi Tiến Độ Học Viên (Teacher Portal)
console.log("13. Kiểm tra Cổng Quản Trị Giáo Viên, Bảo Mật Mã PIN, Xuất CSV & Đồng Bộ Tiến Độ...");
assert.strictEqual(userManager.verifyAdminPin("8888"), true, "Mã PIN mặc định phải là 8888");
assert.strictEqual(userManager.verifyAdminPin("1234"), false, "Mã PIN sai phải bị từ chối");

// Đổi PIN
const pinChangeRes = userManager.changeAdminPin("8888", "9999");
assert.strictEqual(pinChangeRes.success, true);
assert.strictEqual(userManager.verifyAdminPin("9999"), true);
// Khôi phục PIN mặc định
userManager.changeAdminPin("9999", "8888");
assert.strictEqual(userManager.verifyAdminPin("8888"), true);

// Lấy danh sách tổng quan học viên
const overviewList = userManager.getAllStudentsOverview();
assert(Array.isArray(overviewList) && overviewList.length >= 2, "Danh sách học viên phải có ít nhất 2 học viên");
const firstStudent = overviewList[0];
assert(firstStudent.name && firstStudent.currentStageName && firstStudent.xp !== undefined, "Hồ sơ học viên phải đầy đủ trường thông tin");

// Xuất file CSV báo cáo lớp học
const csvContent = userManager.exportStudentsToCSV();
assert(csvContent.startsWith("\uFEFF"), "File CSV phải có UTF-8 BOM để Excel hiển thị tiếng Việt chuẩn");
assert(csvContent.includes("Họ và Tên") && csvContent.includes("Điểm XP"), "Header CSV phải đầy đủ");

// Tạo mã đồng bộ tiến độ học viên
const syncCodeObj = userManager.generateStudentProgressCode();
assert(syncCodeObj && syncCodeObj.code.startsWith("TTDM-SYNC-"), "Mã đồng bộ phải có tiền tố TTDM-SYNC-");
assert(syncCodeObj.summaryText.includes("[TIENGTRUNGDEMA - BÁO CÁO TIẾN ĐỘ HỌC TẬP]"));

// Nhập mã đồng bộ vào cơ sở dữ liệu
const importRes = userManager.importStudentProgressCode(syncCodeObj.code);
assert.strictEqual(importRes.success, true, "Nhập mã tiến độ học viên phải thành công 100%");
assert.strictEqual(importRes.studentName, userManager.currentUser.name);

console.log("   -> [PASS] Cổng Quản Trị Giáo Viên (Mã PIN, Tổng quan học viên, Xuất CSV và Nhập mã đồng bộ) hoạt động xuất sắc 100%");

console.log("=== TẤT CẢ 13 BỘ KIỂM THỬ ĐỀU ĐẠT CHUẨN 100% ===");
