const fs=require('fs'),path=require('path');
const file=path.join(__dirname,'..','outputs','皮影骨骼母版','index.html');
if(!fs.existsSync(file))throw new Error('skeleton page missing');
const html=fs.readFileSync(file,'utf8');
const check=(value,message)=>{if(!value)throw new Error(message)};

for(const token of ['const BONE_LENGTHS','function solveSkeleton','totalHeight:330','upperArm:62','forearm:68','thigh:78','shin:72','gripSpacing:18','mainGrip','offGrip','twoHanded','idlePhases','normalPhases','breakPhases','parryPhases','executePhases']){
  check(html.includes(token),`missing ${token}`);
}

for(const id of ['shoulderBone','spineBone','rearUpperBone','rearForeBone','frontUpperBone','frontForeBone','rearThighBone','rearShinBone','frontThighBone','frontShinBone','swordBone']){
  check(html.includes(`id="${id}"`),`missing SVG bone ${id}`);
}

for(const label of ['肩','肘','髋','膝','踝','剑柄'])check(html.includes(label),`missing joint label ${label}`);
for(const control of ['actionIdle','actionSlash','actionBreak','actionParry','actionExecute','actionGuardHit','actionDodge','actionRecoveryHit','play','pause','step','replay'])check(html.includes(`id="${control}"`),`missing control ${control}`);
check(html.includes('startMs:110,endMs:170'),'missing 110–170ms parry window');
check(html.includes("{t:.745,name:'收剑回势'"),'a missed parry must settle back to guard after its recovery');
check(html.includes("name:'迎架截击'")&&html.includes("name:'弹开定势'"),'parry must have a distinct intercept and deflection pose');
check(html.includes("name:'弹反落空后摇'")&&html.includes("name:'收剑回势'"),'a missed parry must visibly recoil before returning to guard');
check(html.includes("name:'前刺起势'")&&html.includes("name:'前刺命中'")&&html.includes("name:'贯穿定势'"),'execution must use a distinct forward-thrust sequence');
check(html.includes("idle:{duration:1400,loop:true,twoHanded:true"),'idle must use two hands');
check(html.includes("slash:{duration:620,loop:false,twoHanded:false"),'normal attack must use one hand');
check(html.includes("breakAttack:{duration:900,loop:false,twoHanded:false")&&html.includes("name:'普攻横斩'")&&html.includes("name:'破势命中'"),'normal and break attacks must use separate one-handed action sets');
check(html.includes("parry:{duration:550,loop:false,twoHanded:true"),'parry must use two hands');
check(html.includes("execute:{duration:720,loop:false,twoHanded:true"),'execution must use two hands with a decisive duration');
check(html.includes("{t:.36,name:'前刺起势'")&&html.includes("{t:.48,name:'前刺命中'"),'execution thrust must accelerate sharply into impact');
check(html.includes("guardHit:{duration:480,loop:false,twoHanded:true")&&html.includes("dodge:{duration:520,loop:false,twoHanded:true"),'must provide guarded hit and two-handed dodge reactions');
check(html.includes("recoveryHit:{duration:600,loop:false,twoHanded:true"),'must provide one shared two-handed hit reaction for recovery windows');
check(html.includes("name:'格挡受击'")&&html.includes("name:'后撤闪避'"),'guarded hit and dodge need explicit action poses');
check(html.includes("name:'后摇受击'")&&html.includes("name:'后摇震退'"),'shared recovery-hit reaction requires explicit impact poses');
check(html.includes("name:'后摇受击',...base,rootX:370,rootY:423,torso:-16,head:-4")&&html.includes("name:'后摇震退',...base,rootX:352,rootY:428,torso:-20,head:-8"),'shared recovery hit must visibly but moderately bend the character backward');
check(html.includes("head:-4,gripX:72,gripY:50,ft:76,fs:98,rt:104,rs:81,sword:-72")&&html.includes("head:-8,gripX:68,gripY:52,ft:79,fs:100,rt:101,rs:79,sword:-80"),'dodge-recovery hit must angle the raised sword toward the character');
check(!html.includes('parryRecoveryHit')&&!html.includes('actionParryRecoveryHit'),'parry recovery must not have a duplicate hit-reaction animation');
check(html.includes("{t:.615,name:'闪避后摇'")&&html.includes("name:'闪避回防·双手'"),'dodge must reserve a 200ms landing recovery before guard');
check(!html.includes('actionDodgeRecoveryHit')&&!html.includes('dodgeRecoveryHitPhases'),'duplicate dodge-specific recovery-hit action must be removed');
check(html.includes('const rearArmVisible=!p.twoHanded'),'two-handed side view must hide the rear arm artwork');
check(html.includes('points.rearKnee.x<points.frontKnee.x')&&html.includes('points.rearAnkle.x<points.frontAnkle.x'),'front and rear legs must not cross');
check(html.includes('const rearKneeAngle=Math.min(pose.rt,88),rearShinAngle=Math.max(pose.rs,92)'),'rear knee must face forward with a smaller bend than the front knee');
check(html.includes('points.frontKnee.x>points.hipF.x')&&html.includes('points.rearKnee.x>points.hipR.x'),'both knees must bend toward the front');
check(html.includes('function chooseLowerElbow(')&&html.includes('a.y>=b.y?a:b'),'two-handed front elbow must use the lower anatomical solution');
check(html.includes('const shoulderF=shoulder,shoulderR=shoulder;'),'front and rear arms must share one side-view shoulder pivot');
check(html.includes('gripX:115,gripY:30'),'two-handed guard grip must extend forward with a softer arm bend');
check(!html.includes('<image'),'skeleton page must not bind character artwork');

const lengths={upperArm:62,forearm:68,thigh:78,shin:72,sword:205};
const point=(o,l,a)=>({x:o.x+Math.cos(a*Math.PI/180)*l,y:o.y+Math.sin(a*Math.PI/180)*l});
const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
for(const pose of [
  {shoulder:{x:0,y:-90},hipF:{x:14,y:0},hipR:{x:-14,y:0},fu:18,ru:27,ff:-36,rf:-42,ft:103,rt:78,fs:82,rs:96,sword:-38},
  {shoulder:{x:0,y:-90},hipF:{x:14,y:0},hipR:{x:-14,y:0},fu:-70,ru:-58,ff:-55,rf:-64,ft:112,rt:72,fs:70,rs:101,sword:-112},
  {shoulder:{x:0,y:-90},hipF:{x:14,y:0},hipR:{x:-14,y:0},fu:-8,ru:2,ff:-20,rf:-29,ft:108,rt:75,fs:75,rs:99,sword:-58}
]){
  const fe=point(pose.shoulder,lengths.upperArm,pose.fu),re=point(pose.shoulder,lengths.upperArm,pose.ru);
  const grip=point(fe,lengths.forearm,pose.ff);
  const fk=point(pose.hipF,lengths.thigh,pose.ft),fa=point(fk,lengths.shin,pose.fs);
  const rk=point(pose.hipR,lengths.thigh,pose.rt),ra=point(rk,lengths.shin,pose.rs);
  const tip=point(grip,lengths.sword,pose.sword);
  for(const [actual,expected] of [[distance(pose.shoulder,fe),62],[distance(pose.shoulder,re),62],[distance(fe,grip),68],[distance(pose.hipF,fk),78],[distance(fk,fa),72],[distance(pose.hipR,rk),78],[distance(rk,ra),72],[distance(grip,tip),205]]){
    check(Math.abs(actual-expected)<0.01,`bone length drift: ${actual} vs ${expected}`);
  }
}

console.log('shadow skeleton validation passed');
