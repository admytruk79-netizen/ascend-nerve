(()=>{
  /* Canonical Phase I display map from ASCEND School of Initiation Master Curriculum v3.0.
     Month labels are nominal containers; backend readiness remains authoritative. */
  const MONTHS=[
    {month:1,title:'Orientation to the Path',focus:'Observation Foundation'},
    {month:2,title:'Embodied Attention',focus:'Embodied Observation'},
    {month:3,title:'Breath and Rhythm',focus:'Breath & Rhythm'},
    {month:4,title:'Directed Attention',focus:'Directed Attention',gate:'GATE 1'},
    {month:5,title:'Deliberate Action',focus:'Practice Rhythm & Spiral'},
    {month:6,title:'Equanimity',focus:'Physical / Etheric Foundation'},
    {month:7,title:'Constructive Perception',focus:'Astral / Emotional Observation'},
    {month:8,title:'Openness and Discernment',focus:'Mental Organization & Discernment',gate:'GATE 2'},
    {month:9,title:'Inner Quiet',focus:'Akharata — Locating the Axis'},
    {month:10,title:'The Inner Witness',focus:'Akharata — Vertical Development'},
    {month:11,title:'Sense Refinement',focus:'Energy as Directed Quality'},
    {month:12,title:'Imaginative Attention',focus:'Ascending / Descending Balance',gate:'GATE 3'},
    {month:13,title:'Patterns and Repetition',focus:'Harmony & Proportion'},
    {month:14,title:'Resistance and Friction',focus:'Lower-Center Preparation'},
    {month:15,title:'Biography and Meaning',focus:'Lower Centers'},
    {month:16,title:'Values Into Action',focus:'Middle Centers',gate:'GATE 4'},
    {month:17,title:'Relational Presence',focus:'Upper-Center Preparation'},
    {month:18,title:'Resonance and Differentiation',focus:'Upper Centers'},
    {month:19,title:'Compassion and Service',focus:'Whole-System Center Integration'},
    {month:20,title:'Energetic Literacy',focus:'Energy Literacy & Integration',gate:'GATE 5'},
    {month:21,title:'Integration of Disciplines',focus:'Integrated Discipline'},
    {month:22,title:'Discernment and Responsibility',focus:'Discernment & Source Awareness'},
    {month:23,title:'Independent Practice Design',focus:'Independent Practice Architecture'},
    {month:24,title:'The Open Gate',focus:'Open Gate / Continuation',gate:'GATE 6'}
  ];

  // Existing backend stages remain readiness milestones. They do not replace
  // the 24 monthly units, and elapsed time can never bypass server readiness.
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