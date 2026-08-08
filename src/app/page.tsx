import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Brand } from "@/components/brand";
import { ContactPill } from "@/components/contact-pill";
import { WorksRing } from "@/components/three/works-ring";
import { WorksData } from "@/components/works-data";
import { WorkDetail } from "@/components/work-detail";
import { Hero } from "@/components/sections/hero";
import { WorksGrid } from "@/components/sections/works-grid";
import { AboutSection } from "@/components/sections/about-section";
import { GalleryContact } from "@/components/sections/gallery-contact";
import { getWorks } from "../../sanity/queries";
import type { Work } from "@/data/works";

export default async function Home() {
  const works: Work[] = await getWorks();

  return (
    <>
      <WorksData works={works} />
      <WorksRing />
      <SiteHeader />
      <Brand />
      <main>
        <Hero />
        <WorksGrid />
        <AboutSection />
        <GalleryContact />
      </main>
      <SiteFooter />
      <ContactPill />
      <WorkDetail />
    </>
  );
}
