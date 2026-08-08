import { NextStudio } from "next-sanity/studio";
import config from "../../../../sanity.config";

/**
 * The Studio, mounted at /studio. It is a client-rendered single page that
 * owns every route beneath it, hence the catch-all segment.
 */
export const dynamic = "force-static";

export { metadata, viewport } from "next-sanity/studio";

export default function StudioPage() {
  return <NextStudio config={config} />;
}
