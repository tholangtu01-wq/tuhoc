/**
 * tiengtrungdema — Data Nội Dung Bài Học Tương Tác Theo Chặng & Hướng Dẫn Sử Dụng
 */

export const ROADMAP_LESSONS = {
  stage1: {
    badge: "Chặng 1: Nhập Môn",
    title: "Ngữ Âm Bính Âm (Pinyin), 4 Thanh Điệu & 214 Bộ Thủ",
    xpReward: 40,
    sections: [
      {
        title: "1. Hệ thống 4 Thanh Điệu (四声) & Quy Tắc Biến Điệu",
        content: `
          <p>Tiếng Trung chuẩn gồm 4 thanh điệu chính và 1 thanh nhẹ:</p>
          <ul style="padding-left: 20px; margin: 8px 0; line-height: 1.6;">
            <li><strong>Thanh 1 (Âm Bình - ā):</strong> Cao và đều (độ cao 55). Ví dụ: <em>mā (妈 - Mẹ)</em></li>
            <li><strong>Thanh 2 (Dương Bình - á):</strong> Lên giọng từ trung bình lên cao (độ cao 35). Ví dụ: <em>má (麻 - Cây gai)</em></li>
            <li><strong>Thanh 3 (Thượng Thanh - ǎ):</strong> Xuống trầm rồi hơi nhấc lên (độ cao 214). Ví dụ: <em>mǎ (马 - Con ngựa)</em></li>
            <li><strong>Thanh 4 (Khứ Thanh - à):</strong> Rơi dứt khoát từ cao nhất xuống thấp nhất (độ cao 51). Ví dụ: <em>mà (骂 - Mắng)</em></li>
            <li><strong>Thanh nhẹ (Khinh thanh):</strong> Đọc nhẹ và ngắn. Ví dụ: <em>ma (吗 - Trợ từ nghi vấn)</em></li>
          </ul>
          <p style="margin-top: 8px;"><strong>Quy tắc biến điệu quan trọng:</strong> Khi hai thanh 3 đi liền nhau, chữ đầu bắt buộc biến thành thanh 2 (Ví dụ: <em>nǐ + hǎo = ní hǎo</em>; <em>kě + yǐ = ké yǐ</em>).</p>
        `
      },
      {
        title: "2. Bộ Thủ Hán Tự Nền Tảng Có Phát Âm Bản Ngữ",
        vocabList: [
          { hanzi: "氵", pinyin: "shuǐ", mean: "Bộ Thủy (Nước, sông suối) • Ví dụ: 汉 (Hán), 洗 (Tẩy), 没 (Một)" },
          { hanzi: "亻", pinyin: "rén", mean: "Bộ Nhân đứng (Con người) • Ví dụ: 你 (Bạn), 他 (Anh ấy), 们 (Chúng tôi)" },
          { hanzi: "口", pinyin: "kǒu", mean: "Bộ Khẩu (Miệng, lời nói) • Ví dụ: 叫 (Gọi), 吃 (Ăn), 喝 (Uống)" },
          { hanzi: "木", pinyin: "mù", mean: "Bộ Mộc (Cây cối, gỗ) • Ví dụ: 机 (Cơ), 析 (Tích), 本 (Bản)" },
          { hanzi: "讠", pinyin: "yán", mean: "Bộ Ngôn (Lời nói, ngôn ngữ) • Ví dụ: 论 (Luận), 设 (Thiết), 词 (Từ)" }
        ]
      },
      {
        title: "3. Bài Tập Tương Tác Củng Cố Kiến Thức",
        quiz: {
          question: "Khi hai chữ cùng mang thanh 3 đi liền nhau (ví dụ: 你 nǐ và 好 hǎo), chữ đầu tiên sẽ phát âm biến điệu thành thanh mấy?",
          options: [
            { text: "A. Giữ nguyên thanh 3 ban đầu", correct: false },
            { text: "B. Biến thành thanh 2 (đọc là: ní hǎo)", correct: true },
            { text: "C. Biến thành thanh 4 dứt khoát (nì hǎo)", correct: false },
            { text: "D. Biến thành thanh 1 ngang bằng (nī hǎo)", correct: false }
          ],
          explanation: "Quy tắc ngữ âm chuẩn: Khi hai âm tiết mang thanh 3 đi liền nhau, âm tiết thứ nhất bắt buộc phải đọc biến điệu thành thanh 2."
        }
      }
    ]
  },

  stage2: {
    badge: "Chặng 2: Nền Tảng",
    title: "Cấu Trúc Câu Cơ Bản HSK 1 - 2 & Giao Tiếp Đời Sống",
    xpReward: 50,
    sections: [
      {
        title: "1. Ngữ Pháp Trọng Điểm: Câu Chữ 是 (shì) & Có/Không 有 (yǒu)",
        content: `
          <ul style="padding-left: 20px; margin: 8px 0; line-height: 1.6;">
            <li><strong>Câu khẳng định với 是:</strong> Chủ ngữ + 是 + Tân ngữ.<br>Ví dụ: <em>我是大学生 (Wǒ shì dàxuéshēng - Tôi là sinh viên đại học).</em></li>
            <li><strong>Câu phủ định:</strong> Chủ ngữ + 不是 + Tân ngữ.<br>Ví dụ: <em>他不是老师 (Tā bù shì lǎoshī - Anh ấy không phải là giáo viên).</em></li>
            <li><strong>Câu hỏi nghi vấn với 吗:</strong> Mệnh đề + 吗?<br>Ví dụ: <em>你懂了吗? (Nǐ dǒng le ma? - Bạn đã hiểu chưa?)</em></li>
            <li><strong>Sở hữu / Tồn tại với 有:</strong> Chủ ngữ + 有 + Tân ngữ. Lưu ý: Phủ định của 有 bắt buộc phải dùng <strong>没有 (méiyǒu)</strong>, tuyệt đối không nói 不有!</li>
          </ul>
        `
      },
      {
        title: "2. Mẫu Câu Thực Hành Giao Tiếp",
        vocabList: [
          { hanzi: "学习", pinyin: "xuéxí", mean: "Học tập • 我们每天都在认真学习汉语。" },
          { hanzi: "准备", pinyin: "zhǔnbèi", mean: "Chuẩn bị • 我们已经为考试做好了准备。" },
          { hanzi: "帮助", pinyin: "bāngzhù", mean: "Giúp đỡ • 谢谢你的热情帮助！" }
        ]
      },
      {
        title: "3. Bài Tập Tương Tác Nhanh",
        quiz: {
          question: "Để phủ định động từ '有' (có), trong tiếng Trung ta dùng phó từ phủ định nào?",
          options: [
            { text: "A. 不 (bù)", correct: false },
            { text: "B. 没 (méi) thành 没有 (méiyǒu)", correct: true },
            { text: "C. 别 (bié)", correct: false },
            { text: "D. 莫 (mò)", correct: false }
          ],
          explanation: "Riêng động từ '有' chỉ được phủ định bằng '没' thành '没有', tuyệt đối không được nói '不有'."
        }
      }
    ]
  },

  stage3: {
    badge: "Chặng 3: Trung Cấp",
    title: "Ngữ Pháp Nâng Cao HSK 3 - 4 & Diễn Đạt Logic",
    xpReward: 60,
    sections: [
      {
        title: "1. Cấu Trúc Đặc Biệt: Câu Chữ 把 (bǎ) & Bổ Ngữ Kết Quả",
        content: `
          <ul style="padding-left: 20px; margin: 8px 0; line-height: 1.6;">
            <li><strong>Câu chữ 把:</strong> Chủ ngữ + 把 + Tân ngữ + Động từ + Thành phần khác.<br>Dùng khi muốn nhấn mạnh sự xử lý, tác động làm biến đổi trạng thái của tân ngữ.<br>Ví dụ: <em>请把作业交给我 (Qǐng bǎ zuòyè jiāo gěi wǒ - Xin hãy nộp bài tập cho tôi).</em></li>
            <li><strong>Bổ ngữ kết quả:</strong> Động từ + (完, 懂, 见, 到, 清楚).<br>Ví dụ: <em>这个问题我终于弄清楚了 (Vấn đề này tôi cuối cùng đã làm sáng tỏ).</em></li>
            <li><strong>Cặp liên từ diễn đạt logic:</strong> 虽然...但是... (Tuy... nhưng...); 不仅...而且... (Không những... mà còn...).</li>
          </ul>
        `
      },
      {
        title: "2. Từ Vựng Trọng Tâm Chặng Trung Cấp",
        vocabList: [
          { hanzi: "提高", pinyin: "tígāo", mean: "Nâng cao • 显著提高学术汉语水平。" },
          { hanzi: "解决", pinyin: "jiějué", mean: "Giải quyết • 成功解决了大规模计算难题。" },
          { hanzi: "影响", pinyin: "yǐngxiǎng", mean: "Ảnh hưởng • 对学术发展产生深远影响。" }
        ]
      },
      {
        title: "3. Bài Tập Tương Tác Củng Cố",
        quiz: {
          question: "Trong câu: '他把电脑____了', từ nào sau đây điền vào chỗ trống hợp quy tắc câu chữ 把 nhất?",
          options: [
            { text: "A. 买 (chỉ có một động từ đơn độc)", correct: false },
            { text: "B. 修好 (Động từ + Bổ ngữ kết quả hoàn tất)", correct: true },
            { text: "C. 正在 (phó từ chỉ thì tiếp diễn)", correct: false },
            { text: "D. 电脑 (lặp lại tân ngữ)", correct: false }
          ],
          explanation: "Trong câu chữ 把, vị ngữ không thể là một động từ đơn độc mà phía sau bắt buộc phải có thành phần khác như Bổ ngữ kết quả (修好 - sửa xong xuôi)."
        }
      }
    ]
  },

  stage4: {
    badge: "Chặng 4: Cao Cấp",
    title: "Kỹ Năng Đọc Hiểu Báo Chí & Phân Tích Câu Phức HSK 5",
    xpReward: 70,
    sections: [
      {
        title: "1. Kỹ Năng Phân Tích Câu Dài Nhiều Tầng Định Ngữ",
        content: `
          <p>Văn bản báo chí và học thuật thường có định ngữ rất dài trước trợ từ <strong>的 (de)</strong>. 3 bước đọc hiểu nhanh:</p>
          <ol style="padding-left: 20px; margin: 8px 0; line-height: 1.6;">
            <li>Tìm nòng cốt câu: Chủ ngữ chính + Động từ vị ngữ + Danh từ trung tâm ngữ.</li>
            <li>Tách bỏ các mệnh đề dài trước trợ từ '的' để nắm ý chính tức thì.</li>
            <li>Dịch ngược từ danh từ trung tâm ngữ trở về trước để hiểu trọn vẹn ngữ nghĩa.</li>
          </ol>
        `
      },
      {
        title: "2. Thuật Ngữ & Từ Vựng Báo Chí Cao Cấp",
        vocabList: [
          { hanzi: "趋势", pinyin: "qūshì", mean: "Xu thế • 清晰展现了全球变暖的演进趋势。" },
          { hanzi: "核心", pinyin: "héxīn", mean: "Cốt lõi • 科技创新是现代产业升级的核心驱动力。" },
          { hanzi: "价值", pinyin: "jiàzhí", mean: "Giá trị • 蕴含着深刻的当代伦理与学术价值。" }
        ]
      },
      {
        title: "3. Bài Tập Tương Tác",
        quiz: {
          question: "Trong cụm danh từ tiếng Trung có trợ từ '的', thành phần đứng trước '的' có chức năng ngữ pháp gì?",
          options: [
            { text: "A. Trung tâm ngữ (danh từ được nói tới)", correct: false },
            { text: "B. Định ngữ (thành phần bổ nghĩa làm rõ tính chất, phạm vi)", correct: true },
            { text: "C. Trạng ngữ thời gian", correct: false },
            { text: "D. Bổ ngữ khả năng", correct: false }
          ],
          explanation: "Cấu trúc định - trung: [Định ngữ] + 的 + [Trung tâm ngữ]. Định ngữ đứng trước để giới hạn, bổ nghĩa làm rõ cho danh từ trung tâm."
        }
      }
    ]
  },

  stage5: {
    badge: "Chặng 5: Học Thuật",
    title: "Cấu Trúc Luận Văn Khoa Học IMRaD & Bảo Vệ Khóa Luận HSK 6",
    xpReward: 80,
    sections: [
      {
        title: "1. 4 Khối Cấu Trúc Luận Văn Khoa Học Chuẩn Quốc Tế (IMRaD)",
        content: `
          <ul style="padding-left: 20px; margin: 8px 0; line-height: 1.6;">
            <li><strong>引言 (Yǐnyán - Mở đầu / Dẫn nhập):</strong> Bối cảnh nghiên cứu (研究背景), Khoảng trống lý thuyết (研究空白) và Mục tiêu đề tài.</li>
            <li><strong>研究方法 (Yánjiū fāngfǎ - Phương pháp nghiên cứu):</strong> Thiết kế thực nghiệm (实验设计), Thu thập số liệu (数据采集) và Mô hình hóa.</li>
            <li><strong>结果与讨论 (Jiéguǒ yǔ tǎolùn - Kết quả & Thảo luận):</strong> Trình bày bảng biểu (图表展现), Đối chiếu giả thuyết ban đầu và Phân tích chuyên sâu.</li>
            <li><strong>结论与展望 (Jiélùn yǔ zhǎnwàng - Kết luận & Triển vọng):</strong> Tóm lược thành quả cốt lõi, Hạn chế của nghiên cứu và Hướng nghiên cứu tương lai.</li>
          </ul>
        `
      },
      {
        title: "2. Thuật Ngữ Nghiên Cứu & Bảo Vệ Luận Văn",
        vocabList: [
          { hanzi: "答辩", pinyin: "dábiàn", mean: "Bảo vệ luận án • 顺利通过博士学位论文答辩。" },
          { hanzi: "假设", pinyin: "jiǎshè", mean: "Giả thuyết • 验证关于神经元可塑性的初始假设。" },
          { hanzi: "范式", pinyin: "fànshì", mean: "Hệ hình paradigm • 深刻重塑科学研究的基本范式。" }
        ]
      },
      {
        title: "3. Bài Tập Tương Tác",
        quiz: {
          question: "Trong cấu trúc một bài báo khoa học chuẩn (IMRaD), phần nào chịu trách nhiệm đối chiếu kết quả thực nghiệm với giả thuyết ban đầu?",
          options: [
            { text: "A. 摘要 (Abstract / Tóm tắt nghiên cứu)", correct: false },
            { text: "B. 结果与讨论 (Results & Discussion / Kết quả & Thảo luận)", correct: true },
            { text: "C. 参考文献 (References / Danh mục tài liệu tham khảo)", correct: false },
            { text: "D. 致谢 (Acknowledgements / Lời cảm ơn)", correct: false }
          ],
          explanation: "Phần 'Kết quả và Thảo luận' (Results & Discussion) là nơi phân tích sâu sắc các phát hiện thực nghiệm và so sánh với giả thuyết lý luận ban đầu."
        }
      }
    ]
  }
};

export const USER_GUIDE_DATA = {
  roadmap: {
    title: "1. Hướng Dẫn Lộ Trình Học Cá Nhân Hóa (5 Chặng)",
    content: `
      <div class="guide-step-card">
        <strong>🎯 Mục Đích:</strong>
        <p>Lộ trình học tập được thiết kế phân tầng từ cơ bản (Nhập môn Pinyin) đến chuyên sâu (Bảo vệ Luận văn HSK 6). Dữ liệu tiến độ và XP hoàn toàn riêng biệt cho từng người học.</p>
      </div>
      <div class="guide-step-card">
        <strong>🚀 Cách Học:</strong>
        <ol style="padding-left: 20px; line-height: 1.6;">
          <li>Tại tab <em>"Lộ Trình Của Tôi"</em>, bạn sẽ thấy 5 chặng học được đánh số từ Chặng 1 đến Chặng 5.</li>
          <li>Bấm vào nút <strong>"Học Ngay"</strong> trên chặng đã mở khóa để mở bài học tương tác.</li>
          <li>Đọc phần lý thuyết, bấm nút <strong>"🔊 Nghe"</strong> để nghe phát âm chuẩn bản ngữ của các từ vựng cốt lõi.</li>
          <li>Làm bài tập trắc nghiệm củng cố (Mini-Quiz).</li>
          <li>Bấm nút <strong>"Hoàn Thành Bài Học (+XP)"</strong> để nhận điểm kinh nghiệm và tăng tiến độ chặng. Khi đạt 100%, chặng tiếp theo sẽ tự động mở khóa!</li>
        </ol>
      </div>
    `
  },

  vocab: {
    title: "2. Hướng Dẫn Từ Điển & Sổ Tay Từ Vựng HSK",
    content: `
      <div class="guide-step-card">
        <strong>📚 Kho Từ Vựng Toàn Diện:</strong>
        <p>Hơn 86 mục từ vựng chọn lọc, phân bổ rõ ràng từ HSK 1, HSK 2, HSK 3, HSK 4, HSK 5, HSK 6 đến Học thuật Luận văn chuyên ngành.</p>
      </div>
      <div class="guide-step-card">
        <strong>🔍 Cách Tra Cứu &amp; Sử Dụng:</strong>
        <ul style="padding-left: 20px; line-height: 1.6;">
          <li><strong>Bộ lọc cấp độ nhanh:</strong> Bấm vào các nút tròn <em>[Tất Cả], [HSK 1], [HSK 2], [HSK 3], [HSK 4], [HSK 5], [Học Thuật / HSK 6]</em> ở đầu trang để xem ngay các từ vựng theo trình độ.</li>
          <li><strong>Ô tìm kiếm thông minh:</strong> Gõ bất kỳ ký tự chữ Hán, Bính âm Pinyin (có dấu hoặc không dấu), Âm Hán Việt hoặc nghĩa tiếng Việt.</li>
          <li><strong>☆ Lưu Sổ Tay:</strong> Bấm vào nút <em>"☆ Lưu Sổ Tay"</em> trên thẻ từ để lưu vào bộ sưu tập cá nhân. Sau đó, bấm nút <em>"⭐ Sổ Tay Của Tôi"</em> để ôn tập lại những từ bạn quan tâm nhất.</li>
          <li><strong>🔊 Nghe Phát Âm:</strong> Bấm nút <em>"Nghe"</em> trên mỗi từ để nghe giọng đọc bản ngữ Bắc Kinh chuẩn xác 100%.</li>
          <li><strong>Tập Viết / Luyện Đọc:</strong> Bấm <em>"Tập Viết"</em> để chuyển ngay sang bảng luyện nét chữ đó, hoặc bấm <em>"Luyện Đọc"</em> để thử thách giọng phát âm AI.</li>
        </ul>
      </div>
    `
  },

  srs: {
    title: "3. Hướng Dẫn Ôn Tập Flashcards Thông Minh SM-2",
    content: `
      <div class="guide-step-card">
        <strong>🧠 Thuật Toán Khoa Học SuperMemo-2 (SM-2):</strong>
        <p>Hệ thống tự động tính toán khoảng cách lặp lại (Spaced Repetition) dựa trên độ khó và khả năng ghi nhớ của não bộ, giúp ghi nhớ từ vựng vĩnh viễn.</p>
      </div>
      <div class="guide-step-card">
        <strong>🃏 Cách Ôn Tập Thẻ:</strong>
        <ol style="padding-left: 20px; line-height: 1.6;">
          <li>Mặt trước hiển thị Chữ Hán to và Âm Hán Việt. Hãy thử nhớ lại Bính âm và Nghĩa tiếng Việt.</li>
          <li><strong>Bấm vào thẻ</strong> để lật mặt sau 3D: Xem Bính âm Pinyin, Nghĩa chi tiết, Bộ thủ, Chiết tự câu chuyện và Câu ví dụ học thuật có nút nghe.</li>
          <li>Bấm một trong 4 mức độ tự đánh giá ở thanh bên dưới:
            <ul style="margin-top: 4px;">
              <li><strong>Quên:</strong> Hệ thống sẽ đưa từ này lặp lại ngay trong ngày mai.</li>
              <li><strong>Khó:</strong> Từ đang nhớ mang máng, tăng khoảng cách nhẹ.</li>
              <li><strong>Tốt:</strong> Đã nhớ rõ ràng, nhân đôi khoảng thời gian ôn tập.</li>
              <li><strong>Dễ:</strong> Rất thuộc, dời lịch ôn tập sang tuần hoặc tháng sau.</li>
            </ul>
          </li>
          <li>Mỗi lượt ôn tập đúng quy trình được cộng ngay <strong>+10 XP</strong>!</li>
        </ol>
      </div>
    `
  },

  writing: {
    title: "4. Hướng Dẫn Luyện Viết Bút Thuận Thư Pháp (米字格)",
    content: `
      <div class="guide-step-card">
        <strong>🖌️ Nét Bút Lông Viết Tay Chân Thực:</strong>
        <p>Bảng tập viết mô phỏng bút lông thư pháp Khải Thư truyền thống trên nền giấy xuyến chỉ có ô lưới Mễ tự cách (米字格). Nét bút nhạy với tốc độ: di chuyển chậm sẽ cho nét đậm đầy đặn, di chuyển nhanh sẽ tạo nét thanh thoát mảnh mai.</p>
      </div>
      <div class="guide-step-card">
        <strong>📖 Bảng Chi Tiết &amp; Dịch Nghĩa Chữ Đang Viết:</strong>
        <p>Phía dưới bảng viết hiển thị đầy đủ: <em>Chữ Hán to, Bính âm Pinyin, Âm Hán Việt, Nghĩa tiếng Việt, Bộ thủ, Số nét, Kết cấu nét và Các từ ghép tiêu biểu</em>. Bạn hoàn toàn hiểu rõ bản chất và ý nghĩa của chữ mình đang viết!</p>
      </div>
      <div class="guide-step-card">
        <strong>⚙️ Các Nút Điều Khiển:</strong>
        <ul style="padding-left: 20px; line-height: 1.6;">
          <li><strong>Mẫu Nét Mờ:</strong> Bật / tắt mẫu chữ viết tay mờ phía dưới để bạn đồ nét theo.</li>
          <li><strong>Lưới:</strong> Chuyển đổi giữa lưới Mễ tự cách (米) và Điền tự cách (田).</li>
          <li><strong>Hoàn Tác Nét:</strong> Xóa nét bút vừa vẽ sai gần nhất.</li>
          <li><strong>Xóa Bảng:</strong> Làm sạch bảng vẽ để viết lại từ đầu.</li>
          <li><strong>Hoàn Thành:</strong> Bấm để ghi nhận hoàn thành bài tập viết và nhận <strong>+20 XP</strong>.</li>
        </ul>
      </div>
    `
  },

  speech: {
    title: "5. Hướng Dẫn Luyện Phát Âm AI",
    content: `
      <div class="guide-step-card">
        <strong>🎙️ Đánh Giá Ngữ Âm Tự Động:</strong>
        <p>Ứng dụng tích hợp công nghệ nhận diện giọng nói Web Speech Recognition để chấm điểm độ chuẩn xác ngữ âm tiếng Trung (zh-CN) của bạn so với từ mục tiêu.</p>
      </div>
      <div class="guide-step-card">
        <strong>🗣️ Các Bước Luyện Phát Âm:</strong>
        <ol style="padding-left: 20px; line-height: 1.6;">
          <li>Bấm <strong>"Nghe Giọng Bản Ngữ"</strong> để nghe mẫu phát âm chuẩn giọng Bắc Kinh.</li>
          <li>Bấm <strong>"Bấm Micro Luyện Đọc"</strong> và nói to rõ ràng chữ Hán hiển thị trên màn hình.</li>
          <li>Hệ thống sẽ hiển thị kết quả phân tích: Từ máy nhận diện được, phần trăm độ khớp (%) và nhận xét sư phạm.</li>
          <li>Đạt độ khớp cao sẽ nhận ngay <strong>+30 XP</strong> thưởng!</li>
        </ol>
      </div>
    `
  },

  exam: {
    title: "6. Hướng Dẫn Phòng Thi Chuẩn CBT HSK",
    content: `
      <div class="guide-step-card">
        <strong>📝 Kiểm Định Năng Lực Trực Tuyến:</strong>
        <p>Hệ thống cung cấp các đề thi chuẩn HSK (từ HSK 1-2, HSK 3-4 đến HSK 5-6 và Học thuật) mô phỏng chính xác giao diện thi máy tính (CBT - Computer-Based Testing) tại các trường đại học.</p>
      </div>
      <div class="guide-step-card">
        <strong>📜 Giấy Chứng Nhận Thành Tích &amp; In PDF:</strong>
        <ul style="padding-left: 20px; line-height: 1.6;">
          <li>Mỗi đề thi có đồng hồ đếm ngược thời gian làm bài thực tế.</li>
          <li>Sau khi hoàn thành, bấm <strong>"Nộp Bài Chấm Điểm"</strong>: Hệ thống sẽ tự động chấm điểm và xuất Giấy chứng nhận có in họ tên học viên và mã tra cứu bảo mật.</li>
          <li>Bấm nút <strong>"In Chứng Nhận / Lưu PDF"</strong> để in trực tiếp hoặc lưu lại hồ sơ học tập xuất sắc của bạn.</li>
        </ul>
      </div>
    `
  },

  security: {
    title: "7. Quản Lý Hồ Sơ & Bảo Mật Mã Truy Cập (Access Gate)",
    content: `
      <div class="guide-step-card">
        <strong>🔒 Bảo Vệ Ứng Dụng Nội Bộ:</strong>
        <p>Ứng dụng được bảo vệ bằng lớp màn chắn <em>Mã Truy Cập (Access Key)</em>. Chỉ những ai có mã do người quản trị cấp mới có thể mở khóa sử dụng.</p>
      </div>
      <div class="guide-step-card">
        <strong>🔑 Cách Đổi Mã Truy Cập &amp; Khóa Ứng Dụng:</strong>
        <ul style="padding-left: 20px; line-height: 1.6;">
          <li><strong>Đổi mã mới:</strong> Tại tab <em>"Hồ Sơ &amp; Bảo Mật"</em>, tìm mục <em>"Mã Truy Cập Hiện Tại"</em> và bấm nút <strong>"Đổi Mã"</strong> để đổi mật mã mới theo ý bạn.</li>
          <li><strong>Khóa ứng dụng:</strong> Bấm nút <strong>"Khóa App"</strong> trên thanh điều hướng bất kỳ lúc nào để khóa màn hình ngay lập tức.</li>
          <li><strong>Đổi Người Học:</strong> Bấm vào thẻ tên người học ở góc phải trên cùng để chuyển đổi giữa các học viên hoặc bấm tạo thêm hồ sơ học viên mới.</li>
          <li><strong>Sao lưu dữ liệu:</strong> Bạn có thể bấm <strong>"Xuất Dữ Liệu Học Tập (JSON)"</strong> để tải toàn bộ tiến độ, điểm thi và từ vựng về máy tính đề phòng khi đổi trình duyệt.</li>
        </ul>
      </div>
    `
  }
};
