"use client";

import { contactMailto } from "@/lib/mailto";
import { trackContactClicked } from "@/lib/analytics";

/**
 * The email address at the foot of the page.
 *
 * A client component only so the click can be counted: the section around it
 * is rendered on the server, and an onClick there would not survive.
 */
export function ContactEmailLink({
  email,
  className,
}: {
  email: string;
  className?: string;
}) {
  return (
    <a
      href={contactMailto()}
      onClick={() => trackContactClicked("footer")}
      className={className}
    >
      {email}
    </a>
  );
}
