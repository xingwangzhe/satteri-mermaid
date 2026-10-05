# Merman core compatibility patch

`merman-core/` is the crates.io source of `merman-core` 0.7.0 (MIT OR Apache-2.0), retaining its upstream license files. Cargo patches only this crate; all other Merman crates remain pinned to 0.7.0.

Local change: in `src/diagrams/er.rs`, use `str::get` when checking the two-byte ASCII PK/FK/UK token. Slicing two bytes can split a UTF-8 attribute name (for example 学号), which panics and can abort the native host. A non-boundary range now cannot match an ASCII key; normal Unicode attribute lexing proceeds unchanged.

Regression: `test/renderer.test.ts` renders Chinese ER entities, fields, keys and relationship labels. Remove this patch after adopting an upstream release with the fix.
