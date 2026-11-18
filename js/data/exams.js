/**
 * HSK & Academic Chinese Exam Question Banks (Phòng thi CBT Hanzii)
 * Chuẩn định dạng đề thi HSK 3-6 & Kỳ thi Tiếng Trung Học thuật Chuyên sâu
 */

export const EXAM_SUITES = [
  {
    id: "exam-hsk-academic-01",
    title: "Đề thi Chuẩn HSK Học Thuật & Nghiên Cứu Khoa Học (Đề số 01)",
    level: "HSK 4 - 5 / Học thuật",
    durationMinutes: 15,
    passScorePercent: 70,
    description: "Kiểm tra năng lực nhận diện thuật ngữ học thuật, âm Hán Việt, phiên âm Pinyin và cấu trúc câu nghiên cứu khoa học.",
    questions: [
      {
        id: "q1",
        type: "choice",
        prompt: "Từ chữ Hán 【研究】 có phiên âm Pinyin và âm Hán Việt chuẩn xác là gì?",
        options: [
          { text: "yánjiū — Nghiên Cứu", correct: true },
          { text: "yánjiù — Nhãn Cứu", correct: false },
          { text: "yánjiū — Nghiêm Cứu", correct: false },
          { text: "yàngjiū — Dương Cứu", correct: false }
        ],
        explanation: "【研究】 pinyin là 'yánjiū', âm Hán Việt là 'Nghiên Cứu' (研: mài đá suy xét; 究: vào tận cùng hang động tìm hiểu)."
      },
      {
        id: "q2",
        type: "choice",
        prompt: "Chọn từ Hán thích hợp điền vào chỗ trống: '这项_____旨在验证关于神经元可塑性的初始假设。'",
        options: [
          { text: "课题 (kètí - Đề tài)", correct: true },
          { text: "作业 (zuòyè - Bài tập)", correct: false },
          { text: "课文 (kèwén - Bài khóa)", correct: false },
          { text: "口语 (kǒuyǔ - Khẩu ngữ)", correct: false }
        ],
        explanation: "Trong văn cảnh học thuật nghiên cứu khoa học ('旨在验证...初始假设'), danh từ chuẩn mực nhất là 【课题】 (Đề tài nghiên cứu)."
      },
      {
        id: "q3",
        type: "choice",
        prompt: "Cặp từ 【假设】 (jiǎshè) và 【证实】 (zhèngshí) phản ánh quy trình nghiên cứu khoa học nào?",
        options: [
          { text: "Đưa ra giả thuyết khoa học và Tiến hành chứng thực/xác minh", correct: true },
          { text: "Đặt câu hỏi phỏng vấn và Thu thập ý kiến khảo sát", correct: false },
          { text: "Lập dự toán kinh phí và Nghiệm thu đề tài", correct: false },
          { text: "Viết tổng quan tài liệu và Đăng bài báo quốc tế", correct: false }
        ],
        explanation: "【假设】 (Giả thuyết) là giả định ban đầu; 【证实】 (Chứng thực) là dùng thực nghiệm/số liệu để xác minh tính đúng đắn."
      },
      {
        id: "q4",
        type: "choice",
        prompt: "Bộ thủ chính của chữ 【析】 trong từ 【分析】 (fēnxī - Phân tích) là bộ gì?",
        options: [
          { text: "Bộ Mộc (木 - Cây gỗ, chẻ gỗ theo thớ để quan sát)", correct: true },
          { text: "Bộ Đao (刀 - Con dao)", correct: false },
          { text: "Bộ Cân (斤 - Chiếc búa)", correct: false },
          { text: "Bộ Thạch (石 - Hòn đá)", correct: false }
        ],
        explanation: "Chữ 析 thuộc bộ Mộc (木), bên phải là bộ Cân (斤 - cái búa), kết hợp lại mang ý dùng búa chẻ gỗ ra từng thớ để phân tích bản chất."
      },
      {
        id: "q5",
        type: "reorder",
        prompt: "Sắp xếp các cụm từ sau thành một câu học thuật hoàn chỉnh và chuẩn ngữ pháp tiếng Trung:",
        items: [
          "这项研究 (1)",
          "气候变化 (2)",
          "揭示了 (3)",
          "对生态平衡的 (4)",
          "深远影响 (5)"
        ],
        correctOrder: [0, 2, 1, 3, 4], // 1 -> 3 -> 2 -> 4 -> 5
        solutionSentence: "这项研究 (1) 揭示了 (3) 气候变化 (2) 对生态平衡的 (4) 深远影响 (5)。",
        explanation: "Cấu trúc chủ vị chuẩn học thuật: Chủ ngữ [这项研究] + Vị ngữ động từ [揭示了] + Định ngữ [气候变化对生态平衡的] + Trung tâm ngữ tân ngữ [深远影响]."
      },
      {
        id: "q6",
        type: "choice",
        prompt: "Từ 【答辩】 (dábiàn) trong môi trường đào tạo sau đại học mang ý nghĩa gì?",
        options: [
          { text: "Bảo vệ luận án / khóa luận tốt nghiệp trước Hội đồng chuyên môn", correct: true },
          { text: "Tranh luận giữa các sinh viên trong lớp học", correct: false },
          { text: "Trả lời bài thi vấn đáp kết thúc môn học", correct: false },
          { text: "Hội thảo giới thiệu đề tài thực tập doanh nghiệp", correct: false }
        ],
        explanation: "【答辩】 (Đáp biện) là thuật ngữ học thuật chỉ buổi bảo vệ luận văn thạc sĩ hoặc luận án tiến sĩ trước hội đồng giám khảo."
      },
      {
        id: "q7",
        type: "choice",
        prompt: "Điền liên từ quan hệ nhân quả học thuật thích hợp: '优化生产工艺降低了原材料消耗，_____显著提升了企业利润。'",
        options: [
          { text: "从而 (cóng'ér - Do đó mà, nhờ đó mà)", correct: true },
          { text: "但是 (dànshì - Nhưng mà)", correct: false },
          { text: "虽然 (suīrán - Mặc dù)", correct: false },
          { text: "难道 (nándào - Lẽ nào)", correct: false }
        ],
        explanation: "【从而】 (Tùng nhi) là liên từ học thuật kết nối nguyên nhân và kết quả tất yếu mang tính logic trong văn bản nghiên cứu."
      },
      {
        id: "q8",
        type: "choice",
        prompt: "Âm Hán Việt của từ 【核心】 (héxīn) là gì và mang ý nghĩa gì?",
        options: [
          { text: "Hạch Tâm — Yếu tố cốt lõi, trung tâm trọng yếu nhất", correct: true },
          { text: "Hà Tâm — Trái tim của dòng sông", correct: false },
          { text: "Hạch Tín — Lời hứa danh dự", correct: false },
          { text: "Hiệp Tâm — Cùng chung một lòng", correct: false }
        ],
        explanation: "【核心】 âm Hán Việt là 'Hạch Tâm' (Hạch: hạt nhân; Tâm: trái tim), nghĩa là yếu tố then chốt, cốt lõi nhất."
      }
    ]
  },
  {
    id: "exam-hsk-foundation-02",
    title: "Đề thi Đánh giá Năng lực Pinyin & Ngữ Pháp HSK Nền Tảng (Đề số 02)",
    level: "HSK 2 - 3 / Căn bản",
    durationMinutes: 10,
    passScorePercent: 75,
    description: "Đánh giá khả năng phân biệt thanh điệu Pinyin, từ vựng giao tiếp và liên từ nền tảng trong tiếng Trung.",
    questions: [
      {
        id: "q2-1",
        type: "choice",
        prompt: "Thanh điệu chuẩn của từ 【经济】 là gì?",
        options: [
          { text: "jīngjì (Thanh 1 + Thanh 4)", correct: true },
          { text: "jīngjī (Thanh 1 + Thanh 1)", correct: false },
          { text: "jǐngjì (Thanh 3 + Thanh 4)", correct: false },
          { text: "jìngjì (Thanh 4 + Thanh 4)", correct: false }
        ],
        explanation: "【经济】 có bính âm là 'jīng' (thanh 1, âm ngang) + 'jì' (thanh 4, âm dứt khoát hạ giọng)."
      },
      {
        id: "q2-2",
        type: "choice",
        prompt: "Chọn từ thích hợp: '我每天在网上认真_____中文学术词汇。'",
        options: [
          { text: "学习 (xuéxí - Học tập)", correct: true },
          { text: "睡觉 (shuìjiào - Ngủ)", correct: false },
          { text: "买 (mǎi - Mua)", correct: false },
          { text: "看病 (kànbìng - Khám bệnh)", correct: false }
        ],
        explanation: "Hành động đối với '中文学术词汇' (từ vựng học thuật tiếng Trung) là 【学习】 (học tập)."
      },
      {
        id: "q2-3",
        type: "choice",
        prompt: "Cấu trúc liên từ nhượng bộ nào sau đây ghép đôi chuẩn ngữ pháp tiếng Trung?",
        options: [
          { text: "尽管……依然 / 但是…… (Dẫu rằng... vẫn...)", correct: true },
          { text: "因为……从而……", correct: false },
          { text: "随着……反而……", correct: false },
          { text: "为了……难道……", correct: false }
        ],
        explanation: "Cặp liên từ nhượng bộ phổ biến trong văn phong học thuật: '尽管……依然 / 还是 / 但是……' (Cho dù... vẫn...)."
      },
      {
        id: "q2-4",
        type: "choice",
        prompt: "Học vị cao nhất trong bậc giáo dục đại học sau thạc sĩ là gì?",
        options: [
          { text: "博士 (bóshì - Tiến sĩ)", correct: true },
          { text: "学士 (xuéshì - Cử nhân)", correct: false },
          { text: "硕士 (shuòshì - Thạc sĩ)", correct: false },
          { text: "大夫 (dàifu - Bác sĩ y khoa)", correct: false }
        ],
        explanation: "【博士】 (Bác sĩ / Tiến sĩ) là học vị cao nhất trong hệ thống học vị (学士 Cử nhân -> 硕士 Thạc sĩ -> 博士 Tiến sĩ)."
      }
    ]
  }
];
