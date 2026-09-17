// ── LIBRARY RESONANCE ENGINE ────────────────────────────────────────────
// Deterministic, explainable weighted ranking for the Library's
// "Recommended for You" rail — no network calls, no LLM. Ported directly
// from ASCEND Keys' card-draw Resonance Engine (mobile-app/www/app.js in
// the sibling repo), adapted to book chapters instead of cards. Four
// signals combine into one weight per content item:
//  1. Recency weighting — an item viewed recently is less likely to be
//     recommended again until the weighting window (RECENCY_WINDOW views)
//     passes.
//  2. Part-fairness weighting — the book's five Parts, under-represented
//     relative to their natural share of the tagged chapters, get a
//     boost; over-represented Parts get dampened, computed from the
//     student's own view history. Items with no Part tag (the shorter,
//     pre-existing excerpt items) are always neutral here.
//  3. Content-type diversity — within one rail render, a content_type
//     that's already appeared is avoided on later picks when an
//     alternative exists, so the rail reads as several distinct kinds of
//     material rather than three readings in a row.
//  4. Foundation-first gating — a soft (never hard) down-weight on Part
//     IV/V chapters until the student has viewed at least a few items
//     from Parts I-III, matching the book's own repeated "foundation
//     before ascending material" teaching (Chapters 5, 14, 16). Nothing
//     is ever blocked; this only affects ranking.
// A fifth, optional signal folds in as a plain multiplier rather than a
// separate weight function: light keyword overlap between an item's
// title/summary and the student's own recent journal text (bag-of-words,
// no ML, no network — see journalKeywordWeight below). Falls back to
// neutral whenever there's no history or journal text yet — first visit,
// signed out, or a brand-new student all degrade to the same safe
// default, exactly like the Keys engine.
(()=>{
  const LIBRARY_HISTORY_KEY = 'ascend_path_library_history';
  const LIBRARY_HISTORY_MAX = 200;
  const RECENCY_WINDOW = 12;
  const FAIRNESS_WINDOW = 40;
  const STOPWORDS = new Set(['the','and','for','that','this','with','from','have','has','had','was','were','are','you','your','not','but','all','any','can','how','what','when','where','why','who','which','into','than','then','them','they','their','its','it\'s','about','over','under','more','most','some','such','only','also','just','still','been','being','because','while','after','before','again','once','here','there','very','much','many','own','same','other','onto','upon','off','out','per']);

  function loadLibraryHistory(){
    try{
      const raw = JSON.parse(localStorage.getItem(LIBRARY_HISTORY_KEY) || '[]');
      return Array.isArray(raw) ? raw : [];
    }catch(e){ return []; }
  }

  function recordLibraryView(item){
    try{
      const history = loadLibraryHistory();
      history.push({ slug: item.slug, part: item.metadata?.part || null, ts: Date.now() });
      const trimmed = history.slice(-LIBRARY_HISTORY_MAX);
      localStorage.setItem(LIBRARY_HISTORY_KEY, JSON.stringify(trimmed));
    }catch(e){}
  }

  // Weight 1 = neutral. An item viewed `d` views ago (1 = most recent) is
  // weighted down toward .15 and recovers linearly back to 1 by the time
  // RECENCY_WINDOW views have passed since it last appeared.
  function recencyWeight(slug, history){
    for(let i=history.length-1;i>=0;i--){
      if(history[i].slug===slug){
        const d = history.length - i;
        if(d>=RECENCY_WINDOW) return 1;
        return 0.15 + 0.85*(d/RECENCY_WINDOW);
      }
    }
    return 1;
  }

  // naturalShare is computed over the pool actually passed in, so it
  // stays accurate as chapters are added. Only items carrying a Part tag
  // count toward either share; untagged items are handled by the caller
  // (they always get weight 1 here since `part` will be null/undefined).
  function partFairnessWeight(part, history, pool){
    if(!part) return 1;
    const recent = history.slice(-FAIRNESS_WINDOW);
    if(recent.length<6) return 1;
    const tagged = pool.filter(i=>i.metadata?.part);
    if(!tagged.length) return 1;
    const naturalShare = tagged.filter(i=>i.metadata.part===part).length / tagged.length;
    const taggedRecent = recent.filter(e=>e.part);
    if(!taggedRecent.length) return 1;
    const matches = taggedRecent.filter(e=>e.part===part).length;
    const actualShare = matches / taggedRecent.length;
    if(actualShare===0) return 1.6;
    const ratio = naturalShare/actualShare;
    return Math.max(0.5, Math.min(1.8, ratio));
  }

  function withTypeAvoidance(entries, baseWeightFn, usedTypes){
    const anyFresh = entries.some(i=>!usedTypes.has(i.content_type));
    if(!anyFresh) return baseWeightFn;
    return i => (usedTypes.has(i.content_type) ? 0 : baseWeightFn(i));
  }

  function weightedSplicePick(entries, weightFn){
    const weights = entries.map(weightFn);
    const total = weights.reduce((a,b)=>a+b,0);
    let threshold = total>0 ? Math.random()*total : Math.random()*entries.length;
    let idx = entries.length-1;
    for(let i=0;i<entries.length;i++){
      threshold -= total>0 ? weights[i] : 1;
      if(threshold<=0){ idx=i; break; }
    }
    return entries.splice(idx,1)[0];
  }

  function tokenize(text){
    return String(text||'')
      .toLowerCase()
      .replace(/[^a-z0-9\s']/g,' ')
      .split(/\s+/)
      .filter(t=>t.length>=3 && !STOPWORDS.has(t));
  }

  function buildTokenCounts(text){
    const counts = new Map();
    tokenize(text).forEach(t=>counts.set(t,(counts.get(t)||0)+1));
    return counts;
  }

  // Light bag-of-words relevance — counts how many of an item's own
  // title/summary tokens also appear in the student's recent journal
  // text, and nudges the item up accordingly, capped so this signal can
  // never dominate recency/fairness. No model, no network call: just
  // counting shared words.
  function journalKeywordWeight(item, journalTokenCounts){
    if(!journalTokenCounts || journalTokenCounts.size===0) return 1;
    const itemTokens = new Set(tokenize(`${item.title||''} ${item.summary||''}`));
    let overlap = 0;
    itemTokens.forEach(t=>{ if(journalTokenCounts.has(t)) overlap++; });
    if(!overlap) return 1;
    return 1 + Math.min(0.6, overlap*0.15);
  }

  // Soft down-weight, never a hard lock: Part IV/V material is
  // deprioritized in the rail until the student's view history shows at
  // least 3 distinct items from Parts I-III. Anything not on that later
  // track (or untagged) is unaffected.
  function foundationGateWeight(item, history){
    const part = item.metadata?.part;
    if(part!=='Part IV' && part!=='Part V') return 1;
    const earlyParts = new Set(['Part I','Part II','Part III']);
    const distinctEarly = new Set(
      history.filter(e=>e.part && earlyParts.has(e.part)).map(e=>e.slug)
    );
    return distinctEarly.size>=3 ? 1 : 0.4;
  }

  function recommend(items, opts){
    opts = opts || {};
    const history = opts.history || [];
    const n = opts.n || 3;
    const pool = items.filter(i=>i && i.title);
    const journalTokenCounts = buildTokenCounts(opts.journalText||'');
    const entries = [...pool];
    const picked = [];
    const usedTypes = new Set();
    for(let i=0;i<n && entries.length;i++){
      const base = c =>
        recencyWeight(c.slug, history) *
        partFairnessWeight(c.metadata?.part, history, pool) *
        journalKeywordWeight(c, journalTokenCounts) *
        foundationGateWeight(c, history);
      const item = weightedSplicePick(entries, withTypeAvoidance(entries, base, usedTypes));
      usedTypes.add(item.content_type);
      picked.push(item);
    }
    return picked;
  }

  window.LibraryEngine = { loadLibraryHistory, recordLibraryView, recommend };
})();
