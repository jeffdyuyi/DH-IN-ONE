# Character Level To Tier Unification Implementation Plan

> **For agentic workers:** Execute this plan task by task. Keep each task green before continuing, and do not start `pnpm dev`, `pnpm start`, or another long-running server.

**Goal:** Establish one canonical Character Level to Character Tier mapping, route card automation and upgrade UI tier ranges through it, fix the Bare Bones tier regression, and preserve existing character-save and card-pack contracts.

**Architecture:** Add a pure character-progression domain module under `character/progression/` as the authority for valid Character Levels, Character Tiers, and tier ranges. Card automation consumes the derived Character Tier through its snapshot; upgrade UI keeps its historical `tier1`/`tier2`/`tier3` persistence keys but maps them explicitly to Character Tiers 2/3/4. React components render and filter from domain/config data rather than defining level boundaries. Automatic-calculation and storage behavior remain unchanged.

**Tech Stack:** TypeScript, Next.js, Zustand, Vitest, Testing Library, existing card automation IR/compiler/runtime, existing modifier automatic-calculation boundary.

---

## Required Reading

Read these before implementation:

- `AGENTS.md`
- `CONTEXT.md`
- `docs/contexts/modifiers/CONTEXT.md`
- `docs/architecture/project-structure.md`
- `docs/architecture/ui-business-boundaries.md`
- `docs/architecture/testing.md`
- `docs/architecture/character-data.md`
- `docs/superpowers/specs/2026-06-21-card-automation-dsl-phase-1-design.md`
- `docs/superpowers/plans/2026-06-22-card-automation-phase-1.md`

## Domain Contract

The canonical mapping is:

| Character Level | Character Tier |
|---|---|
| 1 | 1 |
| 2-4 | 2 |
| 5-7 | 3 |
| 8-10 | 4 |

Use these terms consistently:

- **Character Level**: the integer character level from 1 through 10.
- **Character Tier**: the derived rules tier `"1" | "2" | "3" | "4"`.
- **Upgrade Band Key**: the legacy persisted/UI grouping key `tier1 | tier2 | tier3`. These keys represent Character Tiers 2/3/4 respectively; they are not Character Tiers.
- **Equipment Tier**: equipment content metadata such as `T1` through `T4`; it is independent of Character Tier derivation.

Invalid, blank, fractional, or out-of-range values do not have a Character Tier. Do not silently map them to Tier 1 or Tier 4 at the canonical domain boundary.

## Current Findings

1. `card/automation/snapshot.ts` is the only runtime implementation of Character Level to Character Tier conversion. It currently maps `1-4 / 5-7 / 8-10 / other` to tiers `1 / 2 / 3 / 4`.
2. `data/cards/builtin-base.json` contains the correct Bare Bones values. The data file does not need a value change.
3. `card/automation/value-evaluator.ts` correctly evaluates `kind: "tier"` and `kind: "valueByTier"` from `snapshot.tier`. The evaluator is not the source of the bug.
4. The repository currently uses `valueByTier` in Bare Bones only, but imported card automation may use both `kind: "tier"` and `kind: "valueByTier"`; therefore the snapshot bug affects third-party card instances too.
5. `card/automation/__tests__/fixture-matrix.test.ts` currently asserts that level 8 Bare Bones emits `13/31`. That fixture encodes the bug and must be corrected after an independent domain test is added.
6. Upgrade UI uses `tier={1}` for the T2/levels 2-4 column, `tier={2}` for T3, and `tier={3}` for T4. Its current output is correct, but the name `tier` conflates Upgrade Band index with Character Tier.
7. Upgrade caps `4/7/10` are repeated in `data/list/upgrade.ts`, `components/character-sheet-page-two-sections/upgrade-section.tsx`, and `components/upgrade-popover/domain-card-selector.tsx`.
8. Existing Upgrade Band keys are embedded in saved `upgradeStates`, migration regexes, test ids, and upgrade source ids. They must remain byte-for-byte compatible.
9. `automation/core/source-definitions.ts` accepts any finite level within 1-10, including fractions. `automation/actions/level-entry-actions.ts` has its own correct integer/range validation with an intentional invalid-to-level-1 fallback.
10. `lib/character-data-validator.ts` checks that `level` exists but does not enforce integer/range validity. Tightening the character import contract is a separate migration/product decision and is not required for this fix.

The relevant baseline is currently green:

```text
card/automation/__tests__/fixture-matrix.test.ts             41 tests
tests/unit/automation/level-entry-actions.test.ts             13 tests
tests/unit/modifiers/source-definitions.test.ts               16 tests
tests/unit/modifiers/store-actions.test.ts                    69 tests
tests/integration/upgrade-cancel-flow.test.tsx                 9 tests
Total                                                         148 tests
```

This green baseline does not prove tier semantics because the Bare Bones fixture expects the wrong level-8 result.

## Non-Negotiable Constraints

- Character Tier is derived; do not add it to `SheetData` or persist it.
- Preserve public card automation tier keys as strings `"1"`, `"2"`, `"3"`, and `"4"`.
- Preserve the exported `CardTier` name as a compatibility alias if consumers import it.
- Preserve all existing Upgrade Band keys and check keys such as `tier1-0-0`.
- Do not bump `schemaVersion`, add a character migration, refresh card instances, or reinstall card packs.
- Do not change Bare Bones contribution ids, ability ids, active-base ids, or automation definition values.
- Do not change automatic-calculation semantics: disabled targets update Source State/Reference Total but keep their Stored Final Value.
- Do not infer Character Tier from Upgrade Band keys, equipment tiers, DOM copy, or selected upgrades.
- Invalid levels must fail fast at the canonical mapping boundary. Do not make `0`, `11`, or `2.5` mean Tier 4.
- Keep business rules out of React components and out of new `lib/` code.

## Scope

### Must change

- Add the canonical Character Level/Character Tier domain module and pure tests.
- Make card automation snapshot use the canonical parser and mapping.
- Make `CardTier` reuse the shared Character Tier type without changing its external string representation.
- Correct and expand Bare Bones fixtures across all tier boundaries.
- Add direct coverage for both `kind: "tier"` and `kind: "valueByTier"` behavior.
- Make system level-derived entries use canonical valid-level parsing.
- Reuse the canonical parser inside level-entry normalization while preserving its fallback semantics.
- Replace ambiguous Upgrade Band `tier` arguments and repeated `4/7/10` caps with explicit Upgrade Band-to-Character Tier configuration.
- Add integration coverage for automatic calculation on/off across a tier boundary.
- Document the canonical relationship in the modifier domain context.

### Explicitly do not change

- `data/cards/builtin-base.json` numeric values or automation ids.
- `card/automation/value-evaluator.ts` behavior unless a failing test proves an evaluator defect.
- Equipment template/filter tiers.
- Saved Upgrade Band/check-key formats.
- Character import acceptance/rejection rules or schema version.
- Attribute auto-base's intentional blank/invalid-level fallback behavior.
- General level-up UI layout or unrelated upgrade behavior.

### Follow-up candidate, not part of this plan

Create a separate character-data validation/migration decision for malformed imported levels. That work must decide whether invalid imported levels should be rejected, normalized, or retained with diagnostics. This plan only ensures malformed values cannot masquerade as a valid Character Tier or fractional level-derived source.

## File Map

Create:

- `character/progression/tiers.ts`
- `character/progression/__tests__/tiers.test.ts`
- `card/automation/__tests__/snapshot.test.ts`
- `components/character-sheet-page-two-sections/__tests__/upgrade-tier-ranges.test.tsx`

Modify:

- `docs/contexts/modifiers/CONTEXT.md`
- `card/automation/ir-types.ts`
- `card/automation/snapshot.ts`
- `card/automation/__tests__/fixture-matrix.test.ts`
- `card/automation/__tests__/resolver.test.ts`
- `automation/core/source-definitions.ts`
- `tests/unit/modifiers/source-definitions.test.ts`
- `automation/actions/level-entry-actions.ts`
- `tests/unit/automation/level-entry-actions.test.ts`
- `data/list/upgrade.ts`
- `components/character-sheet-page-two.tsx`
- `components/character-sheet-page-two-sections/upgrade-section.tsx`
- `components/upgrade-popover/domain-card-selector.tsx`
- `tests/integration/upgrade-cancel-flow.test.tsx`
- `tests/unit/modifiers/store-actions.test.ts`

Possible test-only helper changes are allowed when they reduce duplicated test card construction, but production code must not import test helpers.

---

## Task 1: Establish The Character Progression Domain Authority

**Files:**

- Create: `character/progression/tiers.ts`
- Create: `character/progression/__tests__/tiers.test.ts`
- Modify: `docs/contexts/modifiers/CONTEXT.md`

- [ ] **Step 1: Write failing mapping and validation tests**

Cover every legal level, not only transition examples:

```ts
it.each([
  [1, "1"],
  [2, "2"],
  [3, "2"],
  [4, "2"],
  [5, "3"],
  [6, "3"],
  [7, "3"],
  [8, "4"],
  [9, "4"],
  [10, "4"],
])("maps level %s to tier %s", (level, tier) => {
  expect(getCharacterTier(level)).toBe(tier)
})
```

Cover string inputs because `SheetData.level` is a string, plus invalid values:

```text
"1", "2", "10"             -> valid Character Levels
"", " ", "abc", "1+1"    -> undefined
0, 11, -1, 1.5, "2.5"       -> undefined
NaN, Infinity, null          -> undefined
```

Also assert the declared tier ranges are contiguous, non-overlapping, and cover exactly levels 1 through 10.

- [ ] **Step 2: Run the new test and verify failure**

```bash
pnpm exec vitest run character/progression/__tests__/tiers.test.ts
```

Expected: FAIL because the module does not exist.

- [ ] **Step 3: Implement the shared module**

The module should export:

```ts
export type CharacterLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type CharacterTier = "1" | "2" | "3" | "4"

export const CHARACTER_TIER_LEVEL_RANGES: Record<
  CharacterTier,
  { minLevel: CharacterLevel; maxLevel: CharacterLevel }
>

export function parseCharacterLevel(value: unknown): CharacterLevel | undefined
export function getCharacterTier(value: unknown): CharacterTier | undefined
export function getCharacterTierLevelRange(tier: CharacterTier): {
  minLevel: CharacterLevel
  maxLevel: CharacterLevel
}
```

`getCharacterTier()` must delegate to `parseCharacterLevel()` and use `CHARACTER_TIER_LEVEL_RANGES`; do not create a second hidden boundary table.

- [ ] **Step 4: Document the modifier-context relationship**

Add concise language to `docs/contexts/modifiers/CONTEXT.md`:

- Character Tier is derived from Character Level using the canonical character-progression mapping.
- Card Automation Snapshot reads that derived value.
- Upgrade Band keys and Equipment Tiers are not Character Tiers.
- Invalid Character Levels produce no Character Tier.

- [ ] **Step 5: Run the domain tests**

```bash
pnpm exec vitest run character/progression/__tests__/tiers.test.ts
```

Expected: PASS.

## Task 2: Route Card Automation Through The Canonical Tier

**Files:**

- Modify: `card/automation/ir-types.ts`
- Modify: `card/automation/snapshot.ts`
- Create: `card/automation/__tests__/snapshot.test.ts`
- Modify: `card/automation/__tests__/resolver.test.ts`
- Modify: `card/automation/__tests__/fixture-matrix.test.ts`

- [ ] **Step 1: Add failing snapshot wiring tests**

Verify `buildCardAutomationSnapshot()` returns the canonical level/tier pairs for levels `1`, `2`, `5`, and `8`, and returns both `level: undefined` and `tier: undefined` for malformed/out-of-range values.

Keep target/proficiency numeric parsing tests separate: only Character Level receives strict Character Level validation.

- [ ] **Step 2: Add a failing public-expression regression test**

Use a low-level automation definition or IR with distinct outputs and prove:

- `{ kind: "tier" }` evaluates to `4` at level 8.
- `valueByTier` selects its `"4"` branch at level 8.
- Missing/invalid Character Tier produces a runtime diagnostic and no contribution rather than selecting Tier 4.

This protects imported third-party definitions, not only Bare Bones.

- [ ] **Step 3: Replace the private mapping**

- Make `CardTier` a compatibility alias of `CharacterTier`.
- Remove the private `tierFromLevel()` implementation.
- Build snapshot `level` with `parseCharacterLevel(sheetData.level)`.
- Build snapshot `tier` with `getCharacterTier(level)`.
- Leave other numeric snapshot facts on their existing finite-number parser.

- [ ] **Step 4: Correct and expand Bare Bones fixtures**

Replace the single level-8 expectation with parameterized boundary coverage:

| Level | Armor Base with Strength 2 | Minor Base | Major Base |
|---|---:|---:|---:|
| 1 | 5 | 9 | 19 |
| 2 | 5 | 11 | 24 |
| 5 | 5 | 13 | 31 |
| 8 | 5 | 15 | 38 |

Retain the equipped-armor test proving Bare Bones emits no contributions while armor is equipped.

- [ ] **Step 5: Run card automation tests**

```bash
pnpm exec vitest run \
  card/automation/__tests__/snapshot.test.ts \
  card/automation/__tests__/resolver.test.ts \
  card/automation/__tests__/fixture-matrix.test.ts
```

Expected: PASS.

## Task 3: Reuse Valid Character Level Parsing In Level-Derived Sources

**Files:**

- Modify: `automation/core/source-definitions.ts`
- Modify: `tests/unit/modifiers/source-definitions.test.ts`
- Modify: `automation/actions/level-entry-actions.ts`
- Modify: `tests/unit/automation/level-entry-actions.test.ts`

- [ ] **Step 1: Add invalid-level source tests**

Prove that `0`, `11`, `2.5`, and expression-like `"1+1"` do not create:

- level threshold modifiers;
- base stress/proficiency sources owned by a valid Character Level;
- proficiency threshold modifiers.

Retain existing valid-level tests at 1, 2, 5, 8, and 10.

- [ ] **Step 2: Use `parseCharacterLevel()` in system source collection**

Replace generic number-expression parsing for `sheetData.level` with the canonical parser. Do not modify generic numeric parsing for modifier target values.

This is an intentional behavior correction for malformed imported data: fractional or out-of-range levels stop producing plausible system sources.

- [ ] **Step 3: Preserve level-entry fallback semantics through delegation**

Implement `normalizeLevelForEntryAutomation(value)` as:

```ts
return parseCharacterLevel(value) ?? 1
```

The exported behavior remains unchanged. Extend its table test with fractional, whitespace, and numeric inputs so future parser changes cannot silently alter the fallback.

- [ ] **Step 4: Run source and level-entry tests**

```bash
pnpm exec vitest run \
  tests/unit/modifiers/source-definitions.test.ts \
  tests/unit/automation/level-entry-actions.test.ts
```

Expected: PASS.

## Task 4: Separate Upgrade Band Keys From Character Tiers

**Files:**

- Modify: `data/list/upgrade.ts`
- Modify: `components/character-sheet-page-two.tsx`
- Modify: `components/character-sheet-page-two-sections/upgrade-section.tsx`
- Modify: `components/upgrade-popover/domain-card-selector.tsx`
- Create: `components/character-sheet-page-two-sections/__tests__/upgrade-tier-ranges.test.tsx`
- Modify: `tests/integration/upgrade-cancel-flow.test.tsx`

- [ ] **Step 1: Add an explicit Upgrade Band configuration**

Define and export a narrow type and mapping without changing persisted strings:

```ts
export type UpgradeBandKey = "tier1" | "tier2" | "tier3"

export const UPGRADE_BAND_CHARACTER_TIERS = {
  tier1: "2",
  tier2: "3",
  tier3: "4",
} as const satisfies Record<UpgradeBandKey, CharacterTier>
```

Remove `upgradeOptionsData.tierLevelCaps`. Level caps must come from `getCharacterTierLevelRange(UPGRADE_BAND_CHARACTER_TIERS[key]).maxLevel`.

Keep `tierSpecificUpgrades` keyed by the same `UpgradeBandKey` strings because character migration reads those keys.

- [ ] **Step 2: Add focused config/UI tests before refactoring**

Verify:

- `tier1/tier2/tier3` map to Character Tiers `2/3/4`.
- headings remain `T2 等级 2-4`, `T3 等级 5-7`, `T4 等级 8-10`;
- option copy still shows caps 4, 7, and 10;
- domain-card selection uses caps 4, 7, and 10 while still limiting to the current valid level;
- an invalid/blank current level preserves the existing selector fallback to the Upgrade Band cap;
- clicking an existing upgrade option still writes the legacy key `tier1-...`, not `tier2-...`.

- [ ] **Step 3: Rename ambiguous component APIs**

- Replace numeric `tier` component props with `upgradeBandKey: UpgradeBandKey`.
- Derive the Character Tier through `UPGRADE_BAND_CHARACTER_TIERS`.
- Make `getUpgradeOptions()` accept `UpgradeBandKey`, not a number.
- Make `DomainCardSelector` receive a `characterTier` or already-derived `maxLevel`, not an Upgrade Band index named `tier`.
- Generate headings, level-cap copy, and card-filter caps from the canonical range.
- Replace `tier === 1/2/3` display branches with explicit Upgrade Band key checks or one generated cap display.

Do not rename persisted `upgradeStates` keys, migration regexes, or test ids.

- [ ] **Step 4: Run upgrade UI and migration-sensitive tests**

```bash
pnpm exec vitest run \
  components/character-sheet-page-two-sections/__tests__/upgrade-tier-ranges.test.tsx \
  tests/integration/upgrade-cancel-flow.test.tsx \
  tests/unit/modifiers/upgrade-states.test.ts \
  tests/unit/automation/upgrade-automation.test.ts \
  tests/unit/storage-migration.test.ts \
  tests/unit/migration-versioning.test.ts
```

Expected: PASS, with existing `tier1-*` assertions unchanged.

## Task 5: Cover Automatic Calculation And Existing Character Behavior

**Files:**

- Modify: `tests/unit/modifiers/store-actions.test.ts`
- Modify only if a failing test proves necessary: automatic-calculation implementation files

- [ ] **Step 1: Add enabled-target level-boundary coverage**

Construct a loadout Bare Bones card instance with empty armor and Strength 2. Prove that changing level through `store().updateLevel()` crosses the correct base tiers.

At minimum cover `1 -> 2`, because that is the previously missing transition. Also cover an upward jump crossing `5` and `8` so `applyLevelEntryAutomationsWithNotifications()` and the full automatic-calculation boundary are exercised together.

For a sheet with no other threshold adjustments, distinguish base and final values:

| Level | Bare Bones Base | Level Modifier | Calculated Final |
|---|---:|---:|---:|
| 1 | 9/19 | +1 | 10/20 |
| 2 | 11/24 | +2 | 13/26 |
| 5 | 13/31 | +5 | 18/36 |
| 8 | 15/38 | +8 | 23/46 |

Assert the card base ids remain unchanged across levels so saved `activeBaseId` remains valid.

- [ ] **Step 2: Add disabled-target locked-final coverage**

With automatic calculation disabled separately for `minorThreshold` and `majorThreshold`:

- change level across `1 -> 2`;
- assert `getReferenceSummary()` exposes the new Bare Bones bases/reference totals;
- assert Stored Final Values remain unchanged;
- assert the target states still contain `autoCalculation: false`;
- assert the derived unattributed difference changes rather than being saved as a card/user contribution.

- [ ] **Step 3: Cover non-active and inactive Bare Bones cases**

Retain or add assertions that:

- equipped armor suppresses Bare Bones contributions;
- if another saved base is active, changing the Bare Bones candidate base does not replace that valid active selection;
- Armor Max remains `3 + Strength` and does not change merely because Character Tier changes.

- [ ] **Step 4: Run modifier/store tests**

```bash
pnpm exec vitest run tests/unit/modifiers/store-actions.test.ts
```

Expected: PASS without changing automatic-calculation production code. If production changes are needed, stop and explain which existing invariant was insufficient before expanding scope.

## Task 6: Validate Regression Surface

- [ ] **Step 1: Run focused regression tests**

```bash
pnpm exec vitest run \
  character/progression/__tests__/tiers.test.ts \
  card/automation/__tests__/snapshot.test.ts \
  card/automation/__tests__/resolver.test.ts \
  card/automation/__tests__/fixture-matrix.test.ts \
  tests/unit/automation/level-entry-actions.test.ts \
  tests/unit/modifiers/source-definitions.test.ts \
  tests/unit/modifiers/store-actions.test.ts \
  tests/integration/upgrade-cancel-flow.test.tsx
```

- [ ] **Step 2: Run complete test suites**

```bash
pnpm test:run
pnpm test:unit
pnpm test:integration
```

`pnpm test:run` is required because card-domain tests under `card/automation/` are not covered by `pnpm test:unit`.

- [ ] **Step 3: Run the production build**

```bash
pnpm build
```

- [ ] **Step 4: Inspect the final diff for contract drift**

Confirm:

- no `SheetData` or schema-version change;
- no character migration change;
- no `builtin-base.json` value/id change;
- no card automation public-format change;
- no equipment tier change;
- no saved Upgrade Band key change;
- no unexpected automatic-calculation implementation change.

---

## Regression Analysis

### Expected user-visible corrections

- Bare Bones base thresholds change at levels 2, 5, and 8 according to Character Tier.
- Valid third-party card automations using `tier` or `valueByTier` receive correct tiers.
- Level 8-10 can finally select Tier 4 automation values such as `15/38`.

### Existing characters

- No migration is required because Character Tier is derived at runtime and contribution ids do not change.
- Existing card instances retain their compiled automation IR; no template refresh or card-pack reinstall is required.
- On the next modifier-aware sync, enabled targets may recalculate to the corrected result.
- Disabled targets keep their Stored Final Values while their sources/reference totals update, matching the existing modifier context.
- A valid saved active Bare Bones base id remains valid because the contribution id is stable.

### Third-party card packs

- The external definition and normalized IR formats remain unchanged.
- Behavior changes only where a definition reads Character Tier. That change is intentional and applies equally to installed instance-owned automation.
- Add a generic tier-expression test so future built-in fixtures cannot be the sole contract for third-party behavior.

### Upgrade UI and saved upgrade state

- Headings, selectable-card caps, and option copy must remain visually unchanged.
- Upgrade Band keys remain `tier1/tier2/tier3`; changing them would orphan saved upgrade states and is prohibited.
- Migration continues to read `tier[123]-...` keys and `tierSpecificUpgrades` by the same keys.

### Malformed levels

- Current normal UI already restricts level input to blank or integer 1-10.
- Imported/corrupt values such as `0`, `11`, or `2.5` currently can generate Tier 4 or fractional sources. After this work they produce no valid Character Tier/level-derived source.
- This fail-fast behavior can change calculated values for malformed saves. Treat it as an intentional safety correction, not a compatibility guarantee.
- Do not silently rewrite the stored malformed level in this plan; character import validation/migration needs a separate explicit decision.

### Main regression risks and gates

| Risk | Mitigation |
|---|---|
| Off-by-one mapping returns | Pure exhaustive 1-10 domain table test |
| `kind: "tier"` fixed but `valueByTier` still wrong | Direct tests for both expression kinds |
| Bare Bones fixture mirrors implementation again | Domain test lands before business fixture update |
| Auto calculation overwrites locked finals | Store test with both threshold targets disabled |
| Corrected source id changes and loses active base | Assert stable contribution/base ids |
| Upgrade UI refactor changes persisted keys | Existing `tier1-*` integration/migration assertions remain unchanged |
| Domain-card filters allow wrong levels | Per-Upgrade-Band filter tests for current-level and cap behavior |
| Card pack/schema compatibility breaks | Keep string tier keys and run full card automation/import suites |
| Invalid levels receive a fallback tier | Invalid mapping and runtime-diagnostic tests |
| `pnpm test:unit` misses card tests | Require `pnpm test:run` before completion |

## Completion Criteria

- There is exactly one Character Level to Character Tier range table in production code.
- No React component defines Character Tier boundaries.
- Card automation snapshot, direct tier expressions, and `valueByTier` use the canonical mapping.
- Bare Bones emits `9/19`, `11/24`, `13/31`, and `15/38` at levels `1`, `2`, `5`, and `8` respectively.
- Invalid levels never become Tier 4.
- Upgrade UI still displays T2/T3/T4 ranges and preserves all historical `tier1/tier2/tier3` storage keys.
- Automatic calculation on/off behavior is covered across the `1 -> 2` boundary.
- Focused tests, full tests, and production build pass.
