/** Shared Sanity connection details, read once so a missing value fails loudly. */

function required(name: string, value: string | undefined) {
  if (!value) {
    throw new Error(
      `Missing ${name}. Run \`vercel env pull\` to refresh .env.local.`,
    );
  }
  return value;
}

export const projectId = required(
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
);

export const dataset = required(
  "NEXT_PUBLIC_SANITY_DATASET",
  process.env.NEXT_PUBLIC_SANITY_DATASET,
);

/** Pinned so a future API change cannot alter what existing queries return. */
export const apiVersion = "2026-08-08";
