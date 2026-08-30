import Reveal from './Reveal'
import { NICK_TESTIMONIAL } from './testimonial'

type FramedClientVoiceProps = {
  exactOriginMain?: boolean
  /** Slice of the approved testimony to render; defaults to the full wording. */
  paragraphs?: readonly string[]
}

/**
 * Renders the selected testimonial treatment in production.
 * The exact origin/main state keeps its historical label and single paragraph;
 * the default state applies the approved wording and optically balanced marks.
 * Callers pass the slice they carry, because the two approved paragraphs are
 * split between the homepage and About so no sentence appears on both.
 *
 * It carries no `.eng-plate`: the quote's own ruled aperture is its frame, and
 * the page's one human voice should not arrive in the same engraved case as
 * the outcome and engagement plates it now sits between.
 */
export default function FramedClientVoice({
  exactOriginMain = false,
  paragraphs = NICK_TESTIMONIAL.paragraphs,
}: FramedClientVoiceProps) {
  const eyebrow = exactOriginMain ? 'The time saved' : NICK_TESTIMONIAL.eyebrow
  const copy = exactOriginMain ? NICK_TESTIMONIAL.paragraphs.slice(0, 1) : paragraphs
  const showQuotationMarks = !exactOriginMain

  return (
    <Reveal className="eng-client-frame" delay={0}>
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
            {copy.map((paragraph) => (
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
            <img
              src="/images/testimonial/nick-brookes.png"
              alt={NICK_TESTIMONIAL.name}
              width={58}
              height={58}
              loading="lazy"
              decoding="async"
            />
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
