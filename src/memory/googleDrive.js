import { google } from "googleapis";
const SCOPES = ["https://www.googleapis.com/auth/drive.file","https://www.googleapis.com/auth/drive.appdata"];
function auth() {
  const email = process.env.GOOGLE_CLIENT_EMAIL, key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\n/g,"\n");
  if (!email || !key) return null;
  return new google.auth.JWT({ email, key, scopes: SCOPES });
}
async function ensureFolders(drive) {
  const name = process.env.ANTMEMORY_FOLDER_NAME || "AntMemory";
  const find = async (q) => (await drive.files.list({ q, fields:"files(id,name)", pageSize:1 })).data.files?.[0]||null;
  const mk = async (name, parents=null)=> (await drive.files.create({ requestBody:{ name, mimeType:"application/vnd.google-apps.folder", ...(parents?{parents:[parents]}:{}) }, fields:"id,name"})).data;
  let top = await find(`name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  if (!top) top = await mk(name);
  let memories = await find(`'${top.id}' in parents and name='memories' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  if (!memories) memories = await mk("memories", top.id);
  let snapshots = await find(`'${top.id}' in parents and name='snapshots' and mimeType='application/vnd.google-apps.folder' and trashed=false`);
  if (!snapshots) snapshots = await mk("snapshots", top.id);
  return {topId:top.id, memoriesId:memories.id, snapshotsId:snapshots.id};
}
async function readIndex(drive){
  const list=await drive.files.list({spaces:"appDataFolder", q:"name = 'memory-index.json' and trashed=false", fields:"files(id,name)", pageSize:1});
  if(list.data.files?.length){
    const id=list.data.files[0].id;
    const resp=await drive.files.get({fileId:id, alt:"media"}, {responseType:"stream"});
    const chunks=[]; await new Promise((res,rej)=>{resp.data.on("data",d=>chunks.push(Buffer.from(d))); resp.data.on("end",res); resp.data.on("error",rej);});
    try{return {id, index: JSON.parse(Buffer.concat(chunks).toString("utf-8")||"{}")};}catch{return {id,index:{}};}
  }
  const created=await drive.files.create({ requestBody:{ name:"memory-index.json", parents:["appDataFolder"], mimeType:"application/json"}, media:{ mimeType:"application/json", body:"{}"}, fields:"id,name" });
  return { id: created.data.id, index:{} };
}
async function writeIndex(drive, id, index){
  await drive.files.update({ fileId:id, media:{ mimeType:"application/json", body: JSON.stringify(index) } });
}
async function findInFolder(drive,parent,name){
  const {data}=await drive.files.list({ q:`'${parent}' in parents and name='${name}' and trashed=false`, fields:"files(id,name)", pageSize:1 });
  return data.files?.[0]||null;
}
async function createOrUpdate(drive,parent,name,buffer,appProperties){
  const existing=await findInFolder(drive,parent,name);
  if(existing){
    await drive.files.update({ fileId:existing.id, media:{ mimeType:"text/plain", body: buffer }, requestBody:{ appProperties }});
    return existing.id;
  }
  const {data}=await drive.files.create({ requestBody:{ name, parents:[parent], mimeType:"text/plain", appProperties }, media:{ mimeType:"text/plain", body: buffer }, fields:"id,name" });
  return data.id;
}
export async function upsertMemory({sessionIdentifier, topic, content}){
  const a=auth(); if(!a) return { ok:false, reason:"no_credentials"};
  const drive=google.drive({version:"v3", auth:a});
  const { memoriesId } = await ensureFolders(drive);
  const { id:indexId, index } = await readIndex(drive);
  const key = `${sessionIdentifier}:${topic}`;
  const now = new Date().toISOString();
  const maxBytes = Number(process.env.ANTMEMORY_MAX_FILE_BYTES||1048576);
  const buf = Buffer.from(content||"", "utf-8");
  const props = { type:"memory", topic, session_identifier:sessionIdentifier, expires_at:new Date(Date.now()+Number(process.env.ANTMEMORY_DEFAULT_EXPIRY_DAYS||30)*86400000).toISOString() };
  if (buf.length > maxBytes){
    const parts = Math.ceil(buf.length/maxBytes);
    for(let i=0;i<parts;i++){
      const slice = buf.slice(i*maxBytes, Math.min((i+1)*maxBytes, buf.length));
      const name = `${key}.part${i+1}.txt`;
      await createOrUpdate(drive, memoriesId, name, slice, props);
      index[`${key}#${i+1}`] = { file:name, updated_time:now };
    }
  } else {
    const name = `${key}.txt`;
    await createOrUpdate(drive, memoriesId, name, buf, props);
    index[key] = { file:name, updated_time:now };
  }
  await writeIndex(drive, indexId, index);
  return { ok:true };
}
