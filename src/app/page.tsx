import { createPageMetadata } from '@/lib/metadata'
import StructuredData from './StructuredData'
import EngineNetworkPage from './engine-network/EngineNetworkPage'

export const metadata = createPageMetadata('home')

export default function HomePage() {
  return (
    <>
      <StructuredData page="home" />
      <EngineNetworkPage showDesignLabLink={false} />
    </>
  )
}
