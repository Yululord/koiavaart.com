/**
 * Pushes scripts/paintings.json into Sanity: uploads each painting's photos
 * and creates its document.
 *
 * Idempotent. Documents get a fixed id derived from the folder name, and
 * assets are matched on filename before uploading, so re-running after
 * transcribing more sheets adds the new ones and leaves the rest alone.
 *
 *   node --env-file=.env.local scripts/import-paintings.mjs
 *   node --env-file=.env.local scripts/import-paintings.mjs --drop-placeholders
 */
import { readFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { createClient } from "@sanity/client";

const SOURCE = join(homedir(), "Downloads", "Paintings");

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: "2026-08-08",
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
});

const slugify = (value) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

async function uploadOnce(path, filename) {
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $filename][0]._id`,
    { filename },
  );
  if (existing) return existing;
  const asset = await client.assets.upload("image", await readFile(path), {
    filename,
  });
  return asset._id;
}

const { paintings } = JSON.parse(
  await readFile(new URL("./paintings.json", import.meta.url)),
);

for (const [index, painting] of paintings.entries()) {
  const slug = slugify(painting.title);
  const images = [];

  for (const [n, filename] of painting.images.entries()) {
    const assetId = await uploadOnce(
      join(SOURCE, painting.folder, filename),
      filename,
    );
    images.push({
      _key: `${slug}-${n}`,
      _type: "image",
      asset: { _type: "reference", _ref: assetId },
    });
  }

  await client.createOrReplace({
    _id: `painting-${slug}`,
    _type: "work",
    title: painting.title,
    slug: { _type: "slug", current: slug },
    // Alphabetical for now, spaced so paintings can be slotted between.
    order: (index + 1) * 10,
    images,
    ...(painting.medium ? { medium: painting.medium } : {}),
    ...(painting.dimensions ? { dimensions: painting.dimensions } : {}),
    ...(painting.description ? { description: painting.description } : {}),
    ...(painting.year ? { year: painting.year } : {}),
    ...(painting.price != null ? { price: painting.price } : {}),
    status: painting.status ?? "available",
  });

  console.log(
    `  ${painting.title.padEnd(24)} ${images.length} image(s)` +
      (images.length ? "" : "  (no photograph yet)"),
  );
}

if (process.argv.includes("--drop-placeholders")) {
  const ids = await client.fetch(
    `*[_type == "work" && _id match "work-*"]._id`,
  );
  if (ids.length) {
    await ids.reduce((tx, id) => tx.delete(id), client.transaction()).commit();
    console.log(`\nRemoved ${ids.length} placeholder painting(s).`);
  }
}

console.log(`\n${paintings.length} painting(s) in Sanity, published.`);
