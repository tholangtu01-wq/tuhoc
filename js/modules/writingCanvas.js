/**
 * Interactive Hanzi Writing & Calligraphy Canvas
 * Bảng luyện viết chữ Hán tương tác với lưới Mễ tự cách (米字格) và bút thuận
 */

export class HanziWritingCanvas {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext("2d");
    this.charToPractice = options.char || "研";
    this.showGhost = options.showGhost !== false;
    this.gridType = options.gridType || "mi"; // 'mi' (Mễ tự cách) hoặc 'tian' (Điền tự cách)
    this.inkColor = options.inkColor || "#1e293b";
    this.inkWidth = options.inkWidth || 6;
    
    this.strokes = []; // Lưu các nét vẽ để undo
    this.currentStroke = [];
    this.isDrawing = false;

    this.initCanvas();
    this.bindEvents();
    this.render();
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
        y: clientY - rect.top
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

    // Chuột
    this.canvas.addEventListener("mousedown", startDraw);
    window.addEventListener("mousemove", draw);
    window.addEventListener("mouseup", endDraw);

    // Cảm ứng điện thoại / iPad
    this.canvas.addEventListener("touchstart", startDraw, { passive: false });
    this.canvas.addEventListener("touchmove", draw, { passive: false });
    this.canvas.addEventListener("touchend", endDraw, { passive: false });
  }

  drawGrid() {
    const w = this.displayWidth;
    const h = this.displayHeight;
    const ctx = this.ctx;

    ctx.clearRect(0, 0, w, h);

    // Nền giấy xuyến chỉ nhẹ
    ctx.fillStyle = "#fffcf7";
    ctx.fillRect(0, 0, w, h);

    // Khung viền ngoài
    ctx.strokeStyle = "#e2e8f0";
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, w, h);

    // Đường kẻ lưới nét đứt
    ctx.save();
    ctx.strokeStyle = "#cbd5e1";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);

    // Trục ngang và dọc
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.moveTo(w / 2, 0);
    ctx.lineTo(w / 2, h);
    ctx.stroke();

    // Nếu là lưới Mễ tự cách (米字格) -> vẽ thêm 2 đường chéo
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

  drawGhostChar() {
    if (!this.showGhost || !this.charToPractice) return;
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    ctx.save();
    ctx.font = `bold ${Math.floor(w * 0.75)}px 'KaiTi', 'STKaiti', 'SimSun', 'PingFang SC', serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(226, 232, 240, 0.75)"; // Nét mờ xám nhạt để tô theo
    ctx.fillText(this.charToPractice, w / 2, h / 2 + 10);
    ctx.restore();
  }

  drawStrokes() {
    const ctx = this.ctx;
    ctx.save();
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = this.inkColor;
    ctx.lineWidth = this.inkWidth;

    const allStrokes = [...this.strokes];
    if (this.currentStroke.length > 0) {
      allStrokes.push(this.currentStroke);
    }

    for (const stroke of allStrokes) {
      if (stroke.length < 2) continue;
      ctx.beginPath();
      ctx.moveTo(stroke[0].x, stroke[0].y);
      for (let i = 1; i < stroke.length; i++) {
        ctx.lineTo(stroke[i].x, stroke[i].y);
      }
      ctx.stroke();
    }

    ctx.restore();
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

  setInkColor(color) {
    this.inkColor = color;
    this.render();
  }
}
