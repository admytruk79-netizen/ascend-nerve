// Canonical ASCEND Path visual asset registry.
// Seasonal/reflection artwork is an experience-layer support set: it never owns curriculum order or progression.

const seasonal=(id,title,tags=[])=>({
  id,
  title,
  role:'seasonal-reflection',
  src:`assets/seasonal-art/${id}.png`,
  tags
});

export const ASCEND_VISUAL_ASSETS=[
  seasonal('acceptance-practice','Acceptance Practice',['acceptance','presence','surrender']),
  seasonal('april-deliberate-action','Deliberate Action',['will','action','discipline']),
  seasonal('april-training-the-will','Training the Will',['will','discipline','constancy']),
  seasonal('april-where-does-will-begin','Where Does Will Begin?',['will','reflection','choice']),
  seasonal('august-presence-devotion','Presence & Devotion',['presence','devotion','heart']),
  seasonal('building-or-draining','Building or Draining?',['energy','discernment','reflection']),
  seasonal('confidence-humanity','Confidence & Humanity',['confidence','humanity','heart']),
  seasonal('discipline-or-freedom','Discipline or Freedom?',['discipline','freedom','reflection']),
  seasonal('emotional-composure','Emotional Composure',['equanimity','emotion','balance']),
  seasonal('heart-opening','Heart Opening',['heart','openness','compassion']),
  seasonal('july-discipline-fire','Discipline of Fire',['discipline','will','fire']),
  seasonal('june-gathering-energy','Gathering of Energy',['energy','gathering','attention']),
  seasonal('march-focused-thought','Focused Thought',['thought','attention','focus']),
  seasonal('march-object-contemplation','Object Contemplation',['thought','observation','contemplation']),
  seasonal('march-reverence-patience','Reverence & Patience',['reverence','patience','stillness']),
  seasonal('march-what-am-i-noticing','What Am I Noticing?',['observation','awareness','reflection']),
  seasonal('mastery-of-feeling','Mastery of Feeling',['emotion','equanimity','self-regulation']),
  seasonal('may-openness-readiness','Openness & Readiness',['openness','readiness','discernment']),
  seasonal('may-ready-to-release','Ready to Release?',['release','reflection','letting-go']),
  seasonal('may-truth-vs-imagination','Truth vs Imagination',['discernment','truth','imagination']),
  seasonal('morning-evening-energy','Morning & Evening Energy',['energy','rhythm','observation']),
  seasonal('openness-readiness','Openness & Readiness',['openness','readiness','discernment']),
  seasonal('presence-devotion','Presence & Devotion',['presence','devotion','heart']),
  seasonal('ready-to-release','Ready to Release?',['release','reflection','letting-go']),
  seasonal('self-control-gentleness','Self-Control & Gentleness',['self-control','gentleness','equanimity']),
  seasonal('self-observation-humility','Self-Observation & Humility',['self-observation','humility','awareness']),
  seasonal('spring-april-clarifying-the-will','Clarifying the Will',['will','clarity','discernment']),
  seasonal('spring-march-awakening-perception','Awakening Perception',['perception','awakening','observation']),
  seasonal('spring-may-crossing-the-threshold','Crossing the Threshold',['threshold','readiness','transition']),
  seasonal('star-energy-practice','Star Energy Practice',['energy','attention','practice']),
  seasonal('truth-vs-imagination','Truth vs Imagination',['discernment','truth','imagination']),
  seasonal('two-currents-meeting','Two Currents Meeting',['energy','integration','balance']),
  seasonal('what-am-i-refusing','What Am I Refusing?',['acceptance','resistance','reflection']),
  seasonal('where-does-will-begin','Where Does Will Begin?',['will','reflection','choice']),

  {id:'ascend-logo',title:'ASCEND Logo',role:'brand',src:'assets/ascend-logo.png?v=20260910-people-free-1',tags:['brand','logo']},
  {id:'ascend-path-intro-instrument',title:'ASCEND Path Threshold',role:'environment',src:'assets/ascend-path-intro-instrument.jpg',tags:['threshold','intro','cinematic']},
  {id:'ascend-today-morning-serenity',title:'Morning Serenity',role:'environment',src:'assets/ascend-today-morning-serenity.svg?v=20260910-people-free-1',tags:['day','today','environment']},
  {id:'ascend-twilight-ritual-bg',title:'Twilight Ritual',role:'environment',src:'assets/ascend-twilight-ritual-bg.jpg?v=20260910-people-free-1',tags:['twilight','today','environment']}
];

export const ASCEND_SEMANTIC_ART=ASCEND_VISUAL_ASSETS.filter(asset=>asset.role==='seasonal-reflection');
export const ASCEND_ENVIRONMENT_ASSETS=ASCEND_VISUAL_ASSETS.filter(asset=>asset.role!=='seasonal-reflection');
export const visualAssetById=id=>ASCEND_VISUAL_ASSETS.find(asset=>asset.id===id)||null;

export function semanticAssetFor(item){
  const metadata=item?.metadata||{};
  const explicit=metadata.art_key||metadata.art_asset||metadata.artwork_id||null;
  if(explicit)return visualAssetById(String(explicit));
  return null;
}
