import { ThemeToggle } from '@/components/layout/theme-toggle';
import { Hero } from '@/components/sections/hero';
import { TechTicker } from '@/components/sections/tech-ticker';

export default function HomePage() {
  return (
    <main id="main">
      {/* Provisional: el navbar (Fase 2 Task 4) reemplaza este toggle al integrar */}
      <div className="fixed top-4 right-4 z-40">
        <ThemeToggle />
      </div>
      <Hero />
      <TechTicker />
    </main>
  );
}
