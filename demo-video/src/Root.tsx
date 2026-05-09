import React from "react";
import { Composition } from "remotion";
import { Demo, TOTAL_FRAMES } from "./Demo";

export function RemotionRoot() {
  return (
    <>
      {/* Main demo — 1920×1080, 30fps */}
      <Composition
        id="Demo"
        component={Demo}
        durationInFrames={TOTAL_FRAMES}
        fps={30}
        width={1920}
        height={1080}
      />
    </>
  );
}
