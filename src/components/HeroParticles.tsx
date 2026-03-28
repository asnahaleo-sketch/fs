import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  radius: number;
}

const PARTICLE_COUNT = 90;
const CONNECTION_RADIUS = 160;
const ATTRACT_RADIUS  = 180;
const LINE_OPACITY    = 0.25;

export default function HeroParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId: number;
    let particles: Particle[] = [];
    let mouse = { x: -9999, y: -9999, active: false };

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      canvas.width  = rect.width;
      canvas.height = rect.height;
      init();
    };

    const init = () => {
      particles = Array.from({ length: PARTICLE_COUNT }, () => {
        const x = Math.random() * canvas.width;
        const y = Math.random() * canvas.height;
        return {
          x, y,
          baseX: x,
          baseY: y,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          // Vary sizes so some are tiny background stars and some are clear spheres
          radius: Math.random() > 0.6 ? Math.random() * 3 + 2.5 : Math.random() * 1.5 + 0.8,
        };
      });
    };

    const drawSphere = (x: number, y: number, r: number, alpha: number) => {
      // Radial gradient gives spherical 3D illusion
      const g = ctx.createRadialGradient(
        x - r * 0.35, y - r * 0.35, r * 0.05,
        x, y, r
      );
      g.addColorStop(0,   `rgba(255, 255, 255, ${alpha})`);
      g.addColorStop(0.4, `rgba(210, 225, 255, ${alpha * 0.80})`);
      g.addColorStop(1,   `rgba(100, 150, 255, 0)`);

      // Soft glow
      ctx.shadowBlur  = r > 2.5 ? 10 : 4;
      ctx.shadowColor = r > 2.5
        ? 'rgba(180, 210, 255, 0.55)'
        : 'rgba(150, 180, 255, 0.25)';

      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fillStyle = g;
      ctx.fill();
    };

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particles) {
        // Drift
        p.baseX += p.vx;
        p.baseY += p.vy;
        if (p.baseX < 0 || p.baseX > canvas.width)  p.vx *= -1;
        if (p.baseY < 0 || p.baseY > canvas.height) p.vy *= -1;

        // Magnetic pull toward cursor
        if (mouse.active) {
          const dx   = mouse.x - p.baseX;
          const dy   = mouse.y - p.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < ATTRACT_RADIUS) {
            const force = (1 - dist / ATTRACT_RADIUS) * 0.065;
            p.x += (p.baseX + dx * force * 9 - p.x) * 0.12;
            p.y += (p.baseY + dy * force * 9 - p.y) * 0.12;
          } else {
            p.x += (p.baseX - p.x) * 0.08;
            p.y += (p.baseY - p.y) * 0.08;
          }
        } else {
          p.x += (p.baseX - p.x) * 0.08;
          p.y += (p.baseY - p.y) * 0.08;
        }
      }

      // Draw Plexus connection lines first
      ctx.shadowBlur = 0;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx   = particles[i].x - particles[j].x;
          const dy   = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_RADIUS) {
            const a = LINE_OPACITY * (1 - dist / CONNECTION_RADIUS);
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.lineWidth   = 0.8;
            ctx.strokeStyle = `rgba(180, 210, 255, ${a})`;
            ctx.stroke();
          }
        }
      }

      // Draw spherical nodes on top
      for (const p of particles) {
        const alpha = p.radius > 2 ? 0.85 : 0.45;
        ctx.globalAlpha = alpha;
        drawSphere(p.x, p.y, p.radius, 1);
      }

      ctx.globalAlpha = 1;
      ctx.shadowBlur  = 0;

      rafId = requestAnimationFrame(draw);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect  = canvas.getBoundingClientRect();
      mouse.x     = e.clientX - rect.left;
      mouse.y     = e.clientY - rect.top;
      mouse.active = true;
    };
    const onMouseLeave = () => { mouse.active = false; };

    window.addEventListener('resize', resize);
    canvas.addEventListener('mousemove',  onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    resize();
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove',  onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      aria-hidden="true"
    />
  );
}
