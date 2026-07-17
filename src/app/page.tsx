import type { Metadata } from 'next'
import EngineNetworkPage from './engine-network/EngineNetworkPage'

export const metadata: Metadata = {
  title: 'FinTrace — Forensic financial analysis for legal matters',
  description:
    'FinTrace turns bulk bank statements into a structured transaction ledger and source-linked findings for legal matters.',
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
}

export default function HomePage() {
  return <EngineNetworkPage showDesignLabLink={false} />
}
