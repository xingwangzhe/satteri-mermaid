# Changelog

## 0.8.1 — 2026-10-05

- Patch the Merman 0.7.0 ER lexer so Chinese attribute names do not panic when checking ASCII key tokens. Preserve the upstream source and licenses under `vendor/merman-core`.
- Catch unwinding Rust panics at the N-API boundary and return a render error.
- Add a real Chinese ER diagram regression: 84 passing tests and one upstream TODO.

## 0.8.0 — 2026-10-05

Migrate the native backend to Merman and update the tested Sätteri integration.

- Replace mermaid-rs-renderer with the published Merman 0.7.0 Rust renderer through napi-rs.
- Pin Sätteri 0.10.5 and update its peer range to `>=0.10.5 <0.11.0`.
- Require Node.js 22.14+ for Node-API 10 and Rust 1.95+ for source builds.
- Support 11 Mermaid theme presets, retaining `modern` as an alias for `default`. Expose the native engine catalog with `supportedDiagrams()`.
- Add Mermaid configuration, theme-variable, theme CSS, scoped CSS, and viewport options; preserve compatibility mappings for legacy color options.
- Fix MDX SVG compilation, diagram ID isolation, document flags, responsive shape dimensions, and explicit canvas background overrides.
- Make rendering errors throw by default; add explicit code fallback policies. Reject unsupported `preferredAspectRatio` instead of silently ignoring it.
- Remove the CommonJS export pointing to a missing build artifact; use the ESM entry point.
- Add a local Astro example with 18 diagram families, 11 themes, original source, and package-generated SVG styles. Add `preview` and `preview:stop` commands.
- Add real renderer, XML, Markdown/MDX integration, configuration effect, and package import tests: 83 passing tests and one upstream TODO, verified locally on Linux x64 with Node 22.14.0 and 24.21.0 against the release artifact.
- Add cross-platform CI and lock Rust dependencies with Cargo.lock. Remote matrix execution is not part of the local validation result.
- Preserve the project's MIT LICENSE and copyright attribution; include the Merman MIT notice separately in the npm package.

Known upstream limitation: Merman 0.7.0 can double-escape a less-than sign in a flowchart label, displaying literal `&lt;` text. Diagram fixtures are representative coverage, not exhaustive Mermaid conformance.
