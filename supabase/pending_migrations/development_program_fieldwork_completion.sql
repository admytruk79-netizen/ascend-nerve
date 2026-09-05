-- Complete the ordinary-life training layer for the 13-part Development Program.
-- Canonical primary practices are unchanged. These field assignments are ASCEND
-- training-design bridges so the app does not present an empty school-anatomy section.
with fieldwork(module_number,assignment) as (
  values
  (1,'On waking, record any remembered dream image, mood or fragment before interpreting it. Compare repeated material only after several entries.'),
  (2,'For the first few minutes after waking, notice what remains from sleep before reaching for a phone or beginning the day. Record one concrete carry-over if present.'),
  (3,'After the morning sequence, notice grounding, posture, attention and felt directional quality during one ordinary activity. Record sensation before interpretation.'),
  (4,'After the evening sequence, compare your settling, alertness and bodily sensation with an evening when the practice was not performed. Keep the comparison descriptive.'),
  (5,'During ordinary movement, notice whether breath and movement remain coordinated when attention is divided. Return to a simpler rhythm rather than forcing balance.'),
  (6,'Use one brief pause during the day to release muscular effort, settle breathing and notice the difference between attention and its contents.'),
  (7,'At the fixed prayer time, notice the emotional and ethical quality you bring into the practice. During the following day, test one concrete act consistent with peace, goodwill or restraint.'),
  (9,'Use the frame only for low-stakes calibration exercises that can be independently checked. Record misses as carefully as hits and do not use it for consequential decisions.'),
  (10,'When interpersonal or environmental pressure is felt, briefly recall the sphere and then check ordinary bodily cues such as tension, breath and posture. Do not treat the visualization as proof of an external force.'),
  (12,'Keep a sign log with three separate columns: event observed, meaning considered, and alternative explanation. Look for patterns only after repeated observations.'),
  (13,'Work with one chakra/mantra focus at a time in ordinary practice periods. During the day, note only direct bodily or attentional changes associated with the practice, without treating them as medical facts.')
)
update public.training_branch_modules m
set field_assignment=f.assignment,
    metadata=coalesce(m.metadata,'{}'::jsonb)||jsonb_build_object('fieldwork_expansion','ASCEND training design','fieldwork_completed',true)
from fieldwork f
join public.training_branches b on b.id=m.branch_id
where b.slug='development-program'
  and m.module_number=f.module_number
  and coalesce(m.field_assignment,'')='';
