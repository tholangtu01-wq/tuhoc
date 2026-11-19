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
    this.penType = options.penType || "ballpoint"; // 'ballpoint' (0.5mm), 'gel' (0.7mm), 'brush' (1.0mm)
    this.baseInkWidth = options.inkWidth || (this.penType === "ballpoint" ? 2.4 : (this.penType === "brush" ? 4.2 : 3.2));
    this.inkColor = options.inkColor || "#18181b"; // Muc viet den / xanh den tu nhien
    
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
    const dpr = (typeof window !== "undefined" && window.devicePixelRatio) || 1;
    let width = Math.round(rect.width || 320);
    let height = Math.round(rect.height || 320);

    // Kiểm tra an toàn kích thước
    if (width < 60) width = 320;
    if (height < 60) height = 320;

    this.canvas.width = Math.floor(width * dpr);
    this.canvas.height = Math.floor(height * dpr);
    if (this.ctx.resetTransform) {
      this.ctx.resetTransform();
    } else if (this.ctx.setTransform) {
      this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
    this.ctx.scale(dpr, dpr);
    this.displayWidth = width;
    this.displayHeight = height;
    this.dpr = dpr;
  }

  bindEvents() {
    this.lastPointerType = "mouse";
    this.lastPenTime = 0;

    const getPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      let clientX = e.clientX;
      let clientY = e.clientY;
      let pressure = 0.5;

      if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
        if (e.touches[0].force !== undefined && e.touches[0].force > 0) {
          pressure = e.touches[0].force;
        }
      } else if (e.pressure !== undefined && e.pressure > 0) {
        pressure = e.pressure;
      }

      return {
        x: clientX - rect.left,
        y: clientY - rect.top,
        pressure,
        pointerType: e.pointerType || (e.touches ? "touch" : "mouse"),
        time: Date.now()
      };
    };

    const startDraw = (e) => {
      // Palm rejection: Nếu đang dùng Apple Pencil trên iPad, bỏ qua chạm vô tình từ cẳng tay
      if (this.lastPointerType === "pen" && e.pointerType === "touch" && Date.now() - this.lastPenTime < 600) {
        return;
      }
      if (e.pointerType === "pen") {
        this.lastPointerType = "pen";
        this.lastPenTime = Date.now();
      }

      if (e.cancelable && e.preventDefault) e.preventDefault();
      this.isDrawing = true;
      const pos = getPos(e);
      this.currentStroke = [pos];
    };

    const draw = (e) => {
      if (!this.isDrawing) return;
      if (e.pointerType === "touch" && this.lastPointerType === "pen" && Date.now() - this.lastPenTime < 600) {
        return;
      }
      if (e.cancelable && e.preventDefault) e.preventDefault();
      const pos = getPos(e);
      this.currentStroke.push(pos);
      this.render();
    };

    const endDraw = (e) => {
      if (!this.isDrawing) return;
      if (e.cancelable && e.preventDefault) e.preventDefault();
      this.isDrawing = false;
      if (this.currentStroke.length > 0) {
        this.strokes.push([...this.currentStroke]);
        this.currentStroke = [];
        this.render();
        // Rung nhẹ xúc giác (Haptic feedback) cho smartphone và iPad
        if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
          try { window.navigator.vibrate(8); } catch (_) {}
        }
      }
    };

    // Pointer Events tối ưu cho Apple Pencil, Stylus, Chuột và Màn hình cảm ứng
    if (typeof window !== "undefined" && window.PointerEvent) {
      this.canvas.addEventListener("pointerdown", (e) => {
        try { this.canvas.setPointerCapture?.(e.pointerId); } catch (_) {}
        startDraw(e);
      });
      this.canvas.addEventListener("pointermove", draw);
      const endPointer = (e) => {
        try { this.canvas.releasePointerCapture?.(e.pointerId); } catch (_) {}
        endDraw(e);
      };
      this.canvas.addEventListener("pointerup", endPointer);
      this.canvas.addEventListener("pointercancel", endPointer);
    } else {
      // Fallback cho trình duyệt cũ
      this.canvas.addEventListener("mousedown", startDraw);
      window.addEventListener("mousemove", draw);
      window.addEventListener("mouseup", endDraw);

      this.canvas.addEventListener("touchstart", startDraw, { passive: false });
      this.canvas.addEventListener("touchmove", draw, { passive: false });
      this.canvas.addEventListener("touchend", endDraw, { passive: false });
    }

    // Tự động căn chỉnh độ phân giải khi xoay màn hình iPad / Điện thoại
    if (typeof window !== "undefined" && window.addEventListener) {
      window.addEventListener("resize", () => {
        clearTimeout(this.resizeTimer);
        this.resizeTimer = setTimeout(() => this.handleResize(), 150);
      });
      window.addEventListener("orientationchange", () => {
        setTimeout(() => this.handleResize(), 250);
      });
    }
  }

  handleResize() {
    const oldW = this.displayWidth;
    const oldH = this.displayHeight;
    this.initCanvas();
    const newW = this.displayWidth;
    const newH = this.displayHeight;

    if (oldW > 0 && oldH > 0 && (oldW !== newW || oldH !== newH)) {
      const scaleX = newW / oldW;
      const scaleY = newH / oldH;
      for (const stroke of this.strokes) {
        for (const pt of stroke) {
          pt.x *= scaleX;
          pt.y *= scaleY;
        }
      }
    }
    this.render();
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
   * Thay doi loai ngoi but viet (But bi thanh 0.5mm, But gel 0.7mm, But long nho 1.0mm)
   */
  setPenType(type) {
    this.penType = type || "ballpoint";
    if (this.penType === "ballpoint") {
      this.baseInkWidth = 2.4;
    } else if (this.penType === "brush") {
      this.baseInkWidth = 4.2;
    } else {
      this.baseInkWidth = 3.2; // gel
    }
  }

  /**
   * Ve mau chu viet tay thon gon, thanh manh mo (Mo phong vo tap viet hoc sinh)
   * Uu tien font Noto Sans SC (300), FangSong, KaiTi thanh thoat, khong dung font net dam to
   */
  drawGhostChar() {
    if (!this.showGhost || !this.charToPractice) return;
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;

    ctx.save();
    // Font viet tay thon gon, thanh manh chuan nhu vo o ly tap viet hoc sinh
    ctx.font = `300 ${Math.floor(w * 0.70)}px 'Noto Sans SC', 'FangSong', 'STFangsong', 'KaiTi', 'STKaiti', 'Microsoft YaHei', sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    
    // Net mo xam nhat thon gon, tinh te
    ctx.fillStyle = "rgba(140, 140, 140, 0.28)";
    ctx.fillText(this.charToPractice, w / 2, h / 2 + 6);
    ctx.restore();
  }

  /**
   * Mo phong net but bi / but gel viet tay thon gon tren vo tap sach
   * Net thanh manh, deu va sac net nhu hoc sinh viet vao tap moi ngay
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

      // Áp lực ngòi bút cảm ứng (Hỗ trợ nhạy cảm lực nhấn Apple Pencil trên iPad & bút Stylus)
      let pressureFactor = 1.0;
      if (p2.pressure !== undefined && p2.pressure > 0) {
        // Áp lực bình thường ~0.5. Scale từ 0.75x (chạm nhẹ) đến 1.35x (nhấn mạnh)
        pressureFactor = 0.75 + p2.pressure * 0.6;
      }

      // Do rong net but thon gon mo phong viet vo tap sach hang ngay
      let currentWidth;
      if (this.penType === "ballpoint") {
        // But bi thanh 0.5mm: Net thanh deu, sac sao (1.9px - 2.8px)
        currentWidth = Math.max(1.9, Math.min(2.8, (2.3 - speed * 0.15) * pressureFactor));
      } else if (this.penType === "brush") {
        // But long nho 1.0mm: 3.0px - 5.5px
        currentWidth = Math.max(2.8, Math.min(5.5, (3.8 - speed * 0.7) * pressureFactor));
      } else {
        // But gel / But muc 0.7mm: Net thon gon, co do nhan nhe tu nhien (2.3px - 3.8px)
        currentWidth = Math.max(2.3, Math.min(3.8, (3.1 - speed * 0.35) * pressureFactor));
      }

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

  /**
   * Phát hoạt họa minh họa nét mẫu chữ Hán (Flash animation chuẩn)
   */
  playStrokeAnimation(onComplete) {
    if (!this.charToPractice) return;
    const ctx = this.ctx;
    const w = this.displayWidth;
    const h = this.displayHeight;
    let step = 0;
    const totalSteps = 12;
    const prevShowGhost = this.showGhost;
    this.showGhost = true;

    const animInterval = setInterval(() => {
      step++;
      this.drawGrid();
      
      // Vẽ chữ nhấp nháy phát sáng theo sắc đỏ chu sa thư pháp
      const alpha = 0.2 + 0.6 * Math.sin((step / totalSteps) * Math.PI);
      ctx.save();
      ctx.font = `300 ${Math.floor(w * 0.70)}px 'Noto Sans SC', 'FangSong', 'KaiTi', sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = `rgba(197, 43, 31, ${alpha.toFixed(2)})`;
      ctx.fillText(this.charToPractice, w / 2, h / 2 + 6);
      ctx.restore();

      // Vẽ lại các nét người dùng đã viết
      for (const stroke of this.strokes) {
        this.drawCalligraphyStroke(stroke);
      }

      if (step >= totalSteps) {
        clearInterval(animInterval);
        this.showGhost = prevShowGhost;
        this.render();
        if (typeof onComplete === "function") onComplete();
      }
    }, 60);
  }
}
