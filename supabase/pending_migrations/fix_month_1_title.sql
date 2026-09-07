-- Month 1's practice title was seeded as "Observation Foundation" in
-- path_practices, but the master doc (and the app's own hardcoded
-- Today/Path progression array in path-progression.js, which already
-- used "Orientation to the Path" as the title with "Observation
-- Foundation" as a secondary focus label) both say the canonical title
-- is "Orientation to the Path". This left the Practice Briefing screen
-- (sourced from path_practices.title) showing a different name than
-- Today and Path for the same month. Idempotent.

UPDATE public.path_practices
SET title = 'Orientation to the Path'
WHERE slug = 'core-m01-observation-foundation';
