/**
 * Main Demo composition — assembles all scenes with Sequence + CrossFade.
 * Total duration: ~1440 frames = 48 seconds @ 30fps
 */
import React from "react";
import { Audio, Sequence, staticFile, useCurrentFrame, useVideoConfig, interpolate } from "remotion";
import { HeroScene }          from "./scenes/01-Hero";
import { UploadScene }        from "./scenes/02-Upload";
import { ScreeningKitScene }  from "./scenes/03-ScreeningKit";
import { PipelineScene }      from "./scenes/04-Pipeline";
import { BulkUploadScene }    from "./scenes/05-BulkUpload";
import { MarketIntelScene }   from "./scenes/06-MarketIntel";
import { CTAScene }           from "./scenes/07-CTA";
import { CrossFade, SceneLabel } from "./components/Transition";

// Scene durations in frames (30fps)
const SCENES = [
  { name: "01-Hero",         dur: 150 },   // 5s  — brand intro
  { name: "02-Upload",       dur: 240 },   // 8s  — upload + score
  { name: "03-ScreeningKit", dur: 240 },   // 8s  — screening kit
  { name: "04-Pipeline",     dur: 210 },   // 7s  — pipeline kanban
  { name: "05-BulkUpload",   dur: 210 },   // 7s  — bulk upload
  { name: "06-MarketIntel",  dur: 210 },   // 7s  — market intelligence
  { name: "07-CTA",          dur: 180 },   // 6s  — CTA / outro
] as const;

// Build cumulative start frames
function buildStarts() {
  const starts: number[] = [];
  let acc = 0;
  for (const s of SCENES) { starts.push(acc); acc += s.dur; }
  return starts;
}
const STARTS = buildStarts();
export const TOTAL_FRAMES = SCENES.reduce((a, s) => a + s.dur, 0);

const SCENE_LABELS: Record<string, { label: string; sub?: string }> = {
  "02-Upload":       { label: "Resume Upload & AI Scoring", sub: "Instant 0–100 fit score on upload" },
  "03-ScreeningKit": { label: "AI Screening Kit",           sub: "Pitch deck · Gap analysis · Tailored questions" },
  "04-Pipeline":     { label: "Pipeline Board",             sub: "Kanban view with stale alerts" },
  "05-BulkUpload":   { label: "Bulk Upload",                sub: "25 resumes screened in seconds" },
  "06-MarketIntel":  { label: "Market Intelligence",        sub: "Salary · Scarcity · Sourcing channels" },
};

function SceneWithLabel({
  name,
  dur,
  children,
}: {
  name: string;
  dur: number;
  children: React.ReactNode;
}) {
  const frame = useCurrentFrame();
  const label = SCENE_LABELS[name];
  return (
    <div style={{ width: "100%", height: "100%", position: "relative" }}>
      {children}
      {label && <SceneLabel frame={frame} label={label.label} sub={label.sub} />}
      <CrossFade frame={frame} totalFrames={dur} fadeDuration={16} />
    </div>
  );
}

export function Demo() {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Background music volume: fade in over first 30 frames, fade out over last 30 frames
  const bgVolume = interpolate(
    frame,
    [0, 30, durationInFrames - 30, durationInFrames],
    [0, 0.18, 0.18, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  // Voiceover volume: fade in over first 10 frames, fade out over last 20 frames
  const voVolume = interpolate(
    frame,
    [0, 10, durationInFrames - 20, durationInFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  return (
    <>
      {/* ── Audio tracks ── */}
      {/* Background music — runs the full duration at low volume */}
      <Audio src={staticFile("bgmusic.mp3")} volume={bgVolume} />
      {/* Voiceover — starts at frame 0, plays over everything */}
      <Audio src={staticFile("voiceover.mp3")} volume={voVolume} />

      <Sequence from={STARTS[0]} durationInFrames={SCENES[0].dur}>
        <SceneWithLabel name="01-Hero" dur={SCENES[0].dur}>
          <HeroScene />
        </SceneWithLabel>
      </Sequence>

      <Sequence from={STARTS[1]} durationInFrames={SCENES[1].dur}>
        <SceneWithLabel name="02-Upload" dur={SCENES[1].dur}>
          <UploadScene />
        </SceneWithLabel>
      </Sequence>

      <Sequence from={STARTS[2]} durationInFrames={SCENES[2].dur}>
        <SceneWithLabel name="03-ScreeningKit" dur={SCENES[2].dur}>
          <ScreeningKitScene />
        </SceneWithLabel>
      </Sequence>

      <Sequence from={STARTS[3]} durationInFrames={SCENES[3].dur}>
        <SceneWithLabel name="04-Pipeline" dur={SCENES[3].dur}>
          <PipelineScene />
        </SceneWithLabel>
      </Sequence>

      <Sequence from={STARTS[4]} durationInFrames={SCENES[4].dur}>
        <SceneWithLabel name="05-BulkUpload" dur={SCENES[4].dur}>
          <BulkUploadScene />
        </SceneWithLabel>
      </Sequence>

      <Sequence from={STARTS[5]} durationInFrames={SCENES[5].dur}>
        <SceneWithLabel name="06-MarketIntel" dur={SCENES[5].dur}>
          <MarketIntelScene />
        </SceneWithLabel>
      </Sequence>

      <Sequence from={STARTS[6]} durationInFrames={SCENES[6].dur}>
        <SceneWithLabel name="07-CTA" dur={SCENES[6].dur}>
          <CTAScene />
        </SceneWithLabel>
      </Sequence>
    </>
  );
}
