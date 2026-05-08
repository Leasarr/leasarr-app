Scan recent git commits and update Leasarr docs to reflect the current state of the app.

## What this command does

1. Finds the last commit that touched a doc file (`.claude/rules/`, `documents/progress/`, or `documents/mvp-launch-roadmap/`).
2. Lists all feature/fix/feat commits since that commit.
3. For each commit that represents a meaningful change (skip pure chore/fix commits that don't change app behaviour), determines what doc entries it needs.
4. Updates the relevant docs.

## Step-by-step

**Step 1 — Find the baseline**
```bash
git log --oneline --diff-filter=M -- '.claude/rules/*.md' 'documents/progress/*.md' 'documents/mvp-launch-roadmap/*.md' | head -1
```
This gives the most recent docs-update commit. Note its hash.

**Step 2 — List commits since then**
```bash
git log --oneline <hash>..HEAD
```

**Step 3 — For each commit that added a feature or fixed a meaningful bug:**
- Read its diff (`git show <hash> --stat`) to understand what changed.
- Map it to one of these doc targets:

| What changed | Update here |
|---|---|
| New route, API route, or migration | `.claude/rules/architecture.md` — add to the appropriate table |
| New key file or hook | `.claude/rules/architecture.md` — add to Key files |
| Auth or middleware behaviour | `.claude/rules/auth.md` |
| New component or convention | `.claude/rules/conventions.md` |
| Any shipped feature | `documents/progress/progress_table.md` — add a row |
| Any shipped feature | `documents/progress/roadmap.md` — add a row to the progress table and the Gantt if it represents a new phase |
| Blocking item now resolved | `documents/mvp-launch-roadmap/leasarr-mvp-launch-roadmap.md` — mark as done in "Remaining Before Launch" |

**Step 4 — Write the updates**
- In progress tables: add rows with format `| **Phase** | Description | Date |`. Keep descriptions concise (one line).
- In architecture.md tables: match the existing row format exactly.
- In the mvp-launch-roadmap: bump the version number (increment by 1) and today's date, and add a one-line entry to the Document Control table.
- Do NOT rewrite or restructure existing content — only append or mark items done.
- Do NOT add entries for pure bug fixes, chore commits, or typo fixes unless they fix a security issue.

**Step 5 — Report**
Tell the user:
- How many commits were scanned.
- Which docs were updated and what was added.
- Any commits you skipped and why.
- Whether any "Remaining Before Launch" items are now done.
