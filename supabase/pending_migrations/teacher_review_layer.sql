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
