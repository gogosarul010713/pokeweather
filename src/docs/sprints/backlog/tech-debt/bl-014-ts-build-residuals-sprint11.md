# BL-014: TS Build Residuals from Sprint-11 Cleanup

**Priority:** 🟢 DEBT | **Type:** Tech Debt | **Estimate:** 15min | **Blocker:** none

---

## Problem

Three TypeScript errors introduced as residuals of the sprint-11 cleanup that removed
`saveCityForecast` from the frontend and cleaned `ForecastDoc`. None affect runtime —
all block `tsc -b` clean compilation.

Confirmed pre-existing via `git stash` + build on commit `2075af7`.

---

### Error 1 — `calculated_condition` referenced in `debugCaching.ts`

**File:** `src/services/cache/debugCaching.ts` lines 313, 331

```
error TS2339: Property 'calculated_condition' does not exist on type 'ForecastDoc'
```

**Origin:** US-1007 (sprint-10, commit `7a95f3b`) added `calculated_condition` to
`ForecastDoc`. Sprint-11 cleanup (commit `e1238c4`) removed the field from the type,
but `debugCaching.ts` — a console-only dev tool, never imported in the prod bundle —
was not updated.

**Fix:** Replace `doc.calculated_condition` with a string literal `'N/A'` or remove
the two `console.log` lines entirely.

```ts
// line 313 — BEFORE:
console.log(`    calculated_condition: ${doc.calculated_condition || 'N/A'}`)
// AFTER:
console.log(`    calculated_condition: N/A (field removed in sprint-11)`)

// line 331 — same pattern
```

---

### Error 2 — `saveCityForecast` re-exported from barrel but no longer exists

**File:** `src/services/firebase/index.ts` line 6

```
error TS2305: Module '"./firebaseWeatherService"' has no exported member 'saveCityForecast'
```

**Origin:** US-801 (sprint-8) created `saveCityForecast` in the frontend. Sprint-11
(commit `e1238c4`) removed it — CF became the sole writer (D-043). The barrel export
was not updated. `firebaseWeatherService.ts` line 12 already documents this:
`// saveCityForecast fue eliminado en sprint-11`.

No consumer imports `saveCityForecast` from the barrel — confirmed via graph trace
(only callers are `syncWeatherLogic` and `functions/src/index.ts`, both in CF).

**Fix:** Remove line 6 from `index.ts`.

```ts
// REMOVE:
export { saveCityForecast } from './firebaseWeatherService'
```

---

### Error 3 — `HourlyForecastData` missing cast in `getHourlyForecast`

**File:** `src/services/weather/weatherService.ts` line ~205

```
error TS2740: Type '{ EpochDateTime: number; }' is missing the following properties
from type 'HourlyForecastData': WeatherIcon, Temperature, ...
```

**Origin:** `getHourlyForecast` returns `findCurrentSlot(data)` where `data` is
`response.json()` (type `any`). TypeScript infers the return as `any`, which doesn't
satisfy the declared return type `Promise<HourlyForecastData>`. Exists since US-801
(sprint-8) — never caught because `tsc -b` was not part of CI at the time.

**Fix:** Add explicit cast.

```ts
// BEFORE:
return findCurrentSlot(data)
// AFTER:
return findCurrentSlot(data) as HourlyForecastData
```

---

## Impact

| Error | Runtime impact | Build impact |
|-------|---------------|--------------|
| `calculated_condition` in debugCaching | None — dev-only file | Blocks `tsc -b` |
| `saveCityForecast` barrel export | None — no consumers | Blocks `tsc -b` |
| `HourlyForecastData` cast | None — `response.json()` returns full object | Blocks `tsc -b` |

---

## Files to Modify

| File | Line | Change |
|------|------|--------|
| `src/services/cache/debugCaching.ts` | 313, 331 | Remove or replace `doc.calculated_condition` |
| `src/services/firebase/index.ts` | 6 | Remove `saveCityForecast` re-export |
| `src/services/weather/weatherService.ts` | ~205 | Add `as HourlyForecastData` cast |

---

## Validation

```bash
npm run build
# Expected: same 0 new errors — only pre-existing unrelated warnings
```

---

## References

- Cleanup commit: `e1238c4` — sprint-11 "BUG-022..026, REF-001, schema cleanup"
- `saveCityForecast` origin: commit `61ece21` — US-801 sprint-8
- `calculated_condition` origin: commit `7a95f3b` — US-1007 sprint-10
- D-043: decision-log — CF as sole Firestore writer
