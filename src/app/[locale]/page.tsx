import { Contact } from '@/components/sections/contact';
import { Faq } from '@/components/sections/faq';
import { Hero } from '@/components/sections/hero';
import { Manifesto } from '@/components/sections/manifesto';
import { Process } from '@/components/sections/process';
import { Projects } from '@/components/sections/projects';
import { Remote } from '@/components/sections/remote';
import { Services } from '@/components/sections/services';
import { Stats } from '@/components/sections/stats';
import { TechTicker } from '@/components/sections/tech-ticker';

export default function HomePage() {
  return (
    <main id="main">
      <Hero />
      <TechTicker />
      <Manifesto />
      <Services />
      <Process />
      <Stats />
      <Projects />
      <Remote />
      <Faq />
      <Contact />
    </main>
  );
}
