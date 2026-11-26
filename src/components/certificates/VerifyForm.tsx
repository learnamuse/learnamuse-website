import { asset } from "@/lib/url";
import { Search } from "@/components/ui/icons";

/**
 * Plain GET form → /certificates/?q=… (works without JS; the hub reads ?q= on load).
 * Raw form action needs the base path, hence asset().
 */
export function VerifyForm({ id = "verify-q", compact = false }: { id?: string; compact?: boolean }) {
  return (
    <form action={asset("/certificates/")} method="get" role="search" className="w-full">
      <label htmlFor={id} className={compact ? "sr-only" : "mb-2 block text-sm font-bold text-ink"}>
        نام دارندهٔ گواهی
      </label>
      <div className="flex items-stretch gap-2 rounded-full border border-line bg-surface p-1.5 shadow-card transition-[border-color,box-shadow] duration-200 ease-out focus-within:border-brand focus-within:ring-2 focus-within:ring-brand/40">
        <span className="flex items-center ps-3 text-ink-3" aria-hidden="true">
          <Search className="size-5" />
        </span>
        <input
          id={id}
          name="q"
          type="search"
          required
          autoComplete="off"
          placeholder="نام و نام خانوادگی (فارسی یا انگلیسی)"
          className="min-w-0 flex-1 bg-transparent py-2 text-base text-ink outline-none placeholder:text-ink-3 focus-visible:outline-none"
        />
        <button
          type="submit"
          className="shrink-0 rounded-full bg-brand px-4 py-2.5 text-sm font-bold text-brand-ink transition-[background-color,color,scale] duration-200 hover:bg-brand-strong hover:text-white motion-safe:active:scale-95 sm:px-6"
        >
          استعلام
        </button>
      </div>
    </form>
  );
}
