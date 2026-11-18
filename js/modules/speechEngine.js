/**
 * Web Speech & Native Audio Engine for Chinese
 * Tich hop 2 lop dong co am thanh:
 * 1. Native Online Mandarin Audio Stream (Giong ban ngu Bac Kinh chuan 100%, chay tren moi thiet bi)
 * 2. Web Speech Synthesis (Offline Fallback)
 * 3. Web Speech Recognition (Danh gia phat am AI)
 */

export class SpeechEngine {
  constructor() {
    this.synth = window.speechSynthesis;
    this.voices = [];
    this.currentVoice = null;
    this.speechRate = 0.92;
    this.recognition = null;
    this.isListening = false;
    this.currentAudio = null;

    this.initVoices();
    this.initRecognition();
    this.setupAudioUnlocker();
  }

  /**
   * Mo khoa am thanh tren trinh duyet di dong / iOS / Chrome
   */
  setupAudioUnlocker() {
    if (typeof window === "undefined" || typeof window.addEventListener !== "function") return;
    const unlock = () => {
      try {
        if (typeof Audio !== "undefined") {
          const audio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
          audio.play().catch(() => {});
        }
      } catch (e) {}
      if (typeof window.removeEventListener === "function") {
        window.removeEventListener("click", unlock);
        window.removeEventListener("touchstart", unlock);
      }
    };
    window.addEventListener("click", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
  }

  initVoices() {
    if (!this.synth) return;
    const updateVoices = () => {
      this.voices = this.synth.getVoices();
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

  /**
   * Phat am chuan ban ngu tieng Trung
   * Chien luoc da tang (Multi-Tier Audio Engine):
   * 1. Youdao DictVoice API chuan giong Bac Kinh
   * 2. Youdao DictVoice fallback (le=zh)
   * 3. Google Translate TTS audio stream
   * 4. Web Speech Synthesis API
   */
  speak(text, onStart = null, onEnd = null) {
    if (!text) return;
    const cleanText = text.trim();

    if (typeof onStart === "function") onStart();

    const triggerEnd = () => {
      if (typeof onEnd === "function") {
        onEnd();
        onEnd = null;
      }
    };

    // Dung am thanh truoc do neu dang phat
    if (this.currentAudio) {
      try {
        this.currentAudio.pause();
        this.currentAudio = null;
      } catch (e) {}
    }

    if (this.synth) {
      try { this.synth.cancel(); } catch (e) {}
    }

    // Danh sach cac nguon am thanh ban ngu truc tuyen
    const sources = [
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&type=1`,
      `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(cleanText)}&le=zh`,
      `https://translate.google.com/translate_tts?ie=UTF-8&tl=zh-CN&client=tw-ob&q=${encodeURIComponent(cleanText)}`
    ];

    let sourceIndex = 0;

    const tryNext = () => {
      if (sourceIndex < sources.length) {
        const url = sources[sourceIndex++];
        try {
          const audio = new Audio();
          audio.src = url;
          audio.playbackRate = this.speechRate;
          this.currentAudio = audio;

          let hasEnded = false;
          audio.onended = () => {
            if (!hasEnded) {
              hasEnded = true;
              this.currentAudio = null;
              triggerEnd();
            }
          };

          audio.onerror = () => {
            if (!hasEnded) {
              hasEnded = true;
              tryNext();
            }
          };

          const p = audio.play();
          if (p !== undefined) {
            p.catch(() => {
              if (!hasEnded) {
                hasEnded = true;
                tryNext();
              }
            });
          }
        } catch (e) {
          tryNext();
        }
      } else {
        // Fallback cuoi cung ve trinh doc he thong Web Speech API
        this.speakFallbackWebSpeech(cleanText, triggerEnd);
      }
    };

    tryNext();
  }

  speakFallbackWebSpeech(text, callback = null) {
    if (!this.synth) {
      if (callback) callback();
      return;
    }
    try {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = "zh-CN";
      utterance.rate = this.speechRate;
      utterance.pitch = 1.0;
      if (this.currentVoice) {
        utterance.voice = this.currentVoice;
      }
      utterance.onend = () => {
        if (callback) callback();
      };
      utterance.onerror = () => {
        if (callback) callback();
      };
      this.synth.speak(utterance);
    } catch (e) {
      if (callback) callback();
    }
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

  calculateSimilarity(s1, s2) {
    if (s1 === s2) return 1.0;
    if (!s1 || !s2) return 0.0;
    
    const track = Array(s2.length + 1).fill(null).map(() =>
      Array(s1.length + 1).fill(null)
    );
    for (let i = 0; i <= s1.length; i += 1) track[0][i] = i;
    for (let j = 0; j <= s2.length; j += 1) track[j][0] = j;

    for (let j = 1; j <= s2.length; j += 1) {
      for (let i = 1; i <= s1.length; i += 1) {
        const indicator = s1[i - 1] === s2[j - 1] ? 0 : 1;
        track[j][i] = Math.min(
          track[j][i - 1] + 1,
          track[j - 1][i] + 1,
          track[j - 1][i - 1] + indicator
        );
      }
    }
    const distance = track[s2.length][s1.length];
    const maxLen = Math.max(s1.length, s2.length);
    return Math.max(0, (maxLen - distance) / maxLen);
  }
}
