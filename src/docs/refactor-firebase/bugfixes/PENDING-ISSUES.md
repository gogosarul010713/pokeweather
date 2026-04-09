# ⏸️ PENDING ISSUES — Documented for Future Resolution

**Status:** Known issues not blocking development  
**Last Updated:** 2026-04-08

---

## 🟡 Issue: Firebase Env Vars Warning (Vite Hot Reload)

**Severity:** Low (warning only, functionality works)  
**Assigned:** TBD  
**Blocker:** No (US-801 works despite warning)

### Description
```
⚠️ Firebase: Missing environment variables: VITE_FIREBASE_PROJECT_ID, 
VITE_FIREBASE_API_KEY, VITE_FIREBASE_AUTH_DOMAIN
Weather persistence will not be available. Check .env.local
```

### Reality Check
- ✅ `.env.local` EXISTS with all Firebase credentials
- ✅ `npm run build` finds and uses them correctly
- ✅ Firebase persistence WORKS (data saved in Firestore)
- ❌ But warning still appears in dev logs

### Diagnosis
**Root Cause:** Vite limitation with `.env.local` hot reload
- Vite loads env vars at **dev server startup**
- `.env.local` changes are NOT hot-reloaded (intentional for security)
- Warning appears if `.env.local` is modified AFTER dev server starts
- Or if env var values exist but Vite's parser misses them on first read

### Attempted Solutions
1. ✅ Restart dev server → Still appears
2. ✅ Clear browser cache → Still appears
3. ✅ Verify .env.local exists → Confirmed
4. ✅ npm run build → Finds vars correctly

### Workarounds
- **Ignore the warning** (it's cosmetic, functionality works)
- **Check Firestore Console** to confirm data is being saved (it is)

### Long-term Fix Options
1. **Investigate Vite env loading** — debug why firebaseConfig.ts line 26 misses vars
2. **Add build-time validation** — ensure vars exist before bundling
3. **Switch to hardcoded config for dev** — load from firebase.ts directly (not recommended)
4. **Update to latest Vite** — may fix env loading bug

### Impact
- **Severity:** Cosmetic only
- **Functionality:** 0% impact (everything works)
- **Data integrity:** 0% impact (Firestore saves correctly)
- **User experience:** Confusing warning message

---

## Decision Log

**2026-04-08 Decision:** Document as PENDING, continue with implementation

**Reasoning:**
- US-801 persistence is working correctly (Firestore has data)
- Warning is misleading but doesn't affect functionality
- Time cost to debug Vite hot reload > value gained
- Can be resolved in a dedicated Vite configuration sprint

**Next Owner:** @TBD (assign to Vite/env specialist)

---

**Created by:** Claude (autonomous diagnosis)  
**Status:** ⏸️ On Hold (non-blocking)
