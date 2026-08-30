import clsx from 'clsx'
import Reveal from './Reveal'
import { NICK_TESTIMONIAL } from './testimonial'

export type ClientVoicePosition = 'left' | 'right' | 'footer'

type ClientVoiceProps = {
  delay?: number
  position?: ClientVoicePosition
  /** Slice of the approved testimony to render; defaults to the full wording. */
  paragraphs?: readonly string[]
  /**
   * Set when the voice owns its own page section. The section's own rule and
   * block padding then carry the separation, so the surface drops its stacked
   * top margin and hairlines instead of stacking three rules within a few rems.
   */
  solo?: boolean
}

export default function ClientVoice({
  delay = 120,
  position = 'left',
  paragraphs = NICK_TESTIMONIAL.paragraphs,
  solo = false,
}: ClientVoiceProps) {
  return (
    <Reveal
      as="figure"
      className={clsx('eng-client-voice', `eng-client-voice-${position}`, solo && 'eng-client-voice-solo')}
      delay={delay}
    >
      <p className="eng-kicker eng-client-voice-kicker">{NICK_TESTIMONIAL.eyebrow}</p>
      <div className="eng-client-voice-meta">
        <span className="eng-client-voice-photo eng-client-voice-duo eng-client-voice-grain">
          {/* eslint-disable-next-line @next/next/no-img-element -- testimonial-only portrait on a static export */}
          <img
            src="/images/testimonial/nick-brookes.png"
            alt={NICK_TESTIMONIAL.name}
            width={84}
            height={84}
            loading="lazy"
            decoding="async"
          />
        </span>
        <figcaption className="eng-client-voice-attribution">
          <span className="eng-client-voice-name">{NICK_TESTIMONIAL.name}</span>
          <span className="eng-client-voice-role">{NICK_TESTIMONIAL.role}</span>
        </figcaption>
      </div>
      <blockquote className="eng-client-voice-quote">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </blockquote>
    </Reveal>
  )
}
