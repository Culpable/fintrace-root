import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/metadata'
import EngineNetworkPage from './engine-network/EngineNetworkPage'

export const metadata: Metadata = {
  title: { absolute: pageMetadata.home.title },
  description: pageMetadata.home.description,
  alternates: { canonical: '/' },
  robots: { index: true, follow: true },
}

export default function HomePage() {
  return <EngineNetworkPage showDesignLabLink={false} />
}
