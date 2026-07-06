import Nav from '../components/landing/Nav'
import HeroSection from '../components/landing/HeroSection'
import HowItWorks from '../components/landing/HowItWorks'
import FlowDiagram from '../components/landing/FlowDiagram'
import ActivityTicker from '../components/landing/ActivityTicker'
import StatsRail from '../components/landing/StatsRail'
import Security from '../components/landing/Security'
import Footer from '../components/landing/Footer'

export default function Landing() {
  return (
    <>
      <Nav />
      <HeroSection />
      <HowItWorks />
      <FlowDiagram />
      <ActivityTicker />
      <StatsRail />
      <Security />
      <Footer />
    </>
  )
}
