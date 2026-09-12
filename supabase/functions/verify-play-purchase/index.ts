const PACKAGE='com.ascend.path';
const PRODUCTS={
  ascend_path_monthly:{kind:'subscription',access:'premium'},
  ascend_path_annual:{kind:'subscription',access:'premium'},
  ascend_path_lifetime:{kind:'inapp',access:'lifetime'}
} as const;

const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{'content-type':'application/json'}});
const b64url=(bytes:Uint8Array)=>btoa(String.fromCharCode(...bytes)).replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');
const encode=(value:unknown)=>b64url(new TextEncoder().encode(JSON.stringify(value)));
function pemBytes(pem:string){const clean=pem.replace(/-----BEGIN PRIVATE KEY-----|-----END PRIVATE KEY-----|\s/g,'');const raw=atob(clean);return Uint8Array.from(raw,c=>c.charCodeAt(0));}
async function googleAccessToken(){
  const raw=Deno.env.get('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON');
  if(!raw)throw new Error('GOOGLE_PLAY_SERVICE_ACCOUNT_JSON is not configured');
  const svc=JSON.parse(raw);
  if(!svc.client_email||!svc.private_key)throw new Error('Google Play service account JSON is incomplete');
  const now=Math.floor(Date.now()/1000);
  const header=encode({alg:'RS256',typ:'JWT'});
  const payload=encode({iss:svc.client_email,scope:'https://www.googleapis.com/auth/androidpublisher',aud:'https://oauth2.googleapis.com/token',iat:now,exp:now+3600});
  const key=await crypto.subtle.importKey('pkcs8',pemBytes(svc.private_key),{name:'RSASSA-PKCS1-v1_5',hash:'SHA-256'},false,['sign']);
  const signingInput=`${header}.${payload}`;
  const sig=new Uint8Array(await crypto.subtle.sign('RSASSA-PKCS1-v1_5',key,new TextEncoder().encode(signingInput)));
  const assertion=`${signingInput}.${b64url(sig)}`;
  const body=new URLSearchParams({grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer',assertion});
  const r=await fetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'content-type':'application/x-www-form-urlencoded'},body});
  const data=await r.json();
  if(!r.ok||!data.access_token)throw new Error(data.error_description||data.error||'Could not authorize Google Play Developer API');
  return data.access_token as string;
}
function jwtSub(req:Request){
  const auth=req.headers.get('authorization')||'';
  const token=auth.replace(/^Bearer\s+/i,'');
  const parts=token.split('.');
  if(parts.length<2)throw new Error('Missing authenticated user');
  const normalized=parts[1].replace(/-/g,'+').replace(/_/g,'/');
  const padded=normalized+'='.repeat((4-normalized.length%4)%4);
  const payload=JSON.parse(atob(padded));
  if(!payload.sub)throw new Error('Authenticated user has no subject');
  return String(payload.sub);
}
async function verifySubscription(token:string,accessToken:string){
  const url=`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}/purchases/subscriptionsv2/tokens/${encodeURIComponent(token)}`;
  const r=await fetch(url,{headers:{authorization:`Bearer ${accessToken}`}});
  const data=await r.json();
  if(!r.ok)throw new Error(data?.error?.message||'Google Play subscription verification failed');
  const expiries=(data.lineItems||[]).map((x:any)=>x.expiryTime).filter(Boolean).map((x:string)=>new Date(x).getTime());
  const expiryMs=expiries.length?Math.max(...expiries):0;
  const state=String(data.subscriptionState||'');
  const inactive=['SUBSCRIPTION_STATE_EXPIRED','SUBSCRIPTION_STATE_PENDING','SUBSCRIPTION_STATE_PAUSED'].includes(state);
  return {active:!inactive&&expiryMs>Date.now(),expiresAt:expiryMs?new Date(expiryMs).toISOString():null,reference:data.latestOrderId||token,state};
}
async function verifyInapp(productId:string,token:string,accessToken:string){
  const url=`https://androidpublisher.googleapis.com/androidpublisher/v3/applications/${PACKAGE}/purchases/products/${encodeURIComponent(productId)}/tokens/${encodeURIComponent(token)}`;
  const r=await fetch(url,{headers:{authorization:`Bearer ${accessToken}`}});
  const data=await r.json();
  if(!r.ok)throw new Error(data?.error?.message||'Google Play product verification failed');
  return {active:Number(data.purchaseState)===0,expiresAt:null,reference:data.orderId||token,state:String(data.purchaseState)};
}
// A Google Play purchase token/order stays valid on repeated Google-side
// verification and is not bound to a Supabase user by Google. Without this
// check, one real purchase's token could be replayed from any number of
// freshly-created accounts, each independently passing verification above
// and claiming its own entitlement from a single purchase.
async function findOtherActiveHolder(reference:string,excludingUserId:string){
  const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!service)throw new Error('Supabase service role is unavailable');
  const url=`${Deno.env.get('SUPABASE_URL')}/rest/v1/ascend_entitlements?select=user_id&source_reference=eq.${encodeURIComponent(reference)}&is_active=is.true&user_id=neq.${excludingUserId}&limit=1`;
  const r=await fetch(url,{headers:{apikey:service,authorization:`Bearer ${service}`}});
  if(!r.ok)throw new Error('Could not verify prior entitlement');
  const rows=await r.json();
  return Array.isArray(rows)&&rows.length>0;
}
async function upsertEntitlement(userId:string,product:any,verification:any){
  const url=`${Deno.env.get('SUPABASE_URL')}/rest/v1/ascend_entitlements?on_conflict=user_id`;
  const service=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if(!service)throw new Error('Supabase service role is unavailable');
  const row={user_id:userId,access_level:product.access,source:'google_play',source_reference:verification.reference,is_active:verification.active,starts_at:new Date().toISOString(),expires_at:product.access==='lifetime'?null:verification.expiresAt,updated_at:new Date().toISOString()};
  const r=await fetch(url,{method:'POST',headers:{apikey:service,authorization:`Bearer ${service}`,'content-type':'application/json',prefer:'resolution=merge-duplicates,return=representation'},body:JSON.stringify(row)});
  const data=await r.json().catch(()=>null);
  if(!r.ok)throw new Error(data?.message||data?.error||'Could not update ASCEND entitlement');
  return Array.isArray(data)?data[0]:data;
}

Deno.serve(async(req)=>{
  if(req.method!=='POST')return json({error:'method_not_allowed'},405);
  try{
    const userId=jwtSub(req);
    const body=await req.json();
    const product=PRODUCTS[body.productId as keyof typeof PRODUCTS];
    if(!product||!body.purchaseToken)return json({error:'invalid_purchase_request'},400);
    const accessToken=await googleAccessToken();
    const verification=product.kind==='subscription'?await verifySubscription(body.purchaseToken,accessToken):await verifyInapp(body.productId,body.purchaseToken,accessToken);
    if(!verification.active)return json({error:'purchase_not_active',state:verification.state},403);
    if(await findOtherActiveHolder(verification.reference,userId))return json({error:'purchase_already_linked_to_another_account'},409);
    const entitlement=await upsertEntitlement(userId,product,verification);
    return json({ok:true,entitlement});
  }catch(error){console.error(error);return json({error:error instanceof Error?error.message:'verification_failed'},500)}
});
