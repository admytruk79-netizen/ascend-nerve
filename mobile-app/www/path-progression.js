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
    {month:22,title:'Outer Octaves · Three Centres'},
    {month:23,title:'Ancestors & Higher Self'},
    {month:24,title:'Final Integration',gate:'PATH REVIEW'}
  ];

  // Stages are readiness milestones, not substitutes for the 24 monthly units.
  // Stages 1-7 map directly to Foundation months 1-7. Passing Foundation Review
  // opens month 8; passing Part II opens month 19. Time spent before a gate can
  // never be used to skip the monthly work after that gate.
  const rangeForStage=sortOrder=>{
    const s=Math.max(1,Number(sortOrder)||1);
    if(s<=7)return{start:s,end:s};
    if(s===8)return{start:8,end:18};
    return{start:19,end:24};
  };
  const capForStage=sortOrder=>rangeForStage(sortOrder).end;
  const elapsedMonth=(startedAt,now=new Date())=>{
    const started=new Date(startedAt||now);
    if(Number.isNaN(started.getTime()))return 1;
    return Math.max(1,(now.getFullYear()-started.getFullYear())*12+(now.getMonth()-started.getMonth())+1);
  };
  const monthFor=({stageSortOrder=1,stageStartedAt,now=new Date()})=>{
    const range=rangeForStage(stageSortOrder);
    if(range.start===range.end)return range.start;
    return Math.min(range.end,range.start+elapsedMonth(stageStartedAt,now)-1);
  };

  let cache=null,cacheAt=0;
  async function current({fresh=false}={}){
    if(!window.PathBackend?.isSignedIn?.())return{month:1,stageSortOrder:1,stageTitle:'Beginning',stageMetadata:{},signedIn:false};
    if(!fresh&&cache&&Date.now()-cacheAt<15000)return cache;
    const user=await PathBackend.me();
    if(!user)return{month:1,stageSortOrder:1,stageTitle:'Beginning',stageMetadata:{},signedIn:false};
    const [profiles,stages,progress]=await Promise.all([
      PathBackend.rest('path_profiles',{query:`user_id=eq.${user.id}&select=path_started_at,current_stage_id`}),
      PathBackend.rest('path_stages',{query:'select=id,sort_order,title,metadata&is_published=eq.true&order=sort_order.asc'}),
      PathBackend.rest('path_student_progress',{query:`user_id=eq.${user.id}&select=stage_id,status,started_at&order=started_at.asc`})
    ]);
    const profile=profiles[0]||{};
    const active=progress.find(row=>row.status==='active'||row.status==='review')||progress[progress.length-1];
    const stage=stages.find(row=>row.id===(active?.stage_id||profile.current_stage_id))||stages[0]||{sort_order:1,title:'Beginning'};
    cache={
      month:monthFor({stageSortOrder:stage.sort_order,stageStartedAt:active?.started_at||profile.path_started_at}),
      stageSortOrder:Number(stage.sort_order)||1,
      stageTitle:stage.title||'Beginning',
      stageMetadata:stage.metadata||{},
      signedIn:true
    };
    cacheAt=Date.now();
    return cache;
  }
  function invalidate(){cache=null;cacheAt=0}
  window.ASCENDProgression={MONTHS,rangeForStage,capForStage,elapsedMonth,monthFor,current,invalidate};
})();
