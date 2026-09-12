-- Fixes two real gaps left after the "provisioned explicitly" teacher-review
-- design landed:
--
-- 1. Teacher/student role was inferred purely from "has active students" in
--    path_teacher_relationships. A brand-new teacher account with zero
--    students yet gets the student view forever -- there is no UI path to
--    ever add a first student, since the console that would let them add one
--    never renders. Chicken-and-egg lockout.
-- 2. The self-request policy was correctly removed (see teacher_review_layer.sql),
--    but nothing replaced it: no client action can create a relationship at
--    all now, not even for the legitimate teacher. Every link has to be a
--    hand-run SQL insert.
--
-- Fix: a minimal explicit teacher allowlist (populated by hand, once, per
-- teacher -- matching "provisioned explicitly" exactly) plus one
-- SECURITY DEFINER RPC that lets an allowlisted teacher link a student by
-- email without ever needing broad SELECT on auth.users from the client.

CREATE TABLE IF NOT EXISTS path_teachers (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE path_teachers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "self may check own teacher status" ON path_teachers;
CREATE POLICY "self may check own teacher status" ON path_teachers
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION path_add_student(p_student_email text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $fn$
DECLARE
  v_teacher uuid := auth.uid();
  v_student uuid;
BEGIN
  IF v_teacher IS NULL THEN
    RAISE EXCEPTION 'authentication required';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM path_teachers WHERE user_id = v_teacher) THEN
    RAISE EXCEPTION 'not authorized as a teacher';
  END IF;

  SELECT id INTO v_student FROM auth.users WHERE lower(email) = lower(p_student_email);
  IF v_student IS NULL THEN
    RETURN jsonb_build_object('linked', false, 'reason', 'no_account_found');
  END IF;
  IF v_student = v_teacher THEN
    RETURN jsonb_build_object('linked', false, 'reason', 'cannot_link_self');
  END IF;

  INSERT INTO path_teacher_relationships (teacher_id, student_id, status)
  VALUES (v_teacher, v_student, 'active')
  ON CONFLICT (student_id, teacher_id) DO UPDATE SET status = 'active';

  RETURN jsonb_build_object('linked', true, 'student_id', v_student);
END;
$fn$;

REVOKE EXECUTE ON FUNCTION path_add_student(text) FROM public, anon;
GRANT EXECUTE ON FUNCTION path_add_student(text) TO authenticated, service_role;

-- Bootstrap: mark the school's founding teacher. Replace the email if wrong,
-- or run by hand for whichever account should hold this role.
INSERT INTO path_teachers (user_id)
SELECT id FROM auth.users WHERE email = 'admytruk79@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
