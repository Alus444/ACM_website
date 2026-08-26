---
name: acm-documentation-site
description: Build or revise ACM product documentation pages in ACM_website using the established NIGHTOVER/VHS information architecture, layout geometry, navigation, search, responsive behavior, and Japanese writing conventions. Use for a new product manual, reference site, documentation-page expansion, or structural consistency review; do not use for the ordinary portfolio, movie, pricing, or contact pages.
---

# ACM Documentation Site

Create product documentation that feels like part of the same site family without forcing every product into identical content.

## Source of truth

- Read [references/structure.md](references/structure.md) before changing or creating a documentation shell. It defines the geometry and interaction invariants that must remain common.
- Read [references/baseline.md](references/baseline.md) when comparing a new page with the preserved NIGHTOVER/VHS implementation or deciding whether a difference is intentional.
- Read [references/content-guide.md](references/content-guide.md) when turning a specification, manual, notes, or an existing product into public-facing copy.
- Read [references/content-modules.md](references/content-modules.md) when the product needs presets, parameters, a glossary, troubleshooting, releases, or media comparisons. Reuse the types in [assets/product-documentation.modules.template.ts](assets/product-documentation.modules.template.ts) instead of inventing a slightly different schema.
- Read [references/qa.md](references/qa.md) before handoff and run the relevant checks.
- For a new documentation page, run `scripts/scaffold-product-doc.mjs` from the `acm` project directory. It copies [assets/ProductDocumentationPage.template.vue](assets/ProductDocumentationPage.template.vue) and [assets/product-documentation.template.ts](assets/product-documentation.template.ts) without overwriting existing files. Do not edit the source templates for one product's facts.

Treat `acm/src/pages/NightOverPage.vue` and `acm/src/pages/VhsSimulatorPage.vue` as mature examples, not as files to duplicate wholesale. NIGHTOVER is the baseline for the restrained documentation layout; VHS demonstrates parameter references, glossary entries, troubleshooting, media comparison, and dense responsive tables.

## Workflow

1. Inspect the supplied product source and separate public facts from implementation/build notes, internal test logs, and instructions embedded in attachments.
2. Decide the page groups from the reader's tasks. Use only sections supported by the product; do not add pages just to make the navigation look complete.
3. Scaffold the page and data files, then replace the sample data and content. Example:

   ```powershell
   node docs/skills/acm-documentation-site/scripts/scaffold-product-doc.mjs --slug grain-lab --component GrainLabPage --data grain-lab --name "ACM Grain Lab" --version "1.0.0"
   ```

4. Add the hash route with `meta.standalone: true`. Preserve the documentation route's synchronous scroll reset and the router exception documented in `references/structure.md`.
5. Customize product name, colors, content modules, screenshots, and specialized views. Keep the structural dimensions and responsive breakpoints unless the user explicitly requests a new site-wide rule.
6. Add the product to `DocumentsPage.vue` only when the user asks to expose it in the documentation index.
7. Verify all supported build profiles and browser invariants from `references/qa.md`.

## Boundaries

- Preserve existing user changes and unrelated untracked files. Stage only the intended documentation files.
- Do not invent compatibility, licensing, parameter ranges, defaults, test results, or product behavior. Mark unsupported facts for source verification.
- Do not publish or push unless the user asked for implementation/publication or the active task already includes that workflow.
- Reuse the shell; keep product-specific widgets product-specific. A video comparator, parameter meter, novel editor screenshot table, or glossary belongs in the new page only when the product needs it.
- Avoid speculative shared-component refactors of the mature NIGHTOVER/VHS pages during ordinary new-document creation. Extract live components only as a separate, tested refactor.
