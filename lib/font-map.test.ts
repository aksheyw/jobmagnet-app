import { describe, it, expect } from "vitest";
import { resolveFont, isAllowedFont, googleFontLinks } from "./font-map";

describe("font-map (app copy — parity with codex)", () => {
  it("resolves a known font to its next/font/google symbol", () => {
    expect(resolveFont("Inter")).toEqual({
      importName: "Inter",
      requested: "Inter",
      fellBack: false,
    });
  });

  it("resolves the newly-added Hanken Grotesk (R6)", () => {
    const r = resolveFont("Hanken Grotesk");
    expect(r.importName).toBe("Hanken_Grotesk");
    expect(r.fellBack).toBe(false);
  });

  it("resolves the newly-added Archivo (R6)", () => {
    const r = resolveFont("Archivo");
    expect(r.importName).toBe("Archivo");
    expect(r.fellBack).toBe(false);
  });

  it("falls back to Inter for an unknown font", () => {
    const r = resolveFont("Söhne");
    expect(r.importName).toBe("Inter");
    expect(r.fellBack).toBe(true);
  });

  it("isAllowedFont is case- and whitespace-insensitive", () => {
    expect(isAllowedFont("  hanken   grotesk ")).toBe(true);
    expect(isAllowedFont("Proprietary Sans")).toBe(false);
  });
});

describe("googleFontLinks (load brand fonts at render time)", () => {
  it("builds a css2 stylesheet href for an allowlisted font", () => {
    expect(googleFontLinks(["Fraunces"])).toEqual([
      "https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&display=swap",
    ]);
  });

  it("uses canonical casing + '+' for multi-word families", () => {
    expect(googleFontLinks(["hanken grotesk"])).toEqual([
      "https://fonts.googleapis.com/css2?family=Hanken+Grotesk:wght@400;700&display=swap",
    ]);
  });

  it("dedupes the same family (e.g. headline === body)", () => {
    expect(googleFontLinks(["Inter", "Inter"])).toHaveLength(1);
  });

  it("skips non-allowlisted (proprietary) fonts — they can't be Google-loaded", () => {
    expect(googleFontLinks(["GT Walsheim"])).toEqual([]);
  });

  it("filters a mixed list to only the allowlisted families", () => {
    const links = googleFontLinks(["GT Walsheim", "Fraunces"]);
    expect(links).toHaveLength(1);
    expect(links[0]).toContain("family=Fraunces");
  });

  it("returns an empty array for empty / nullish input", () => {
    expect(googleFontLinks([])).toEqual([]);
    expect(googleFontLinks([undefined, null, ""])).toEqual([]);
  });
});
