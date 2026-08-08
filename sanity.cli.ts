import { defineCliConfig } from "sanity/cli";

/**
 * Config for the Sanity CLI, used to deploy the Studio to Sanity's own
 * hosting at <studioHost>.sanity.studio — a first-party origin, so the
 * login handshake that fails when the Studio is served from our domain
 * does not apply there.
 */
export default defineCliConfig({
  api: {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  },
  studioHost: "koiavaart",
});
