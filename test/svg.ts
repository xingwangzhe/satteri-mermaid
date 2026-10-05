import { SaxesParser } from "saxes";

export interface SvgElement {
  name: string;
  attributes: Record<string, string>;
}

/** XML parsing detects malformed output that a substring check misses. */
export function parseSvg(svg: string): SvgElement[] {
  const elements: SvgElement[] = [];
  const parser = new SaxesParser({ xmlns: false });
  parser.on("opentag", (tag) => {
    elements.push({ name: tag.name, attributes: tag.attributes as Record<string, string> });
  });
  parser.write(svg).close();
  if (elements[0]?.name !== "svg") throw new Error("Expected an SVG root");
  return elements;
}
