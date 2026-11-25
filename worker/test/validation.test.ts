import { describe, expect, it } from "vitest";
import { MESSAGES, normalizeIranMobile, toLatinDigits, validateContactFields } from "../src/validation";

describe("normalizeIranMobile", () => {
  it.each([
    ["09123456789", "09123456789"],
    ["9123456789", "09123456789"],
    ["+989123456789", "09123456789"],
    ["00989123456789", "09123456789"],
    ["989123456789", "09123456789"],
    ["۰۹۱۲۳۴۵۶۷۸۹", "09123456789"],
    ["٠٩١٢٣٤٥٦٧٨٩", "09123456789"],
    ["+۹۸ ۹۱۲ ۳۴۵ ۶۷۸۹", "09123456789"],
    ["0912-345-6789", "09123456789"],
    ["(0912) 345 67 89", "09123456789"],
  ])("accepts %s", (input, out) => {
    expect(normalizeIranMobile(input)).toBe(out);
  });

  it.each(["", "0912345678", "091234567890", "02112345678", "08123456789", "+19123456789", "abc", "0912345678x"])(
    "rejects %s",
    (input) => {
      expect(normalizeIranMobile(input)).toBeNull();
    },
  );
});

describe("toLatinDigits", () => {
  it("converts Persian and Arabic digits", () => {
    expect(toLatinDigits("۱۲۳٤٥٦")).toBe("123456");
  });
});

describe("validateContactFields", () => {
  const ok = { name: "سارا رحیمی", phone: "۰۹۱۲۳۴۵۶۷۸۹", message: "سلام", wantsCollaboration: true };

  it("normalizes a valid submission", () => {
    expect(validateContactFields({ ...ok, name: "  سارا   رحیمی " })).toEqual({
      fieldErrors: {},
      value: { name: "سارا رحیمی", phone: "09123456789", message: "سلام", wantsCollaboration: true },
    });
  });

  it("message is optional; wantsCollaboration defaults to false", () => {
    const r = validateContactFields({ name: "علی", phone: "09121112233" });
    expect(r.value).toEqual({ name: "علی", phone: "09121112233", message: "", wantsCollaboration: false });
  });

  it("enforces name length 2–80", () => {
    expect(validateContactFields({ ...ok, name: "" }).fieldErrors.name).toBe(MESSAGES.nameRequired);
    expect(validateContactFields({ ...ok, name: " ع " }).fieldErrors.name).toBe(MESSAGES.nameTooShort);
    expect(validateContactFields({ ...ok, name: "ع".repeat(80) }).fieldErrors.name).toBeUndefined();
    expect(validateContactFields({ ...ok, name: "ع".repeat(81) }).fieldErrors.name).toBe(MESSAGES.nameTooLong);
  });

  it("validates phone", () => {
    expect(validateContactFields({ ...ok, phone: "" }).fieldErrors.phone).toBe(MESSAGES.phoneRequired);
    expect(validateContactFields({ ...ok, phone: "12345" }).fieldErrors.phone).toBe(MESSAGES.phoneInvalid);
  });

  it("limits message to 2000 characters", () => {
    expect(validateContactFields({ ...ok, message: "a".repeat(2000) }).fieldErrors.message).toBeUndefined();
    expect(validateContactFields({ ...ok, message: "a".repeat(2001) }).fieldErrors.message).toBe(MESSAGES.messageTooLong);
  });

  it("treats non-string fields as missing", () => {
    const r = validateContactFields({ name: 42, phone: ["0912"], message: {} });
    expect(r.value).toBeNull();
    expect(r.fieldErrors).toEqual({ name: MESSAGES.nameRequired, phone: MESSAGES.phoneRequired });
  });
});
