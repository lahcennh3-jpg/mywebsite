# Updating a study with verified work

Edit the matching object in `content/projects.json`. Do not turn a proposal, a catalog recipe or an introduced fixture into a claim about native product behavior. The build fails on incomplete publication gates rather than quietly treating a status change as proof.

## Keep scope and evidence aligned

For every artifact, record its exact boundary and one supported `kind`:

| Kind | Meaning |
| --- | --- |
| `source-design` | Pinned source reasoning or reviewed design; no native runtime implication |
| `introduced-fixture` | Added synthetic exercise, including deliberately introduced failures |
| `native-observation` | Exact authorized native build, configuration and environment actually observed |
| `actual-model` | Real identified model, known synthetic data and valid measured experiment |
| `authorized-professional` | Actual scoped professional contribution with authorization and public-release permission |

Distinguish confirmed native issue, configuration error, introduced weakness, extension defect and unconfirmed hypothesis in the actual write-up. A source/design study can be completed within that scope after the required review; its title, details and limitations must still state that runtime behavior was not tested.

## Evidence packet before promotion

Maintain raw evidence outside the public portfolio when necessary. Publish only sanitized material. The completed study needs:

1. Product need; declared authorized scope; exact source/config/runtime/model manifests where applicable.
2. Predictions, permitted/denied/failure cases and requirement → control → case → raw evidence → outcome links.
3. Actual observations and explanations, invalid/uncertain trials and assistance attribution. No fabricated achievements or replaced denominators.
4. Reviewed change or no-change rationale, legitimate regressions, remediation/retest and remaining gaps.
5. Recovery/rollback/reconciliation, component owners, reproducible handover and a selected transfer.
6. Appropriate independent review and a record that Ahmed independently explains or adapts the mechanism. A checkbox or an AI-generated report does not provide this evidence.
7. Publication permission, including applicable private-disclosure or professional constraints. Never commit secrets, private findings, customer data, tokens or private authorization records.

## Content fields

Fields start empty and remain hidden until actually supplied:

- `evidenceLinks`: objects with `label`, public HTTPS `url`, `kind`, and a precise `scope`.
- `results`: an object with `summary`, `kind`, and public HTTPS `evidenceUrl`; write only supported outcomes.
- `metrics`: either `label`, measured numeric `value`, `unit`, `method`, `evidenceUrl`; or `label`, actual `numerator`, nonzero `denominator`, `method`, `evidenceUrl`. Percentages require the fraction form, which displays the recorded fraction and a calculated percentage. Define eligible/valid cases and record invalid trials in the referenced ledger. `0/0` is rejected. No metric alone proves readiness.
- `screenshots`: objects with `src` (HTTPS or `assets/` path), meaningful `alt`, and optional `caption`. Put local approved images under `public/assets/`.
- `review`: actual `status`, `scope`, public HTTPS `reference`, and `independent: true` only when supported. Use `status: "Reviewed pass"` for promotion after appropriate review; this is not an automatically awarded status.
- `publication`: `approved: true` only after actual permission. Supply public-safe HTTPS `permissionReference`, `reproducibilityReference` and `independentDemonstrationReference`. Publish a sanitized public statement/record when an underlying approval is private; never publish a private record just to satisfy a URL field.

Permission is required for rendering any supplied observations, even while a project remains `In progress`. Promotion to `Completed` additionally requires results, classified evidence, independent review, reproduction and independent demonstration references. The validator checks metadata completeness; it cannot verify a reviewer’s independence, scientific validity or permission authenticity. Those need human review of the referenced evidence.

Update planned prose to match what was actually executed before promotion. Keep unresolved native/model/specialist claims explicitly unverified, even if a narrower source/design or fixture study is completed. C04 runtime prerequisites may change only when actual evidence resolves them. Keep C06 optional. C08’s 24 cases are a proposed design until actual receipts exist.

Then run:

```bash
npm run validate
npm test
npm run build
npm run check
npm run preview
```

Check the completed view and direct detail page, including status, evidence kind, result scope and limits. Commit the content and approved assets on a review branch. Review the public diff and merge only the appropriate material. The Pages workflow publishes successful `main` builds.

## Revalidation

Changed source, effective configuration, identity, policy, dependencies, corpus, model, runtime or scorer can invalidate prior claims. Link affected cases, retain historical evidence and use `Blocked` or `In progress` while retesting as appropriate. Do not silently carry a reviewed pass across a changed system or let polished presentation imply native assurance.
