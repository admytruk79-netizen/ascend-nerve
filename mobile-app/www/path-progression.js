(()=>{
  const MONTHS=[
    {month:1,title:'Observation Foundation',gate:'ENTRY'},
    {month:2,title:'Embodied Observation'},
    {month:3,title:'Breath & Rhythm'},
    {month:4,title:'Directed Attention'},
    {month:5,title:'Practice Rhythm & Spiral'},
    {month:6,title:'Physical / Etheric Foundation'},
    {month:7,title:'Astral / Emotional Observation',gate:'FOUNDATION REVIEW'},
    {month:8,title:'Mental Organization & Discernment'},
    {month:9,title:'Akharata — Locating Axis'},
    {month:10,title:'Akharata — Vertical Development',gate:'PART I GATE'},
    {month:11,title:'Energy as Directed Quality'},
    {month:12,title:'Ascending / Descending Balance'},
    {month:13,title:'Harmony & Proportion'},
    {month:14,title:'Lower-Center Preparation'},
    {month:15,title:'Lower Centers'},
    {month:16,title:'Middle Centers'},
    {month:17,title:'Upper-Center Preparation'},
    {month:18,title:'Upper Centers',gate:'PART II GATE'},
    {month:19,title:'Whole-System Center Integration'},
    {month:20,title:'Energy Literacy & Integration'},
    {month:21,title:'Integrated Discipline'},
    {month:22,title:'Discernment & Source Awareness'},
    {month:23,title:'Independent Practice Architecture'},
    {month:24,title:'Open Gate / Continuation',gate:'PATH REVIEW'}
  ];

  // Stages remain readiness milestones inside the existing ASCEND hierarchy.
  // They do not replace the 24 monthly units and Practice Branches never advance
  // Core Formation. Gate completion opens the next existing Core range; elapsed
  // time alone never skips monthly work after a gate.
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
