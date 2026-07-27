/**
 * Human Cycles — Galactic Meaning Module
 *
 * The interpretive layer for the Dreamspell count: the action/essence/power
 * triplet carried by each of the twenty solar seals, the function and creative
 * question of each of the thirteen galactic tones, and the temperament of the
 * four colour families.
 *
 * This is a LOCAL data module by deliberate choice. No stable free public API
 * publishes this correspondence set — the available calculators are HTML-only
 * with no documented JSON endpoint, so depending on one would make the calendar
 * fragile and slow for data that is small, fixed, and offline-friendly.
 *
 * Provenance: the seal and tone correspondences are the standard Dreamspell
 * set from Argüelles' published affirmations. They are a modern twentieth-
 * century system — see the note surfaced in the UI — not ancient Maya
 * testimony.
 */

export interface SealMeaning {
  /** What the seal does — its verb, third person ("Loves"). */
  action: string;
  /** The same verb in first person, for affirmations ("love"). */
  verb: string;
  /** What the seal is — its quality of being. */
  essence: string;
  /** What the seal seals — its domain of power. */
  power: string;
  /** A short reflective gloss on the day's character. */
  gloss: string;
}

export interface ToneMeaning {
  /** The tone's creative function — its verb, third person ("Pulses"). */
  action: string;
  /** The same verb in first person, for affirmations ("pulse"). */
  verb: string;
  /** The gerund used in the affirmation's second clause ("Realizing"). */
  gerund: string;
  /** The creative power the tone carries. */
  power: string;
  /** The question the tone poses to the day. */
  question: string;
}

export interface ColorMeaning {
  /** The colour family's movement in the wavespell. */
  movement: string;
  /** Its temperament. */
  temperament: string;
}

/** Indexed by seal number 1–20. */
export const SEAL_MEANINGS: Record<number, SealMeaning> = {
  1: {
    action: "Nurtures",
    verb: "nurture",
    essence: "Being",
    power: "Birth",
    gloss: "The source opens. Trust what is beginning before it can justify itself.",
  },
  2: {
    action: "Communicates",
    verb: "communicate",
    essence: "Breath",
    power: "Spirit",
    gloss: "Spirit moves as breath and speech. What wants to be said through you today?",
  },
  3: {
    action: "Dreams",
    verb: "dream",
    essence: "Intuition",
    power: "Abundance",
    gloss: "The interior night is fertile. Abundance is gestated in the dark, not seized in the light.",
  },
  4: {
    action: "Targets",
    verb: "target",
    essence: "Awareness",
    power: "Flowering",
    gloss: "A seed is a decision made in advance. Aim, then let the ground do its work.",
  },
  5: {
    action: "Survives",
    verb: "survive",
    essence: "Instinct",
    power: "Life Force",
    gloss: "The body knows first. Let vitality and instinct lead where thinking stalls.",
  },
  6: {
    action: "Equalizes",
    verb: "equalize",
    essence: "Opportunity",
    power: "Death",
    gloss: "Every crossing requires a release. Bridge two worlds by letting one end.",
  },
  7: {
    action: "Knows",
    verb: "know",
    essence: "Healing",
    power: "Accomplishment",
    gloss: "Knowledge becomes healing only when it is enacted. Close what is open.",
  },
  8: {
    action: "Beautifies",
    verb: "beautify",
    essence: "Art",
    power: "Elegance",
    gloss: "Elegance is not decoration but exactness. Make the form worthy of the content.",
  },
  9: {
    action: "Purifies",
    verb: "purify",
    essence: "Flow",
    power: "Universal Water",
    gloss: "Water clarifies by moving. Let feeling run rather than pool.",
  },
  10: {
    action: "Loves",
    verb: "love",
    essence: "Loyalty",
    power: "Heart",
    gloss: "Fidelity is a practice, not a feeling. Stay with what you have committed to.",
  },
  11: {
    action: "Plays",
    verb: "play",
    essence: "Illusion",
    power: "Magic",
    gloss: "Play dissolves what force cannot. Take the serious thing lightly and watch it move.",
  },
  12: {
    action: "Influences",
    verb: "influence",
    essence: "Wisdom",
    power: "Free Will",
    gloss: "Wisdom is free will exercised well. Choose deliberately; influence follows.",
  },
  13: {
    action: "Explores",
    verb: "explore",
    essence: "Wakefulness",
    power: "Space",
    gloss: "Cross the threshold you have been circling. Space opens only to those who enter it.",
  },
  14: {
    action: "Enchants",
    verb: "enchant",
    essence: "Receptivity",
    power: "Timelessness",
    gloss: "Receptivity is its own power. Hold the space and let timing reveal itself.",
  },
  15: {
    action: "Creates",
    verb: "create",
    essence: "Mind",
    power: "Vision",
    gloss: "Altitude changes everything. See the whole pattern before committing to a move.",
  },
  16: {
    action: "Questions",
    verb: "question",
    essence: "Fearlessness",
    power: "Intelligence",
    gloss: "Intelligence begins with a fearless question. Ask the one you have been avoiding.",
  },
  17: {
    action: "Evolves",
    verb: "evolve",
    essence: "Synchronicity",
    power: "Navigation",
    gloss: "Follow the signal, not the plan. Coincidence is navigational data.",
  },
  18: {
    action: "Reflects",
    verb: "reflect",
    essence: "Order",
    power: "Endlessness",
    gloss: "The mirror shows without commentary. See the situation as it is, not as it flatters.",
  },
  19: {
    action: "Catalyzes",
    verb: "catalyze",
    essence: "Energy",
    power: "Self-Generation",
    gloss: "Storms rearrange what stagnation preserved. Let the disruption finish its work.",
  },
  20: {
    action: "Enlightens",
    verb: "enlighten",
    essence: "Life",
    power: "Universal Fire",
    gloss: "Completion is its own illumination. Let the cycle end fully so the next can begin.",
  },
};

/** Indexed by tone number 1–13. */
export const TONE_MEANINGS: Record<number, ToneMeaning> = {
  1: { action: "Unifies", verb: "unify", gerund: "Unifying", power: "Attraction", question: "What is my purpose?" },
  2: { action: "Polarizes", verb: "polarize", gerund: "Polarizing", power: "Stabilization", question: "What is my challenge?" },
  3: { action: "Activates", verb: "activate", gerund: "Activating", power: "Service", question: "How can I best serve?" },
  4: { action: "Defines", verb: "define", gerund: "Defining", power: "Form", question: "What form will this take?" },
  5: { action: "Empowers", verb: "empower", gerund: "Empowering", power: "Radiance", question: "How can I best empower myself?" },
  6: { action: "Organizes", verb: "organize", gerund: "Organizing", power: "Equality", question: "How can I extend this to others?" },
  7: { action: "Channels", verb: "channel", gerund: "Channeling", power: "Attunement", question: "How can I attune myself to service?" },
  8: { action: "Harmonizes", verb: "harmonize", gerund: "Modeling", power: "Integrity", question: "Do I live what I believe?" },
  9: { action: "Pulses", verb: "pulse", gerund: "Realizing", power: "Intention", question: "How do I realize my purpose?" },
  10: { action: "Perfects", verb: "perfect", gerund: "Producing", power: "Manifestation", question: "How do I make this real?" },
  11: { action: "Dissolves", verb: "dissolve", gerund: "Releasing", power: "Liberation", question: "How do I release what binds me?" },
  12: { action: "Dedicates", verb: "dedicate", gerund: "Universalizing", power: "Cooperation", question: "How can I dedicate this to all?" },
  13: { action: "Endures", verb: "endure", gerund: "Transcending", power: "Presence", question: "How can I be fully present?" },
};

/** Indexed by colour family name. */
export const COLOR_MEANINGS: Record<string, ColorMeaning> = {
  Red: { movement: "Initiates", temperament: "Beginning — the impulse that starts the cycle" },
  White: { movement: "Refines", temperament: "Purification — the sifting that clarifies" },
  Blue: { movement: "Transforms", temperament: "Transmutation — the turn that changes shape" },
  Yellow: { movement: "Ripens", temperament: "Maturation — the harvest that completes" },
};

/**
 * Compose the full affirmation for a kin in the traditional Dreamspell form:
 *
 *   I {tone verb} in order to {seal verb}
 *   {Tone gerund} {seal essence}, I seal the process of {seal power}
 *   with the {tone} tone of {tone power}
 *   I am guided by the power of {guide seal's power}
 *
 * Matches the published form exactly. Verified against the Kin 229 year-bearer
 * affirmation: "I harmonize in order to purify / Modeling flow / I seal the
 * process of universal water / with the galactic tone of integrity / I am
 * guided by the power of space." Note the closing clause names the *power* of
 * the guide seal (Skywalker → Space), not the seal's own name.
 *
 * `guideSealNumber` is the seal of the kin's *guide* kin, from
 * `sealOf(getOracle(kin).guide)`.
 */
export function affirmationFor(
  toneNumber: number,
  sealNumber: number,
  toneName: string,
  guideSealNumber: number,
): string {
  const tone = TONE_MEANINGS[toneNumber];
  const seal = SEAL_MEANINGS[sealNumber];
  const guidePower = SEAL_MEANINGS[guideSealNumber].power;
  return [
    `I ${tone.verb} in order to ${seal.verb}.`,
    `${tone.gerund} ${seal.essence.toLowerCase()}, I seal the process of ${seal.power.toLowerCase()}`,
    `with the ${toneName.toLowerCase()} tone of ${tone.power.toLowerCase()}.`,
    `I am guided by the power of ${guidePower.toLowerCase()}.`,
  ].join(" ");
}
