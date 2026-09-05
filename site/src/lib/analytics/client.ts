import {
  createAnalyticsCore,
  type AnalyticsEventInput,
  type AnalyticsQueuePersistence,
  type ValidatedAnalyticsEvent,
} from './core.ts'
import type { Config, OverridedMixpanel } from 'mixpanel-browser'

type BrowserAnalyticsEvent =
  | { name: 'Page Viewed'; path: string }
  | Omit<Extract<AnalyticsEventInput, { name: 'Assessment CTA Clicked' }>, 'path'>
  | Omit<Extract<AnalyticsEventInput, { name: 'Enquiry Started' }>, 'path'>
  | Omit<Extract<AnalyticsEventInput, { name: 'Enquiry Submitted' }>, 'path'>
  | Omit<Extract<AnalyticsEventInput, { name: 'Enquiry Submission Failed' }>, 'path'>

const MIXPANEL_PUBLIC_TOKEN = 'eb76617a49248a0cd7e6958ec234d01b'
const MIXPANEL_US_HOST = 'https://api-js.mixpanel.com'
const PROPERTY_BLACKLIST = [
  '$current_url',
  '$referrer',
  '$referring_domain',
  '$initial_referrer',
  '$initial_referring_domain',
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
  'utm_id',
  'utm_source_platform',
  'utm_campaign_id',
  'utm_creative_format',
  'utm_marketing_tactic',
  '$utm_source',
  '$utm_medium',
  '$utm_campaign',
  '$utm_content',
  '$utm_term',
  '$utm_id',
  '$utm_source_platform',
  '$utm_campaign_id',
  '$utm_creative_format',
  '$utm_marketing_tactic',
  'gclid',
  'fbclid',
  'msclkid',
  'dclid',
  'ko_click_id',
  'li_fat_id',
  'sccid',
  'ttclid',
  'twclid',
  'wbraid',
]

const MIXPANEL_CONFIG = {
  api_host: MIXPANEL_US_HOST,
  persistence: 'localStorage',
  autocapture: false,
  track_pageview: false,
  track_marketing: false,
  skip_first_touch_marketing: true,
  record_sessions_percent: 0,
  record_heatmap_data: false,
  flags: false,
  remote_settings_mode: 'disabled',
  ip: false,
  save_referrer: false,
  store_google: false,
  stop_utm_persistence: true,
  ignore_dnt: false,
  property_blacklist: PROPERTY_BLACKLIST,
} satisfies Partial<Config> & { track_marketing: boolean }

const QUEUE_STORAGE_KEY = 'fintrace-analytics-queue'
const QUEUE_LIMIT = 50
/**
 * Events that must survive the navigation they trigger. Mixpanel's default
 * XHR transport is cancelled when the document unloads, so a CTA click is
 * handed to `sendBeacon`, which the browser completes after the page is gone.
 */
const BEACON_EVENTS = new Set<ValidatedAnalyticsEvent['name']>(['Assessment CTA Clicked'])

/**
 * Carry the pre-adapter queue across a full page navigation.
 *
 * Every read clears the key, so a restored event is delivered exactly once.
 * Every method fails open: a browser with session storage blocked keeps the
 * in-memory behaviour rather than throwing into a caller.
 */
const sessionQueuePersistence: AnalyticsQueuePersistence = {
  load() {
    try {
      const raw = window.sessionStorage.getItem(QUEUE_STORAGE_KEY)
      window.sessionStorage.removeItem(QUEUE_STORAGE_KEY)
      if (!raw) return []
      const parsed: unknown = JSON.parse(raw)
      if (!Array.isArray(parsed)) return []
      return parsed.filter(
        (entry): entry is ValidatedAnalyticsEvent =>
          Boolean(entry) &&
          typeof entry === 'object' &&
          typeof (entry as ValidatedAnalyticsEvent).name === 'string' &&
          Boolean((entry as ValidatedAnalyticsEvent).properties),
      )
    } catch {
      return []
    }
  },
  save(queue) {
    try {
      if (queue.length === 0) {
        window.sessionStorage.removeItem(QUEUE_STORAGE_KEY)
        return
      }
      window.sessionStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue.slice(-QUEUE_LIMIT)))
    } catch {
      // Storage is full, disabled or partitioned. Keep the in-memory queue.
    }
  },
}

const analytics = createAnalyticsCore({
  environment: import.meta.env.PROD ? 'production' : 'development',
  queueLimit: QUEUE_LIMIT,
  persistence: typeof window === 'undefined' ? undefined : sessionQueuePersistence,
  loadAdapter: async () => {
    // Load the core-only entry after hydration so recorder code never enters the active client graph.
    const mixpanelModule = await import('mixpanel-browser/src/loaders/loader-module-core')
    // Narrow the documented runtime default because the vendor's core-loader declaration omits its default export.
    const mixpanel = mixpanelModule.default as unknown as OverridedMixpanel

    return {
      initialise() {
        mixpanel.init(MIXPANEL_PUBLIC_TOKEN, MIXPANEL_CONFIG)
      },
      track(event: ValidatedAnalyticsEvent) {
        mixpanel.track(
          event.name,
          event.properties,
          BEACON_EVENTS.has(event.name) ? { transport: 'sendBeacon' } : undefined,
        )
      },
    }
  },
})

export function initialiseAnalytics() {
  analytics.initialiseAnalytics()
}

export function trackAnalytics(event: BrowserAnalyticsEvent) {
  if (typeof window === 'undefined') {
    return
  }

  analytics.trackAnalytics({
    ...event,
    path: event.name === 'Page Viewed' ? event.path : window.location.pathname,
  })
}
