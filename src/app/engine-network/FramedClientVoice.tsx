import Reveal from './Reveal'
import { NICK_TESTIMONIAL } from './testimonial'

type FramedClientVoiceProps = {
  exactOriginMain?: boolean
}

/**
 * Renders the selected engraved-plate testimonial treatment in production.
 * The exact origin/main state keeps its historical label and single paragraph;
 * the default state applies the approved wording and optically balanced marks.
 */
export default function FramedClientVoice({ exactOriginMain = false }: FramedClientVoiceProps) {
  const eyebrow = exactOriginMain ? 'The time saved' : NICK_TESTIMONIAL.eyebrow
  const paragraphs = exactOriginMain ? NICK_TESTIMONIAL.paragraphs.slice(0, 1) : NICK_TESTIMONIAL.paragraphs
  const showQuotationMarks = !exactOriginMain

  return (
    <Reveal className="eng-plate eng-client-frame" delay={0}>
      <div className={showQuotationMarks ? 'eng-client-frame-wrap eng-client-frame-final' : 'eng-client-frame-wrap'}>
        <p className="eng-kicker">{eyebrow}</p>
        {showQuotationMarks ? null : <div className="eng-client-frame-tick" aria-hidden="true" />}
        <blockquote className="eng-client-frame-quote">
          {showQuotationMarks ? (
            <span className="eng-client-frame-mark eng-client-frame-mark-open" aria-hidden="true">
              “
            </span>
          ) : null}
          <div className="eng-client-frame-copy">
            {paragraphs.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          {showQuotationMarks ? (
            <span className="eng-client-frame-mark eng-client-frame-mark-close" aria-hidden="true">
              ”
            </span>
          ) : null}
        </blockquote>
        <div className="eng-client-frame-rule" aria-hidden="true" />
        <div className="eng-client-frame-attribution">
          <span className="eng-client-frame-photo eng-client-voice-duo eng-client-voice-grain">
            {/* eslint-disable-next-line @next/next/no-img-element -- exact testimonial-only origin/main treatment */}
            <img src="/images/testimonial/nick-brookes.png" alt={NICK_TESTIMONIAL.name} width={58} height={58} />
          </span>
          <span>
            <span className="eng-client-frame-name">{NICK_TESTIMONIAL.name}</span>
            <span className="eng-client-frame-role">{NICK_TESTIMONIAL.role}</span>
          </span>
        </div>
      </div>
    </Reveal>
  )
}
