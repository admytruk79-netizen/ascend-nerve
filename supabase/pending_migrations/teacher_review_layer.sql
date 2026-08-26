-- Teacher review layer, aligned with the live ASCEND Path schema.
-- Reviews are stage-level progression decisions. Journal sharing is optional
-- context and never grants progression by itself.

CREATE TABLE IF NOT EXISTS path_teacher_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (student_id, teacher_id)
);

CREATE TABLE IF NOT EXISTS path_teacher_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  teacher_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stage_id uuid NOT NULL REFERENCES path_stages(id) ON DELETE CASCADE,
  decision text NOT NULL CHECK (decision IN ('advance','continue','pause')),
  guidance text,
  submitted_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE path_teacher_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_teacher_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher relationships visible to participants" ON path_teacher_relationships;
CREATE POLICY "teacher relationships visible to participants" ON path_teacher_relationships
  FOR SELECT USING (auth.uid() = teacher_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "teacher reviews visible to participants" ON path_teacher_reviews;
CREATE POLICY "teacher reviews visible to participants" ON path_teacher_reviews
  FOR SELECT USING (auth.uid() = teacher_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "teacher may create review for active student" ON path_teacher_reviews;
CREATE POLICY "teacher may create review for active student" ON path_teacher_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = teacher_id
    AND EXISTS (
      SELECT 1 FROM path_teacher_relationships r
      WHERE r.teacher_id = auth.uid()
        AND r.student_id = path_teacher_reviews.student_id
        AND r.status = 'active'
    )
  );

-- Teacher/student relationships are provisioned explicitly. Do not auto-link
-- an arbitrary account as a teacher and do not encode personal email addresses
-- in a migration.

-- Without this, getSharedJournalEntries() always returns empty: journal
-- entries were owner-only (auth.uid() = user_id) with no teacher exception,
-- so the "share with teacher" checkbox on the Journal had nothing to grant.
-- Already applied live on project nqionqvuudamqkfbaopk.
DROP POLICY IF EXISTS "teacher may view shared entries" ON path_journal_entries;
CREATE POLICY "teacher may view shared entries" ON path_journal_entries
  FOR SELECT USING (
    share_with_teacher = true
    AND EXISTS (
      SELECT 1 FROM path_teacher_relationships r
      WHERE r.teacher_id = auth.uid() AND r.student_id = path_journal_entries.user_id AND r.status = 'active'
    )
  );

-- NOTE: a live "student may request teacher relationship" INSERT policy on
-- path_teacher_relationships (student_id = auth.uid()) predates the
-- "provisioned explicitly" decision above and was not dropped when this file
-- was rewritten -- self-request is still technically possible via the API
-- even though no client UI offers it. Left as-is pending an explicit call on
-- whether to remove it; flagging rather than dropping unilaterally.
