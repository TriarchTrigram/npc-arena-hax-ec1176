// Free World's character creator: name your stick figure, pick up to three powers, then choose what it wears,
// how tall it stands and which of its powers' colours it takes. The powers decide the rest (colours, stance,
// entrance, effects and moves), and the preview shows the fighter breathing in the stance they give it.
import { useEffect, useMemo, useRef, useState } from "react";
import { PiFloppyDiskBold } from "react-icons/pi";
import { Text, useString } from "~stencil/ui/strings";
import type { StringKey } from "~stencil/types/strings";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Sheet, SheetBody, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { FighterDot } from "~/components/fighter-dot";
import { cn } from "~/lib/utils";
import {
  BUILDS, DEF_BY_ID, GEARS, MAX_CUSTOM_POWERS, MAX_NAME, SHADES, customOf,
  type CustomSpec, type Power, type RosterId,
} from "~/lib/fighters";
import { GROUND, newGame, strollPose, drawStroller, type Game } from "~/lib/arena-engine";
import { saveMyFighter } from "~/lib/my-fighter";

const STARTER: CustomSpec = { name: "", powers: ["pyro"], gear: "scarf", build: "regular", shade: "main" };
const PW = 320;
const PH = 260;

/** The fighter breathing in its stance, on a floor lit in its colours. */
function Preview({ spec, fallbackName }: { spec: CustomSpec; fallbackName: string }) {
  const ref = useRef<HTMLCanvasElement>(null);
  const aria = useString("creator.previewAria");
  const key = [spec.powers.join("."), spec.gear, spec.build, spec.shade].join("|");
  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const def = customOf(spec, fallbackName);
    const g: Game = newGame([def], true);
    const f = g.fighters[0];
    f.x = 0;
    f.y = GROUND;
    f.facing = 1;
    f.scale = (f.scale / 1.25) * 1.3;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = performance.now();
    const draw = (now: number) => {
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      if (!reduce) g.t += dt;
      strollPose(g, f, 0, 0, reduce ? 1 : dt);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, PW, PH);
      const floor = PH - 34;
      // a pool of light in the main colour, ringed in the glow
      const grd = ctx.createRadialGradient(PW / 2, floor, 6, PW / 2, floor, 150);
      grd.addColorStop(0, def.glow);
      grd.addColorStop(0.35, def.color);
      grd.addColorStop(1, "transparent");
      ctx.globalAlpha = 0.35;
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, PW, PH);
      ctx.globalAlpha = 1;
      ctx.translate(PW / 2, floor - GROUND);
      drawStroller(ctx, g, f);
      if (!reduce) raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  return (
    <canvas
      ref={ref}
      width={PW}
      height={PH}
      role="img"
      aria-label={aria}
      className="mx-auto block h-auto w-full max-w-80 rounded-xl border-4 border-border bg-background-secondary"
      data-creator-preview
    />
  );
}

function Choice({ on, onClick, disabled, children, className }: { on: boolean; onClick: () => void; disabled?: boolean; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "flex min-h-10 items-center gap-2 rounded-xl border-2 px-3 py-2 text-left text-sm transition-colors duration-150 hover:bg-surface-hover active:bg-surface-active disabled:opacity-50",
        on ? "border-foreground bg-card font-semibold text-foreground" : "border-border bg-background text-muted-foreground",
        className,
      )}
    >
      {children}
    </button>
  );
}

function Heading({ id, hint }: { id: StringKey; hint?: StringKey }) {
  return (
    <div className="flex flex-col gap-1">
      <Text id={id} as="h3" className="font-display text-lg text-foreground" />
      {hint && <Text id={hint} as="p" className="text-sm text-muted-foreground" />}
    </div>
  );
}

/** The creator sheet. `powers` are the powers on offer (the fighters plus any quest or new-gen fighter you've earned). */
export function CharacterCreator({ open, onOpenChange, saved, powers, onSaved }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  saved: CustomSpec | null;
  powers: Power[];
  onSaved: (id: RosterId) => void;
}) {
  const [draft, setDraft] = useState<CustomSpec>(saved ?? STARTER);
  const [savedNote, setSavedNote] = useState<string | null>(null);
  // every time the sheet opens it starts from what you saved
  useEffect(() => {
    if (open) {
      setDraft(saved ?? STARTER);
      setSavedNote(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);
  const fallbackName = useString("creator.fallbackName");
  const namePlaceholder = useString("creator.namePlaceholder");
  const def = useMemo(() => customOf(draft, fallbackName), [draft, fallbackName]);
  const set = (patch: Partial<CustomSpec>) => {
    setDraft((d) => ({ ...d, ...patch }));
    setSavedNote(null);
  };
  const togglePower = (p: Power) => {
    const has = draft.powers.includes(p);
    if (has && draft.powers.length === 1) return;
    if (!has && draft.powers.length >= MAX_CUSTOM_POWERS) return;
    set({ powers: has ? draft.powers.filter((x) => x !== p) : [...draft.powers, p] });
  };
  const name = draft.name.replace(/\s+/g, " ").trim();
  const save = () => {
    if (!name) return;
    const id = saveMyFighter({ ...draft, name });
    setSavedNote(name);
    onSaved(id);
  };
  const full = draft.powers.length >= MAX_CUSTOM_POWERS;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg" data-creator>
        <SheetHeader>
          <SheetTitle className="font-display text-xl"><Text id="creator.title" /></SheetTitle>
          <SheetDescription><Text id="creator.intro" /></SheetDescription>
        </SheetHeader>
        <SheetBody className="gap-6">
          <Preview spec={draft} fallbackName={fallbackName} />

          <div className="flex flex-col gap-2">
            <Label htmlFor="creator-name" className="font-display text-lg text-foreground"><Text id="creator.nameLabel" /></Label>
            <Input
              id="creator-name"
              value={draft.name}
              maxLength={MAX_NAME}
              placeholder={namePlaceholder}
              autoComplete="off"
              onChange={(e) => set({ name: e.target.value })}
            />
          </div>

          <section className="flex flex-col gap-3" data-creator-powers>
            <div className="flex flex-wrap items-baseline gap-2">
              <Heading id="creator.powersTitle" hint="creator.powersHint" />
            </div>
            <Text id="creator.powersCount" vars={{ count: draft.powers.length, max: MAX_CUSTOM_POWERS }} as="p" className="text-sm text-muted-foreground tabular-nums" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {powers.map((p) => {
                const d = DEF_BY_ID[p];
                const at = draft.powers.indexOf(p);
                const on = at >= 0;
                return (
                  <Choice key={p} on={on} disabled={!on && full} onClick={() => togglePower(p)}>
                    <FighterDot def={d} className="size-5" />
                    <span className="min-w-0 truncate" title={d.power}>{d.power}</span>
                    {on && (
                      <span className="ml-auto shrink-0 rounded-full border-2 border-foreground px-1.5 text-xs font-extrabold tabular-nums text-foreground">
                        {at === 0 ? <Text id="creator.mainPower" /> : at + 1}
                      </span>
                    )}
                  </Choice>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3" data-creator-look>
            <Heading id="creator.lookTitle" hint="creator.lookHint" />
            <Text id="creator.gearLabel" as="h4" className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground" />
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {GEARS.map((gear) => (
                <Choice key={gear} on={draft.gear === gear} onClick={() => set({ gear })}>
                  <Text id={`creator.gear.${gear}` as StringKey} />
                </Choice>
              ))}
            </div>
            <Text id="creator.buildLabel" as="h4" className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground" />
            <div className="grid grid-cols-3 gap-2">
              {BUILDS.map((build) => (
                <Choice key={build} on={draft.build === build} onClick={() => set({ build })}>
                  <Text id={`creator.build.${build}` as StringKey} />
                </Choice>
              ))}
            </div>
            <Text id="creator.shadeLabel" as="h4" className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground" />
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              {SHADES.map((shade) => {
                const look = customOf({ ...draft, shade }, fallbackName);
                return (
                  <Choice key={shade} on={draft.shade === shade} onClick={() => set({ shade })}>
                    <FighterDot def={look} className="size-5" />
                    <Text id={`creator.shade.${shade}` as StringKey} />
                  </Choice>
                );
              })}
            </div>
          </section>

          <section className="flex flex-col gap-3" data-creator-moves>
            <Heading id="creator.givesTitle" />
            <dl className="grid grid-cols-3 gap-2 text-sm">
              {([
                ["creator.stat.role", <Text key="r" id={`creator.role.${def.role}` as StringKey} />],
                ["creator.stat.health", def.hp],
                ["creator.stat.speed", def.speed],
              ] as const).map(([label, value]) => (
                <div key={label} className="rounded-xl border-2 border-border bg-background px-3 py-2">
                  <Text id={label} as="dt" className="text-xs font-extrabold uppercase tracking-[0.08em] text-muted-foreground" />
                  <dd className="font-semibold tabular-nums text-foreground">{value}</dd>
                </div>
              ))}
            </dl>
            <Text id="creator.movesCount" vars={{ count: def.moves.length }} as="p" className="text-sm text-muted-foreground tabular-nums" />
            <ul className="grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
              {def.moves.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-foreground">
                  <FighterDot def={DEF_BY_ID[m.power ?? def.id]} className="size-3" />
                  <span className="min-w-0 truncate">{m.name}</span>
                </li>
              ))}
            </ul>
          </section>

          <div className="flex flex-col gap-2">
            <Button onClick={save} disabled={!name} data-creator-save>
              <PiFloppyDiskBold className="size-5" aria-hidden />
              <Text id="creator.save" />
            </Button>
            {!name && <Text id="creator.needName" as="p" className="text-sm text-muted-foreground" />}
            <div aria-live="polite" className="text-sm text-foreground-secondary">
              {savedNote && <Text id="creator.savedNote" vars={{ name: savedNote }} />}
            </div>
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}
