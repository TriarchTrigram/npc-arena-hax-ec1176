// The Story bosses. Each is its own fighter, not a fusion: its own moves (several with mechanics no
// roster fighter has), its own body design drawn by the engine, and its own colours. `id` is only the
// voice and entrance it borrows from the roster.
import type { BossDesign, FighterDef, Move } from "./fighters";
import type { Form } from "./forms";

export type BossId = "nullshade" | "maelstrom" | "magmaw" | "everwinter" | "riftmaker" | "hollowking" | "blacksun" | "axiom";

const M = (m: Omit<Move, "wind" | "act" | "rec"> & Partial<Pick<Move, "wind" | "act" | "rec">>): Move => ({
  wind: 0.2,
  act: 0.12,
  rec: 0.24,
  ...m,
});

export const BOSSES: Record<BossId, FighterDef> = {
  // Chapter 1. Bends antimatter: whatever it touches cancels out.
  nullshade: {
    id: "umbra", boss: "antimatter", name: "Nullshade", power: "Antimatter", role: "control",
    ability: "Commands antimatter. Its field erases shots, and matter meeting antimatter annihilates.",
    color: "hsl(268 40% 16%)", glow: "hsl(186 100% 82%)", hp: 255, speed: 86,
    moves: [
      M({ id: "positron-palm", name: "Positron Palm", kind: "melee", anim: "thrust", range: 74, cd: 0.95, dmg: 9, kb: 260 }),
      M({ id: "antimatter-lance", name: "Antimatter Lance", kind: "beam", anim: "cast", range: 460, minRange: 70, cd: 3, dmg: 13, act: 0.32, wind: 0.32 }),
      M({ id: "annihilation", name: "Annihilation", kind: "annihilate", anim: "raise", range: 520, minRange: 40, cd: 6, dmg: 22, radius: 78, kb: 360, lift: -420, wind: 0.35, rec: 0.35 }),
      M({ id: "null-field", name: "Null Field", kind: "zone", anim: "slam", range: 380, cd: 9, dmg: 5, radius: 130, dur: 4.5, pullIn: 90, erase: true, wind: 0.35 }),
      M({ id: "pair-burst", name: "Pair Production", kind: "projectile", anim: "thrust", range: 560, minRange: 90, cd: 2.6, dmg: 6, speed: 520, size: 10, count: 2, spread: 0.16, shape: "orb" }),
      M({ id: "zero-point", name: "Zero Point", kind: "burst", anim: "slam", range: 130, cd: 7, dmg: 15, radius: 160, kb: 480, lift: -300, wind: 0.32, rec: 0.35 }),
    ],
  },
  // Chapter 2. A storm at sea given a body.
  maelstrom: {
    id: "hydro", boss: "maelstrom", name: "Maelstrom", power: "Tempest Sea", role: "attacker",
    ability: "A living sea storm. Walls of water roll across the whole arena, and its whirlpool drags everyone in.",
    color: "hsl(204 70% 30%)", glow: "hsl(186 100% 76%)", hp: 280, speed: 94,
    moves: [
      M({ id: "trident-rake", name: "Trident Rake", kind: "melee", anim: "lunge", range: 96, cd: 1, dmg: 9, kb: 240, status: "stun", statusDur: 0.2 }),
      M({ id: "tidal-wall", name: "Tidal Wall", kind: "projectile", anim: "slam", range: 900, minRange: 60, cd: 7, dmg: 16, speed: 330, size: 34, pierce: true, ground: true, shape: "wave", kb: 420, lift: -360, wind: 0.4, rec: 0.35 }),
      M({ id: "eye-of-the-storm", name: "Eye of the Storm", kind: "zone", anim: "raise", range: 420, cd: 9, dmg: 6, radius: 140, dur: 4, pullIn: 130, status: "stun", statusDur: 0.12, wind: 0.35 }),
      M({ id: "thunderhead", name: "Thunderhead", kind: "rain", anim: "raise", range: 520, cd: 5.5, dmg: 7, count: 7, radius: 160, status: "stun", statusDur: 0.25, wind: 0.35, rec: 0.3 }),
      M({ id: "riptide", name: "Riptide", kind: "pull", anim: "thrust", range: 420, minRange: 120, cd: 4.5, dmg: 7, wind: 0.24 }),
      M({ id: "waterspout", name: "Waterspout", kind: "eruption", anim: "uppercut", range: 460, minRange: 50, cd: 4.5, dmg: 13, radius: 52, lift: -820, wind: 0.32 }),
    ],
  },
  // Chapter 3. A walking volcano with a mouth of magma.
  magmaw: {
    id: "terra", boss: "magmaw", name: "Magmaw", power: "Living Volcano", role: "tank",
    ability: "A walking volcano. The floor splits into fault lines and the sky rains molten rock.",
    color: "hsl(12 30% 20%)", glow: "hsl(28 100% 58%)", hp: 266, speed: 74,
    moves: [
      M({ id: "magma-bite", name: "Magma Bite", kind: "melee", anim: "lunge", range: 88, cd: 1.3, dmg: 13, kb: 340, status: "burn", statusDur: 1.5, wind: 0.26 }),
      M({ id: "fault-line", name: "Fault Line", kind: "eruption", anim: "slam", range: 600, minRange: 40, cd: 6, dmg: 12, radius: 46, count: 4, lift: -640, status: "burn", statusDur: 1.5, wind: 0.4 }),
      M({ id: "lava-bombs", name: "Lava Bombs", kind: "rain", anim: "raise", range: 540, cd: 5.5, dmg: 9, count: 5, radius: 150, size: 13, shape: "rock", status: "burn", statusDur: 2, wind: 0.4, rec: 0.3 }),
      M({ id: "magma-lake", name: "Magma Lake", kind: "zone", anim: "slam", range: 360, cd: 9, dmg: 7, radius: 120, dur: 4, status: "burn", statusDur: 0.6, wind: 0.35 }),
      M({ id: "volcanic-roar", name: "Volcanic Roar", kind: "burst", anim: "raise", range: 150, cd: 6.5, dmg: 16, radius: 175, kb: 440, lift: -380, status: "burn", statusDur: 2.5, wind: 0.36, rec: 0.38 }),
      M({ id: "obsidian-hide", name: "Obsidian Hide", kind: "heal", anim: "raise", range: 2000, cd: 14, dmg: 0, heal: 30, below: 0.5, wind: 0.4 }),
    ],
  },
  // Chapter 4. The winter that stopped the clocks.
  everwinter: {
    id: "cryo", boss: "everwinter", name: "Everwinter", power: "Frozen Time", role: "control",
    ability: "The winter that stopped time. It can freeze the whole arena in one moment and strike while nothing moves.",
    color: "hsl(206 50% 82%)", glow: "hsl(44 90% 72%)", hp: 331, speed: 86,
    moves: [
      M({ id: "rime-sickle", name: "Rime Sickle", kind: "melee", anim: "spin", range: 84, cd: 1, dmg: 9, kb: 200, status: "slow", statusDur: 1.2 }),
      M({ id: "time-stop", name: "Time Stop", kind: "burst", anim: "raise", range: 2000, cd: 13, dmg: 6, radius: 60, world: true, status: "freeze", statusDur: 1.7, wind: 0.5, rec: 0.2 }),
      M({ id: "hourglass-icicles", name: "Hourglass Icicles", kind: "rain", anim: "raise", range: 520, cd: 5, dmg: 8, count: 6, radius: 140, shape: "shard", status: "slow", statusDur: 1.2, wind: 0.35, rec: 0.3 }),
      M({ id: "frost-lance", name: "Frost Lance", kind: "beam", anim: "thrust", range: 440, minRange: 70, cd: 3, dmg: 12, act: 0.3, status: "slow", statusDur: 1.4, wind: 0.28 }),
      M({ id: "rime-step", name: "Rime Step", kind: "blink", anim: "kick", range: 480, minRange: 140, cd: 4.5, dmg: 11, kb: 300, status: "freeze", statusDur: 0.6 }),
      M({ id: "glacial-age", name: "Glacial Age", kind: "zone", anim: "slam", range: 360, cd: 9, dmg: 5, radius: 140, dur: 4.5, status: "slow", statusDur: 0.6, wind: 0.35 }),
    ],
  },
  // Chapter 5. Bends reality: it can move the whole fight to the Moon, the desert, a galaxy, the open universe or a nebula.
  riftmaker: {
    id: "psy", boss: "riftmaker", name: "The Riftmaker", power: "Reality Warping", role: "trickster",
    ability: "Rewrites reality. It moves the whole fight to the Moon or the open Universe, where everyone floats, a scorching desert that burns its enemies, a galaxy whose shooting stars rain on them, or a nebula whose gas slows and blinds them.",
    color: "hsl(252 30% 12%)", glow: "hsl(318 100% 72%)", hp: 320, speed: 98,
    moves: [
      M({ id: "fold-strike", name: "Fold Strike", kind: "melee", anim: "jab", range: 76, cd: 0.9, dmg: 9, kb: 220 }),
      M({ id: "reality-warp", name: "Reality Warp", kind: "warp", anim: "raise", range: 2000, cd: 15, dmg: 0, wind: 0.55, rec: 0.3 }),
      M({ id: "dimension-tear", name: "Dimension Tear", kind: "beam", anim: "cast", range: 480, minRange: 70, cd: 3.2, dmg: 14, act: 0.34, wind: 0.3 }),
      M({ id: "fold-space", name: "Fold Space", kind: "blink", anim: "uppercut", range: 520, minRange: 140, cd: 4, dmg: 12, lift: -560, kb: 160 }),
      M({ id: "mirror-shards", name: "Mirror Shards", kind: "projectile", anim: "cast", range: 580, minRange: 80, cd: 2.4, dmg: 5, speed: 640, size: 9, count: 4, spread: 0.2, shape: "shard" }),
      M({ id: "unmake", name: "Unmake", kind: "burst", anim: "slam", range: 140, cd: 7, dmg: 17, radius: 165, kb: 460, lift: -320, status: "blind", statusDur: 1.5, wind: 0.34, rec: 0.36 }),
    ],
  },
  // Chapter 6. A crowned reaper that feeds on souls: most of what it lands gives it health back.
  hollowking: {
    id: "umbra", boss: "hollow", name: "The Hollow King", power: "Soul Reaping", role: "attacker",
    ability: "Reaps souls. Its scythe and its graveyard drain health back into it, and Soul Harvest tears a soul out of every enemy at once.",
    color: "hsl(170 14% 16%)", glow: "hsl(152 92% 64%)", hp: 450, speed: 90,
    moves: [
      M({ id: "reaper-scythe", name: "Reaper's Scythe", kind: "melee", anim: "spin", range: 100, cd: 1.05, dmg: 10, kb: 260, heal: 3, wind: 0.22 }),
      M({ id: "soul-chains", name: "Soul Chains", kind: "pull", anim: "thrust", range: 440, minRange: 120, cd: 4.5, dmg: 7, status: "slow", statusDur: 1.2, wind: 0.24 }),
      M({ id: "grave-hands", name: "Grave Hands", kind: "eruption", anim: "slam", range: 560, minRange: 40, cd: 5.5, dmg: 11, radius: 44, count: 3, lift: -520, status: "stun", statusDur: 0.35, wind: 0.36 }),
      M({ id: "wailing-souls", name: "Wailing Souls", kind: "projectile", anim: "cast", range: 560, minRange: 80, cd: 2.8, dmg: 6, speed: 430, size: 11, count: 3, spread: 0.22, status: "blind", statusDur: 1 }),
      M({ id: "graveyard", name: "Graveyard", kind: "zone", anim: "raise", range: 380, cd: 9, dmg: 6, radius: 130, dur: 4.5, heal: 2, status: "slow", statusDur: 0.6, wind: 0.35 }),
      M({ id: "soul-harvest", name: "Soul Harvest", kind: "burst", anim: "raise", range: 2000, cd: 12, dmg: 9, heal: 6, harvest: true, wind: 0.5, rec: 0.3 }),
    ],
  },
  // Chapter 7. A sun gone dark: its corona burns, and Total Eclipse plunges the arena into night.
  blacksun: {
    id: "lux", boss: "blacksun", name: "The Black Sun", power: "Eclipse", role: "control",
    ability: "A sun swallowed by its own shadow. Solar flares burn, and Total Eclipse blacks out the sky so its enemies swing blind.",
    color: "hsl(30 30% 10%)", glow: "hsl(40 100% 64%)", hp: 420, speed: 92,
    moves: [
      M({ id: "corona-edge", name: "Corona Edge", kind: "melee", anim: "kick", range: 82, cd: 0.95, dmg: 10, kb: 240, status: "burn", statusDur: 1.2 }),
      M({ id: "solar-flare", name: "Solar Flare", kind: "beam", anim: "cast", range: 500, minRange: 70, cd: 3.2, dmg: 14, act: 0.34, status: "burn", statusDur: 1.5, wind: 0.32 }),
      M({ id: "sunspot-rain", name: "Sunspot Rain", kind: "rain", anim: "raise", range: 540, cd: 5.5, dmg: 8, count: 6, radius: 160, size: 12, status: "burn", statusDur: 1.5, wind: 0.35, rec: 0.3 }),
      M({ id: "eclipse-disc", name: "Eclipse Disc", kind: "projectile", anim: "thrust", range: 620, minRange: 90, cd: 3.4, dmg: 11, speed: 460, size: 16, pierce: true, shape: "disc", status: "blind", statusDur: 1.2 }),
      M({ id: "prominence", name: "Prominence", kind: "eruption", anim: "uppercut", range: 480, minRange: 50, cd: 4.8, dmg: 13, radius: 50, lift: -720, status: "burn", statusDur: 2, wind: 0.34 }),
      M({ id: "total-eclipse", name: "Total Eclipse", kind: "burst", anim: "raise", range: 2000, cd: 14, dmg: 6, eclipse: true, status: "blind", statusDur: 4, wind: 0.55, rec: 0.3 }),
    ],
  },
  // Chapter 8. The cosmos given a will: it rewrites reality more often than the Riftmaker, and its Event Horizon swallows shots whole.
  axiom: {
    id: "gravi", boss: "axiom", name: "The Axiom", power: "Cosmic Reality Warping", role: "control",
    ability: "The cosmos given a will. It rewrites reality more often than the Riftmaker ever could, folds galaxies into its fists, rains stars on its enemies and its Event Horizon swallows shots whole.",
    color: "hsl(236 55% 11%)", glow: "hsl(272 100% 80%)", hp: 480, speed: 96,
    moves: [
      M({ id: "galaxy-fist", name: "Galaxy Fist", kind: "melee", anim: "jab", range: 80, cd: 0.9, dmg: 10, kb: 260 }),
      M({ id: "cosmic-rewrite", name: "Cosmic Rewrite", kind: "warp", anim: "raise", range: 2000, cd: 12, dmg: 0, wind: 0.5, rec: 0.3 }),
      M({ id: "cosmic-string", name: "Cosmic String", kind: "beam", anim: "cast", range: 520, minRange: 70, cd: 3.2, dmg: 14, act: 0.36, kb: 220, wind: 0.3 }),
      M({ id: "star-shower", name: "Star Shower", kind: "rain", anim: "raise", range: 560, cd: 5.5, dmg: 8, count: 8, radius: 180, size: 11, shape: "shard", wind: 0.35, rec: 0.3 }),
      M({ id: "event-horizon", name: "Event Horizon", kind: "zone", anim: "slam", range: 400, cd: 9, dmg: 6, radius: 140, dur: 4.5, pullIn: 160, erase: true, status: "slow", statusDur: 0.6, wind: 0.35 }),
      M({ id: "wormhole-step", name: "Wormhole Step", kind: "blink", anim: "kick", range: 540, minRange: 130, cd: 4, dmg: 12, kb: 300, lift: -320 }),
    ],
  },
};

// ---------- Boss phases ----------
// Each boss breaks into a 2nd, 3rd and 4th phase as its health runs down (75%, 50%, 25%). A phase is a form
// (forms.ts, kind "phase"): the fight pauses for its cutscene, the boss is recoloured and stronger, and 2 new
// moves join the ones it already has, so by its 4th phase a boss fights with 12. Its look grows with each
// phase (drawBossPhase in boss-designs.ts).
const P2 = { kind: "phase" as const, step: 2, at: 0.75, dmg: 1.12, kb: 1.08, cd: 0.88, speed: 1.05, act: 1.05 };
const P3 = { kind: "phase" as const, step: 3, at: 0.5, dmg: 1.24, kb: 1.15, cd: 0.78, speed: 1.1, act: 1.1 };
const P4 = { kind: "phase" as const, step: 4, at: 0.25, dmg: 1.38, kb: 1.25, cd: 0.68, speed: 1.18, act: 1.18 };

export const BOSS_PHASES: Partial<Record<BossDesign, Form[]>> = {
  antimatter: [
    {
      ...P2, power: "umbra", title: "UNSTABLE PAIR", dodge: 0.1,
      blurb: "Matter and antimatter split off it and circle its body. Its shots come in threes and pass through.",
      body: "hsl(268 45% 20%)", glow: "hsl(186 100% 82%)", a: "hsl(268 60% 34%)", b: "hsl(186 100% 80%)",
      moves: [
        M({ id: "twin-orbit", name: "Twin Orbit", kind: "projectile", anim: "thrust", range: 580, minRange: 80, cd: 3, dmg: 7, speed: 560, size: 11, count: 3, spread: 0.22, pierce: true, shape: "orb" }),
        M({ id: "antimatter-grasp", name: "Antimatter Grasp", kind: "pull", anim: "cast", range: 440, minRange: 110, cd: 4.5, dmg: 9, status: "slow", statusDur: 1, wind: 0.24 }),
      ],
    },
    {
      ...P3, power: "umbra", title: "ANNIHILATION ENGINE", drain: 0.12,
      blurb: "Its body cracks open over pure antimatter and a broken halo turns behind its head. Every hit it lands takes a little health back.",
      body: "hsl(200 60% 12%)", glow: "hsl(186 100% 88%)", a: "hsl(186 100% 56%)", b: "hsl(0 0% 100%)",
      moves: [
        M({ id: "chain-annihilation", name: "Chain Annihilation", kind: "eruption", anim: "slam", range: 600, minRange: 40, cd: 6, dmg: 12, radius: 44, count: 5, lift: -560, status: "blind", statusDur: 0.6, wind: 0.36 }),
        M({ id: "erasure-beam", name: "Erasure Beam", kind: "beam", anim: "cast", range: 620, minRange: 60, cd: 4, dmg: 18, act: 0.4, kb: 300, wind: 0.36 }),
      ],
    },
    {
      ...P4, power: "umbra", title: "ZERO STATE", drain: 0.12, guard: 0.8,
      blurb: "Nothing left but the void it carries. Wings of erased space spread behind it, and Big Crunch blasts most of the arena.",
      body: "hsl(0 0% 4%)", glow: "hsl(186 100% 70%)", a: "hsl(268 80% 12%)", b: "hsl(186 100% 76%)", dark: "hsl(268 60% 3%)",
      moves: [
        M({ id: "absolute-null", name: "Absolute Null", kind: "zone", anim: "raise", range: 440, cd: 9, dmg: 8, radius: 170, dur: 4.5, pullIn: 260, erase: true, status: "slow", statusDur: 0.6, wind: 0.4 }),
        M({ id: "big-crunch", name: "Big Crunch", kind: "burst", anim: "raise", range: 480, cd: 12, dmg: 16, radius: 440, kb: 420, lift: -420, wind: 0.55, rec: 0.35 }),
      ],
    },
  ],
  maelstrom: [
    {
      ...P2, power: "hydro", title: "RISING TIDE",
      blurb: "The sea climbs its body and swirls around its waist. An undertow rolls along the floor and it rides the tide straight at you.",
      body: "hsl(208 75% 26%)", glow: "hsl(186 100% 80%)", a: "hsl(205 90% 44%)", b: "hsl(186 100% 84%)",
      moves: [
        M({ id: "undertow", name: "Undertow", kind: "projectile", anim: "slam", range: 900, minRange: 60, cd: 6, dmg: 12, speed: 380, size: 26, pierce: true, ground: true, shape: "wave", kb: 300, lift: -260, status: "slow", statusDur: 1.2, wind: 0.36 }),
        M({ id: "harpoon-tide", name: "Harpoon Tide", kind: "dash", anim: "lunge", range: 380, cd: 3.8, dmg: 13, dist: 380, act: 0.24, kb: 340, lift: -200 }),
      ],
    },
    {
      ...P3, power: "hydro", title: "HURRICANE CROWN", dodge: 0.15,
      blurb: "A storm cloud crowns its head and lightning answers it. It slips some hits like spray.",
      body: "hsl(220 35% 22%)", glow: "hsl(54 100% 72%)", a: "hsl(220 40% 36%)", b: "hsl(54 100% 74%)",
      moves: [
        M({ id: "lightning-trident", name: "Lightning Trident", kind: "beam", anim: "thrust", range: 520, minRange: 60, cd: 3.6, dmg: 15, act: 0.3, status: "stun", statusDur: 0.3, wind: 0.28 }),
        M({ id: "squall-line", name: "Squall Line", kind: "rain", anim: "raise", range: 560, cd: 6, dmg: 8, count: 9, radius: 200, status: "stun", statusDur: 0.2, wind: 0.36, rec: 0.3 }),
      ],
    },
    {
      ...P4, power: "hydro", title: "ABYSSAL LEVIATHAN", regen: 1.6, guard: 0.85,
      blurb: "A sea serpent from the deep coils behind it. The storm mends it, and its last whirlpool drowns half the arena.",
      body: "hsl(200 80% 10%)", glow: "hsl(170 100% 66%)", a: "hsl(205 90% 22%)", b: "hsl(170 100% 70%)", dark: "hsl(210 70% 5%)",
      moves: [
        M({ id: "leviathan-maw", name: "Leviathan's Maw", kind: "pull", anim: "cast", range: 520, minRange: 100, cd: 5, dmg: 14, status: "slow", statusDur: 1.2, wind: 0.28 }),
        M({ id: "drowned-world", name: "Drowned World", kind: "zone", anim: "slam", range: 420, cd: 10, dmg: 7, radius: 200, dur: 5, pullIn: 200, status: "slow", statusDur: 0.6, wind: 0.4 }),
      ],
    },
  ],
  magmaw: [
    {
      ...P2, power: "terra", title: "ERUPTION", guard: 0.85,
      blurb: "Its cracks split wide and magma runs down its body. It takes less damage and spits burning rock.",
      body: "hsl(12 50% 22%)", glow: "hsl(28 100% 60%)", a: "hsl(16 100% 46%)", b: "hsl(40 100% 64%)",
      moves: [
        M({ id: "magma-geyser", name: "Magma Geyser", kind: "eruption", anim: "uppercut", range: 480, minRange: 50, cd: 4.6, dmg: 14, radius: 54, lift: -820, status: "burn", statusDur: 1.5, wind: 0.3 }),
        M({ id: "cinder-spit", name: "Cinder Spit", kind: "projectile", anim: "thrust", range: 560, minRange: 80, cd: 2.6, dmg: 6, speed: 520, size: 11, count: 3, spread: 0.2, arc: true, shape: "rock", status: "burn", statusDur: 1.5 }),
      ],
    },
    {
      ...P3, power: "terra", title: "PYROCLASTIC", guard: 0.8,
      blurb: "Vents burst open on its shoulders and a column of ash pours out. Its ash blinds, and a burning flow rolls across the floor.",
      body: "hsl(20 15% 14%)", glow: "hsl(20 100% 56%)", a: "hsl(18 30% 28%)", b: "hsl(32 100% 60%)", dark: "hsl(20 20% 6%)",
      moves: [
        M({ id: "ash-storm", name: "Ash Storm", kind: "zone", anim: "raise", range: 380, cd: 8.5, dmg: 6, radius: 160, dur: 4.5, status: "blind", statusDur: 0.6, wind: 0.35 }),
        M({ id: "pyroclastic-flow", name: "Pyroclastic Flow", kind: "projectile", anim: "slam", range: 900, minRange: 60, cd: 7, dmg: 16, speed: 360, size: 32, pierce: true, ground: true, shape: "wave", kb: 440, lift: -340, status: "burn", statusDur: 2, wind: 0.4, rec: 0.35 }),
      ],
    },
    {
      ...P4, power: "terra", title: "MOLTEN CORE", guard: 0.75, regen: 1.2,
      blurb: "Its shell melts away from a white-hot core and a ring of obsidian circles it. Supervolcano blasts most of the arena.",
      body: "hsl(14 90% 40%)", glow: "hsl(48 100% 70%)", a: "hsl(10 100% 48%)", b: "hsl(50 100% 70%)",
      moves: [
        M({ id: "supervolcano", name: "Supervolcano", kind: "burst", anim: "raise", range: 460, cd: 12, dmg: 14, radius: 420, kb: 400, lift: -520, status: "burn", statusDur: 3, wind: 0.55, rec: 0.35 }),
        M({ id: "caldera-crush", name: "Caldera Crush", kind: "burst", anim: "slam", range: 160, cd: 7, dmg: 22, radius: 200, kb: 560, lift: -400, status: "burn", statusDur: 2.5, wind: 0.36, rec: 0.38 }),
      ],
    },
  ],
  everwinter: [
    {
      ...P2, power: "cryo", title: "BLACK ICE", dodge: 0.15,
      blurb: "Spikes of black ice grow along its shoulders. Glaciers break out of the floor, and it slips some hits.",
      body: "hsl(210 40% 60%)", glow: "hsl(44 90% 72%)", a: "hsl(210 60% 50%)", b: "hsl(44 95% 76%)",
      moves: [
        M({ id: "glacier-fang", name: "Glacier Fang", kind: "eruption", anim: "slam", range: 520, minRange: 50, cd: 5, dmg: 12, radius: 44, count: 3, lift: -560, status: "slow", statusDur: 1.4, wind: 0.34 }),
        M({ id: "frozen-second", name: "Frozen Second", kind: "blink", anim: "kick", range: 520, minRange: 120, cd: 4.2, dmg: 13, kb: 320, status: "freeze", statusDur: 0.5 }),
      ],
    },
    {
      ...P3, power: "cryo", title: "STOPPED HOUR", drain: 0.15,
      blurb: "A frozen clock face turns behind it. Its clock hands fly in volleys, and the seconds it steals come back as health.",
      body: "hsl(44 50% 70%)", glow: "hsl(44 100% 80%)", a: "hsl(42 80% 54%)", b: "hsl(200 90% 90%)",
      moves: [
        M({ id: "clock-hands", name: "Clock Hands", kind: "projectile", anim: "cast", range: 580, minRange: 80, cd: 3, dmg: 6, speed: 640, size: 10, count: 5, spread: 0.14, shape: "blade", status: "slow", statusDur: 1 }),
        M({ id: "rewound-blizzard", name: "Rewound Blizzard", kind: "rain", anim: "raise", range: 540, cd: 6, dmg: 8, count: 8, radius: 180, shape: "shard", status: "freeze", statusDur: 0.4, wind: 0.36, rec: 0.3 }),
      ],
    },
    {
      ...P4, power: "cryo", title: "ENDLESS WINTER", guard: 0.8, regen: 1.2,
      blurb: "A crown of icicles and a blizzard that never stops. Eternal Stop freezes the whole arena for longer than any Time Stop.",
      body: "hsl(200 70% 94%)", glow: "hsl(190 100% 96%)", a: "hsl(200 90% 68%)", b: "hsl(0 0% 100%)",
      moves: [
        M({ id: "eternal-stop", name: "Eternal Stop", kind: "burst", anim: "raise", range: 2000, cd: 15, dmg: 10, radius: 60, world: true, status: "freeze", statusDur: 2.4, wind: 0.55, rec: 0.2 }),
        M({ id: "absolute-winter", name: "Absolute Winter", kind: "zone", anim: "slam", range: 400, cd: 9, dmg: 7, radius: 190, dur: 5, pullIn: 120, status: "slow", statusDur: 0.8, wind: 0.36 }),
      ],
    },
  ],
  riftmaker: [
    {
      ...P2, power: "psy", title: "FRACTURED SELF", dodge: 0.15,
      blurb: "Two mirror copies split off it and sway at its sides. It slips some hits, and its mirror shards fly in a wide fan.",
      body: "hsl(262 36% 18%)", glow: "hsl(318 100% 76%)", a: "hsl(318 90% 58%)", b: "hsl(186 100% 80%)",
      moves: [
        M({ id: "kaleidoscope", name: "Kaleidoscope", kind: "projectile", anim: "cast", range: 600, minRange: 80, cd: 3.4, dmg: 5, speed: 620, size: 9, count: 6, spread: 0.3, shape: "shard", status: "blind", statusDur: 0.5 }),
        M({ id: "mirror-step", name: "Mirror Step", kind: "blink", anim: "kick", range: 500, minRange: 120, cd: 4, dmg: 12, kb: 280, status: "blind", statusDur: 0.5 }),
      ],
    },
    {
      ...P3, power: "psy", title: "TORN SKY", drain: 0.12,
      blurb: "The tear behind it opens into a ring of open space full of stars, and two more eyes open on its brow. Stars fall through the ring, and every hit it lands takes a little health back.",
      body: "hsl(250 50% 10%)", glow: "hsl(186 100% 80%)", a: "hsl(252 70% 30%)", b: "hsl(318 100% 80%)",
      moves: [
        M({ id: "gravity-fold", name: "Gravity Fold", kind: "pull", anim: "cast", range: 480, minRange: 110, cd: 4.5, dmg: 10, status: "blind", statusDur: 0.6, wind: 0.24 }),
        M({ id: "falling-sky", name: "Falling Sky", kind: "rain", anim: "raise", range: 560, cd: 6, dmg: 8, count: 8, radius: 190, size: 11, shape: "shard", wind: 0.36, rec: 0.3 }),
      ],
    },
    {
      ...P4, power: "psy", title: "THE UNWRITTEN", guard: 0.8, regen: 1.2,
      blurb: "Reality stops holding it together: its body glitches into slices and a turning cube of broken space frames it. Rewrite blasts most of the arena.",
      body: "hsl(0 0% 96%)", glow: "hsl(318 100% 70%)", a: "hsl(186 100% 56%)", b: "hsl(318 100% 72%)", dark: "hsl(262 70% 6%)",
      moves: [
        M({ id: "rewrite", name: "Rewrite", kind: "burst", anim: "raise", range: 480, cd: 12, dmg: 15, radius: 430, kb: 420, lift: -400, status: "blind", statusDur: 1.2, wind: 0.55, rec: 0.35 }),
        M({ id: "infinite-mirror", name: "Infinite Mirror", kind: "beam", anim: "cast", range: 640, minRange: 60, cd: 4, dmg: 18, act: 0.4, kb: 300, status: "blind", statusDur: 0.6, wind: 0.36 }),
      ],
    },
  ],
  hollow: [
    {
      ...P2, power: "umbra", title: "SOUL FEAST", drain: 0.1,
      blurb: "Green soul fire runs along the hem of its cloak and a chain of skulls hangs from its belt. It hurls its scythe, and every hit feeds it.",
      body: "hsl(168 18% 14%)", glow: "hsl(152 100% 68%)", a: "hsl(160 40% 18%)", b: "hsl(152 100% 72%)",
      moves: [
        M({ id: "reaver-throw", name: "Reaver Throw", kind: "projectile", anim: "spin", range: 600, minRange: 90, cd: 3.4, dmg: 11, speed: 520, size: 16, pierce: true, shape: "blade" }),
        M({ id: "ghost-march", name: "Ghost March", kind: "dash", anim: "lunge", range: 380, cd: 4, dmg: 12, dist: 380, act: 0.24, kb: 300, status: "slow", statusDur: 1 }),
      ],
    },
    {
      ...P3, power: "umbra", title: "THE DEAD COURT", guard: 0.85,
      blurb: "Two ghost knights of its fallen court rise at its sides. Bone Spires burst up through the floor in a row, and Banshee Wail blinds everyone near it.",
      body: "hsl(170 22% 10%)", glow: "hsl(140 90% 70%)", a: "hsl(44 30% 82%)", b: "hsl(152 100% 66%)",
      moves: [
        M({ id: "bone-spires", name: "Bone Spires", kind: "eruption", anim: "slam", range: 600, minRange: 40, cd: 6, dmg: 11, radius: 42, count: 5, lift: -560, status: "stun", statusDur: 0.3, wind: 0.36 }),
        M({ id: "banshee-wail", name: "Banshee Wail", kind: "burst", anim: "raise", range: 160, cd: 7, dmg: 12, radius: 200, kb: 360, lift: -240, status: "blind", statusDur: 1.4, wind: 0.34, rec: 0.36 }),
      ],
    },
    {
      ...P4, power: "umbra", title: "DEATH ITSELF", guard: 0.8, drain: 0.15,
      blurb: "Wings of bone and torn shadow open behind it and a ring of soul fire burns over its crown. Final Harvest reaps every enemy at once, and Requiem feeds it while they stand in it.",
      body: "hsl(160 30% 6%)", glow: "hsl(152 100% 74%)", a: "hsl(165 40% 10%)", b: "hsl(150 100% 76%)", dark: "hsl(170 40% 3%)",
      moves: [
        M({ id: "final-harvest", name: "Final Harvest", kind: "burst", anim: "raise", range: 2000, cd: 14, dmg: 13, heal: 9, harvest: true, wind: 0.55, rec: 0.3 }),
        M({ id: "requiem", name: "Requiem", kind: "zone", anim: "slam", range: 420, cd: 10, dmg: 7, radius: 190, dur: 5, pullIn: 160, heal: 3, status: "slow", statusDur: 0.6, wind: 0.4 }),
      ],
    },
  ],
  blacksun: [
    {
      ...P2, power: "lux", title: "CORONA STORM",
      blurb: "Three sunspots break off its disc and circle its body. It fires them in volleys and charges in a trail of fire.",
      body: "hsl(26 40% 14%)", glow: "hsl(40 100% 66%)", a: "hsl(24 100% 50%)", b: "hsl(48 100% 74%)",
      moves: [
        M({ id: "sunspot-volley", name: "Sunspot Volley", kind: "projectile", anim: "thrust", range: 580, minRange: 80, cd: 3, dmg: 5, speed: 560, size: 10, count: 5, spread: 0.26, shape: "orb", status: "burn", statusDur: 1.2 }),
        M({ id: "sunrush", name: "Sunrush", kind: "dash", anim: "lunge", range: 400, cd: 3.8, dmg: 13, dist: 400, act: 0.24, kb: 320, lift: -200, status: "burn", statusDur: 1.5 }),
      ],
    },
    {
      ...P3, power: "lux", title: "PENUMBRA", dodge: 0.15,
      blurb: "A ring of black flame circles the dead sun with a diamond of light running round its edge. Its rays turn dark and blind, and it slips some hits in the shade.",
      body: "hsl(250 30% 8%)", glow: "hsl(44 100% 70%)", a: "hsl(250 40% 10%)", b: "hsl(44 100% 72%)", dark: "hsl(250 40% 4%)",
      moves: [
        M({ id: "umbral-ray", name: "Umbral Ray", kind: "beam", anim: "cast", range: 560, minRange: 70, cd: 3.8, dmg: 16, act: 0.36, status: "blind", statusDur: 0.8, wind: 0.32 }),
        M({ id: "shadow-flare", name: "Shadow Flare", kind: "eruption", anim: "slam", range: 540, minRange: 50, cd: 5.5, dmg: 12, radius: 48, count: 3, lift: -620, status: "blind", statusDur: 0.6, wind: 0.36 }),
      ],
    },
    {
      ...P4, power: "lux", title: "SUPERNOVA", guard: 0.75, regen: 1.2,
      blurb: "The dead sun cracks open and white fire pours out of it, and its fists burn white. Supernova blasts most of the arena, and Endless Night blacks out the sky and leaves its enemies blind longer than Total Eclipse.",
      body: "hsl(40 100% 86%)", glow: "hsl(0 0% 100%)", a: "hsl(36 100% 56%)", b: "hsl(0 0% 100%)",
      moves: [
        M({ id: "supernova", name: "Supernova", kind: "burst", anim: "raise", range: 460, cd: 12, dmg: 15, radius: 440, kb: 420, lift: -480, status: "burn", statusDur: 3, wind: 0.55, rec: 0.35 }),
        M({ id: "endless-night", name: "Endless Night", kind: "burst", anim: "raise", range: 2000, cd: 15, dmg: 9, eclipse: true, status: "blind", statusDur: 4.5, wind: 0.55, rec: 0.3 }),
      ],
    },
  ],
  axiom: [
    {
      ...P2, power: "gravi", title: "NEBULA HEART", dodge: 0.12,
      blurb: "A nebula blooms in its chest and three small worlds fall into orbit round it. It throws planets, and its nebula veil blinds whoever stands in it.",
      body: "hsl(262 50% 16%)", glow: "hsl(300 100% 78%)", a: "hsl(290 80% 52%)", b: "hsl(200 100% 80%)",
      moves: [
        M({ id: "planet-toss", name: "Planet Toss", kind: "projectile", anim: "thrust", range: 620, minRange: 90, cd: 3.6, dmg: 14, speed: 380, size: 22, arc: true, shape: "rock", kb: 380, lift: -260, wind: 0.3 }),
        M({ id: "nebula-veil", name: "Nebula Veil", kind: "zone", anim: "raise", range: 400, cd: 9, dmg: 6, radius: 160, dur: 4.5, status: "blind", statusDur: 0.6, wind: 0.35 }),
      ],
    },
    {
      ...P3, power: "gravi", title: "GALAXY CROWN", drain: 0.12,
      blurb: "A crown of stars lights over its head and a second galaxy turns behind it. Superclusters fly in fans, and every hit it lands takes a little health back.",
      body: "hsl(230 60% 12%)", glow: "hsl(48 100% 80%)", a: "hsl(240 80% 40%)", b: "hsl(48 100% 82%)",
      moves: [
        M({ id: "supercluster", name: "Supercluster", kind: "projectile", anim: "cast", range: 600, minRange: 80, cd: 3, dmg: 6, speed: 600, size: 10, count: 6, spread: 0.26, shape: "orb" }),
        M({ id: "gravity-well", name: "Gravity Well", kind: "pull", anim: "cast", range: 500, minRange: 110, cd: 4.5, dmg: 11, status: "slow", statusDur: 1.2, wind: 0.26 }),
      ],
    },
    {
      ...P4, power: "gravi", title: "THE LAST LAW", guard: 0.78, regen: 1.3,
      blurb: "A black hole opens behind it and its body turns to open sky. Big Bang blasts most of the arena, and Heat Death puts out every star so its enemies swing blind.",
      body: "hsl(0 0% 3%)", glow: "hsl(0 0% 100%)", a: "hsl(272 90% 60%)", b: "hsl(48 100% 86%)", dark: "hsl(250 60% 3%)",
      moves: [
        M({ id: "big-bang", name: "Big Bang", kind: "burst", anim: "raise", range: 480, cd: 12, dmg: 16, radius: 440, kb: 440, lift: -460, wind: 0.55, rec: 0.35 }),
        M({ id: "heat-death", name: "Heat Death", kind: "burst", anim: "raise", range: 2000, cd: 15, dmg: 8, eclipse: true, status: "blind", statusDur: 4, wind: 0.55, rec: 0.3 }),
      ],
    },
  ],
};
