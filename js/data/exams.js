/**
 * tiengtrungdema — Exam Suites & Stage Checkpoint Tests
 * Hệ thống đề thi CBT HSK và Đề thi Kiểm Tra Đánh Giá Nâng Cấp Lộ Trình 5 Chặng
 */

export const EXAM_SUITES = [
  // ==================== BÀI TEST NÂNG CẤP CHẶNG 1 ====================
  {
    id: "exam-stage1",
    stageKey: "stage1",
    title: "Bài Test Nâng Cấp Chặng 1: Chuẩn Pinyin & 214 Bộ Thủ Hán Tự",
    level: "Nhập Môn / HSK 1",
    durationMinutes: 10,
    passScorePercent: 70,
    description: "Đánh giá mức độ nắm vững 4 thanh điệu, quy tắc biến điệu và nhận diện 214 bộ thủ căn bản trước khi chuyển lên Chặng 2.",
    questions: [
      {
        id: "s1-q1",
        type: "choice",
        prompt: "Trong tiếng Trung chuẩn, thanh 1 (Âm Bình - ví dụ chữ 妈 mā) có cao độ và đặc điểm phát âm như thế nào?",
        options: [
          { text: "Cao và ngang đều (độ cao 55)", correct: true },
          { text: "Lên giọng từ trung bình lên cao (độ cao 35)", correct: false },
          { text: "Xuống trầm rồi nhấc lên (độ cao 214)", correct: false },
          { text: "Rơi dứt khoát từ cao nhất xuống thấp (độ cao 51)", correct: false }
        ],
        explanation: "Thanh 1 trong tiếng Trung là thanh cao ngang (âm bình, độ cao 5-5), giữ hơi đều và ngân vang."
      },
      {
        id: "s1-q2",
        type: "choice",
        prompt: "Khi hai chữ cùng mang thanh 3 đi liền nhau (ví dụ: 你 nǐ và 好 hǎo), chữ đầu tiên sẽ phát âm biến điệu thành thanh mấy?",
        options: [
          { text: "Biến thành thanh 2 (đọc là: ní hǎo)", correct: true },
          { text: "Giữ nguyên thanh 3 ban đầu (nǐ hǎo)", correct: false },
          { text: "Biến thành thanh 4 dứt khoát (nì hǎo)", correct: false },
          { text: "Biến thành thanh 1 ngang bằng (nī hǎo)", correct: false }
        ],
        explanation: "Quy tắc biến điệu thanh 3: Hai thanh 3 đi liền nhau, chữ đầu tiên bắt buộc biến thành thanh 2 (nǐ hǎo -> ní hǎo)."
      },
      {
        id: "s1-q3",
        type: "choice",
        prompt: "Bộ thủ 【氵】 (ba chấm thủy) thường xuất hiện trong các chữ Hán liên quan đến khái niệm gì?",
        options: [
          { text: "Nước, sông hồ, chất lỏng (Ví dụ: 汉 Hán, 洗 Tẩy, 海 Hải)", correct: true },
          { text: "Cây cối, gỗ rừng (Ví dụ: 木 Mộc, 林 Lâm)", correct: false },
          { text: "Con người, hành vi nhân đạo (Ví dụ: 你 Bạn, 他 Anh ấy)", correct: false },
          { text: "Ngôn ngữ, lời nói (Ví dụ: 话 Lời, 语 Ngữ)", correct: false }
        ],
        explanation: "Bộ Thủy (氵) là hình thái biến thể của chữ Thủy (水), biểu thị nước và các sự vật liên quan đến chất lỏng."
      },
      {
        id: "s1-q4",
        type: "choice",
        prompt: "Chữ Hán 【你】 (Bạn / Cậu) có chứa bộ thủ nào đứng ở phía bên trái?",
        options: [
          { text: "Bộ Nhân đứng (亻) — Chỉ con người", correct: true },
          { text: "Bộ Khẩu (口) — Chỉ miệng", correct: false },
          { text: "Bộ Mộc (木) — Chỉ cây cối", correct: false },
          { text: "Bộ Thổ (土) — Chỉ đất", correct: false }
        ],
        explanation: "Chữ 你 gồm bộ Nhân đứng (亻) ở bên trái chỉ con người và chữ 尔 (ěr) ở bên phải tạo âm."
      },
      {
        id: "s1-q5",
        type: "choice",
        prompt: "Từ 【谢谢】 (Cảm ơn) có phiên âm Pinyin chuẩn xác là gì?",
        options: [
          { text: "xièxie (Chữ đầu thanh 4, chữ sau thanh nhẹ)", correct: true },
          { text: "xīexīe (Hai chữ cùng thanh 1)", correct: false },
          { text: "xiěxiě (Hai chữ cùng thanh 3)", correct: false },
          { text: "xíexíe (Hai chữ cùng thanh 2)", correct: false }
        ],
        explanation: "【谢谢】 có phiên âm chuẩn là 'xièxie', chữ thứ hai đọc thành thanh nhẹ (khinh thanh)."
      }
    ]
  },

  // ==================== BÀI TEST NÂNG CẤP CHẶNG 2 ====================
  {
    id: "exam-stage2",
    stageKey: "stage2",
    title: "Bài Test Nâng Cấp Chặng 2: Nền Tảng HSK 1 - 2 & Mẫu Câu Giao Tiếp",
    level: "HSK 1 - 2 / Căn bản",
    durationMinutes: 12,
    passScorePercent: 70,
    description: "Đánh giá ngữ pháp câu chữ 是, 有/没有, mẫu câu giao tiếp đời sống và 300 từ vựng cốt lõi trước khi nâng lên Chặng 3.",
    questions: [
      {
        id: "s2-q1",
        type: "choice",
        prompt: "Để phủ định động từ 【有】 (có/sở hữu), cách nói nào sau đây là chuẩn ngữ pháp tiếng Trung?",
        options: [
          { text: "没有 (méiyǒu)", correct: true },
          { text: "不有 (bù yǒu)", correct: false },
          { text: "别有 (bié yǒu)", correct: false },
          { text: "莫有 (mò yǒu)", correct: false }
        ],
        explanation: "Riêng động từ '有' chỉ được phủ định bằng phó từ '没' thành '没有', tuyệt đối không được nói '不有'."
      },
      {
        id: "s2-q2",
        type: "choice",
        prompt: "Chọn từ thích hợp điền vào chỗ trống: '我们每天都在认真_____汉语。'",
        options: [
          { text: "学习 (xuéxí - Học tập)", correct: true },
          { text: "睡觉 (shuìjiào - Ngủ)", correct: false },
          { text: "买 (mǎi - Mua)", correct: false },
          { text: "跑步 (pǎobù - Chạy bộ)", correct: false }
        ],
        explanation: "Đối tượng là '汉语' (tiếng Hán/tiếng Trung) nên hành động phù hợp nhất là 【学习】 (học tập)."
      },
      {
        id: "s2-q3",
        type: "choice",
        prompt: "Trong câu nghi vấn hỏi 'Bạn là người nước nào?', đại từ nghi vấn nào được sử dụng?",
        options: [
          { text: "哪 (nǎ - Nào trong: 你是哪国人？)", correct: true },
          { text: "那 (nà - Kia/Đó)", correct: false },
          { text: "什么 (shénme - Cái gì)", correct: false },
          { text: "谁 (shéi - Ai)", correct: false }
        ],
        explanation: "Câu hỏi quốc tịch chuẩn là: '你是哪国人？' (Nǐ shì nǎ guó rén?)."
      },
      {
        id: "s2-q4",
        type: "choice",
        prompt: "Từ 【准备】 (zhǔnbèi) mang ý nghĩa gì và dùng trong ngữ cảnh nào?",
        options: [
          { text: "Chuẩn bị (Ví dụ: 准备考试 - Chuẩn bị thi)", correct: true },
          { text: "Chính xác (Ví dụ: 准确 - Chuẩn xác)", correct: false },
          { text: "Phê chuẩn (Ví dụ: 批准 - Phê chuẩn)", correct: false },
          { text: "Tiêu chuẩn (Ví dụ: 标准 - Tiêu chuẩn)", correct: false }
        ],
        explanation: "【准备】 nghĩa là chuẩn bị, chuẩn bị hành trang hoặc tâm thế thực hiện hành động."
      },
      {
        id: "s2-q5",
        type: "reorder",
        prompt: "Sắp xếp các từ sau thành câu khẳng định hoàn chỉnh: '我是大学生 (Tôi là sinh viên đại học)'",
        items: [
          "大学生 (1)",
          "我 (2)",
          "是 (3)"
        ],
        correctOrder: [1, 2, 0], // 我 -> 是 -> 大学生
        solutionSentence: "我 (2) 是 (3) 大学生 (1)。",
        explanation: "Cấu trúc câu khẳng định chữ 是: Chủ ngữ [我] + 是 + Tân ngữ [大学生]."
      }
    ]
  },

  // ==================== BÀI TEST NÂNG CẤP CHẶNG 3 ====================
  {
    id: "exam-stage3",
    stageKey: "stage3",
    title: "Bài Test Nâng Cấp Chặng 3: Trung Cấp HSK 3 & Liên Từ Ghép Câu, Bổ Ngữ",
    level: "HSK 3 / Trung cấp 1",
    durationMinutes: 15,
    passScorePercent: 70,
    description: "Đánh giá khả năng liên kết câu, cấu trúc so sánh, bổ ngữ kết quả và 600 từ vựng HSK 3 trước khi nâng lên Chặng 4.",
    questions: [
      {
        id: "s3-q1",
        type: "choice",
        prompt: "Cặp liên từ biểu thị quan hệ nhượng bộ đối lập (Tuy... nhưng...) trong tiếng Trung là gì?",
        options: [
          { text: "虽然……但是…… (Suīrán... dànshì...)", correct: true },
          { text: "因为……所以…… (Bởi vì... cho nên...)", correct: false },
          { text: "不仅……而且…… (Không những... mà còn...)", correct: false },
          { text: "如果……就…… (Nếu... thì...)", correct: false }
        ],
        explanation: "【虽然……但是……】 là cặp liên từ biểu thị quan hệ chuyển ý (nhượng bộ - đối lập)."
      },
      {
        id: "s3-q2",
        type: "choice",
        prompt: "Từ 【提高】 (tígāo) trong cụm từ '提高汉语水平' mang âm Hán Việt và ý nghĩa gì?",
        options: [
          { text: "Đề Cao — Nâng cao trình độ / năng lực", correct: true },
          { text: "Đề Cử — Tiến cử người tài", correct: false },
          { text: "Tiêu Cao — Tiêu chuẩn cao", correct: false },
          { text: "Đề Mục — Tiêu đề bài viết", correct: false }
        ],
        explanation: "【提高】 âm Hán Việt là 'Đề Cao', nghĩa là làm cho trình độ, năng lực, mức độ phát triển cao hơn."
      },
      {
        id: "s3-q3",
        type: "choice",
        prompt: "Trong câu: '这个问题我终于弄清楚了', từ 【清楚】 (qīngchu) đóng vai trò ngữ pháp gì?",
        options: [
          { text: "Bổ ngữ kết quả (làm rõ bản chất hành động '弄')", correct: true },
          { text: "Định ngữ đứng trước danh từ", correct: false },
          { text: "Trạng ngữ chỉ thời gian", correct: false },
          { text: "Tân ngữ trực tiếp", correct: false }
        ],
        explanation: "'弄清楚' (nòng qīngchu): Động từ '弄' kết hợp với tính từ '清楚' làm bổ ngữ kết quả, biểu thị kết quả làm sáng tỏ."
      },
      {
        id: "s3-q4",
        type: "choice",
        prompt: "Cấu trúc so sánh hơn với chữ 【比】 (bǐ): 'Hôm nay trời lạnh hơn hôm qua' được diễn đạt như thế nào?",
        options: [
          { text: "今天比昨天冷 (Jīntiān bǐ zuótiān lěng)", correct: true },
          { text: "今天比昨天很冷 (Jīntiān bǐ zuótiān hěn lěng)", correct: false },
          { text: "昨天比今天冷 (Zuótiān bǐ jīntiān lěng)", correct: false },
          { text: "今天冷比昨天 (Jīntiān lěng bǐ zuótiān)", correct: false }
        ],
        explanation: "Cấu trúc câu so sánh chữ 比: A + 比 + B + Tính từ (không dùng phó từ chỉ mức độ như '很' trước tính từ)."
      },
      {
        id: "s3-q5",
        type: "choice",
        prompt: "Từ 【解决】 (jiějué - Giải quyết) thường kết hợp với danh từ nào sau đây để tạo cụm từ tự nhiên nhất?",
        options: [
          { text: "解决问题 (Giải quyết vấn đề / khó khăn)", correct: true },
          { text: "解决饭 (Ăn cơm)", correct: false },
          { text: "解决书 (Đọc sách)", correct: false },
          { text: "解决老师 (Gặp thầy giáo)", correct: false }
        ],
        explanation: "Động từ 【解决】 (Giải quyết) thường đi kèm tân ngữ 【问题】 (Vấn đề), 【矛盾】 (Mâu thuẫn), 【困难】 (Khó khăn)."
      }
    ]
  },

  // ==================== BÀI TEST NÂNG CẤP CHẶNG 4 ====================
  {
    id: "exam-stage4",
    stageKey: "stage4",
    title: "Bài Test Nâng Cấp Chặng 4: Trung Cấp Cao HSK 4 & Câu Chữ 把, Câu Bị Động",
    level: "HSK 4 / Trung cấp 2",
    durationMinutes: 15,
    passScorePercent: 70,
    description: "Đánh giá năng lực xử lý câu chữ 把, câu bị động 被, bổ ngữ khả năng/xu hướng và từ vựng HSK 4 trước khi nâng lên Chặng 5.",
    questions: [
      {
        id: "s4-q1",
        type: "choice",
        prompt: "Trong câu chữ 把: '请把作业____给我', từ nào sau đây điền vào chỗ trống là chuẩn xác ngữ pháp?",
        options: [
          { text: "交 (jiāo - Động từ kèm thành phần bổ ngữ kết quả: 交给我)", correct: true },
          { text: "看 (kàn - Động từ đơn lẻ)", correct: false },
          { text: "做 (zuò - Chưa có thành phần hướng)", correct: false },
          { text: "写 (xiě - Chưa hoàn tất)", correct: false }
        ],
        explanation: "Cấu trúc câu chữ 把: Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác ('交给我' - nộp cho tôi). Động từ không được đứng đơn lẻ."
      },
      {
        id: "s4-q2",
        type: "choice",
        prompt: "Trong câu bị động chữ 【被】 (bèi): '钱包被小偷偷走了', từ '小偷' (kẻ trộm) đóng vai trò gì?",
        options: [
          { text: "Chủ thể thực hiện hành vi trộm cắp", correct: true },
          { text: "Đối tượng bị tác động bởi hành vi", correct: false },
          { text: "Trạng ngữ chỉ nơi chốn", correct: false },
          { text: "Bổ ngữ chỉ kết quả", correct: false }
        ],
        explanation: "Cấu trúc câu chữ 被: [Chủ ngữ chịu tác động] + 被 + [Chủ thể gây ra hành động] + Động từ + Thành phần khác."
      },
      {
        id: "s4-q3",
        type: "choice",
        prompt: "Cụm bổ ngữ khả năng 【看得懂】 (kàn de dǒng) mang ý nghĩa gì?",
        options: [
          { text: "Đọc hiểu được (có năng lực hiểu nội dung bài viết)", correct: true },
          { text: "Đọc không hiểu gì cả", correct: false },
          { text: "Xem hết toàn bộ cuốn sách", correct: false },
          { text: "Đang chăm chú theo dõi", correct: false }
        ],
        explanation: "Cấu trúc bổ ngữ khả năng: Động từ + 得 + Bổ ngữ kết quả biểu thị 'có thể làm được' (看得懂 = đọc hiểu được)."
      },
      {
        id: "s4-q4",
        type: "choice",
        prompt: "Từ 【关键】 (guānjiàn) mang âm Hán Việt là 'Quan Kiện', dùng để chỉ điều gì?",
        options: [
          { text: "Điểm mấu chốt, then chốt quyết định sự thành bại", correct: true },
          { text: "Chiếc chìa khóa mở cửa nhà", correct: false },
          { text: "Sự liên quan giữa hai người", correct: false },
          { text: "Vấn đề ít quan trọng", correct: false }
        ],
        explanation: "【关键】 (Quan Kiện) nghĩa là mấu chốt then chốt (ví dụ: 关键问题 - vấn đề then chốt; 关键时刻 - thời khắc quyết định)."
      },
      {
        id: "s4-q5",
        type: "reorder",
        prompt: "Sắp xếp các cụm từ sau thành câu chữ 把 chuẩn ngữ pháp:",
        items: [
          "他 (1)",
          "把 (2)",
          "房间 (3)",
          "打扫得 (4)",
          "干干净净 (5)"
        ],
        correctOrder: [0, 1, 2, 3, 4], // 他 -> 把 -> 房间 -> 打扫得 -> 干干净净
        solutionSentence: "他 (1) 把 (2) 房间 (3) 打扫得 (4) 干干净净 (5)。",
        explanation: "Cấu trúc: Chủ ngữ [他] + 把 + Tân ngữ [房间] + Động từ [打扫] + Bổ ngữ trạng thái [得干干净净]."
      }
    ]
  },

  // ==================== BÀI TEST NÂNG CẤP CHẶNG 5 ====================
  {
    id: "exam-stage5",
    stageKey: "stage5",
    title: "Bài Test Nâng Cấp Chặng 5: Cao Cấp HSK 5 & Đọc Báo Chí, Phân Tích Câu Phức",
    level: "HSK 5 / Cao cấp 1",
    durationMinutes: 15,
    passScorePercent: 70,
    description: "Đánh giá kỹ năng phân tích câu dài nhiều tầng định ngữ, từ vựng báo chí, tư duy nghị luận trước khi nâng lên Chặng 6.",
    questions: [
      {
        id: "s5-q1",
        type: "choice",
        prompt: "Trong cụm danh từ tiếng Trung có trợ từ '的', thành phần đứng TRƯỚC '的' có chức năng ngữ pháp gì?",
        options: [
          { text: "Định ngữ (thành phần bổ nghĩa làm rõ tính chất, phạm vi của danh từ trung tâm)", correct: true },
          { text: "Trung tâm ngữ (danh từ chính được nói tới)", correct: false },
          { text: "Bổ ngữ chỉ kết quả", correct: false },
          { text: "Trạng ngữ cách thức", correct: false }
        ],
        explanation: "Cấu trúc Định - Trung chuẩn: [Định ngữ] + 的 + [Trung tâm ngữ]. Định ngữ đứng trước để hạn định hoặc miêu tả."
      },
      {
        id: "s5-q2",
        type: "choice",
        prompt: "Điền liên từ quan hệ logic thích hợp: '优化生产工艺降低了能耗，_____显著提升了企业利润。'",
        options: [
          { text: "从而 (cóng'ér - Do đó mà, nhờ vậy mà)", correct: true },
          { text: "但是 (dànshì - Nhưng mà)", correct: false },
          { text: "虽然 (suīrán - Mặc dù)", correct: false },
          { text: "难道 (nándào - Lẽ nào)", correct: false }
        ],
        explanation: "【从而】 (Tùng nhi) là liên từ nghị luận học thuật kết nối giữa hành động và kết quả tất yếu mang tính tích cực."
      },
      {
        id: "s5-q3",
        type: "choice",
        prompt: "Từ 【核心】 (héxīn) có âm Hán Việt là gì và mang ý nghĩa gì trong bài viết nghị luận?",
        options: [
          { text: "Hạch Tâm — Yếu tố cốt lõi, trọng tâm trung tâm nhất", correct: true },
          { text: "Hà Tâm — Trái tim của dòng sông", correct: false },
          { text: "Hạch Tín — Lời hứa danh dự", correct: false },
          { text: "Hiệp Tâm — Cùng chung một lòng", correct: false }
        ],
        explanation: "【核心】 âm Hán Việt là 'Hạch Tâm' (Hạch: hạt nhân; Tâm: trái tim), nghĩa là yếu tố then chốt, cốt lõi nhất."
      },
      {
        id: "s5-q4",
        type: "choice",
        prompt: "Từ 【趋势】 (qūshì) trong báo chí kinh tế thường dùng để chỉ điều gì?",
        options: [
          { text: "Xu thế, chiều hướng biến chuyển của sự vật theo thời gian", correct: true },
          { text: "Tình thế nguy hiểm khẩn cấp", correct: false },
          { text: "Quyền thế của chính quyền", correct: false },
          { text: "Tư thế đứng thẳng", correct: false }
        ],
        explanation: "【趋势】 âm Hán Việt là 'Xu Thế', chỉ hướng vận động và biến đổi khách quan trong tương lai."
      },
      {
        id: "s5-q5",
        type: "reorder",
        prompt: "Sắp xếp các cụm từ sau thành câu báo chí chuẩn ngữ pháp:",
        items: [
          "科技创新 (1)",
          "是 (2)",
          "产业升级的 (3)",
          "核心驱动力 (4)"
        ],
        correctOrder: [0, 1, 2, 3], // 科技创新 -> 是 -> 产业升级的 -> 核心驱动力
        solutionSentence: "科技创新 (1) 是 (2) 产业升级的 (3) 核心驱动力 (4)。",
        explanation: "Cấu trúc: Chủ ngữ [科技创新] + 是 + [Định ngữ: 产业升级的] + [Trung tâm ngữ: 核心驱动力]."
      }
    ]
  },

  // ==================== BÀI TEST NÂNG CẤP CHẶNG 6 ====================
  {
    id: "exam-stage6",
    stageKey: "stage6",
    title: "Bài Test Nâng Cấp Chặng 6: Cao Cấp HSK 6 & Thành Ngữ, Ngữ Pháp Chuyên Sâu",
    level: "HSK 6 / Cao cấp 2",
    durationMinutes: 18,
    passScorePercent: 70,
    description: "Đánh giá năng lực sử dụng thành ngữ 4 chữ, câu phức đa tầng, văn phong thư từ trang trọng và biên phiên dịch cao cấp.",
    questions: [
      {
        id: "s6-q1",
        type: "choice",
        prompt: "Thành ngữ 4 chữ 【循序渐进】 (xún xù jiàn jìn) mang hàm ý phương pháp luận nào?",
        options: [
          { text: "Tiến hành tuần tự từng bước một cách khoa học, không đốt cháy giai đoạn", correct: true },
          { text: "Hành động bất chấp hậu quả", correct: false },
          { text: "Làm việc dựa vào may mắn ngẫu nhiên", correct: false },
          { text: "Đứng yên một chỗ chờ thời cơ", correct: false }
        ],
        explanation: "【循序渐进】 (Tuần tự tiệm tiến): Tuân theo trình tự, tiến lên từng bước vững chắc."
      },
      {
        id: "s6-q2",
        type: "choice",
        prompt: "Thành ngữ 【持之以恒】 (chí zhī yǐ héng) ca ngợi đức tính phẩm chất gì của con người?",
        options: [
          { text: "Sự kiên trì, bền bỉ theo đuổi mục tiêu lâu dài đến cùng", correct: true },
          { text: "Sự thông minh nhạy bén bẩm sinh", correct: false },
          { text: "Sự hào phóng chi tiêu rộng rãi", correct: false },
          { text: "Lòng dũng cảm dám mạo hiểm", correct: false }
        ],
        explanation: "【持之以恒】 (Trì chi dĩ hằng): Giữ vững ý chí kiên định và duy trì nỗ lực một cách liên tục không ngừng nghỉ."
      },
      {
        id: "s6-q3",
        type: "choice",
        prompt: "Động từ 【阐述】 (chǎnshù) có âm Hán Việt là 'Xiển Thuật', mang ý nghĩa học thuật nào?",
        options: [
          { text: "Trình bày, diễn giải tường tận và phân tích sâu sắc một quan điểm lý luận", correct: true },
          { text: "Kể lại một câu chuyện cười vui vẻ", correct: false },
          { text: "Phủ nhận hoàn toàn ý kiến của người khác", correct: false },
          { text: "Ghi chép sơ sài vài dòng nhật ký", correct: false }
        ],
        explanation: "【阐述】 (Xiển thuật): Làm sáng tỏ và diễn giải có hệ thống một quan điểm, luận điểm khoa học."
      },
      {
        id: "s6-q4",
        type: "choice",
        prompt: "Trong văn phong trang trọng HSK 6, cấu trúc phản vấn 【何尝不……】 (hécháng bù...) biểu thị điều gì?",
        options: [
          { text: "Khẳng định mạnh mẽ: 'Đâu phải là không / Có bao giờ không...'", correct: true },
          { text: "Nghi ngờ hoàn toàn sự việc không có thật", correct: false },
          { text: "Khuyên nhủ người nghe nên dừng lại", correct: false },
          { text: "Hỏi về thời gian cụ thể trong quá khứ", correct: false }
        ],
        explanation: "【何尝不】 là kết cấu phản vấn tu từ dùng để nhấn mạnh ý khẳng định: 'nào phải là không... / thật ra chính là như vậy'."
      },
      {
        id: "s6-q5",
        type: "reorder",
        prompt: "Sắp xếp các cụm từ sau thành câu HSK 6 hoàn chỉnh:",
        items: [
          "无论面对多大的困难 (1)",
          "我们都要 (2)",
          "持之以恒地 (3)",
          "追求真理 (4)"
        ],
        correctOrder: [0, 1, 2, 3], // 无论面对多大的困难 -> 我们都要 -> 持之以恒地 -> 追求真理
        solutionSentence: "无论面对多大的困难 (1) 我们都要 (2) 持之以恒地 (3) 追求真理 (4)。",
        explanation: "Cấu trúc nhượng bộ: 无论……都…… + Phó từ làm trạng ngữ [持之以恒地] + Cụm động tân [追求真理]."
      }
    ]
  },

  // ==================== BÀI TEST TỐT NGHIỆP CHẶNG 7 (HỌC THUẬT) ====================
  {
    id: "exam-stage7",
    stageKey: "stage7",
    title: "Bài Test Tốt Nghiệp Chặng 7: Tiếng Trung Học Thuật Chuyên Sâu & Luận Văn IMRaD",
    level: "Học Thuật / Sau Đại Học",
    durationMinutes: 20,
    passScorePercent: 70,
    description: "Đánh giá toàn diện cấu trúc luận văn khoa học chuẩn quốc tế IMRaD, thuật ngữ nghiên cứu và năng lực bảo vệ khóa luận trước Hội đồng.",
    questions: [
      {
        id: "s7-q1",
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
        id: "s7-q2",
        type: "choice",
        prompt: "Trong cấu trúc một bài báo khoa học chuẩn quốc tế (IMRaD), phần nào chịu trách nhiệm đối chiếu kết quả thực nghiệm với giả thuyết ban đầu?",
        options: [
          { text: "结果与讨论 (Results & Discussion / Kết quả & Thảo luận)", correct: true },
          { text: "摘要 (Abstract / Tóm tắt nghiên cứu)", correct: false },
          { text: "引言 (Introduction / Dẫn nhập)", correct: false },
          { text: "参考文献 (References / Tài liệu tham khảo)", correct: false }
        ],
        explanation: "Phần Kết quả và Thảo luận (Results & Discussion) là nơi trình bày số liệu thực nghiệm và thảo luận sâu so sánh với giả thuyết."
      },
      {
        id: "s7-q3",
        type: "choice",
        prompt: "Cặp thuật ngữ 【假设】 (jiǎshè) và 【证实】 (zhèngshí) phản ánh quy trình nghiên cứu khoa học nào?",
        options: [
          { text: "Đưa ra giả thuyết khoa học và Tiến hành chứng thực/xác minh", correct: true },
          { text: "Đặt câu hỏi phỏng vấn và Thu thập ý kiến khảo sát", correct: false },
          { text: "Lập dự toán kinh phí và Nghiệm thu đề tài", correct: false },
          { text: "Viết tổng quan tài liệu và Đăng bài báo quốc tế", correct: false }
        ],
        explanation: "【假设】 (Giả thuyết) là giả định ban đầu; 【证实】 (Chứng thực) là dùng thực nghiệm/số liệu để xác minh tính đúng đắn."
      },
      {
        id: "s7-q4",
        type: "choice",
        prompt: "Thuật ngữ 【答辩】 (dábiàn) trong môi trường đào tạo sau đại học mang ý nghĩa gì?",
        options: [
          { text: "Bảo vệ luận án / khóa luận tốt nghiệp trước Hội đồng chuyên môn", correct: true },
          { text: "Tranh luận giữa các sinh viên trong lớp học", correct: false },
          { text: "Trả lời bài thi vấn đáp kết thúc môn học", correct: false },
          { text: "Hội thảo giới thiệu đề tài thực tập doanh nghiệp", correct: false }
        ],
        explanation: "【答辩】 (Đáp biện) là thuật ngữ học thuật chỉ buổi bảo vệ luận văn thạc sĩ hoặc luận án tiến sĩ trước hội đồng giám khảo."
      },
      {
        id: "s7-q5",
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
        id: "s7-q6",
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
      }
    ]
  }
];
