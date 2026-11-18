/**
 * Interactive Hanzi Calligraphy Brush Canvas
 * Mo phong but long thu phap Khai Thu viet tay (Handwritten Brush Calligraphy)
 * Tich hop do net muot ma qua Quadratic Bezier Curves va ap luc net but thanh dam
 */

export class HanziWritingCanvas {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.charToPractice = options.char || "研";
    this.showGhost = options.showGhost !== false;
    this.gridType = options.gridType || "mi"; // 'mi' (Me tu cach) hoac 'tian' (Dien tu cach)
    this.baseInkWidth = options.inkWidth || 7;
    this.inkColor = options.inkColor || "#18181b"; // Muc tau den truyen thong
    
    this.strokes = []; // Luu cac net ve
    this.currentStroke = [];
    this.isDrawing = false;
    this.lastTime = 0;

    this.initCanvas();
    this.bindEvents();
    this.render();

    // Tu dong ve lai khi font thu phap viet tay Ma Shan Zheng hoan tat tai ve
    if (typeof document !== "undefined" && document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        this.render();
      }).catch(() => {});
    }
  }

  initCanvas() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = rect.width || 320;
    const height = rect.height || 320;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
  }

  bindEvents() {
    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        time: Date.now()
      };
    };

    const startDraw = (e) => {
      e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.currentStroke = [pos];
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      const pos = getPos(e);
      this.currentStroke.push(pos);
      this.render();
    };

    const endDraw = (e) => {
      if (!this.isDrawing) return;
      e.preventDefault();
      this.isDrawing = false;
      if (this.currentStroke.length > 0) {
        this.strokes.push([...this.currentStroke]);
        this.currentStroke = [];
        this.render();
      }
    };

    this.canvas.addEventListener("mousedown", startDraw);
    window.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", endDraw);

    this.canvas.addEventListener("touchstart", startDraw, { passive: false });
    this.canvas.addEventListener("touchmove", draw, { passive: false });
    this.canvas.addEventListener("touchend", endDraw, { passive: false });
  }

  drawGrid() {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Nen giay xuyen chi co dien (Xuan Paper Texture Background)
    ctx.fillStyle = "#fffdfa";
    ctx.fillRect(0, 0, w, h);

    // Khung vien ngoai do son dam phong cach thu phap
    ctx.strokeStyle = "#e7e5e4";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);

    // Duong ke luoi net dut
    ctx.save();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Truc ngang va doc
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Luoi Me tu cach (米字格) co 2 duong cheo
    if (this.gridType === "mi") {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(w, h);
      ctx.moveTo(w, 0);
      ctx.lineTo(0, h);
      ctx.stroke();
    }

    ctx.restore();
  }

  /**
   * Ve mau chu viet tay thu phap mo (Handwritten Calligraphy Brush Font)
   * Uu tien font Khai Thu 'Ma Shan Zheng' va 'KaiTi' net viet tay mem mai, khong dung font in may
   */
  drawGhostChar() {
    if (!this.showGhost || !this.charToPractice) return;
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    ctx.save();
    // Font thu phap viet tay Khai Thu (Calligraphy brush font)
    ctx.font = `${Math.floor(w * 0.74)}px 'Ma Shan Zheng', 'STKaiti', 'KaiTi', 'BiaoKai', 'DFKai-SB', cursive, serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Nét mờ xám nhạt tự nhiên như nét bút lông xuyến chỉ
    ctx.fillStyle = "rgba(148, 140, 133, 0.45)";
    ctx.fillText(this.charToPractice, w / 2, h / 2 + 8);
    ctx.restore();
  }

  /**
   * Mo phong net but long thu phap thanh dam (Dynamic Calligraphy Brush Stroke)
   * Net di chuyen nhanh -> Net thanh; Net di chuyen cham/ti mi -> Net dam day
   */
  drawCalligraphyStroke(points) {
    if (!points || points.length < 2) return;
    const ctx = this.ctx;

    for (let i = 1; i < points.length; i++) {
      const p1 = points[i - 1];
      const p2 = points[i];

      const dist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
      const timeDiff = Math.max(10, p2.time - p1.time);
      const speed = dist / timeDiff;

      // Bien thien do rong net but theo van toc: Toc do cao -> Net thanh (min 3px), Toc do cham -> Net dam (max 10px)
      const currentWidth = Math.max(3, Math.min(10, this.baseInkWidth - speed * 1.5));

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(p1.x, p1.y);
      ctx.lineTo(p2.x, p2.y);
      ctx.strokeStyle = this.inkColor;
      ctx.lineWidth = currentWidth;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.stroke();
      ctx.restore();
    }
  }

  drawStrokes() {
    const allStrokes = [...this.strokes];
    if (this.currentStroke.length > 0) {
      allStrokes.push(this.currentStroke);
    }

    for (const stroke of allStrokes) {
      this.drawCalligraphyStroke(stroke);
    }
  }

  render() {
    this.drawGrid();
    this.drawGhostChar();
    this.drawStrokes();
  }

  clear() {
    this.strokes = [];
    this.currentStroke = [];
    this.render();
  }

  undo() {
    if (this.strokes.length > 0) {
      this.strokes.pop();
      this.render();
    }
  }

  setChar(char) {
    this.charToPractice = char;
    this.clear();
  }

  toggleGhost(enable) {
    this.showGhost = typeof enable === "boolean" ? enable : !this.showGhost;
    this.render();
  }

  toggleGrid() {
    this.gridType = this.gridType === "mi" ? "tian" : "mi";
    this.render();
    return this.gridType;
  }
}
