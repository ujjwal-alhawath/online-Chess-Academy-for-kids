import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Features } from '@/components/Features';
import { HowItWorks } from '@/components/HowItWorks';
import { LearningPath } from '@/components/LearningPath';
import { PracticeArena } from '@/components/PracticeArena';
import { TournamentsOverview } from '@/components/TournamentsOverview';
import { ProgressSection } from '@/components/ProgressSection';
import { CallToAction } from '@/components/CallToAction';
import { Footer } from '@/components/Footer';

export default function HomePage() {
  return (
    <main className="min-h-screen flex flex-col bg-slate-50">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <LearningPath />
      <PracticeArena />
      <TournamentsOverview />
      <ProgressSection />
      <CallToAction />
      <Footer />
    </main>
  );
}
