/**
 * One-off seed: moves what already lives in the repo into Sanity — the nine
 * paintings, the About copy and portrait, and the social handles.
 *
 * Deliberately does NOT carry over the invented placeholders. Medium,
 * dimensions, price, description and the per-painting Saatchi links were
 * stand-ins, and seeding them would dress guesses up as real data. They are
 * left empty; the site omits what is not set.
 *
 * Idempotent: documents use fixed ids and createOrReplace, and image assets
 * are looked up by filename before uploading, so re-running does not
 * duplicate anything.
 *
 *   node --env-file=.env.local scripts/seed-sanity.mjs
 */
import { readFile } from "node:fs/promises";
import { createClient } from "@sanity/client";
import { about } from "../src/data/about.ts";
import { contact } from "../src/data/site.ts";

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-08-08",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX"];

async function uploadOnce(path, filename) {
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    { filename },
  );
  if (existing) {
    console.log(`  reused ${filename}`);
    return existing;
  }
  const asset = await client.assets.upload("image", await readFile(path), {
    filename,
  });
  console.log(`  uploaded ${filename}`);
  return asset._id;
}

async function seedWorks() {
  console.log("Paintings");
  for (let i = 0; i < 9; i++) {
    const n = String(i + 1).padStart(2, "0");
    const filename = `work-${n}.png`;
    const assetId = await uploadOnce(
      `public/images/works/${filename}`,
      filename,
    );
    await client.createOrReplace({
      _id: `work-${n}`,
      _type: "work",
      // Provisional, exactly as on the site today — these are not her titles.
      title: `Untitled ${ROMAN[i]}`,
      slug: { _type: "slug", current: `untitled-${ROMAN[i].toLowerCase()}` },
      order: (i + 1) * 10,
      image: {
        _type: "image",
        asset: { _type: "reference", _ref: assetId },
      },
    });
  }
}

async function seedAbout() {
  console.log("About");
  const assetId = await uploadOnce(
    "public/images/about/portrait-30.png",
    "portrait-30.png",
  );
  await client.createOrReplace({
    _id: "about",
    _type: "about",
    quote: about.quote,
    body: about.paragraphs,
    portrait: {
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
    },
  });
}

async function seedSettings() {
  console.log("Contact & social");
  await client.createOrReplace({
    _id: "settings",
    _type: "settings",
    note: contact.note,
    // Email left unset on purpose: her@email.com was a placeholder.
    socials: contact.socials.map((group, i) => ({
      _key: `group-${i}`,
      label: group.label,
      handles: group.handles.map((entry, j) => ({
        _key: `handle-${i}-${j}`,
        handle: entry.handle,
        ...(entry.href ? { href: entry.href } : {}),
      })),
    })),
  });
}

await seedWorks();
await seedAbout();
await seedSettings();
console.log("\nDone. Everything is published, not draft.");
