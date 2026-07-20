'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useState, type CSSProperties } from 'react'
import clsx from 'clsx'

// Load the three.js scene on the client only, after first paint. The library
// stays inside this route's async chunk, so no other design pays for WebGL.
const EvidenceScene = dynamic(() => import('./Scene'), { ssr: false })

/** Inline delay helper for the hero's staggered load choreography. */
const loadDelay = (ms: number) => ({ '--load-delay': `${ms}ms` }) as CSSProperties

/**
 * Hero for The Evidence Engine.
 *
 * Layers, bottom to top: a designed static fallback (instant first paint),
 * the WebGL scene (cross-fades in when its first frame renders), a contrast
 * scrim, then the DOM headline block and the mono stat strip.
 */
export default function Hero() {
  const [sceneReady, setSceneReady] = useState(false)

  return (
    <section className="eng-hero" id="top">
      {/* Static fallback: obsidian vignette + a faint SVG echo of the gate
          and the account constellation it assembles. Visible for the first
          few hundred milliseconds, then the live scene fades in over it —
          first paint never waits on WebGL. */}
      <div className="eng-hero-fallback" aria-hidden="true">
        <svg className="eng-fallback-wide" viewBox="0 0 1440 900" preserveAspectRatio="xMidYMid slice">
          <circle cx="905" cy="395" r="138" fill="none" stroke="#d4a94e" strokeOpacity="0.28" strokeWidth="1" />
          <circle cx="905" cy="395" r="121" fill="none" stroke="#d4a94e" strokeOpacity="0.12" strokeWidth="1" />
          <line x1="0" y1="395" x2="1440" y2="395" stroke="url(#eng-fallback-line)" strokeWidth="1" />
          {/* Constellation echo: hub ring, three spokes, one crimson hop */}
          <line x1="1112" y1="422" x2="1188" y2="365" stroke="#d4a94e" strokeOpacity="0.22" strokeWidth="1" />
          <line x1="1114" y1="436" x2="1216" y2="474" stroke="#d4a94e" strokeOpacity="0.22" strokeWidth="1" />
          <line x1="1104" y1="443" x2="1146" y2="530" stroke="#b3231f" strokeOpacity="0.3" strokeWidth="1" />
          <circle cx="1100" cy="430" r="14" fill="none" stroke="#f0d491" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="1198" cy="357" r="10" fill="none" stroke="#d4a94e" strokeOpacity="0.32" strokeWidth="1" />
          <circle cx="1227" cy="478" r="10" fill="none" stroke="#d4a94e" strokeOpacity="0.32" strokeWidth="1" />
          <circle cx="1151" cy="540" r="9" fill="none" stroke="#b3231f" strokeOpacity="0.38" strokeWidth="1" />
          <defs>
            <linearGradient id="eng-fallback-line" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#d4a94e" stopOpacity="0" />
              <stop offset="0.63" stopColor="#d4a94e" stopOpacity="0.35" />
              <stop offset="1" stopColor="#d4a94e" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
        {/* Match the compact scene's aspect-aware projection. A 900 × 1080
            coordinate system, slice-cropped by the browser, places the gate at
            40% on a tall tablet and 31% on a 390 × 900 phone, exactly like the
            compact camera rather than leaving the fallback clipped at the far
            right during the WebGL cross-fade. */}
        <svg className="eng-fallback-compact" viewBox="0 0 900 1080" preserveAspectRatio="xMidYMid slice">
          <ellipse
            cx="362"
            cy="503"
            rx="17"
            ry="187"
            fill="none"
            stroke="#d4a94e"
            strokeOpacity="0.28"
            strokeWidth="1"
          />
          <ellipse
            cx="362"
            cy="503"
            rx="14"
            ry="169"
            fill="none"
            stroke="#d4a94e"
            strokeOpacity="0.12"
            strokeWidth="1"
          />
          <line x1="0" y1="503" x2="900" y2="503" stroke="url(#eng-fallback-line-compact)" strokeWidth="1" />
          {/* Five-node compact constellation echo, including the crimson hop. */}
          <line x1="499" y1="478" x2="420" y2="329" stroke="#d4a94e" strokeOpacity="0.22" strokeWidth="1" />
          <line x1="499" y1="478" x2="596" y2="346" stroke="#d4a94e" strokeOpacity="0.22" strokeWidth="1" />
          <line x1="499" y1="478" x2="454" y2="583" stroke="#b3231f" strokeOpacity="0.3" strokeWidth="1" />
          <line x1="420" y1="329" x2="547" y2="211" stroke="#d4a94e" strokeOpacity="0.22" strokeWidth="1" />
          <circle cx="499" cy="478" r="14" fill="none" stroke="#f0d491" strokeOpacity="0.4" strokeWidth="1" />
          <circle cx="420" cy="329" r="10" fill="none" stroke="#d4a94e" strokeOpacity="0.32" strokeWidth="1" />
          <circle cx="596" cy="346" r="10" fill="none" stroke="#d4a94e" strokeOpacity="0.32" strokeWidth="1" />
          <circle cx="547" cy="211" r="9" fill="none" stroke="#d4a94e" strokeOpacity="0.32" strokeWidth="1" />
          <circle cx="454" cy="583" r="9" fill="none" stroke="#b3231f" strokeOpacity="0.38" strokeWidth="1" />
          <defs>
            <linearGradient id="eng-fallback-line-compact" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#d4a94e" stopOpacity="0" />
              <stop offset="0.4" stopColor="#d4a94e" stopOpacity="0.35" />
              <stop offset="1" stopColor="#d4a94e" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Live WebGL layer — opacity transition handled in engine.css */}
      <div className={clsx('eng-scene-layer', sceneReady && 'is-ready')}>
        <EvidenceScene onReady={() => setSceneReady(true)} />
      </div>

      {/* Scrim guarantees headline contrast over the brightest scene moments */}
      <div className="eng-hero-scrim" aria-hidden="true" />

      {/* Headline block, lower left, clear of the gate on desktop */}
      <div className="eng-container eng-hero-inner">
        <p className="eng-kicker eng-load" style={loadDelay(100)}>
          <span className="eng-hero-copy-wide">Forensic financial analysis for legal teams</span>
          <span className="eng-hero-copy-mobile">Forensic analysis for legal teams</span>
        </p>
        <h1 className="eng-display eng-load" style={loadDelay(220)}>
          The evidence <span className="eng-gold-text">engine</span>.
        </h1>
        <p className="eng-lede eng-load" style={loadDelay(360)}>
          <span className="eng-hero-copy-wide">
            FinTrace turns thousands of pages of bank statements — any bank, any format, scanned or born-digital — into
            structured, source-linked evidence that stands up in court.
          </span>
          <span className="eng-hero-copy-mobile">
            FinTrace turns thousands of bank-statement pages into structured, source-linked evidence, ready for legal
            review.
          </span>
        </p>
        <div className="eng-hero-ctas eng-load" style={loadDelay(500)}>
          <Link className="eng-btn-gold" href="/contact/">
            Request a matter assessment
          </Link>
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
        <span>Decades of statements</span>
        <span className="eng-strip-div" aria-hidden="true" />
        <span>Any bank, any currency</span>
        <span className="eng-strip-div" aria-hidden="true" />
        <span>One ledger</span>
      </div>
    </section>
  )
}
