INSERT INTO training_branches (slug, title, subtitle, description, sort_order, is_published, metadata)
VALUES (
  'development-program',
  'The Development Program',
  'Inner Tools and the Chakra System',
  $d$A set of daily and situational practices building directly on the six subsidiary exercises already at the center of ASCEND Path's Core Formation — new tools (the dowsing frame, aura protection, the system of signs), morning and evening energy practices, a practice of acceptance for processing reactive judgment, and a complete chakra mantra sequence.

This is where the name "Akharata" itself first appears in the author's own teaching material: among the seven chakra mantras below, Akharata is given as the mantra of the crown center — the direct source of the term the published Akharata System later took its name from.

As with every branch in this library, these practices ask for the same disciplined, impartial observation taught throughout Core Formation. Treat what arises as data to be recorded precisely, not evidence to be believed immediately — the same caution this whole curriculum has applied from its first stage onward.$d$,
  4,
  true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","expansion":"ASCEND training design, translated and restructured from the original Russian","total_modules":13}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title, subtitle=EXCLUDED.subtitle, description=EXCLUDED.description, metadata=EXCLUDED.metadata;

INSERT INTO training_branch_modules (branch_id, module_number, phase_number, phase_title, title, summary, focus, outcome, primary_practice, micro_practice, field_assignment, journal_prompt, integration_practice, minimum_repetitions, safety_level, is_published, metadata)
VALUES
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 1, 1, 'Morning and Evening Rhythm',
  'Meditation Before Sleep',
  'A spoken meditation asking the astral body and the I-consciousness to be carried, in sleep, toward the region that matches your own inner state.',
  '["Sleep meditation","Astral body","Threshold of sleep"]'::jsonb,
  'A conscious, spoken threshold into sleep, rather than simply falling unconscious — the same threshold Chapter 4 of the Akharata System asks a reader to notice, here given words.',
  $p$**Practice:** Speak inwardly or aloud, before sleep: address the night itself — the "great night luminary" that keeps watch over our sleeping earthly bodies — and ask it to wrap your Lunar being, your astral body, and what you call your I-consciousness, in silver light. Ask to be guided, not toward restless wandering, but toward the region that matches your own inner content — into the astral sea, the ocean of pure reason, where the soul can receive the messages of the spiritual worlds and be nourished by the living force of the World of Spirit. Address the starry sky itself, the spirits of the fixed stars and distant galaxies watching over your passage across the vault of earthly being, and ask them to be your guides in the astral world and the world-spirit, on the grounds of a shared nature. Ask to be led to your true home while, under the covering of earthly night, your undivided bodies gather strength. Ask the great World Spirit to fill you with the knowledge and strength of the spiritual world needed for your being and your earthly body to continue its life and fulfill the tasks set for the soul. Close by asking the World Spirit, the Spirits of the Stars, and the Great Isis-Moon to lead you back into your body at the completion of the small death called Sleep — so that, as after the rebirth of the cosmos from deep pralaya, your daytime consciousness will wake again to the tasks of your place on this planet and the reason for your being on Earth. Close: "So be it."$p$,
  'Speak the meditation quietly to yourself as the last act before sleep, without rushing it.',
  NULL,
  'What, if anything, did you carry back from sleep tonight — an image, a mood, a fragment? Note it plainly.',
  'Perform nightly. This pairs directly with the Waking Meditation below — together they form one practice bracketing sleep at both ends.',
  10, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 2, 1, 'Morning and Evening Rhythm',
  'Meditation Immediately After Waking',
  'A spoken meditation asking the daytime I-consciousness to receive what the spirit gathered in the World of Sleep, before the day''s business overwrites it.',
  '["Waking meditation","Threshold of waking","Receiving sleep''s content"]'::jsonb,
  'A brief, deliberate pause at the exact seam between sleep and waking, where Practice XXIII of Sphere of Attention would later call this same threshold "unusually fertile ground for observation."',
  $p$**Practice:** Speak, immediately on waking, before reaching for anything else: the sun's ray hurries to meet the earth, waking everything around, and even the birds fall silent as a new circle of life begins. You see the stars, the far distances — the Spiritual and Astral World falling asleep in that world as your own clear consciousness, which knows all of the spiritual cosmos and the purpose of spirit on Earth, wakes here. The I-consciousness hurries to return to the body, which longs to wake, into the World of Day. The daytime I-consciousness absorbs, like a sponge, the knowledge and strength brought in by the astral body and by the all-seeing awareness from the astral country-seas. Life's force floods back and fills the body with ether after its journeys through the World of Sleep. Into your alert consciousness, the secrets of the cosmos and the Laws of Being that your spirit saw, knew, accounted for, and understood during Sleep enter only dimly, wanting to be passed on. But within you are two worlds — Navi and Yavi — mirrors of one another; what the day-self sees and hears here, it cannot pass to the spirit, and what the One who sees everything in the Spiritual World knows, the daytime self cannot fully grasp. Ask the forces of Light for the wisdom to show you, plainly, what to do, so that this inner mirror can be broken — so that you can become a whole spirit, so that your clear, eternal consciousness may be illuminated fully by your eternal Spirit, and you may come to know who you are.$p$,
  'Speak this before reaching for a phone or beginning the day — a minute is enough.',
  NULL,
  'What crossed over from sleep this morning, however dim or fragmentary?',
  'Perform daily, immediately on waking. Paired with the Sleep Meditation above.',
  10, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 3, 1, 'Morning and Evening Rhythm',
  'Morning Practice: Filling with Energies',
  'A standing practice drawing an ascending current up from the Earth''s core through each body in turn, and a descending current from the Higher Self down through the crown, meeting at the heart.',
  '["Ascending and descending current","Earth connection","Higher Self"]'::jsonb,
  'A felt, two-directional circuit through the whole layered structure of bodies — physical through mental — anchored at both ends, closing at the heart.',
  $p$**Instructions:** Stand upright, feet shoulder-width apart. Close your eyes. Attune to the shared field of the School. Bring attention to your feet, then below your feet to the Earth, to the Earth's core. Ask to be filled with an ascending stream of energy. Observe its color and quality as it rises from the Earth's center, through your feet and up through your legs. Where you sense a block, help the movement continue upward. Let the energy fill the physical body at the tailbone, then the etheric body at the lower abdomen, moving up to the solar plexus, filling the astral body. Attune to the crown of the head, then to your Higher Self. From above, a current of Cosmos descends from the Higher Self, through the crown, filling the fourth, mental body, moving on to the center of the forehead, flowing through and changing color as it reaches the throat, then the heart and chest. Between the heart and the solar plexus the two streams mix — the descending stream fills the lower half of the middle sphere and continues down into the Earth's center; the ascending stream fills the upper half of the middle sphere, the upper sphere, and the sphere above that, continuing out into Cosmos. From the heart, the surplus flows out into the world, surrounding the whole of the Earth. Close by giving thanks to the spirit of the Earth, the Higher Self, the Cosmos, the spirits of the Teachers, and the Higher Powers.$p$,
  'The full standing sequence, morning, before the day begins.',
  NULL,
  'Where did the ascending current meet resistance today? Did the two streams mix cleanly at the heart?',
  'Perform each morning. This is one half of a paired daily rhythm with the Evening Practice below.',
  10, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 4, 1, 'Morning and Evening Rhythm',
  'Evening Practice: Energy of the Stars',
  'Performed after full dark, drawing residual warmth up from the Earth to meet a cold current descending from the distant suns and stars, mixing at the heart.',
  '["Descending starlight","Earth''s residual warmth","Evening rhythm"]'::jsonb,
  'A second, complementary circuit to the morning practice — warmth rising to meet cold descending — closing the day''s energetic rhythm rather than opening it.',
  $p$**Instructions:** Perform after sunset, once it is fully dark. Stand upright, feet shoulder-width apart. Attune to your inner world. Bring attention to your feet, then to the Earth's core and the spirit of the planet Earth. Ask to be filled with the residual warmth-energy of the Earth. Observe this energy rising in a wedge shape up through you, from the feet, continuing as a wedge to the center of the middle sphere. From there it thins and rises as a stream to your head, to the upper sphere, and further up toward the luminaries of distant worlds — suns and stars. In answer, a cold energy descends from the distant suns and stars, entering as a wedge at the upper sphere, through the crown, down to the heart. At the heart, this stream thins and continues downward through the middle and lower spheres, into the legs, feet, and the Earth's center. Observe the two streams mixing in the middle sphere, filling the middle, upper, and lower spheres together. Continue observing until your being's bodies feel sufficiently filled. Close by thanking the spirit of the Earth, the Spirits of the distant Suns and Stars, the spirits of the Teachers, and all the Higher Powers.$p$,
  'The full standing sequence, after dark, most evenings.',
  NULL,
  'How did the two streams — Earth''s warmth and the stars'' cold — feel different tonight from the previous session?',
  'Perform most evenings after dark. Paired with the Morning Practice above.',
  10, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 5, 1, 'Morning and Evening Rhythm',
  'Dynamic Meditation: Evening Balancing',
  'A slow, breath-paced sequence of balancing movements, attuned to the shared field of the School, allowing images to attach to each movement over time.',
  '["Moving meditation","Balance","Breath-paced movement"]'::jsonb,
  'A settled rhythm of movement and breath in which balance, not any single image, is the actual content of the practice.',
  $p$**Instructions:** Attune to the shared field (egregor) of the School. Begin the balancing sequence. Move smoothly, with equally smooth inhalation and exhalation. Close your eyes if possible, and hold your balance. The task is to enter the rhythm of the movements and the breath together. Over time, specific images will begin to attach themselves to each movement in the sequence — allow the time for them to appear rather than forcing them. On completing the sequence, speak a word of thanks for the energies received, and close the practice.$p$,
  'A shortened version of the balancing sequence when time is limited — a few movements held with the same breath-pacing.',
  NULL,
  'Did any image begin to attach itself to a movement tonight? Note it exactly, without embellishing.',
  'Perform most evenings, typically following the Evening Practice above. Do not force imagery onto the movements before it arrives on its own.',
  8, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 6, 1, 'Morning and Evening Rhythm',
  'Meditation on Emptiness',
  'A closing, lying-down practice following the dynamic balancing, in which the energetic channels close and settle.',
  '["Emptiness","Closing practice","Channel settling"]'::jsonb,
  'A settled closing state in which attention moves inward through attention itself, to consciousness, to emptiness — and the day''s energy work is allowed to close rather than left open.',
  $p$**Instructions:** After completing the dynamic meditation, lie down on a flat surface. Place your left palm over your right, two finger-widths below the navel. Rest the tongue against the soft palate. Bring attention to the body, relaxing it with each inhalation and exhalation, from the head down to the toes. Move attention to the breath, letting it gradually even out and settle. Move attention to attention itself, then to consciousness, then to emptiness. In this position, the energetic channels close, and the energies settle into balance.$p$,
  'A brief version — settle the body and breath, then rest attention on emptiness for a few minutes.',
  NULL,
  'How long did it take tonight for the breath and body to settle before attention could rest on emptiness?',
  'Performed as the closing step after the Dynamic Meditation, most evenings.',
  8, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 7, 1, 'Morning and Evening Rhythm',
  'Evening Prayer',
  'A short, spoken prayer for one''s own clarity and for the wider world, performed at a fixed evening hour.',
  '["Prayer","Fixed hour","World-directed intention"]'::jsonb,
  'A brief daily turn of attention outward, toward the world, closing a day otherwise spent in largely inward-facing practice.',
  $p$**Practice:** At a fixed hour each evening, speak: address the All-Merciful Lord directly, asking that your being be lit by divine Light, so that your heart may open and your reason be purified; asking that all people of the Earth receive that same gracious, purifying Light, so that their hearts may open and their minds be freed from evil and hatred; asking that wisdom descend on everyone in this world. Ask that evil, war, hatred, jealousy, envy, and the other vices that have gripped humanity come to an end on Earth. Close that portion: "So be it, Amen." Then address the Great Powers of the Universe directly, asking that they not leave the Earth and humanity without help, in the name of peace and light in the Universe. Close: "So be it, Amen."$p$,
  'Speak the prayer at the same fixed hour daily, even briefly, rather than skipping it when rushed.',
  NULL,
  'Did anything shift in how you held the day''s events after speaking this tonight?',
  'Perform daily, at the same fixed hour, as a closing practice of the day.',
  14, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 8, 2, 'Working with Reaction and Attention',
  'Practice of Acceptance',
  'An evening practice for moments of emotional overflow toward other people, their actions, or their abilities — related to, but distinct from, the six subsidiary exercises.',
  '["Processing reaction","Inner witness","Requesting forgiveness"]'::jsonb,
  'A cooled, examined relationship to a day''s strongest reactions toward other people — closer to Chapter 3''s observer/observed distinction applied specifically to interpersonal judgment.',
  $p$**When to use:** In moments when emotion and expressed judgment toward the people around you become excessive — closely related to one strand of the six subsidiary exercises, but distinct from it. Perform in the evening, once the day's activity has settled.

**Instructions:** Sit comfortably, quiet the mind — a candle and closed eyes can help, though open eyes are fine too. Attune to the most intimate part of your being (soul, spirit, subtle bodies) — the part that is always unchanging, that does not actively participate in ordinary daily consciousness, but that you always sense as a kind of presence within you, an observer, especially when reviewing your day. Ask your Higher Self to show you the whole structure of your life — everything that makes you who you are. Direct attention to whatever provoked your strongest reactions today, toward people, events, the world. Which part of you is reacting? How does that reacting part affect your own energetic structures, and those of the people around you? Look closely at the reacting structure itself — what is it like? Does it carry a noble form? Does it function as an inner guardian? Turn toward those you feel wronged you, and those you may have wronged; observe how the day's grievances affected them and affected you. Ask forgiveness of the World, the Higher Powers, the inner guardian, and anyone you may have hurt, knowingly or not, through your own non-acceptance and its disruptive effect on the World and on your own most intimate structures. Ask to be directed, and for strength and wisdom to accept the World as it is. Give thanks to the Higher Powers and the inner guardian, and close the practice.

**Caution:** This is a demanding practice. It shows you both what you share with other people and what separates you from them, and how unjustified your non-acceptance and distortion of the world often is when the impulse to judge or condemn arises. Approach it carefully.$p$,
  'Reserve for evenings when a real emotional charge from the day is still present — this is not a routine nightly practice.',
  'Notice, across the day, moments of strong reaction toward another person''s actions or abilities, without acting on the judgment.',
  'Whose actions provoked the strongest reaction today? What did looking directly at the reacting part of yourself reveal?',
  'Use as needed rather than on a fixed schedule — specifically when the day has left a real charge of judgment or grievance toward others still unresolved.',
  6, 'enhanced', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II","overload_note":"The source explicitly names this a demanding practice to approach carefully."}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 9, 2, 'Working with Reaction and Attention',
  'Working with the Dowsing Frame',
  'A month-long preparatory bonding period followed by establishing a working yes/no vocabulary with a dowsing (biolocation) frame.',
  '["Dowsing frame","New tool","Yes/no vocabulary"]'::jsonb,
  'A frame that responds reliably to a personally-established yes/no vocabulary, cross-checked against known answers before being trusted with unknown ones.',
  $p$**Preparatory Practice:** Begin carrying the frame with you at all times, keeping it as close to the body as possible — ideally under your pillow at night. This is how the bond between frame and practitioner is established. Continue for one month before proceeding.

**Working with the Frame:** Once you sense a genuine connection — the frame beginning to feel like an extension of your own hand — find a comfortable grip. Your task now is to set the frame's basic working parameters. Start simply: establish that a turn in one direction means Yes and the other means No. Confirm the frame can turn freely in your hand. This stage takes time. Work with the frame daily. Ask questions you already know the answer to, and — more usefully — questions you cannot know the answer to. Develop your own style and language of communication with the frame. Cross-check results with someone you trust: for example, have them write a number on paper and fold it, then, attuned to the frame, ask mentally "one?", "two?", and so on, until the frame turns to "Yes."$p$,
  'A daily check-in with the frame using a question you already know the answer to, to keep calibration honest.',
  NULL,
  'Did today''s frame answers match what you already knew to be true? Where did calibration feel off?',
  'One month of simple carrying before attempting to work with it. After that, daily practice, cross-checked regularly against known answers rather than trusted blindly.',
  20, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 10, 2, 'Working with Reaction and Attention',
  'Aura Protection: The Green Sphere',
  'A daily visualization of a green sphere surrounding the body, built up in density until it can be actively felt, maintained, and checked for weak points.',
  '["Aura protection","Green sphere","Felt density"]'::jsonb,
  'A felt, checkable protective field that can be actively filled by will and monitored for thinning or breach, rather than a static image held once and forgotten.',
  $p$**Instructions:** Each day, mentally surround yourself with a green sphere and actively direct attention into it from every side. Continue this daily until you begin to feel something like a density at the physical level. Set aside dedicated time for this, at the same time each day if possible. The next stage arrives once you can actively fill the green sphere by will and directly feel its state — learning to sense when its density drops, where it sags or thins in particular places, and when it is under active pressure.$p$,
  'A quick daily check-in: bring the sphere to mind and briefly assess its density and any thin points.',
  NULL,
  'Where, if anywhere, did the sphere feel thin or under pressure today?',
  'Daily, at a consistent time, until density can be actively felt and maintained rather than only imagined.',
  14, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 11, 2, 'Working with Reaction and Attention',
  'Service to the World and Opening the Heart',
  'A standing practice of small, systematic acts of care for the world — feeding animals, clearing litter from natural places — undertaken specifically to open the heart center.',
  '["Service","Heart-opening","Systematic small acts"]'::jsonb,
  'A concrete, repeated practice of care extended outward, undertaken specifically as heart-center work rather than as general goodwill.',
  $p$**Instructions:** Make it a standing rule to help the world around you. Begin with something simple — feeding birds, ducks, pigeons, stray animals — the important thing is that it happens systematically. At first you may do this without fully understanding why. The next stage asks you to watch closely for events that precede this act — for instance, before feeding the birds. One purpose of this practice is opening the qualities of the Anahata (heart) chakra. As a companion rule, clear the litter from any natural place where you spend time — before leaving, take with you whatever you can carry out to be disposed of properly. This works on pride, on laziness, and on opening the heart. See the System of Signs practice for what tends to follow.$p$,
  'One small, concrete act of care for the world — feeding an animal, clearing a small piece of litter — done consistently rather than occasionally.',
  'Make this systematic rather than occasional: a standing rule, not a one-off gesture.',
  'What did you notice before or after today''s act of care — any event, however small, worth recording?',
  'Ongoing, as a standing practice. Pairs directly with the System of Signs below.',
  10, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 12, 2, 'Working with Reaction and Attention',
  'The System of Signs',
  'Beginning to notice, and eventually meditate on, the pattern of events the world returns in response to one''s own actions.',
  '["Synchronicity","Feedback from the world","Personal sign system"]'::jsonb,
  'A recognized, personal system of signs through which the world appears to respond to your own actions — built from noticing, over time, rather than assumed in advance.',
  $p$**Instructions:** Begin noticing signs — connected, for instance, to the practice of feeding animals above. Watch how the world responds to your act of help: do the birds seem to expect you, or does a bird from another part of the city come to you? On days you feed them, what else happens? Are there new, unusual, non-logical shifts — fewer confrontational situations, or unexpected material gain? When you visit somewhere in nature and clear litter, what do you sense coming from that space toward you afterward? What signs do you notice, in the short and longer term? Over time your own personal system of signs will begin to form — the way the world speaks back to you. At first the signs appear scattered and disconnected (a billboard you "happened" to glance at answering a question you were holding). Over time, intuition begins to connect your actions with what particular signs mean for you specifically, forming a coherent picture — an understanding of how you affect the world through your actions, and how the world communicates this back to you. The point is that, in the ordinary rush of life, we usually fail to notice that all of our actions receive some response from the world; that response reaches us through the situations of our own lives.

**Meditation on Your System of Signs:** When you feel a need to clarify something about your own system of signs, sit in meditation, attune to your Higher Self, and ask to be shown the connection between your actions in the world and the events that follow. With time, these answers will come more readily, without needing to enter a deep meditative state each time.$p$,
  'A daily glance back: any sign, however small, connected to today''s acts of care or attention?',
  NULL,
  'What sign, if any, did you notice today? Record it precisely rather than interpreting it immediately.',
  'Ongoing. A pattern of signs, specific to you, is expected to take real time to form — treat early, scattered signs as data rather than as a system to be declared complete.',
  10, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part II"}'::jsonb
),
(
  '0d996b33-d813-441e-8f25-c60a0c0a08e7', 13, 3, 'The Chakra System',
  'Chakra Mantra Practice',
  'A seated practice moving through all seven chakras in ascending order using a distinct mantra for each — including Akharata, the mantra given here for the crown center, the direct origin of the term this whole system is named for.',
  '["Seven chakras","Mantra practice","Akharata as crown mantra"]'::jsonb,
  'A direct, personal experience of each chakra in turn — location, vibration, and color — building an internal understanding of the chakra system through practice rather than through description alone.',
  $p$**On the Chakras:** In the traditional teachings, the chakras are compared to a lotus flower, its root in the earth, its stem in the water, its cup in the air. The chakras' roots are the organs and glands located in the physical body; their stems are the nerves and etheric channels — the meridians — in the etheric body; their cups open on the astral plane and the other bodies.

Muladhara (root chakra): located at the tailbone. Corresponds to the element Earth. Governs the skeletal-muscular system, equilibrium, and stability. Mantra: Hum.
Svadhisthana (sacral chakra): located low in the abdomen, the pubic region. Element Water. Governs the urogenital system, adrenal glands, bladder, skin; the senses of touch, cold, and warmth. Mantra: Hara.
Manipura (solar plexus chakra): located at the solar plexus. Element Fire. Governs the digestive organs, pancreas, liver, stomach, and the sense of taste. Mantra: Tara.
Anahata (heart chakra): located at the center of the chest. Element Air. Located in the lungs and the heart system, directly in the heart itself. Mantra: Illa.
Vishuddha (throat chakra): located at the jugular notch, the base of the throat. Corresponds to all the elements below it together, and to space. Rooted in the thyroid and thymus glands; governs the neck muscles and glands in that region; governs hearing. Mantra: Buagir.
Ajna (brow chakra): located at the center of the head and between the brows. Element Time. Governs the perception of time. Rooted in the subcortex, the pituitary gland. Mantra: Sampo.
Sahasrara (crown chakra): located in the subcortical region, at the height of a palm above the head. Mantra: Akharata.

**Practice:** Sit comfortably — the lotus position if it suits you — and light a candle if that helps you settle. Speak the mantra of the School. Calm the body, breath, and mind. Attune to your inner world and to your Higher Self. Ask the spirits of your guides, teachers, and protectors for support in this practice.

First, the root chakra, Muladhara: attune to the tailbone, sing aloud or silently the mantra "Hum," and try to feel the vibration beginning to spread from the tailbone up along the Akharata column. Sense this chakra's qualities and what role it plays in your body and in the whole structure across all your bodies. Remember these sensations. Try, while singing Hum, to call up from the depths of consciousness this chakra's spiritual color — a deep, saturated crimson-red — and fix this image and these sensations.

Second, Svadhisthana: attune to the lower abdomen, sing "Hara," feel the vibration spreading from the lower abdomen along the Akharata column. Sense this chakra's qualities and role. Call up its color — a rich orange — and fix the image.

Third, Manipura: attune to the solar plexus, sing "Tara," merge with the correct sound of this mantra, feel the vibration spreading along the Akharata column. Sense this chakra's qualities and role. Call up its color — sun-yellow — and fix the image.

Fourth, the heart chakra, Anahata: attune to the center of the chest, at the heart, sing "Illa," feel the vibration filling you and spreading along the Akharata column. Sense this chakra's qualities and role in the whole structure of your being, across all your bodies. Call up its color — green — and fix the image.

Fifth, Vishuddha: attune to the jugular notch at the base of the throat, sing "Buagir," feel the vibration spreading from the throat center upward, downward, and outward, flowing out from the root of the chakra on the Akharata column. Sense its qualities and role. Call up its color — a light blue — and fix the image.

Sixth, Ajna: attune to the center of the forehead, the pineal gland, between the brows, sing "Sampo," feel the resonance and the place that answers this mantra's sound, spreading along the Akharata column and through the head. Sense this chakra's qualities and function. Fix these sensations, then call up its color — a deep, saturated blue — and fix the image.

Seventh, Sahasrara: attune to the crown, where this chakra's root sits above the top of the spine, and sense the chakra itself above the head. Sing "Akharata," feel the vibration beginning to spread from where this chakra is located. Sense its qualities — what activates in you when it is fully functioning, and what is absent when it is not. Sense its role in your body and across the whole structure of your bodies. Call up its color — a deep, saturated violet — and fix the image.

**Closing:** Now move back through each chakra in reverse, from Sahasrara down to Muladhara, briefly re-attuning to each through its mantra. Before closing the meditation, give thanks to the forces that supported this practice. Record the results in your journal.$p$,
  'The full seven-chakra ascending sequence, unhurried, one sitting.',
  NULL,
  'Which chakra''s color or vibration was clearest today? Which remained faint or hard to locate?',
  'The aim of this practice is a genuine internal understanding of the chakras and the chakra system — knowing where they are, what they feel like, by direct experience rather than by description. This is internal, actual experience, not knowledge taken from a book.',
  8, 'standard', true,
  '{"source":"Programma Razvitiya (Development Program)","author":"Oleksandr Dmytruk","original_language":"Russian","part":"Part III","note":"Akharata is given here as the mantra of the crown chakra — the direct origin of the term \"Akharata System.\""}'::jsonb
);
