/**
 * Web Speech Engine for Chinese (Phát âm TTS zh-CN & Nhận diện Giọng nói)
 * Hỗ trợ Web Speech Synthesis & Web Speech Recognition chuẩn ngữ âm Bắc Kinh
 */

export class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentVoice = null;
    this.speechRate = 0.92;
    this.recognition = null;
    this.isListening = false;

    this.initVoices();
    this.initRecognition();
  }

  initVoices() {
    if (!this.synth) return;
    const updateVoices = () => {
      this.voices = this.synth.getVoices();
      // Ưu tiên các giọng Trung văn phổ thông (zh-CN, Mandarin)
      this.currentVoice = this.voices.find(v => 
        v.lang === "zh-CN" || v.lang === "cmn-Hans-CN" || v.lang.startsWith("zh")
      ) || null;
    };

    updateVoices();
    if (this.synth.onvoiceschanged !== undefined) {
      this.synth.onvoiceschanged = updateVoices;
    }
  }

  setSpeechRate(rate) {
    this.speechRate = parseFloat(rate) || 0.92;
  }

  speak(text) {
    if (!this.synth) {
      console.warn("Trình duyệt không hỗ trợ Web Speech Synthesis.");
      return;
    }

    // Dừng âm thanh đang phát trước đó để tránh dồn ứ
    this.synth.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "zh-CN";
    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    if (this.currentVoice) {
      utterance.voice = this.currentVoice;
    }

    this.synth.speak(utterance);
  }

  initRecognition() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.lang = "zh-CN";
      this.recognition.continuous = false;
      this.recognition.interimResults = false;
      this.recognition.maxAlternatives = 1;
    }
  }

  /**
   * Bắt đầu ghi âm giọng đọc người dùng và so khớp với từ/câu mục tiêu
   */
  evaluatePronunciation(expectedText, onResult, onError) {
    if (!this.recognition) {
      onError("Trình duyệt hiện tại chưa hỗ trợ Web Speech Recognition (Khuyên dùng Chrome/Edge trên PC hoặc Android).");
      return;
    }

    if (this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }

    this.recognition.onstart = () => {
      this.isListening = true;
    };

    this.recognition.onerror = (event) => {
      this.isListening = false;
      let msg = "Lỗi thu âm: " + event.error;
      if (event.error === "not-allowed") {
        msg = "Quyền truy cập Microphone đã bị chặn. Vui lòng cấp quyền micro trên trình duyệt để luyện nói.";
      }
      onError(msg);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    this.recognition.onresult = (event) => {
      this.isListening = false;
      const transcript = event.results[0][0].transcript.trim();
      const confidence = event.results[0][0].confidence || 0.85;

      const cleanExpected = expectedText.replace(/[^\u4e00-\u9fa5]/g, "");
      const cleanActual = transcript.replace(/[^\u4e00-\u9fa5]/g, "");

      const similarity = this.calculateSimilarity(cleanExpected, cleanActual);
      const isMatched = similarity >= 0.75;

      onResult({
        expected: expectedText,
        transcript: transcript,
        confidence: Math.round(confidence * 100),
        similarity: Math.round(similarity * 100),
        isMatched,
        feedback: isMatched 
          ? "Phát âm rất chuẩn xác! Ngữ điệu và âm sắc rõ ràng."
          : `Cần cải thiện. Máy nghe được: "${transcript}". Hãy nghe lại và thử phát âm to, rõ thanh điệu hơn nhé!`
      });
    };

    try {
      this.recognition.start();
    } catch (err) {
      onError("Không thể khởi động micro: " + err.message);
    }
  }

  stopListening() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  calculateSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;
    
    // Levenshtein distance
    const track = Array(s2.length + 1).fill(null).map(() =>
      Array(s1.length + 1).fill(null)
    );
    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1, // deletion
          track[j - 1][i] + 1, // insertion
          track[j - 1][i - 1] + indicator // substitution
        );
      }
    }
    const distance = track[s2.length][s1.length];
    const maxLen = Math.max(s1.length, s2.length);
    return Math.max(0, (maxLen - distance) / maxLen);
  }
}
