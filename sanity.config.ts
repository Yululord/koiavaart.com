"use client";

import { visionTool } from "@sanity/vision";
import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { apiVersion, dataset, projectId } from "./sanity/env";
import { schemaTypes } from "./sanity/schemas";

/**
 * The editing interface, served from /studio on this same site so there is
 * one address to sign in to rather than a separate Sanity-hosted one.
 *
 * About and Contact are singletons: the sidebar opens each document
 * directly instead of offering a list you could add a second one to.
 */
export default defineConfig({
  basePath: "/studio",
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title("Content")
          .items([
            S.documentTypeListItem("work").title("Paintings"),
            S.divider(),
            S.listItem()
              .title("About")
              .id("about")
              .child(S.document().schemaType("about").documentId("about")),
            S.listItem()
              .title("Contact & social")
              .id("settings")
              .child(
                S.document().schemaType("settings").documentId("settings"),
              ),
          ]),
    }),
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
