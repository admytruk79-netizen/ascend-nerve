-- Teacher review layer: path_teacher_relationships + path_teacher_reviews were
-- declared in ARCHITECTURE.md but never implemented. This adds them, a
-- sole-teacher auto-link (every new student links to whichever profile has
-- is_teacher = true), and RLS. Not yet applied -- run once the Supabase MCP
-- connector is enabled for the chat, or paste directly into the SQL editor
-- for project nqionqvuudamqkfbaopk. Idempotent where practical.

ALTER TABLE path_profiles ADD COLUMN IF NOT EXISTS is_teacher boolean NOT NULL DEFAULT false;

CREATE TABLE IF NOT EXISTS path_teacher_relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (teacher_user_id, student_user_id)
);

CREATE TABLE IF NOT EXISTS path_teacher_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  student_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  journal_entry_id uuid REFERENCES path_journal_entries(id) ON DELETE SET NULL,
  stage_id uuid REFERENCES path_stages(id) ON DELETE SET NULL,
  note text NOT NULL,
  recommendation text NOT NULL DEFAULT 'acknowledged'
    CHECK (recommendation IN ('acknowledged','ready','not_yet','needs_discussion')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE path_teacher_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_teacher_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "teacher relationships visible to both sides" ON path_teacher_relationships;
CREATE POLICY "teacher relationships visible to both sides" ON path_teacher_relationships
  FOR SELECT USING (auth.uid() = teacher_user_id OR auth.uid() = student_user_id);

DROP POLICY IF EXISTS "teacher reviews visible to both sides" ON path_teacher_reviews;
CREATE POLICY "teacher reviews visible to both sides" ON path_teacher_reviews
  FOR SELECT USING (auth.uid() = teacher_user_id OR auth.uid() = student_user_id);

DROP POLICY IF EXISTS "only the linked teacher can write a review" ON path_teacher_reviews;
CREATE POLICY "only the linked teacher can write a review" ON path_teacher_reviews
  FOR INSERT WITH CHECK (
    auth.uid() = teacher_user_id
    AND EXISTS (
      SELECT 1 FROM path_teacher_relationships r
      WHERE r.teacher_user_id = auth.uid() AND r.student_user_id = path_teacher_reviews.student_user_id
    )
  );

-- Auto-link every new (non-teacher) student to the sole teacher on profile creation.
CREATE OR REPLACE FUNCTION path_link_student_to_teacher()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_teacher_id uuid;
BEGIN
  IF NEW.is_teacher THEN
    RETURN NEW;
  END IF;
  SELECT user_id INTO v_teacher_id FROM path_profiles WHERE is_teacher = true LIMIT 1;
  IF v_teacher_id IS NOT NULL AND v_teacher_id != NEW.user_id THEN
    INSERT INTO path_teacher_relationships (teacher_user_id, student_user_id)
    VALUES (v_teacher_id, NEW.user_id)
    ON CONFLICT (teacher_user_id, student_user_id) DO NOTHING;
  END IF;
  RETURN NEW;
END;
$fn$;

DROP TRIGGER IF EXISTS path_link_student_to_teacher_trigger ON path_profiles;
CREATE TRIGGER path_link_student_to_teacher_trigger
  AFTER INSERT ON path_profiles
  FOR EACH ROW EXECUTE FUNCTION path_link_student_to_teacher();

-- Mark the school's author/sole teacher. Replace the email below if wrong.
UPDATE path_profiles SET is_teacher = true
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'admytruk79@gmail.com' LIMIT 1);
