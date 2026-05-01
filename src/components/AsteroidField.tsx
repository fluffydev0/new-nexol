import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  size: number;
  speed: number;
  opacity: number;
  trail: { x: number; y: number }[];
  angle: number;
  wobble: number;
  wobbleSpeed: number;
  glow: boolean;
}

const AsteroidField = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const animRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = document.documentElement.scrollHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const resizeObserver = new ResizeObserver(() => {
      canvas.height = document.documentElement.scrollHeight;
    });
    resizeObserver.observe(document.body);

    const createParticle = (): Particle => ({
      x: Math.random() * canvas.width,
      y: -Math.random() * 200 - 20,
      size: Math.random() * 2.5 + 0.5,
      speed: Math.random() * 1.5 + 0.3,
      opacity: Math.random() * 0.6 + 0.2,
      trail: [],
      angle: Math.random() * 0.4 - 0.2 + Math.PI / 2,
      wobble: 0,
      wobbleSpeed: Math.random() * 0.02 + 0.005,
      glow: Math.random() > 0.7,
    });

    const PARTICLE_COUNT = 60;
    particlesRef.current = Array.from({ length: PARTICLE_COUNT }, () => {
      const p = createParticle();
      p.y = Math.random() * canvas.height;
      return p;
    });

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (const p of particlesRef.current) {
        p.wobble += p.wobbleSpeed;
        const dx = Math.cos(p.angle + Math.sin(p.wobble) * 0.3) * p.speed;
        const dy = Math.sin(p.angle) * p.speed;
        p.x += dx;
        p.y += dy;

        p.trail.push({ x: p.x, y: p.y });
        if (p.trail.length > 12) p.trail.shift();

        // Draw trail
        if (p.trail.length > 1) {
          for (let i = 1; i < p.trail.length; i++) {
            const t = i / p.trail.length;
            ctx.beginPath();
            ctx.moveTo(p.trail[i - 1].x, p.trail[i - 1].y);
            ctx.lineTo(p.trail[i].x, p.trail[i].y);
            ctx.strokeStyle = `rgba(0, 255, 170, ${t * p.opacity * 0.3})`;
            ctx.lineWidth = p.size * t * 0.5;
            ctx.stroke();
          }
        }

        // Draw glow
        if (p.glow) {
          const gradient = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.size * 6);
          gradient.addColorStop(0, `rgba(0, 255, 170, ${p.opacity * 0.15})`);
          gradient.addColorStop(1, "transparent");
          ctx.fillStyle = gradient;
          ctx.fillRect(p.x - p.size * 6, p.y - p.size * 6, p.size * 12, p.size * 12);
        }

        // Draw particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 255, 230, ${p.opacity})`;
        ctx.fill();

        // Reset if off screen
        if (p.y > canvas.height + 50 || p.x < -50 || p.x > canvas.width + 50) {
          Object.assign(p, createParticle());
        }
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener("resize", resize);
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.7 }}
    />
  );
};

export default AsteroidField;
