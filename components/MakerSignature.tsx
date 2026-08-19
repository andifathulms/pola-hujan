import type { SVGProps } from "react";

/**
 * Personal maker's mark, not a legal/data notice — kept visually
 * separate from any citation line (DESIGN.md §1's "citation line" is a
 * different, per-view thing). Uses `you` (#8B3A62) as the accent, since
 * DESIGN.md §3 already defines it as the one colour that sits outside
 * the three regime families — the right token for "this is personal,
 * not a classification", not a repurposed family hue.
 */

function GlobeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9S9.5 5.5 12 3Z" />
    </svg>
  );
}

function GitHubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M12 2C6.48 2 2 6.58 2 12.19c0 4.49 2.87 8.3 6.84 9.64.5.1.68-.22.68-.49 0-.24-.01-1.04-.01-1.88-2.78.61-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.31.1-2.73 0 0 .84-.28 2.75 1.05a9.28 9.28 0 0 1 5 0c1.91-1.33 2.75-1.05 2.75-1.05.55 1.42.2 2.47.1 2.73.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.6.69.49A10.02 10.02 0 0 0 22 12.19C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function LinkedInIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-.95 1.83-1.95 3.77-1.95 4.03 0 4.78 2.5 4.78 5.76V21h-4v-5.6c0-1.34-.02-3.06-1.87-3.06-1.87 0-2.16 1.44-2.16 2.96V21h-4V9Z" />
    </svg>
  );
}

function InstagramIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

const MAKER = {
  name: "Andi Fathul Mukminin",
  links: [
    { label: "Portofolio", href: "https://andifathulms.github.io/en/", Icon: GlobeIcon },
    { label: "GitHub", href: "https://github.com/andifathulms", Icon: GitHubIcon },
    { label: "LinkedIn", href: "https://www.linkedin.com/in/andifathulmukminin/", Icon: LinkedInIcon },
    { label: "Instagram", href: "https://www.instagram.com/andifathulms/", Icon: InstagramIcon },
  ],
} as const;

export function MakerSignature() {
  const year = new Date().getFullYear();
  const portfolioHref = MAKER.links[0].href;

  return (
    <footer className="border-t border-rule px-4 py-4 lg:px-6">
      <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-end sm:gap-3">
        <p className="text-xs text-ink/70">
          Designed &amp; built by{" "}
          <a
            href={portfolioHref}
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink underline decoration-ink/30 underline-offset-2 transition-colors duration-fast hover:text-you hover:decoration-you"
          >
            {MAKER.name}
          </a>{" "}
          · <span className="font-mono tabular-nums">© {year}</span>
        </p>

        <div className="flex items-center gap-1">
          {MAKER.links.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="rounded p-1.5 text-ink/50 transition-colors duration-fast hover:bg-rule/60 hover:text-you"
            >
              <Icon className="h-[18px] w-[18px]" />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
