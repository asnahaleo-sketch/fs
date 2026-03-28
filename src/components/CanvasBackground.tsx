import { useEffect, useRef } from 'react';

class Dot {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  baseX: number;
  baseY: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.vx = (Math.random() - 0.5) * 0.3;
    this.vy = (Math.random() - 0.5) * 0.3;
    this.radius = Math.random() > 0.7 ? 2.5 : 1.5;
  }

  update(width: number, height: number, isSingularity: boolean) {
    if (isSingularity) return;
    this.baseX += this.vx;
    this.baseY += this.vy;

    if (this.baseX < 0 || this.baseX > width) this.vx *= -1;
    if (this.baseY < 0 || this.baseY > height) this.vy *= -1;
  }

  applyInteraction(mouseX: number, mouseY: number, isMousePresent: boolean, isSingularity: boolean, width: number, height: number) {
    if (isSingularity) {
      const centerX = width / 2;
      const centerY = height / 2;
      const dx = centerX - this.x;
      const dy = centerY - this.y;
      
      this.x += dx * 0.15;
      this.y += dy * 0.15;
      
      this.radius *= 0.90;
      return;
    }

    if (isMousePresent) {
      const dx = mouseX - this.baseX;
      const dy = mouseY - this.baseY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      // Smooth ease-in-out cluster target
      if (distance < 150) {
        const force = Math.pow((150 - distance) / 150, 2); 
        const targetX = this.baseX + dx * force * 0.8;
        const targetY = this.baseY + dy * force * 0.8;

        this.x += (targetX - this.x) * 0.1;
        this.y += (targetY - this.y) * 0.1;
        return;
      }
    }
    
    this.x += (this.baseX - this.x) * 0.05;
    this.y += (this.baseY - this.y) * 0.05;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.radius < 0.1) return;
    ctx.shadowBlur = this.radius > 1.8 ? 8 : 3;
    ctx.shadowColor = 'rgba(200, 220, 255, 0.7)';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}

export default function CanvasBackground({ triggerSingularity }: { triggerSingularity: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let dots: Dot[] = [];
    const DOT_COUNT = 180;

    let mouseParams = { x: 0, y: 0, isPresent: false };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initDots();
    };

    const initDots = () => {
      dots = [];
      for (let i = 0; i < DOT_COUNT; i++) {
        dots.push(new Dot(Math.random() * canvas.width, Math.random() * canvas.height));
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseParams.x = e.clientX;
      mouseParams.y = e.clientY;
      mouseParams.isPresent = true;
    };

    const handleMouseLeave = () => {
      mouseParams.isPresent = false;
    };

    window.addEventListener('resize', resizeCanvas);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    resizeCanvas();

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < dots.length; i++) {
        dots[i].update(canvas.width, canvas.height, triggerSingularity);
        dots[i].applyInteraction(mouseParams.x, mouseParams.y, mouseParams.isPresent, triggerSingularity, canvas.width, canvas.height);
      }

      for (let i = 0; i < dots.length; i++) {
        dots[i].draw(ctx);
        if (triggerSingularity) continue;

        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < 14400) { // 120px connection radius
            const dist = Math.sqrt(distSq);
            const alpha = 0.35 * (1 - dist / 120);
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.lineWidth = 1.2;
            ctx.strokeStyle = `rgba(180, 210, 255, ${alpha})`;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, [triggerSingularity]);

  return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true" />;
}
