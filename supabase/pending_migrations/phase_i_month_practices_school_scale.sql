-- ASCEND Phase I School-scale month practices
-- Canonical sources: 24-Month Practice Map v2.2 + 24 module documents.
-- Preserves the existing backend stage/readiness grouping while giving each canonical
-- month its own primary practice payload. Generated IDs are never hard-coded.

with practice_seed(month_no,slug,title,minutes,instructions,purpose,fieldwork) as (
  values
  (1,'core-m01-observation-foundation','Observation Foundation',10,
   'Orientation: settle into a stable posture and let external activity quiet. Preparation: notice contact, posture, sound and the natural breath without changing it. Practice: follow the breath as it is for the central portion of the session; when attention wanders, return without self-criticism. Quiet observation: notice what was directly perceived and what was interpretation. Completion: name one concrete observation before leaving the practice. Do not try to produce unusual states.',
   'Establish rhythm, direct observation and the distinction between experience and interpretation.',
   'During ordinary activity, pause briefly and name one direct perception before explaining it.'),
  (2,'core-m02-embodied-attention','Embodied Attention',12,
   'Orientation: arrive through contact with the chair or floor. Preparation: scan posture, pressure, temperature and muscular tone without trying to improve them. Practice: move attention slowly through the body and then include the surrounding environment while retaining bodily contact. Quiet observation: distinguish sensation from the story about sensation. Completion: record the clearest bodily fact you noticed.',
   'Develop stable contact with bodily sensation, posture, environment and present-moment observation.',
   'Carry embodied attention into walking, standing and one routine daily movement.'),
  (3,'core-m03-breath-rhythm','Breath & Rhythm',10,
   'Orientation: settle and observe the body before attending to breathing. Preparation: allow several natural breaths without counting or control. Practice: observe the full cycle of inhalation, turning point, exhalation and pause. If rhythm changes by itself, note it without forcing a pattern. Quiet observation: notice attention, ease, effort and distraction. Completion: return to whole-body awareness and record one before-and-after difference.',
   'Use natural breathing as a steady attentional instrument without turning breathwork into performance.',
   'Establish a consistent practice time and use one brief natural-breath recall during the day.'),
  (4,'core-m04-directed-attention','Directed Attention',12,
   'Orientation: choose one ordinary neutral object. Preparation: look at it simply before analysing it. Practice: direct thought deliberately through its observable features, parts, function and relationships; when unrelated thought appears, notice and return. Quiet observation: rest for a minute without adding new analysis and notice the quality of attention. Completion: record where attention was strongest and where it escaped.',
   'Train voluntary concentration and deliberate return from distraction without self-punishment.',
   'Choose one ordinary-life task each day and complete a short interval without switching attention.'),
  (5,'core-m05-deliberate-action','Deliberate Action',10,
   'Orientation: choose one small action that is useful, harmless and not already automatic. Preparation: define exactly what will be done and when. Practice: rehearse the decision inwardly, notice resistance without bargaining with it, and perform the chosen action at the appointed time. Quiet observation: after the action, sit briefly with the difference between impulse and decision. Completion: record whether the action was done exactly as chosen and what interfered.',
   'Strengthen will through small chosen actions carried out consistently and precisely.',
   'Repeat the same chosen action daily until it is stable; then add complexity only gradually.'),
  (6,'core-m06-equanimity','Equanimity',12,
   'Orientation: recall one recent emotional movement without deliberately intensifying it. Preparation: locate its bodily and attentional qualities. Practice: allow the feeling to be present while observing it without suppression, indulgence or immediate expression. Quiet observation: notice the gap between feeling and response. Completion: choose one deliberate form of response or non-response and record what changed.',
   'Observe emotional movement while cultivating steadiness rather than suppression.',
   'During one emotionally charged moment each day, notice feeling first and choose expression second.'),
  (7,'core-m07-constructive-perception','Constructive Perception',12,
   'Orientation: bring to mind an ordinary difficulty, mistake or unattractive situation. Preparation: state the difficulty plainly without minimising it. Practice: look deliberately for what is also accurate, useful, beautiful, good or instructive in the same situation. Do not force optimism and do not erase criticism. Quiet observation: compare the first perception with the fuller one. Completion: record both the difficulty and the additional perception.',
   'Develop balanced perception that can recognise constructive qualities without denial or sentimentality.',
   'Once daily, find one neglected constructive fact inside a situation you would normally dismiss.'),
  (8,'core-m08-openness-discernment','Openness & Discernment',12,
   'Orientation: choose an object, event or idea you believe you already understand. Preparation: name your existing assumption. Practice: observe again and look for one genuinely new detail, relationship or possibility. Hold new impressions provisionally rather than believing or rejecting them immediately. Quiet observation: separate perception, inference, memory, fantasy and wish. Completion: record what changed and what remains uncertain.',
   'Hold unfamiliar experience provisionally while maintaining critical judgment.',
   'In conversation or study, identify one assumption and test it against new observation before deciding.'),
  (9,'core-m09-inner-quiet','Inner Quiet',12,
   'Orientation: establish posture and a few minutes of natural breathing. Preparation: notice the stream of commentary without trying to stop it by force. Practice: let each thought be recognised and released without following its argument; repeatedly return to receptive awareness of breath, body and sound. Quiet observation: include the spaces between thoughts. Completion: note whether quiet was absent, brief or sustained without grading the result.',
   'Reduce unnecessary inner commentary and develop receptive silence.',
   'Use three short pauses during the day in which you stop adding commentary and simply receive what is present.'),
  (10,'core-m10-inner-witness','The Inner Witness',15,
   'Orientation: settle into embodied attention. Preparation: notice one current sensation, one feeling and one thought. Practice: observe these changing contents while also noticing the stable standpoint from which they are being noticed. Do not turn the witness into an imagined entity or attainment. Quiet observation: let contents come and go without choosing a preferred state. Completion: record what was observed and what you inferred about the observer separately.',
   'Strengthen the distinction between changing inner contents and the act of observing them.',
   'In one ordinary reaction each day, silently note sensation, feeling, thought and observing awareness as separate data.'),
  (11,'core-m11-sense-refinement','Sense Refinement',15,
   'Orientation: choose one sense domain for the session. Preparation: reduce distraction and establish a neutral baseline. Practice: attend closely to gradations of colour, sound, texture, temperature, pressure or movement without immediately naming or evaluating them. Quiet observation: compare raw sensory detail with the concepts that arrived afterward. Completion: record three precise observations in concrete language.',
   'Deepen sensory precision and distinguish raw observation from interpretation.',
   'Choose one everyday sensory event and describe it with concrete detail before assigning meaning.'),
  (12,'core-m12-imaginative-attention','Imaginative Attention',15,
   'Orientation: ground in breath and bodily sensation first. Preparation: choose a simple neutral image, form or remembered object. Practice: hold the image deliberately for a short interval, release it, then recreate it and compare what changed. Distinguish intentional imagination from spontaneous perception. Quiet observation: return fully to ordinary sensory awareness. Completion: record image, changes, effort and uncertainty without treating imagery as external fact.',
   'Develop disciplined imagination while preserving the boundary between image, memory, inference and perception.',
   'Notice once daily when imagination fills in missing information and label that addition explicitly.'),
  (13,'core-m13-patterns-repetition','Patterns & Repetition',15,
   'Orientation: review several recent journal observations. Preparation: choose one recurring behaviour, attentional habit or reaction. Practice: reconstruct two or three concrete instances in sequence, noting trigger, bodily state, thought, action and result. Quiet observation: look for repetition without forcing a single explanation. Completion: name the pattern provisionally and one point where a different response could be tested.',
   'Recognise recurring behavioural and attentional patterns across practice and ordinary life.',
   'When the selected pattern appears, note it briefly in real time before trying to change it.'),
  (14,'core-m14-resistance-friction','Resistance & Friction',15,
   'Orientation: choose one current point of avoidance, impatience, fatigue or defensiveness. Preparation: distinguish real limits from automatic resistance. Practice: stay with the bodily and mental texture of resistance for several minutes without attacking or obeying it; then take one small proportionate action. Quiet observation: notice what changed after contact and action. Completion: record resistance, limit, action and outcome separately.',
   'Work consciously with avoidance, impatience, fatigue and self-protective reactions.',
   'Use one small, safe action each day to test whether resistance changes through direct engagement.'),
  (15,'core-m15-biography-meaning','Biography & Meaning',15,
   'Orientation: select one bounded life period or event rather than the whole biography. Preparation: list observable facts before interpretations. Practice: review the sequence, important relationships, choices and consequences while noticing where later meaning has been projected backward. Quiet observation: allow multiple possible meanings to remain open. Completion: write one factual summary, one interpretation and one unresolved question.',
   'Examine biography carefully while separating remembered fact, present interpretation and unresolved meaning.',
   'Notice how one current choice echoes or differs from an earlier pattern without claiming a fixed destiny.'),
  (16,'core-m16-values-action','Values Into Action',15,
   'Orientation: choose one value you claim matters in ordinary life. Preparation: define one observable behaviour that would express it today. Practice: examine the gap between stated value, impulse, habit and action; then mentally rehearse one precise value-aligned action. Quiet observation: notice resistance and competing values. Completion: commit to one concrete action and later record what actually happened.',
   'Translate reflective values into observable conduct and test them in ordinary life.',
   'Carry out one small value-aligned action and record the actual consequence rather than the intended image of yourself.'),
  (17,'core-m17-relational-presence','Relational Presence',15,
   'Orientation: settle into bodily contact and natural breath. Preparation: recall a recent interaction or prepare for an upcoming one. Practice: attend simultaneously to your own bodily state, the other person’s actual words and behaviour, and the impulse to predict or defend. Quiet observation: distinguish contact from projection. Completion: identify one moment of genuine listening and one moment where assumption replaced contact.',
   'Develop steadier presence in relationship without losing self-observation or projecting certainty onto others.',
   'In one conversation daily, practise listening through the end of a sentence before preparing your response.'),
  (18,'core-m18-resonance-differentiation','Resonance & Differentiation',15,
   'Orientation: ground attention in your own body and emotional state. Preparation: choose one recent relational or environmental impression. Practice: notice what changes in you while recalling or encountering it, then separate what is directly yours, what is observed externally and what is interpretation. Quiet observation: tolerate uncertainty rather than assigning invisible causes. Completion: record the three layers separately.',
   'Train sensitivity to relational resonance while preserving differentiation and epistemic caution.',
   'When a strong atmosphere or interpersonal impression arises, record your own change first before explaining its source.'),
  (19,'core-m19-compassion-service','Compassion & Service',15,
   'Orientation: choose one real person, group or ordinary situation where help is possible. Preparation: notice motives such as rescue, guilt, recognition or avoidance. Practice: cultivate warm attention while asking what action is actually useful, proportionate and lawful. Quiet observation: distinguish compassion from self-image. Completion: choose one small act of service or restraint and later record its real effect.',
   'Connect inner development with compassionate, proportionate service in ordinary life.',
   'Perform one small act of useful service without seeking recognition and observe your motives before and after.'),
  (20,'core-m20-energetic-literacy','Energetic Literacy',18,
   'Orientation: begin with posture, ordinary sensation and natural breathing. Preparation: establish the central axis from feet through the upright spine as an attentional reference. Practice: observe qualities such as heaviness/lightness, expansion/contraction, warmth/coolness or upward/downward tendency without treating them as proof of a metaphysical mechanism. Quiet observation: return to ordinary sensory grounding. Completion: record sensation first, energetic interpretation second and uncertainty third.',
   'Introduce embodied energetic observation cautiously while preserving observation-before-interpretation.',
   'Briefly notice centredness, grounding and directional quality during ordinary movement; stop or simplify if practice disrupts ordinary functioning.'),
  (21,'core-m21-integration-disciplines','Integration of Disciplines',18,
   'Orientation: review the practices already established and choose only those relevant today. Preparation: set one primary practice and one continuing discipline. Practice: complete the primary exercise without constantly switching methods, then add a short continuing component. Quiet observation: notice whether the combination supports coherence or creates clutter. Completion: record what belongs in the personal rhythm and what should remain occasional.',
   'Combine established practices into a coherent personal rhythm without losing their distinct purposes.',
   'Test the chosen rhythm in ordinary life for one week before adding anything new.'),
  (22,'core-m22-discernment-responsibility','Discernment & Responsibility',15,
   'Orientation: choose one claim, interpretation or practice belief currently important to you. Preparation: identify its source and whether it is observation, tradition, inference or personal meaning. Practice: compare the claim with direct experience and alternative explanations while preserving what remains genuinely useful. Quiet observation: notice the wish for certainty. Completion: record what is supported, what is provisional and what should not be claimed.',
   'Strengthen judgment, source-awareness, limits and responsibility for interpretation.',
   'Before repeating an important spiritual or psychological claim, identify its source and the level of certainty you actually have.'),
  (23,'core-m23-independent-practice-design','Independent Practice Design',20,
   'Orientation: review your current primary, continuing, weekly and grounding practices. Preparation: identify the developmental purpose of each and remove unnecessary duplication. Practice: design a sustainable weekly rhythm with one clear primary practice, limited continuing work, ordinary-life application and review. Quiet observation: test the plan against available time, health, work and relationships. Completion: write the plan as a simple schedule and one rule for reducing intensity when overloaded.',
   'Build a sustainable practice architecture using primary, continuing and contextual practices.',
   'Live the designed rhythm for a week, tracking sustainability and ordinary functioning rather than perfection.'),
  (24,'core-m24-open-gate','The Open Gate',20,
   'Orientation: gather representative observations from the full formation. Preparation: review consistency, changes in attention and conduct, unfinished work, overload history and the disciplines that remain necessary. Practice: compare the opening record with the present record without forcing a success narrative; identify evidence, ambiguity and contradiction. Quiet observation: sit without deciding your own attainment. Completion: record what is established, what requires continuation and what questions belong to formal readiness review.',
   'Review the two-year formation, consolidate evidence of development and transition toward self-directed practice without self-certification.',
   'Maintain ordinary practice while the Open Gate readiness process is completed; calendar time alone does not open Phase II.')
), upserted as (
  insert into public.path_practices(slug,title,practice_type,instructions,default_minutes,metadata,is_published)
  select slug,title,'primary',instructions,minutes,
    jsonb_build_object(
      'source','ASCEND 24-Month Practice Map v2.2 + canonical module document',
      'month',month_no,
      'canonical_month',true,
      'school_scale',true,
      'purpose',purpose,
      'fieldwork',fieldwork,
      'session_architecture','orientation → preparation → deliberate practice → quiet observation → completion reflection',
      'journal_prompt','What did I directly observe? What interpretation am I making, and what remains uncertain?'
    ),true
  from practice_seed
  on conflict(slug) do update set
    title=excluded.title,
    practice_type=excluded.practice_type,
    instructions=excluded.instructions,
    default_minutes=excluded.default_minutes,
    metadata=public.path_practices.metadata || excluded.metadata,
    is_published=true
  returning id,slug,(metadata->>'month')::int as month_no
), mapped as (
  select u.id as practice_id,u.month_no,s.id as stage_id
  from upserted u
  join public.path_stages s
    on s.is_published=true
   and u.month_no between coalesce((s.metadata->>'month_start')::int,s.sort_order)
                      and coalesce((s.metadata->>'month_end')::int,s.sort_order)
)
insert into public.path_stage_practices(stage_id,practice_id,role,frequency_rule,sort_order)
select stage_id,practice_id,'primary',jsonb_build_object('cadence','daily','canonical_month',month_no,'required',true),100+month_no
from mapped
on conflict(stage_id,practice_id,role) do update set
  frequency_rule=excluded.frequency_rule,
  sort_order=excluded.sort_order;

-- Keep existing historical practices and continuing-practice links intact. The UI
-- selects the canonical month primary by metadata.month; the server accepts it because
-- it is assigned to the authoritative active stage.
