import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Services } from "@/components/sections/Services";
import { Work } from "@/components/sections/Work";
import { SiteChrome } from "@/components/SiteChrome";
import { Footer } from "@/components/Footer";

export default function Home() {
  return (
    <>
      <SiteChrome />
      <Hero />
      <Services />
      <Work />
      <About />
      <Contact />
      <Footer />
    </>
  );
}
