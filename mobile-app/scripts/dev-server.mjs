import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..','www');
const args=process.argv.slice(2);
const valueAfter=flag=>{const index=args.indexOf(flag);return index>=0?args[index+1]:undefined};
const port=Number(valueAfter('--port')||4173);
const host=valueAfter('--host')||'0.0.0.0';
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.svg':'image/svg+xml'};

http.createServer(async(request,response)=>{
  try{
    const pathname=decodeURIComponent(new URL(request.url,'http://localhost').pathname);
    const qaPreview=pathname==='/qa-preview';
    const requested=pathname==='/'||qaPreview?'index.html':pathname.replace(/^\/+/, '');
    const file=path.resolve(root,requested);
    if(!file.startsWith(`${root}${path.sep}`)&&file!==path.join(root,'index.html'))throw new Error('Invalid path');
    let body=await fs.readFile(file);
    if(qaPreview){
      const fixtures={
        ascend_entitlements:[{access_level:'lifetime',source:'qa-preview',starts_at:'2026-08-27T00:00:00Z',expires_at:null,is_active:true}],
        path_phases:[{id:'phase-1',title:'Core Formation',sort_order:1}],
        path_stages:[{id:'stage-1',phase_id:'phase-1',slug:'entry-seven-days',title:'Self-Contemplation',subtitle:'Beginning',sort_order:1,required_practice_days:7,progression_mode:'readiness',objective:'Observe without forcing interpretation.',is_published:true}],
        path_practices:[{id:'practice-1',slug:'self-contemplation',title:'Self-Contemplation',default_minutes:10,instructions:'Observe thought without following it.',is_published:true}],
        path_stage_practices:[{stage_id:'stage-1',practice_id:'practice-1',role:'primary'}],
        path_student_progress:[{stage_id:'stage-1',status:'active',practice_days:0,started_at:'2026-08-27T00:00:00Z'}],
        path_profiles:[{user_id:'00000000-0000-0000-0000-000000000001',display_name:'Member',current_stage_id:'stage-1',onboarding_completed_at:null}],
        path_attainment_markers:[],path_content_items:[],path_content_unlock_rules:[],path_journal_entries:[],path_training_assignments:[],training_branches:[],training_branch_modules:[],teacher_students:[],teachers:[]
      };
      const mock=`<style>.app-shell{max-width:390px}.bottom-nav{left:calc(50% - 195px);right:calc(50% - 195px);top:776px;bottom:auto}.path-intro,.practice-briefing,.practice-overlay,.library-overlay{left:calc(50% - 195px)!important;right:auto!important;bottom:auto!important;width:390px!important;height:844px!important}.ritual-scene{height:300px!important}.ritual-portal{width:220px!important;height:220px!important}</style><script>(()=>{const user={id:'00000000-0000-0000-0000-000000000001',email:'member@ascend.test',email_confirmed_at:'2026-08-27T00:00:00Z'};localStorage.setItem('ascendPathTheme','twilight');localStorage.setItem('ascendPathSession',JSON.stringify({access_token:'qa-token',refresh_token:'qa-refresh',expires_in:3600,token_type:'bearer'}));const nativeFetch=window.fetch.bind(window);window.fetch=async(input,init={})=>{const url=new URL(typeof input==='string'?input:input.url,location.href);if(!url.hostname.includes('supabase.co'))return nativeFetch(input,init);if(url.pathname.endsWith('/auth/v1/user'))return new Response(JSON.stringify(user),{status:200,headers:{'Content-Type':'application/json'}});const table=url.pathname.split('/').pop();return new Response(JSON.stringify(${JSON.stringify(fixtures)}[table]||[]),{status:200,headers:{'Content-Type':'application/json'}})};})();</script>`;
      body=Buffer.from(body.toString('utf8').replace('<script src="backend.js',`${mock}<script src="backend.js`));
    }
    response.writeHead(200,{'Content-Type':types[path.extname(file).toLowerCase()]||'application/octet-stream','Cache-Control':'no-store'});
    response.end(body);
  }catch{
    response.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'});
    response.end('Not found');
  }
}).listen(port,host,()=>console.log(`ASCEND preview running on ${host}:${port}`));
