Create a new numbered Supabase migration file.

## Arguments
`$ARGUMENTS` is the migration description in snake_case (e.g. `add_cookie_consents`). If no argument is provided, ask the user for one before proceeding.

## Steps

1. Run `ls supabase/migrations/ | sort` to find the highest existing migration number.
2. Increment by 1 and zero-pad to 3 digits (e.g. `022` → `023`).
3. Create the file `supabase/migrations/<NNN>_$ARGUMENTS.sql` with this scaffold:

```sql
-- Migration: <NNN>_$ARGUMENTS
-- Purpose: <one-line description derived from the argument name>

```

4. Open the file so the user can write the SQL.
5. After creating the file, add a row to the **Migrations** table in `.claude/rules/architecture.md`:
   - File column: the new filename (without path)
   - Purpose column: a placeholder like `TODO — describe what this migration does`
   - Tell the user to update the Purpose once they've written the SQL.

Do not write any SQL content beyond the scaffold — the user will fill it in.
