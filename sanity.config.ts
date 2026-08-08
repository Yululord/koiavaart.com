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
  // Keep the session as a token in local storage rather than a cookie.
  // The default is a cookie, which a browser will not store for an http
  // origin or across sites once third-party cookies are blocked — so the
  // login succeeded, the redirect came back with nothing kept, and the
  // Studio asked to log in again, round and round.
  auth: { loginMethod: "token" },
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
