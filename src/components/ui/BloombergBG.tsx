"use client";
import { useEffect, useRef } from "react";

export default function BloombergBG() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const parent = c.parentElement!;
    let w = parent.offsetWidth, h = parent.offsetHeight;
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    let t = 0, raf: number;

    const nodes = Array.from({ length: 14 }, () => ({
      x: Math.random() * w, y: Math.random() * h,
      vx: (Math.random() - .5) * .18, vy: (Math.random() - .5) * .18,
      pulse: Math.random() * Math.PI * 2,
    }));

    const draw = () => {
      t += 0.007;
      ctx.clearRect(0, 0, w, h);

      // base
      ctx.fillStyle = "#010810";
      ctx.fillRect(0, 0, w, h);

      // vignette
      const vig = ctx.createRadialGradient(w*.5,h*.5,0,w*.5,h*.5,Math.max(w,h)*.75);
      vig.addColorStop(0, "rgba(0,20,42,0)");
      vig.addColorStop(1, "rgba(0,0,8,.75)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, w, h);

      // grid
      const gs = 46;
      for (let x = 0; x < w; x += gs) {
        ctx.strokeStyle = `rgba(0,220,255,${.035 + Math.sin(x*.018+t*.4)*.015})`;
        ctx.lineWidth = .35;
        ctx.beginPath(); ctx.moveTo(x,0); ctx.lineTo(x,h); ctx.stroke();
      }
      for (let y = 0; y < h; y += gs) {
        ctx.strokeStyle = `rgba(0,200,255,${.035 + Math.sin(y*.018+t*.3)*.015})`;
        ctx.lineWidth = .35;
        ctx.beginPath(); ctx.moveTo(0,y); ctx.lineTo(w,y); ctx.stroke();
      }

      // scan line
      const sy = ((t * 28) % (h + 40)) - 20;
      const sg = ctx.createLinearGradient(0, sy-3, 0, sy+3);
      sg.addColorStop(0,"rgba(0,220,255,0)");
      sg.addColorStop(.5,"rgba(0,220,255,0.055)");
      sg.addColorStop(1,"rgba(0,220,255,0)");
      ctx.fillStyle = sg; ctx.fillRect(0, sy-3, w, 6);

      // diagonal beams
      [[0,0,w,h],[w*.35,0,w,h*.65],[0,h*.3,w*.7,h]].forEach(([x1,y1,x2,y2],i) => {
        const bg = ctx.createLinearGradient(x1,y1,x2,y2);
        const a = .045 + Math.sin(t + i)*.02;
        bg.addColorStop(0,"rgba(0,180,255,0)");
        bg.addColorStop(.5,`rgba(0,180,255,${a})`);
        bg.addColorStop(1,"rgba(0,180,255,0)");
        ctx.strokeStyle = bg; ctx.lineWidth = .9;
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      });

      // nodes
      nodes.forEach(n => {
        n.x += n.vx; n.y += n.vy; n.pulse += 0.025;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const glow = ctx.createRadialGradient(n.x,n.y,0,n.x,n.y,22+Math.sin(n.pulse)*6);
        glow.addColorStop(0,`rgba(0,220,255,${.28+Math.sin(n.pulse)*.12})`);
        glow.addColorStop(1,"rgba(0,220,255,0)");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(n.x,n.y,22,0,Math.PI*2); ctx.fill();
        ctx.fillStyle = `rgba(200,245,255,${.65+Math.sin(n.pulse)*.3})`;
        ctx.beginPath(); ctx.arc(n.x,n.y,1.5,0,Math.PI*2); ctx.fill();
      });

      // connections
      nodes.forEach((n,i) => nodes.slice(i+1).forEach(m => {
        const d = Math.hypot(n.x-m.x, n.y-m.y);
        if (d < 150) {
          ctx.strokeStyle = `rgba(0,180,255,${(1-d/150)*.075})`;
          ctx.lineWidth = .5;
          ctx.beginPath(); ctx.moveTo(n.x,n.y); ctx.lineTo(m.x,m.y); ctx.stroke();
        }
      }));

      // HUD brackets
      const corners: [number,number][] = [[2,2],[w-62,2],[2,h-42],[w-62,h-42]];
      corners.forEach(([cx,cy]) => {
        ctx.strokeStyle = `rgba(0,220,255,${.14+Math.sin(t)*.04})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx,cy+13); ctx.lineTo(cx,cy); ctx.lineTo(cx+13,cy);
        ctx.moveTo(cx+47,cy); ctx.lineTo(cx+60,cy); ctx.lineTo(cx+60,cy+13);
        ctx.moveTo(cx,cy+27); ctx.lineTo(cx,cy+40); ctx.lineTo(cx+13,cy+40);
        ctx.moveTo(cx+47,cy+40); ctx.lineTo(cx+60,cy+40); ctx.lineTo(cx+60,cy+27);
        ctx.stroke();
      });

      raf = requestAnimationFrame(draw);
    };
    draw();

    const ro = new ResizeObserver(() => {
      w = parent.offsetWidth; h = parent.offsetHeight;
      c.width = w; c.height = h;
    });
    ro.observe(parent);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, []);

  return (
    <canvas
      ref={ref}
      style={{ position:"fixed", inset:0, zIndex:0, pointerEvents:"none" }}
    />
  );
}
