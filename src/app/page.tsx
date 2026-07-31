import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Brand } from "@/components/brand";
import { ContactPill } from "@/components/contact-pill";
import { WorksRing } from "@/components/three/works-ring";
import { WorkDetail } from "@/components/work-detail";
import { Hero } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about-section";
import { GalleryContact } from "@/components/sections/gallery-contact";

export default function Home() {
  return (
    <>
      <WorksRing />
      <SiteHeader />
      <Brand />
      <main>
        <Hero />
        <AboutSection />
        <GalleryContact />
      </main>
      <SiteFooter />
      <ContactPill />
      <WorkDetail />
    </>
  );
}
