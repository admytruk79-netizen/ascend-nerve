(()=>{
  const MONTHS=[
    {month:1,title:'Foundation · Self-Contemplation',gate:'ENTRY'},
    {month:2,title:'Clarity · Thought'},
    {month:3,title:'Constancy · Will'},
    {month:4,title:'Equanimity'},
    {month:5,title:'Positive Perception'},
    {month:6,title:'Openness'},
    {month:7,title:'Impartial Retrospect',gate:'FOUNDATION REVIEW'},
    {month:8,title:'Consolidation · Continuing Practice'},
    {month:9,title:'Consolidation · Observation & Integration'},
    {month:10,title:'Preparation · Review & Readiness',gate:'PART I GATE'},
    {month:11,title:'Part II · Energy Gain'},
    {month:12,title:'Star Energy'},
    {month:13,title:'Emptiness'},
    {month:14,title:'New Tools'},
    {month:15,title:'Green Sphere'},
    {month:16,title:'Helping the World'},
    {month:17,title:'Integration'},
    {month:18,title:'Consolidation',gate:'PART II GATE'},
    {month:19,title:'Part III · Seven Chakra'},
    {month:20,title:'Elements'},
    {month:21,title:'Inner Octaves'},
    {month:22,title:'Three Centres'},
    {month:23,title:'Ancestors & Higher Self'},
    {month:24,title:'Final Integration',gate:'PATH REVIEW'}
  ];

  // One formation unit is deliberately slower than content consumption.
  // Calendar time is only a minimum condition. A later month opens only after
  // confirmed practice, reflection, and ordinary-life application accumulate.
  const FORMATION_UNIT_DAYS=21;
  const rangeForStage=sortOrder=>{
    const s=Math.max(1,Number(sortOrder)||1);
    if(s<=7)return{start:s,end:s};
    if(s===8)return{start:8,end:18};
    return{start:19,end:24};
  };
  const capForStage=sortOrder=>rangeForStage(sortOrder).end;
  const evidenceCount=value=>Math.max(0,Number(value)||0);
  const lifeEvidence=evidence=>evidenceCount(evidence?.life_application_entries)+evidenceCount(evidence?.training_in_life_logs);
  const completedFormationUnits=evidence=>{
    if(!evidence)return 0;
    const practiceUnits=Math.floor(evidenceCount(evidence.practice_days)/FORMATION_UNIT_DAYS);
    const durationUnits=Math.floor(evidenceCount(evidence.elapsed_days)/FORMATION_UNIT_DAYS);
    const reflectionUnits=evidenceCount(evidence.journal_entries);
    const applicationUnits=lifeEvidence(evidence);
    return Math.max(0,Math.min(practiceUnits,durationUnits,reflectionUnits,applicationUnits));
  };
  const monthFor=({stageSortOrder=1,evidence=null})=>{
    const range=rangeForStage(stageSortOrder);
    if(range.start===range.end)return range.start;
    const span=range.end-range.start;
    return range.start+Math.min(span,completedFormationUnits(evidence));
  };

  let cache=null,cacheAt=0;
  async function current({fresh=false}={}){
    if(!window.PathBackend?.isSignedIn?.())return{month:1,stageSortOrder:1,stageTitle:'Beginning',signedIn:false,formationUnits:0};
    if(!fresh&&cache&&Date.now()-cacheAt<15000)return cache;
    const user=await PathBackend.me();
    if(!user)return{month:1,stageSortOrder:1,stageTitle:'Beginning',signedIn:false,formationUnits:0};
    const [profiles,stages,progress]=await Promise.all([
      PathBackend.rest('path_profiles',{query:`user_id=eq.${user.id}&select=path_started_at,current_stage_id`}),
      PathBackend.rest('path_stages',{query:'select=id,sort_order,title&is_published=eq.true&order=sort_order.asc'}),
      PathBackend.rest('path_student_progress',{query:`user_id=eq.${user.id}&select=stage_id,status,started_at,practice_days&order=started_at.asc`})
    ]);
    const profile=profiles[0]||{};
    const active=progress.find(row=>row.status==='active'||row.status==='review')||progress[progress.length-1];
    const stage=stages.find(row=>row.id===(active?.stage_id||profile.current_stage_id))||stages[0]||{sort_order:1,title:'Beginning'};
    const stageSortOrder=Number(stage.sort_order)||1;
    let evidence=null;
    if(stageSortOrder>7&&active?.stage_id){
      try{evidence=await PathBackend.rpc('path_get_readiness_evidence',{p_stage_id:active.stage_id})}
      catch(err){console.error('Could not load formation evidence; holding current monthly unit.',err)}
    }
    const formationUnits=completedFormationUnits(evidence);
    cache={
      month:monthFor({stageSortOrder,evidence}),
      stageSortOrder,
      stageTitle:stage.title||'Beginning',
      signedIn:true,
      formationUnits,
      evidenceReady:!!evidence?.evidence_ready
    };
    cacheAt=Date.now();
    return cache;
  }
  function invalidate(){cache=null;cacheAt=0}
  window.ASCENDProgression={MONTHS,FORMATION_UNIT_DAYS,rangeForStage,capForStage,completedFormationUnits,monthFor,current,invalidate};
})();
