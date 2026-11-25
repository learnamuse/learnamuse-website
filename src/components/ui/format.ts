/** Persian-digit helpers. Content JSON stores Latin digits ("7 ساعت"); we display Persian ones. */
const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

/** Replace Latin digits inside any string with Persian digits. */
export function faDigits(value: string | number): string {
  return String(value).replace(/[0-9]/g, (d) => FA_DIGITS[Number(d)]);
}

const nf = new Intl.NumberFormat("fa-IR");

/** Format a number with Persian digits and separators, e.g. 21 -> "۲۱". */
export function faNumber(n: number): string {
  return nf.format(n);
}
