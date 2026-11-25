// How each quest fighter looks on top of the stickman body. The engine calls this twice per frame:
// behind the limbs ("back") and in front ("front"), like the Story bosses' designs.
// Hexizon: a pitch black stickman with a neon green outline, one glowing green eye, one black-green flare
// for the other eye, and a large bone carried like a monk's staff.
// Parallax: a body of deep space with glowing seams, a visor slit, and wireframe cubes of folded space orbiting him.
// Halflife: a heavy body cracked with green light, a reactor core turning in his chest and radiation drifting off him.
// Redline: red and gold, goggles, hair whipping back, chevrons on the chest and afterimages that trail him the faster he runs.
// Liminal: a great ring door behind its shoulders, a small door at each hand, orbiting bits of matter and a keyhole for a face.
// Overtone: headphones, an equalizer for a face, a speaker cone thumping in his chest and rings of sound pulsing off him on the beat.
// Vellum: a paper body with fold creases, a red ink seal on the brow, a long scroll trailing from the shoulders and origami cranes circling.
import type { Power } from "./fighters";
import { drawCrane } from "./move-looks";
import type { BossRig } from "./boss-designs";

type Pt = { x: number; y: number };
const TAU = Math.PI * 2;
const HEAD = 11;

/** What the quest fighter is doing this frame, so the staff can follow the move. */
export type QuestAct = { id: string; kind: string; phase: "wind" | "strike" | "after"; u: number };
/** The colours to draw in: its own, or its Nightmare Mode's. */
export type QuestPaint = { glow: string; a: string; b: string; nightmare: boolean };

const al = (c: string, a: number) => c.replace(")", ` / ${Math.max(0, Math.min(1, a))})`);

function strokePath(ctx: CanvasRenderingContext2D, pts: Pt[]) {
  ctx.beginPath();
  pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
  ctx.stroke();
}

function glowDot(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c: string, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, al(c, a));
  g.addColorStop(1, al(c, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

/** Every limb, the torso and the head as one silhouette stroke, for outlines and rims. */
function silhouette(ctx: CanvasRenderingContext2D, r: BossRig, s: number, w: number, c: string) {
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const pts of [[r.hip, r.kB, r.fB], [r.shoulder, r.eB, r.hB], [r.hip, r.neck], [r.hip, r.kF, r.fF], [r.shoulder, r.eF, r.hF]]) strokePath(ctx, pts);
  ctx.beginPath();
  ctx.arc(r.head.x, r.head.y, HEAD * s + w / 2 - 1.5 * s, 0, TAU);
  ctx.stroke();
}

// ---------- Hexizon ----------

/** The bone staff: a long bone through both hands, knuckled at each end. Spins on a staff strike. */
function boneStaff(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, act: QuestAct | undefined, p: QuestPaint) {
  let ang = Math.atan2(r.hF.y - r.hB.y, r.hF.x - r.hB.x);
  if (Math.hypot(r.hF.x - r.hB.x, r.hF.y - r.hB.y) < 8 * s) ang = Math.atan2(r.hF.y - r.eF.y, r.hF.x - r.eF.x);
  let cx = r.hF.x, cy = r.hF.y;
  if (act && act.id === "bone-staff" && act.phase !== "wind") {
    // twirled overhead and brought round in a full turn
    ang += face * (act.phase === "strike" ? act.u * TAU * 1.5 : 0);
  } else if (act && (act.kind === "beam" || act.kind === "projectile")) {
    // levelled at the target like a pointer
    ang = face > 0 ? -0.15 : Math.PI + 0.15;
  } else if (!act) {
    ang += Math.sin(t * 2.2) * 0.04;
  }
  const L = 58 * s, k = 0.38;
  const x0 = cx - Math.cos(ang) * L * (1 - k) * 1.4, y0 = cy - Math.sin(ang) * L * (1 - k) * 1.4;
  const x1 = cx + Math.cos(ang) * L * (1 + k) * 0.7, y1 = cy + Math.sin(ang) * L * (1 + k) * 0.7;
  ctx.save();
  // neon rim behind
  ctx.lineCap = "round";
  ctx.strokeStyle = al(p.glow, 0.55);
  ctx.lineWidth = 10 * s;
  strokePath(ctx, [{ x: x0, y: y0 }, { x: x1, y: y1 }]);
  ctx.strokeStyle = "hsl(45 30% 90%)";
  ctx.lineWidth = 5.5 * s;
  strokePath(ctx, [{ x: x0, y: y0 }, { x: x1, y: y1 }]);
  // the knuckles at each end: two round lobes across the shaft
  const nx = -Math.sin(ang), ny = Math.cos(ang);
  for (const [ex, ey] of [[x0, y0], [x1, y1]] as const) {
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(ex + nx * sd * 4.2 * s, ey + ny * sd * 4.2 * s, 4.6 * s, 0, TAU);
      ctx.fillStyle = "hsl(45 30% 90%)";
      ctx.fill();
      ctx.strokeStyle = "hsl(150 30% 6%)";
      ctx.lineWidth = 1.6 * s;
      ctx.stroke();
    }
  }
  // a smear of green while it spins
  if (act && act.id === "bone-staff" && act.phase === "strike") {
    ctx.globalCompositeOperation = "lighter";
    ctx.strokeStyle = al(p.glow, 0.5 * (1 - act.u));
    ctx.lineWidth = 6 * s;
    ctx.beginPath();
    ctx.arc(cx, cy, L * 0.95, ang - face * 1.6, ang, face < 0);
    ctx.stroke();
  }
  ctx.restore();
}

function hexizonBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // a soft neon haze, then a crisp outline the black body is drawn over
  silhouette(ctx, r, s, 18 * s, al(p.glow, alive ? 0.16 + 0.05 * Math.sin(t * 5) : 0.06));
  ctx.globalCompositeOperation = "source-over";
  silhouette(ctx, r, s, 13 * s, alive ? p.glow : al(p.glow, 0.45));
  if (p.nightmare && alive) {
    // glitching red copy jumping off the body
    const j = Math.floor(t * 14) % 5 === 0 ? (Math.sin(t * 91) * 6) * s : 0;
    if (j) {
      ctx.save();
      ctx.translate(j, 0);
      silhouette(ctx, r, s, 9 * s, al(p.b, 0.6));
      ctx.restore();
    }
  }
  ctx.restore();
}

function hexizonFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  boneStaff(ctx, r, s, face, t, act, p);
  if (!alive) return;
  const h = r.head;
  // the glowing green eye, toward the front of the face
  const ex = h.x + face * 5.2 * s, ey = h.y - 1.5 * s;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  glowDot(ctx, ex, ey, 9 * s, p.nightmare ? p.b : p.glow, 0.85);
  ctx.globalCompositeOperation = "source-over";
  ctx.fillStyle = "white";
  ctx.beginPath();
  ctx.arc(ex, ey, 2.4 * s, 0, TAU);
  ctx.fill();
  // the other eye: a black flame with a green rim, licking up off the head
  const fx = h.x - face * 1.5 * s, fy = h.y - 2 * s;
  const fl = Math.sin(t * 17) * 2.2 * s;
  for (const [w, c] of [[5.4, p.glow], [3.4, "hsl(150 40% 3%)"]] as const) {
    ctx.beginPath();
    ctx.moveTo(fx - w * s, fy + 2 * s);
    ctx.quadraticCurveTo(fx - w * 0.8 * s, fy - 6 * s, fx - face * 3 * s + fl, fy - (12 + w) * s);
    ctx.quadraticCurveTo(fx + w * 0.9 * s, fy - 5 * s, fx + w * s, fy + 2 * s);
    ctx.quadraticCurveTo(fx, fy + 5 * s, fx - w * s, fy + 2 * s);
    ctx.fillStyle = c;
    ctx.fill();
  }
  ctx.globalCompositeOperation = "lighter";
  glowDot(ctx, fx, fy - 4 * s, 7 * s, p.glow, 0.35);
  ctx.restore();
}

// ---------- Parallax ----------

/** A wireframe cube turning in 3D, drawn flat. */
function wireCube(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, rx: number, ry: number, c: string, w: number) {
  const pts: Pt[] = [];
  for (const [a, b, d] of [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]) {
    // rotate round y, then x
    const x1 = a * Math.cos(ry) - d * Math.sin(ry), z1 = a * Math.sin(ry) + d * Math.cos(ry);
    const y1 = b * Math.cos(rx) - z1 * Math.sin(rx);
    pts.push({ x: x + x1 * size, y: y + y1 * size });
  }
  ctx.strokeStyle = c;
  ctx.lineWidth = w;
  ctx.beginPath();
  for (const [i, j] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) {
    ctx.moveTo(pts[i].x, pts[i].y);
    ctx.lineTo(pts[j].x, pts[j].y);
  }
  ctx.stroke();
}

function parallaxBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  if (!alive) return;
  const cx = (r.hip.x + r.head.x) / 2, cy = (r.hip.y + r.head.y) / 2;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // a pane of bent space behind him: a warped grid that ripples harder while he casts
  const k = act ? (act.phase === "strike" ? 1 : 0.5) : 0.25;
  ctx.strokeStyle = al(p.glow, 0.12 + 0.12 * k);
  ctx.lineWidth = 1.2 * s;
  for (let i = -3; i <= 3; i++) {
    ctx.beginPath();
    for (let j = -4; j <= 4; j++) {
      const yy = cy + j * 13 * s;
      const xx = cx + i * 13 * s + Math.sin(t * 3 + j * 0.8 + i) * 3 * s * k;
      j === -4 ? ctx.moveTo(xx, yy) : ctx.lineTo(xx, yy);
    }
    ctx.stroke();
  }
  // three cubes of folded space orbiting him, the far ones behind the body
  for (let i = 0; i < 3; i++) {
    const a = t * 1.3 + (i * TAU) / 3;
    if (Math.sin(a) > 0) continue;
    wireCube(ctx, cx + Math.cos(a) * 44 * s, cy - 20 * s + Math.sin(a * 2) * 10 * s, (6 + i * 1.5) * s, t * 1.7 + i, t * 2.1 + i, al(i === 1 ? p.b : p.glow, 0.8), 1.6 * s);
  }
  ctx.restore();
}

function parallaxFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  // glowing seams down the middle of every limb: the body is a window onto open space
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.strokeStyle = al(p.glow, alive ? 0.7 : 0.25);
  ctx.lineWidth = 1.6 * s;
  for (const pts of [[r.hip, r.kF, r.fF], [r.shoulder, r.eF, r.hF], [r.hip, r.neck]]) strokePath(ctx, pts);
  // stars inside the head
  for (let i = 0; i < 5; i++) {
    const a = i * 2.4 + 0.6, d = (3 + (i % 3) * 2.4) * s;
    const tw = 0.4 + 0.6 * Math.abs(Math.sin(t * 3 + i * 1.7));
    ctx.fillStyle = al(i % 2 ? p.b : "hsl(0 0% 100%)", tw * (alive ? 1 : 0.4));
    ctx.fillRect(r.head.x + Math.cos(a) * d - face * 2 * s, r.head.y + Math.sin(a) * d, 1.6 * s, 1.6 * s);
  }
  if (alive) {
    // the visor: a bright slit across the front of the face
    const ex = r.head.x + face * 4 * s, ey = r.head.y - 1.5 * s;
    ctx.strokeStyle = p.b;
    ctx.lineWidth = 2.6 * s;
    ctx.beginPath();
    ctx.moveTo(ex - face * 4 * s, ey);
    ctx.lineTo(ex + face * 6 * s, ey - 0.6 * s);
    ctx.stroke();
    glowDot(ctx, ex + face * 2 * s, ey, 9 * s, p.b, 0.6);
    // the near cubes, in front of the body
    const cx = (r.hip.x + r.head.x) / 2, cy = (r.hip.y + r.head.y) / 2;
    for (let i = 0; i < 3; i++) {
      const a = t * 1.3 + (i * TAU) / 3;
      if (Math.sin(a) <= 0) continue;
      wireCube(ctx, cx + Math.cos(a) * 44 * s, cy - 20 * s + Math.sin(a * 2) * 10 * s, (6 + i * 1.5) * s, t * 1.7 + i, t * 2.1 + i, i === 1 ? p.b : p.glow, 1.8 * s);
    }
    // a crack in space at the front hand
    if (p.nightmare || Math.sin(t * 2) > 0.3) {
      ctx.strokeStyle = al(p.b, 0.8);
      ctx.lineWidth = 1.4 * s;
      ctx.beginPath();
      ctx.moveTo(r.hF.x - 6 * s, r.hF.y - 8 * s);
      ctx.lineTo(r.hF.x - 1 * s, r.hF.y - 2 * s);
      ctx.lineTo(r.hF.x + 3 * s, r.hF.y - 5 * s);
      ctx.lineTo(r.hF.x + 7 * s, r.hF.y + 4 * s);
      ctx.stroke();
    }
  }
  ctx.restore();
}

// ---------- Halflife ----------

/** A jagged glowing crack along one bone of the body. */
function crack(ctx: CanvasRenderingContext2D, a: Pt, b: Pt, s: number, seed: number) {
  const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
  const nx = -dy / len, ny = dx / len;
  ctx.beginPath();
  ctx.moveTo(a.x, a.y);
  for (let i = 1; i < 4; i++) {
    const k = i / 4, o = Math.sin(seed * 7.3 + i * 2.1) * 2.6 * s;
    ctx.lineTo(a.x + dx * k + nx * o, a.y + dy * k + ny * o);
  }
  ctx.lineTo(b.x, b.y);
  ctx.stroke();
}

function halflifeBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // a heavy radioactive haze around the whole body, pulsing like a heartbeat and flaring while he charges
  const beat = Math.pow(Math.max(0, Math.sin(t * 3.2)), 6);
  const charge = act ? (act.phase === "wind" ? act.u : act.phase === "strike" ? 1 - act.u * 0.5 : 0.3) : 0;
  silhouette(ctx, r, s, (20 + beat * 6 + charge * 8) * s, al(p.glow, alive ? 0.12 + beat * 0.08 + charge * 0.12 : 0.04));
  if (alive) {
    // motes of radiation drifting up off his shoulders
    for (let i = 0; i < 7; i++) {
      const life = (t * 0.7 + i / 7) % 1;
      const x = r.shoulder.x + Math.sin(i * 3.7 + t) * 18 * s;
      const y = r.shoulder.y - life * 70 * s;
      glowDot(ctx, x, y, (3 + (i % 3)) * s, i % 2 ? p.b : p.glow, 0.7 * (1 - life));
    }
  }
  ctx.restore();
}

function halflifeFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // cracks in his skin with the reactor showing through
  const flick = 0.65 + 0.35 * Math.sin(t * 11);
  ctx.strokeStyle = al(p.glow, alive ? flick : 0.2);
  ctx.lineWidth = 1.8 * s;
  [[r.hip, r.neck], [r.shoulder, r.eF], [r.eF, r.hF], [r.hip, r.kF], [r.kF, r.fF]].forEach(([a, b], i) => crack(ctx, a, b, s, i + 1));
  // the core in his chest: a bright disc with three blades turning round it
  const cx = r.shoulder.x * 0.6 + r.hip.x * 0.4 + face * 2 * s, cy = r.shoulder.y * 0.6 + r.hip.y * 0.4;
  if (alive) {
    glowDot(ctx, cx, cy, 16 * s, p.glow, 0.75);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = "hsl(90 40% 4%)";
    ctx.beginPath(); ctx.arc(cx, cy, 6.2 * s, 0, TAU); ctx.fill();
    ctx.fillStyle = p.nightmare ? p.b : "hsl(70 100% 72%)";
    const spin = t * 1.6;
    for (let i = 0; i < 3; i++) {
      const a0 = spin + (i * TAU) / 3;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.arc(cx, cy, 5.6 * s, a0, a0 + 0.9);
      ctx.closePath();
      ctx.fill();
    }
    ctx.beginPath(); ctx.arc(cx, cy, 1.4 * s, 0, TAU); ctx.fill();
    // two hot slits for eyes
    ctx.globalCompositeOperation = "lighter";
    const ex = r.head.x + face * 4 * s, ey = r.head.y - 1.5 * s;
    ctx.strokeStyle = p.nightmare ? p.b : "hsl(70 100% 80%)";
    ctx.lineWidth = 2.2 * s;
    for (const o of [-2.2, 3]) {
      ctx.beginPath();
      ctx.moveTo(ex + face * (o - 1.4) * s, ey - 0.6 * s);
      ctx.lineTo(ex + face * (o + 1.4) * s, ey + 0.4 * s);
      ctx.stroke();
    }
    glowDot(ctx, ex, ey, 8 * s, p.glow, 0.5);
  }
  ctx.restore();
}

// ---------- Redline ----------

function redlineBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint, vx: number) {
  if (!alive) return;
  ctx.save();
  // afterimages left behind him: more and further apart the faster he goes, always a faint one at rest
  const fast = Math.min(1, Math.abs(vx) / 260) + (act && (act.kind === "dash" || act.kind === "blink") && act.phase === "strike" ? 0.8 : 0);
  const back = vx !== 0 ? -Math.sign(vx) : -face;
  const n = 1 + Math.round(fast * 3);
  for (let i = 1; i <= n; i++) {
    ctx.save();
    ctx.translate(back * i * (6 + fast * 16) * s, 0);
    silhouette(ctx, r, s, 9 * s, al(i % 2 ? p.b : p.glow, (0.28 + fast * 0.2) / i));
    ctx.restore();
  }
  // speed lines streaming off the body
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  const lines = 3 + Math.round(fast * 5);
  for (let i = 0; i < lines; i++) {
    const y = r.head.y + ((i * 37 + Math.floor(t * 30) * 13) % 100) / 100 * (r.fF.y - r.head.y);
    const len = (14 + fast * 40 + ((i * 17) % 11)) * s;
    const x0 = r.hip.x + back * (8 + (i % 3) * 6) * s;
    ctx.strokeStyle = al(i % 2 ? p.glow : "hsl(0 0% 100%)", 0.25 + fast * 0.4);
    ctx.lineWidth = 1.5 * s;
    ctx.beginPath(); ctx.moveTo(x0, y); ctx.lineTo(x0 + back * len, y); ctx.stroke();
  }
  ctx.restore();
}

function redlineFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint, vx: number) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // two gold chevrons down the chest, pointing the way he runs
  const tx = r.neck.x + (r.hip.x - r.neck.x) * 0.3, ty = r.neck.y + (r.hip.y - r.neck.y) * 0.3;
  ctx.strokeStyle = alive ? p.glow : al(p.glow, 0.4);
  ctx.lineWidth = 2.2 * s;
  for (let i = 0; i < 2; i++) {
    const y = ty + i * 7 * s;
    ctx.beginPath();
    ctx.moveTo(tx - face * 4 * s, y - 4 * s);
    ctx.lineTo(tx + face * 3 * s, y);
    ctx.lineTo(tx - face * 4 * s, y + 4 * s);
    ctx.stroke();
  }
  if (alive) {
    const h = r.head;
    // a streak of flame-coloured hair whipping back off the head, longer when he runs
    const run = Math.min(1, Math.abs(vx) / 260);
    const back = -face;
    for (let i = 0; i < 3; i++) {
      const wav = Math.sin(t * 22 + i * 1.7) * 2.5 * s;
      ctx.strokeStyle = i === 1 ? p.b : p.glow;
      ctx.lineWidth = (3.2 - i * 0.6) * s;
      ctx.beginPath();
      ctx.moveTo(h.x + back * 4 * s, h.y - (7 - i * 3) * s);
      ctx.quadraticCurveTo(h.x + back * (14 + run * 8) * s, h.y - (10 - i * 4) * s + wav, h.x + back * (20 + run * 22 + i * 3) * s, h.y - (4 - i * 3) * s + wav);
      ctx.stroke();
    }
    // goggles: a gold band with a bright lens toward the front
    ctx.strokeStyle = "hsl(44 90% 50%)";
    ctx.lineWidth = 4 * s;
    ctx.beginPath();
    ctx.moveTo(h.x - face * 9 * s, h.y - 2 * s);
    ctx.lineTo(h.x + face * 10 * s, h.y - 2.6 * s);
    ctx.stroke();
    ctx.fillStyle = p.nightmare ? p.a : "hsl(190 100% 80%)";
    ctx.beginPath(); ctx.ellipse(h.x + face * 5.5 * s, h.y - 2.4 * s, 3.4 * s, 2.4 * s, 0, 0, TAU); ctx.fill();
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x + face * 5.5 * s, h.y - 2.4 * s, 8 * s, p.nightmare ? p.a : p.glow, 0.5);
    // sparks crackling off his heels
    if (Math.floor(t * 18) % 3 === 0) {
      ctx.strokeStyle = al(p.glow, 0.9);
      ctx.lineWidth = 1.4 * s;
      for (const ft of [r.fF, r.fB]) {
        ctx.beginPath();
        ctx.moveTo(ft.x, ft.y - 2 * s);
        ctx.lineTo(ft.x + back * 5 * s, ft.y - 6 * s);
        ctx.lineTo(ft.x + back * 9 * s, ft.y - 3 * s);
        ctx.stroke();
      }
    }
  }
  ctx.restore();
}

// ---------- Liminal ----------

/** A ring-shaped door in the air, seen at an angle: a dark middle with a bright rim. */
function doorRing(ctx: CanvasRenderingContext2D, x: number, y: number, rx: number, ry: number, rot: number, rim: string, inner: string, t: number, a = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.fillStyle = al("hsl(270 50% 4%)", 0.85 * a);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.fill();
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = al(inner, 0.7 * a);
  ctx.lineWidth = Math.max(1, rx * 0.12);
  ctx.beginPath(); ctx.ellipse(0, 0, rx * 0.78, ry * 0.78, 0, t * 3, t * 3 + 4.4); ctx.stroke();
  ctx.strokeStyle = al(rim, a);
  ctx.lineWidth = Math.max(1.2, rx * 0.2);
  ctx.beginPath(); ctx.ellipse(0, 0, rx, ry, 0, 0, TAU); ctx.stroke();
  ctx.restore();
}

function liminalBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  if (!alive) return;
  // a great door hanging behind its shoulders, opening wider while it casts
  const open = act ? (act.phase === "strike" ? 1.15 : 1.05) : 1;
  const cx = r.neck.x, cy = r.neck.y - 4 * s;
  ctx.save();
  doorRing(ctx, cx, cy, 30 * s * open, 34 * s * open, Math.sin(t * 0.8) * 0.08, p.glow, p.b, t, 0.85);
  ctx.restore();
}

function liminalFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  // a small door at each hand, the front one tilting toward the target as it attacks
  if (alive) {
    const swell = act && act.phase === "strike" ? 1.5 : 1;
    doorRing(ctx, r.hF.x + face * 4 * s, r.hF.y, 5 * s * swell, 9 * s * swell, face * 0.3, p.glow, p.b, t);
    doorRing(ctx, r.hB.x - face * 4 * s, r.hB.y, 4 * s, 7.5 * s, -face * 0.3, p.b, p.glow, -t);
  }
  // bits of matter orbiting the body, coming apart and clicking back together
  const cx = (r.hip.x + r.neck.x) / 2, cy = (r.hip.y + r.neck.y) / 2;
  for (let i = 0; i < 6; i++) {
    const a = t * 1.1 + (i * TAU) / 6;
    const apart = 0.5 + 0.5 * Math.sin(t * 1.8 + i);
    const d = (26 + apart * 14) * s;
    const x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d * 0.55;
    const z = (2.2 + (i % 2)) * s;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(t * 2 + i);
    ctx.fillStyle = al(i % 2 ? p.glow : p.b, alive ? 0.9 : 0.3);
    ctx.fillRect(-z, -z, z * 2, z * 2);
    ctx.restore();
  }
  if (alive) {
    // its face is a keyhole of light
    const h = r.head, kx = h.x + face * 2 * s, ky = h.y - 2 * s;
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, kx, ky + 2 * s, 10 * s, p.glow, 0.55);
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = p.nightmare ? p.b : "hsl(0 0% 100%)";
    ctx.beginPath(); ctx.arc(kx, ky, 2.8 * s, 0, TAU); ctx.fill();
    ctx.beginPath(); ctx.moveTo(kx - 1.4 * s, ky + 1 * s); ctx.lineTo(kx + 1.4 * s, ky + 1 * s); ctx.lineTo(kx + 2.6 * s, ky + 7 * s); ctx.lineTo(kx - 2.6 * s, ky + 7 * s); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

// ---------- Overtone ----------

/** The beat Overtone moves to: a sharp kick about twice a second. */
const beatOf = (t: number) => Math.pow(Math.max(0, Math.sin(t * 7.5)), 8);

function overtoneBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  if (!alive) return;
  const cx = r.shoulder.x * 0.6 + r.hip.x * 0.4, cy = r.shoulder.y * 0.6 + r.hip.y * 0.4;
  const loud = act ? (act.phase === "strike" ? 1 : 0.6) : 0.3;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";
  // rings of sound pulsing off both sides of him, more of them and brighter when he plays
  const n = 2 + Math.round(loud * 2);
  for (let i = 0; i < n; i++) {
    const q = (t * 1.2 + i / n) % 1;
    const rr = (18 + q * 52) * s;
    ctx.strokeStyle = al(i % 2 ? p.b : p.glow, (0.15 + loud * 0.45) * (1 - q));
    ctx.lineWidth = (2.6 - q * 1.6) * s;
    for (const sd of [-1, 1]) {
      ctx.beginPath();
      ctx.arc(cx, cy, rr, sd > 0 ? -0.7 : Math.PI - 0.7, sd > 0 ? 0.7 : Math.PI + 0.7);
      ctx.stroke();
    }
  }
  if (p.nightmare) {
    // black static crackling round him
    for (let i = 0; i < 10; i++) {
      const x = cx + (Math.sin(i * 7.1 + Math.floor(t * 20)) * 34) * s, y = cy + (Math.cos(i * 3.3 + Math.floor(t * 20) * 1.7) * 46) * s;
      ctx.fillStyle = al(i % 2 ? p.glow : "hsl(0 0% 100%)", 0.6);
      ctx.fillRect(x, y, 2.4 * s, 1.2 * s);
    }
  }
  ctx.restore();
}

function overtoneFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  const beat = alive ? beatOf(t) + (act && act.phase === "strike" ? 0.6 : 0) : 0;
  // the speaker cone in his chest, thumping on the beat
  const cx = r.shoulder.x * 0.6 + r.hip.x * 0.4 + face * 1.5 * s, cy = r.shoulder.y * 0.6 + r.hip.y * 0.4;
  const R = 8 * s * (1 + beat * 0.12);
  ctx.fillStyle = "hsl(220 14% 8%)";
  ctx.beginPath(); ctx.arc(cx, cy, R + 1.5 * s, 0, TAU); ctx.fill();
  ctx.strokeStyle = alive ? p.glow : al(p.glow, 0.35);
  ctx.lineWidth = 1.6 * s;
  ctx.beginPath(); ctx.arc(cx, cy, R, 0, TAU); ctx.stroke();
  ctx.strokeStyle = al(p.glow, alive ? 0.6 : 0.2);
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.6, 0, TAU); ctx.stroke();
  ctx.fillStyle = alive ? p.b : al(p.b, 0.3);
  ctx.beginPath(); ctx.arc(cx, cy, R * 0.25, 0, TAU); ctx.fill();
  if (alive) {
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, cx, cy, R * 2, p.glow, 0.25 + beat * 0.4);
    ctx.globalCompositeOperation = "source-over";
  }
  const h = r.head, hr = HEAD * s;
  // headphones: a band over the top of the head and a cup over the ear
  ctx.strokeStyle = "hsl(220 10% 22%)";
  ctx.lineWidth = 3 * s;
  ctx.beginPath(); ctx.arc(h.x, h.y, hr + 2.5 * s, Math.PI * 1.08, Math.PI * 1.92); ctx.stroke();
  const ex = h.x - face * 1.5 * s, ey = h.y + 1 * s;
  ctx.fillStyle = "hsl(220 10% 18%)";
  ctx.beginPath(); ctx.ellipse(ex, ey, 4.4 * s, 6 * s, 0, 0, TAU); ctx.fill();
  ctx.strokeStyle = alive ? p.glow : al(p.glow, 0.35);
  ctx.lineWidth = 1.5 * s;
  ctx.stroke();
  if (alive) {
    // an equalizer for a face: bars at the front of the head jumping with the music
    ctx.globalCompositeOperation = "lighter";
    glowDot(ctx, h.x + face * 5 * s, h.y, 10 * s, p.glow, 0.35);
    for (let i = 0; i < 4; i++) {
      const bh = (2 + 5 * Math.abs(Math.sin(t * (6 + i * 1.7) + i * 2.1)) + beat * 2) * s;
      ctx.fillStyle = i === 3 || p.nightmare ? p.b : p.glow;
      ctx.fillRect(h.x + face * (2 + i * 2.4) * s - 0.8 * s, h.y + 2 * s - bh, 1.6 * s, bh);
    }
  }
  ctx.restore();
}

// ---------- Vellum ----------

function vellumCranes(ctx: CanvasRenderingContext2D, r: BossRig, s: number, t: number, alive: boolean, p: QuestPaint, near: boolean) {
  if (!alive) return;
  const cx = (r.hip.x + r.neck.x) / 2, cy = (r.hip.y + r.neck.y) / 2 - 18 * s;
  for (let i = 0; i < 3; i++) {
    const a = t * 0.9 + (i * TAU) / 3;
    if ((Math.sin(a) > 0) !== near) continue;
    const x = cx + Math.cos(a) * 42 * s, y = cy + Math.sin(a * 2 + i) * 12 * s - i * 8 * s;
    // fly the way the orbit is going
    const heading = Math.sin(a) > 0 ? Math.PI : 0;
    ctx.globalAlpha = near ? 1 : 0.7;
    drawCrane(ctx, x, y, (5 + (i % 2) * 1.5) * s, heading + Math.cos(a) * 0.2, Math.sin(t * 9 + i * 2), p.nightmare ? "hsl(0 0% 12%)" : "hsl(42 40% 95%)", p.glow);
  }
  ctx.globalAlpha = 1;
}

function vellumBack(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, act: QuestAct | undefined, p: QuestPaint) {
  ctx.save();
  // a long paper scroll draped off the shoulders and streaming out behind, rippling on the air
  const back = -face;
  const lift = act && act.phase === "strike" ? 1.6 : 1;
  const top: Pt[] = [];
  const n = 9;
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    top.push({
      x: r.neck.x + back * (k * 62 * s),
      y: r.neck.y + 4 * s + k * 18 * s + Math.sin(t * 3.2 - k * 5) * k * 9 * s * lift - (alive ? 0 : -k * 20 * s),
    });
  }
  const wdt = 7 * s;
  ctx.fillStyle = p.nightmare ? "hsl(0 0% 10%)" : "hsl(42 45% 92%)";
  ctx.beginPath();
  top.forEach((q, i) => (i ? ctx.lineTo(q.x, q.y) : ctx.moveTo(q.x, q.y)));
  for (let i = n; i >= 0; i--) ctx.lineTo(top[i].x, top[i].y + wdt * (1 - (i / n) * 0.3));
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = al(p.glow, alive ? 0.7 : 0.3);
  ctx.lineWidth = 1.2 * s;
  ctx.stroke();
  // ink marks along it
  ctx.strokeStyle = p.nightmare ? al(p.glow, 0.8) : "hsl(0 0% 10% / 0.7)";
  ctx.lineWidth = 1.4 * s;
  for (let i = 2; i < n; i += 2) {
    const q = top[i];
    ctx.beginPath(); ctx.moveTo(q.x, q.y + 2 * s); ctx.lineTo(q.x + back * 1 * s, q.y + 5 * s); ctx.stroke();
  }
  vellumCranes(ctx, r, s, t, alive, p, false);
  ctx.restore();
}

function vellumFront(ctx: CanvasRenderingContext2D, r: BossRig, s: number, face: number, t: number, alive: boolean, p: QuestPaint) {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // fold creases across the limbs: a little zigzag where the paper has been folded
  ctx.strokeStyle = p.nightmare ? al(p.glow, 0.7) : "hsl(30 20% 55% / 0.8)";
  ctx.lineWidth = 1.1 * s;
  for (const [a, b] of [[r.hip, r.neck], [r.shoulder, r.eF], [r.eF, r.hF], [r.hip, r.kF], [r.kF, r.fF]] as const) {
    const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy) || 1;
    const nx = -dy / len, ny = dx / len, ux = dx / len, uy = dy / len;
    ctx.beginPath();
    ctx.moveTo(mx - nx * 3 * s - ux * 2 * s, my - ny * 3 * s - uy * 2 * s);
    ctx.lineTo(mx + ux * 1.5 * s, my + uy * 1.5 * s);
    ctx.lineTo(mx + nx * 3 * s - ux * 2 * s, my + ny * 3 * s - uy * 2 * s);
    ctx.stroke();
  }
  const h = r.head;
  // a red ink seal on the brow and one brushed eye
  ctx.strokeStyle = alive ? p.glow : al(p.glow, 0.4);
  ctx.lineWidth = 1.4 * s;
  const sx = h.x + face * 1 * s, sy = h.y - 5.5 * s;
  ctx.beginPath(); ctx.arc(sx, sy, 3 * s, 0, TAU); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(sx - 1.4 * s, sy - 1 * s); ctx.lineTo(sx + 1.4 * s, sy + 1 * s); ctx.stroke();
  if (alive) {
    ctx.strokeStyle = p.nightmare ? p.glow : "hsl(0 0% 8%)";
    ctx.lineWidth = 2 * s;
    ctx.beginPath();
    ctx.moveTo(h.x + face * 2 * s, h.y + 0.5 * s);
    ctx.quadraticCurveTo(h.x + face * 5 * s, h.y - 1.5 * s, h.x + face * 8.5 * s, h.y + 0.2 * s);
    ctx.stroke();
    if (p.nightmare) {
      ctx.globalCompositeOperation = "lighter";
      glowDot(ctx, h.x + face * 5 * s, h.y, 8 * s, p.glow, 0.6);
      ctx.globalCompositeOperation = "source-over";
    }
  }
  vellumCranes(ctx, r, s, t, alive, p, true);
  ctx.restore();
}

export function drawQuestDesign(
  ctx: CanvasRenderingContext2D, id: Power, layer: "back" | "front", r: BossRig, s: number, face: number, t: number,
  alive: boolean, act: QuestAct | undefined, p: QuestPaint, vx = 0,
) {
  if (id === "hexizon") return layer === "back" ? hexizonBack(ctx, r, s, t, alive, p) : hexizonFront(ctx, r, s, face, t, alive, act, p);
  if (id === "spatio") return layer === "back" ? parallaxBack(ctx, r, s, t, alive, act, p) : parallaxFront(ctx, r, s, face, t, alive, p);
  if (id === "gamma") return layer === "back" ? halflifeBack(ctx, r, s, t, alive, act, p) : halflifeFront(ctx, r, s, face, t, alive, p);
  if (id === "velo") return layer === "back" ? redlineBack(ctx, r, s, face, t, alive, act, p, vx) : redlineFront(ctx, r, s, face, t, alive, p, vx);
  if (id === "portal") return layer === "back" ? liminalBack(ctx, r, s, t, alive, act, p) : liminalFront(ctx, r, s, face, t, alive, act, p);
  if (id === "sono") return layer === "back" ? overtoneBack(ctx, r, s, t, alive, act, p) : overtoneFront(ctx, r, s, face, t, alive, act, p);
  if (id === "paper") return layer === "back" ? vellumBack(ctx, r, s, face, t, alive, act, p) : vellumFront(ctx, r, s, face, t, alive, p);
}
