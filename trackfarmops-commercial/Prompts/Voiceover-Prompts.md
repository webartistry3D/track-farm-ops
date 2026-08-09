# TRACKFARMOPS — VOICEOVER PROMPTS
"The Land Remembers" — AI Scratch Voiceover Generation

These prompts generate scratch/temp voiceover tracks for use in offline edit and pre-visualization, per `06-Sound-Bible.md` §2 and `07-Production-Workflow.md` §3.1. **Scratch VO only** — final delivery must use professional voice talent per the casting direction in Sound Bible §2.2.

Use with any high-quality text-to-speech model capable of expressive/emotional direction (e.g., ElevenLabs, Google's expressive TTS, or similar). Where the tool supports a text prompt/direction field separate from the script line, use the "Direction" field below; otherwise prepend the direction as a bracketed note before the line and strip it in post.

---

## 1. VOICE PROFILE SETUP

```
Voice profile: Male, age 50-65, West African/Nigerian-accented English. Warm, weathered, authoritative but never theatrical. Conversational gravitas — think a respected village elder or a trusted advisor, not a movie-trailer announcer. Natural pacing with long, deliberate pauses. Slight rasp acceptable, no vocal fry or artificial deepening.
```

---

## 2. ACT 1 LINES — "WEATHERED" REGISTER

**Direction:** Slow, low, world-worn. Long pauses between phrases. Sounds like a man remembering hardship, not narrating it from a script.

```
Line: "Before the tractors. Before the satellites... there was guesswork."
Direction: Very slow, spacious delivery. Emphasize "guesswork" with a slight downward inflection, like setting down something heavy.
```

```
Line: "Guessing the rain. Guessing the yield. Guessing what tomorrow would take from us."
Direction: Each "guessing" said with slightly rising weariness, building tension across the three clauses. Slight quickening pace compared to the opening line, but still deliberate.
```

```
Line: "Because farming has always carried the weight of the unknown. And the harvest that could feed a continent has waited long enough."
Direction: This is the emotional low point of the VO — deliver with quiet conviction, not sadness. Slow down further on "has waited long enough," landing each word distinctly.
```

---

## 3. ACT 2 LINES — "RESOLUTE" REGISTER (PIVOT)

**Direction:** The pivot moment. Should feel like the same man taking a breath and standing up straighter — same performer, shifting register, not a new voice.

```
Line: "Until now."
Direction: Short, clean, almost a released breath. Leave a full second of silence before and after this line when assembling the scratch track. This is the most important line reading in the entire film — do not rush it.
```

```
Line: "Know exactly what every harvest earns. What every season costs. Down to the coin."
Direction: Clear, confident, warm — informational but not clinical. Slight emphasis on "down to the coin" as a satisfying, precise landing.
```

```
Line: "Nothing disappears. Nothing is miscounted. Everything is where it should be."
Direction: Steady rhythmic delivery, each "Nothing..." building slight confidence, "Everything is where it should be" delivered with quiet reassurance.
```

```
Line: "Nothing sits forgotten. Every machine, every acre — working, accounted for, alive."
Direction: Warmer and slightly more energized than the previous line — this is the midpoint of Act 2's confidence build. Slight rise in pitch on "alive."
```

```
Line: "Nothing is left to chance. Every life on this farm — watched over, protected."
Direction: Softer, more caring tone than prior lines — this beat is about living things (livestock), so warmth should outweigh confidence here.
```

```
Line: "And when everything finally speaks as one — you don't just see a farm. You see its future, before it happens. Owners. Managers. Vets. Investors. Everyone, on one truth."
Direction: Building energy and pitch throughout, matching the musical swell (Sound Bible §1.2). The list "Owners. Managers. Vets. Investors." should be delivered with a distinct staccato rhythm, each word its own clean beat. "Everyone, on one truth" is the peak — deliver with full confidence and warmth, the emotional high point of the VO's arc so far.
```

---

## 4. ACT 3 LINES — RESOLVED REGISTER (FULL CIRCLE)

**Direction:** Slows back down, becomes intimate and quiet again — full circle back to the Act 1 register, but resolved rather than weary.

```
Line: "This is not software. This is clarity. This is Africa's land, finally speaking with clarity."
Direction: Measured, building emotion but restrained — avoid over-selling. Slight emphasis on repeated "clarity" both times, second instance slightly warmer/fuller than the first.
```

```
Line: "The land remembers who feeds it. Now, it finally has a voice."
Direction: Quiet, powerful, unhurried. This should feel like the emotional twin of the Act 1 opening line — same register of intimacy, but resolved rather than heavy. Longest pause of the entire VO track before this line.
```

```
Line: "TrackFarmOps. Every acre. Every asset. Every decision."
Direction: Clean, warm, unhurried final tagline delivery — the closing handshake, not a hard sell. Each "Every ___" given equal, confident weight, slight rhythmic cadence like a closing statement rather than a list.
```

---

## 5. FULL CONTINUOUS SCRATCH TRACK PROMPT

For tools that accept a full-script single generation with inline direction tags:

```
[Slow, weathered, low West African-accented male voice, long pauses] Before the tractors. Before the satellites... there was guesswork.
[same weathered tone, slightly quickening] Guessing the rain. Guessing the yield. Guessing what tomorrow would take from us.
[weathered, quiet conviction, slowing down] Because farming has always carried the weight of the unknown. And the harvest that could feed a continent has waited long enough.
[pivot: short, clean, like a released breath] Until now.
[clear, confident, warm] Know exactly what every harvest earns. What every season costs. Down to the coin.
[steady, rhythmic, reassuring] Nothing disappears. Nothing is miscounted. Everything is where it should be.
[warmer, slightly more energized] Nothing sits forgotten. Every machine, every acre — working, accounted for, alive.
[softer, caring] Nothing is left to chance. Every life on this farm — watched over, protected.
[building energy and pitch, staccato on list] And when everything finally speaks as one — you don't just see a farm. You see its future, before it happens. Owners. Managers. Vets. Investors. Everyone, on one truth.
[measured, restrained emotion] This is not software. This is clarity. This is Africa's land, finally speaking with clarity.
[quiet, powerful, unhurried, longest pause before this line] The land remembers who feeds it. Now, it finally has a voice.
[clean, warm, unhurried, confident closing cadence] TrackFarmOps. Every acre. Every asset. Every decision.
```

---

## 6. USAGE NOTES

- Generate the scratch track using §5's full continuous prompt first for offline edit timing purposes (`07-Production-Workflow.md` §3.1).
- Re-generate individual lines from §2–§4 in isolation if any segment needs finer control over pacing/emotion for a specific edit point.
- Scratch VO timing must be re-validated against the two critical silences (00:23–00:25 and 01:28–01:30, per `06-Sound-Bible.md` §2.3) — insert manual silence padding in the edit if the TTS output doesn't naturally leave enough space.
- When briefing the final human voice talent, play them this scratch track as a pacing/emotional reference alongside the written direction — it is faster than describing the arc verbally and ensures the talent understands the full-circle structural device (Act 1 weathered → Act 2 resolute → Act 3 resolved-weathered).
