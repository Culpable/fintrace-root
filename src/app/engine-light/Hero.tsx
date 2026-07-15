'use client'

import dynamic from 'next/dynamic'
import { useState, type CSSProperties } from 'react'
import clsx from 'clsx'

// Load the three.js scene on the client only, after first paint. The library
// stays inside this route's async chunk, so no other design pays for WebGL.
const EvidenceScene = dynamic(() => import('./Scene'), { ssr: false })

/** Inline delay helper for the hero's staggered load choreography. */
const loadDelay = (ms: number) => ({ '--load-delay': `${ms}ms` }) as CSSProperties

/**
 * Hero for The Evidence Engine — Light.
 *
 * Layers, bottom to top: a designed static fallback (instant first paint),
 * the WebGL scene (cross-fades in when its first frame renders), a light
 * contrast scrim, then the DOM headline block and the mono stat strip.
 */
export default function Hero() {
  const [sceneReady, setSceneReady] = useState(false)

  return (
    <section className="eng-hero" id="top">
      {/* Static fallback: parchment field + a faint bronze SVG echo of the
          gate. Visible for the first few hundred milliseconds, then the live
          scene fades in over it — first paint never waits on WebGL. */}
      <div className="eng-hero-fallback" aria-hidden="true">
        <svg viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <circle cx="905" cy="430" r="150" fill="none" stroke="#8a6a24" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="905" cy="430" r="132" fill="none" stroke="#a07c2c" strokeOpacity="0.18" strokeWidth="1" />
          <line x1="0" y1="430" x2="1440" y2="430" stroke="url(#englight-fallback-line)" strokeWidth="1" />
          <defs>
            <linearGradient id="englight-fallback-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#8a6a24" stopOpacity="0" />
              <stop offset="0.63" stopColor="#8a6a24" stopOpacity="0.45" />
              <stop offset="1" stopColor="#8a6a24" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Live WebGL layer — opacity transition handled in engine-light.css */}
      <div className={clsx('eng-scene-layer', sceneReady && 'is-ready')}>
        <EvidenceScene onReady={() => setSceneReady(true)} />
      </div>

      {/* Scrim guarantees headline contrast over the brightest scene moments */}
      <div className="eng-hero-scrim" aria-hidden="true" />

      {/* Headline block, lower left, clear of the gate on desktop */}
      <div className="eng-container eng-hero-inner">
        <p className="eng-kicker eng-load" style={loadDelay(100)}>
          Forensic infrastructure for legal teams
        </p>
        <h1 className="eng-display eng-load" style={loadDelay(220)}>
          The evidence <span className="eng-gold-text">engine</span>.
        </h1>
        <p className="eng-lede eng-load" style={loadDelay(360)}>
          FinTrace turns thousands of pages of bank statements — any bank, any format, scanned or born-digital — into
          structured, source-linked evidence that stands up in court.
        </p>
        <div className="eng-hero-ctas eng-load" style={loadDelay(500)}>
          <a className="eng-btn-gold" href="mailto:hello@fintrace.com.au">
            Request a matter assessment
          </a>
          <a className="eng-btn-ghost" href="#process">
            See how the engine works
          </a>
        </div>
      </div>

      {/* Scroll cue: a golden filament that draws and releases */}
      <div className="eng-scroll-cue" aria-hidden="true" />

      {/* Mono stat strip anchoring the hero's bottom edge */}
      <div className="eng-hero-strip eng-load" style={loadDelay(680)}>
        <span>Thousands of pages</span>
        <span className="eng-strip-div" aria-hidden="true" />
        <span>≈50 accounts</span>
        <span className="eng-strip-div" aria-hidden="true" />
        <span>15 years of statements</span>
        <span className="eng-strip-div" aria-hidden="true" />
        <span>One ledger</span>
      </div>
    </section>
  )
}
