import type { Metadata } from 'next'
import EngineNetworkPage from '../../engine-network/EngineNetworkPage'
import { internalRobots } from '../internal-design-metadata'
import './internal-engine-network.css'

export const metadata: Metadata = {
  title: 'The Evidence Engine — Network',
  description:
    'FinTrace engine flagship: documents pass the scanning gate and re-emerge as a constellation of traced accounts — then the evidence is structured, connected and matched, line by line.',
  alternates: { canonical: '/' },
  robots: internalRobots,
}

export default function InternalEngineNetworkPage() {
  return <EngineNetworkPage showDesignLabLink />
}
