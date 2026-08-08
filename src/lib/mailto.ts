import { contact } from "@/data/site";
import { formatPrice } from "@/lib/format";
import type { Work } from "@/data/works";

/**
 * Pre-composed emails behind the two calls to action.
 *
 * Writing the first line for someone is most of the reason they send the
 * message at all — a blank compose window asks them to introduce themselves
 * and explain what they want before they have decided to.
 */
function mailto(subject: string, lines: string[]) {
  const body = lines.join("\n");
  return (
    `mailto:${contact.email}` +
    `?subject=${encodeURIComponent(subject)}` +
    `&body=${encodeURIComponent(body)}`
  );
}

/** The Contact button: no painting in mind, so it leaves them a prompt. */
export function contactMailto() {
  return mailto("Enquiry about your work", [
    "Hello Valeriia,",
    "",
    "I came across your website and would like to know more about your paintings.",
    "",
    "I'm particularly interested in:",
    "",
  ]);
}

/**
 * Buy, from a painting's own page. Carries the details she needs to answer
 * without having to ask which painting it was.
 */
export function paintingMailto(work: Work) {
  const facts = [work.dimensions, work.price ? formatPrice(work.price) : null]
    .filter(Boolean)
    .join(", ");

  return mailto(`Purchase enquiry — ${work.title}`, [
    "Hello Valeriia,",
    "",
    `I would like to enquire about purchasing ${work.title}` +
      (facts ? ` (${facts})` : "") +
      ".",
    "",
    "Please let me know about availability, shipping and payment.",
    "",
    "Best regards,",
  ]);
}
