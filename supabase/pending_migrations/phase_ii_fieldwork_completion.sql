-- Phase II advanced formation fieldwork completion
-- Source spine: Practice Sequence: Sphere of Attention and Integration of New Bodies.
-- Source-defined applied practices are preserved; gaps are filled with clearly marked
-- ASCEND-developed observation/application exercises that do not change progression authority.

with assignments(module_number, field_assignment, provenance) as (
values
(1,'Carry the observation into ordinary life by noticing whether the Sphere image or felt structure returns spontaneously during the day. Record only what actually occurs, without trying to summon it or use it to make decisions.','source-derived ASCEND fieldwork'),
(2,'During ordinary activity, notice whether any center becomes spontaneously distinguishable from the whole. Record its felt quality and context without assigning it a role or practical meaning yet.','source-derived ASCEND fieldwork'),
(3,'Across several days, compare whether the same Leading, Led, or Supporting classifications recur under different conditions. Treat inconsistency as valid data and keep classifications provisional until they converge.','source-derived ASCEND fieldwork'),
(4,'Once each day, pause before one routine decision, briefly recall the felt sense of the Sphere, notice whether any center leans toward an option, then make the decision consciously and compare the result with decisions made without the check-in.','source-applied pairing: Practice IVa'),
(6,'Continue the daily Sphere-in-Choice exercise while including the restructured bodies. Notice whether any restructured body contributes a distinct perspective or response in a real decision, and record only repeatable differences.','ASCEND-developed extension of Practice IVa'),
(7,'Carry the observation into ordinary situations by noticing whether changes in attention alter how the whole Sphere is perceived while walking, working, or interacting. Record the effect of attention without trying to manipulate the mechanism.','ASCEND-developed applied fieldwork'),
(8,'Choose one ordinary activity each week and observe, afterward, whether any of the three tracked domains—movement of matter, body qualities, or system-wide influence—showed a clear correlate in lived experience. Record null or ambiguous results equally.','ASCEND-developed applied fieldwork'),
(9,'Maintain ordinary routines while integration proceeds. Once daily, note whether expanded perception supported or interfered with concentration, sleep, emotional steadiness, or practical functioning; pause and return to stabilization if functioning deteriorates.','source-derived safety fieldwork'),
(11,'When Unity is stable, apply it to one genuine pending decision with real consequences: let the leading bodies register their views, note agreement and disagreement, decide consciously, and review the outcome over the following weeks.','source-applied pairing: Practice XIa'),
(13,'For the current body, define one small concrete real-life version of the primary exercise you have identified for it, practice it repeatedly under ordinary conditions until reliable, and keep a written record of what was determined and why.','source-derived application from Practice XI-A'),
(14,'After each weekly octave-layer session, choose one ordinary sensory or practical experience and describe its felt density or texture without counting, theorizing, or forcing correspondence. Compare notes across layers over time.','ASCEND-developed applied fieldwork'),
(15,'Do not assign practical uses prematurely. Once at least two or three cosmic-correlate bodies are individually recognizable, begin matching a clearly felt body-quality to a real task that genuinely calls for that quality and record the result.','source-applied bridge to Practice XIIIa'),
(17,'During the week after each ascent session, observe one situation in which scale, pressure, or perspective is prominent. Record whether the galactic-core quality appears spontaneously; do not deliberately apply it until Practice XV is stable.','ASCEND-developed observation fieldwork'),
(18,'Identify a recurring situation where you feel undersized, overwhelmed, or unable to hold perspective. Before entering it, recall the integrated Galactic Core quality, act from that felt sense as far as practical, and record what changed, if anything.','source-applied pairing: Practice XVa'),
(20,'As each nearby-galaxy integration stabilizes, observe ordinary life for any distinct quality that appears without deliberate effort. Record differences between integrations without inventing a use for a galaxy whose quality is not yet clear.','ASCEND-developed integration fieldwork'),
(21,'After Laniakea has genuinely been entered, choose one day each week to notice several times whether you are forcing an outcome or moving with the larger current of the day; adjust your pace where appropriate and review where the shift helped or did not.','source-applied pairing: Practice XVIIa'),
(23,'Within a day or two after new folding work, observe ordinary activity for any spontaneous change in steadiness, pacing, or response. Record the observation without treating it as proof that the strand itself caused the change.','ASCEND-developed integration fieldwork'),
(24,'Choose one recurring habitual reaction and observe it whenever it appears over several weeks without trying to force change. Record any shifts, however small, and which prior integration seemed most connected.','source-applied pairing: Practice XIXa'),
(26,'Once all six beams are individually distinguishable, provisionally assign each beam-quality to one life domain such as work, relationships, health, creative work, rest, or service, then test those assignments in real situations.','source-applied bridge to Practice XXIa'),
(27,'Before entering a life domain, briefly recall its provisionally assigned beam-quality. Review the six assignments monthly and revise any pairing that does not continue to match lived experience.','source-applied pairing: Practice XXIa'),
(29,'Once daily, briefly touch each developed body in awareness and ask whether anything it registers is relevant to how you act today. Act only where practical, note what stands out, and let the rest go.','source-applied pairing: Practice XXIIa'),
(31,'After every travel session, verify the physical anchor is fully re-established before returning to ordinary activity. During the following day, note any residual disorientation, concentration change, or unusual carryover; reduce or pause if the anchor feels compromised.','source-derived safety/application fieldwork'),
(32,'In ordinary moments, notice whether the absorbed plane-quality appears unprompted without active effort. If it crowds out ordinary functioning, pause absorption for that body and return to simple stabilization until balance returns.','source-derived application and safety fieldwork'),
(33,'In ordinary life, notice whether steadiness or strength becomes harder to attribute to one separate body. Record spontaneous moments of this blended quality; do not force the alloy during daily tasks until Practice XXVI begins.','source-derived integration fieldwork')
), target as (
 select m.id,m.module_number
 from public.training_branch_modules m
 join public.training_branches b on b.id=m.branch_id
 where b.slug='sphere-of-attention'
)
update public.training_branch_modules m
set field_assignment=a.field_assignment,
    metadata=coalesce(m.metadata,'{}'::jsonb)||jsonb_build_object('fieldwork_provenance',a.provenance,'fieldwork_mapped_at','2026-09-07')
from assignments a,target t
where m.id=t.id and t.module_number=a.module_number and (m.field_assignment is null or btrim(m.field_assignment)='');
