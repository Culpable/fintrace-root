/**
 * Optional DNS override for hosted checks.
 *
 * Set `HOSTED_HOST_IP` to `hostname=address` to make this process resolve that
 * one hostname itself. It exists because a freshly created record can sit
 * behind a stale negative entry in the local resolver's cache for the zone's
 * SOA minimum, long after public resolvers answer correctly. It changes nothing
 * about the hosted behaviour under test, and every check that uses it is
 * re-run without it before the result is treated as final.
 */
import dns from 'node:dns'

const raw = process.env.HOSTED_HOST_IP
export const hostOverride = raw ? { host: raw.split('=')[0], address: raw.split('=')[1] } : null

if (hostOverride) {
  // Node's fetch resolves through `dns.lookup`, so one override covers it and
  // every other socket this process opens.
  const originalLookup = dns.lookup.bind(dns)
  const family = hostOverride.address.includes(':') ? 6 : 4
  dns.lookup = (hostname, options, callback) => {
    const done = typeof options === 'function' ? options : callback
    const settings = typeof options === 'function' ? {} : (options ?? {})
    if (hostname !== hostOverride.host) return originalLookup(hostname, options, callback)
    if (typeof settings === 'object' && settings.all) {
      return done(null, [{ address: hostOverride.address, family }])
    }
    return done(null, hostOverride.address, family)
  }
}

/** Chromium launch arguments that apply the same override, if one is set. */
export function browserResolverArguments() {
  return hostOverride ? [`--host-resolver-rules=MAP ${hostOverride.host} ${hostOverride.address}`] : []
}
