/**
 * Generic chat-bubble glyph used for the Bale messenger channel (decorative).
 * Lives here rather than in ui/icons.tsx because the contact feature is the only user;
 * move it there if the footer or the /bale-bot/ page needs it too.
 */
export const BaleIcon = ({ className = "size-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M12 2.75A9.25 9.25 0 002.75 12v8.1c0 .64.52 1.15 1.15 1.15H12a9.25 9.25 0 000-18.5zm-3.6 10.6a1.35 1.35 0 110-2.7 1.35 1.35 0 010 2.7zm3.6 0a1.35 1.35 0 110-2.7 1.35 1.35 0 010 2.7zm3.6 0a1.35 1.35 0 110-2.7 1.35 1.35 0 010 2.7z" />
  </svg>
);
