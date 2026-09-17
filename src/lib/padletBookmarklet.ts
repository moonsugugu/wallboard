// 패들렛 보드 페이지에서 실행되는 북마클릿 원본.
// 선생님 본인 브라우저(이미 인증된 세션)에서 실행되므로 same-origin fetch로
// /api/5/wall_sections, /api/10/wishes 를 그대로 불러올 수 있다.
// (서버가 대신 패들렛에 접속하면 Cloudflare 봇 차단(403)에 걸리기 때문에
//  이 방식을 쓴다 — server/index.mjs 에는 이 로직을 두지 않는다.)
const BOOKMARKLET_SOURCE = `(function(){
function stripHtml(h){if(!h)return '';return h.replace(/<br\\s*\\/?>/gi,'\\n').replace(/<\\/p>/gi,'\\n').replace(/<[^>]+>/g,'').replace(/&nbsp;/g,' ').replace(/&amp;/g,'&').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'"').replace(/&#39;/g,"'").replace(/\\n{3,}/g,'\\n\\n').trim();}
var COLORS={red:'#ffd6d6',orange:'#ffe3c2',yellow:'#fff3b0',green:'#d6f5e3',teal:'#cdf3ee',blue:'#d6e6ff',purple:'#ecd6ff',pink:'#ffd6ec',gray:'#e7e5e0',grey:'#e7e5e0'};
async function run(){
if(!/(^|\\.)padlet\\.com$/.test(location.hostname)){alert('패들렛 보드 페이지에서 눌러주세요.');return;}
var html=document.documentElement.outerHTML;
var fmt=(html.match(/"wallFormat":"(\\w+)"/)||[])[1]||'grid';
var wallId=(html.match(/"wallId":"(\\d+)"/)||[])[1];
var hashid=(html.match(/wall_hashid=(board_[A-Za-z0-9]+)/)||[])[1];
var titleEl=document.querySelector('title');
var title=titleEl?titleEl.textContent.trim():'가져온 담벼락';
if(!wallId||!hashid){alert('보드 정보를 찾지 못했습니다. 페이지를 새로고침한 뒤 다시 시도해주세요.');return;}
var layout=fmt==='grid'?'wall':'columns';
var sectionsRes=await fetch('/api/5/wall_sections?wall_id='+wallId+'&');
var sectionsJson=await sectionsRes.json();
var sections=(sectionsJson.data||[]).slice().sort(function(a,b){return a.attributes.sort_index-b.attributes.sort_index;});
var sectionTitleById={};
sections.forEach(function(s){sectionTitleById[String(s.id)]=s.attributes.title||'섹션';});
var wishes=[];
var pageStart='';
for(var i=0;i<30;i++){
var res=await fetch('/api/10/wishes?wall_hashid='+encodeURIComponent(hashid)+'&page_start='+encodeURIComponent(pageStart));
var json=await res.json();
wishes=wishes.concat(json.data||[]);
var next=json.meta&&json.meta.next;
if(!next)break;
pageStart=next;
}
wishes.sort(function(a,b){return (a.attributes.sort_index||0)-(b.attributes.sort_index||0);});
var posts=wishes.filter(function(w){return w.attributes.published!==false;}).map(function(w){
var a=w.attributes;
var link=a.attachment_link;
var url=(link&&link.display_url)||a.attachment||null;
var attachmentType='none';
if(url){
if(link&&(link.content_category==='photo'||(link.content_type&&link.content_type.indexOf('image/')===0)))attachmentType='image';
else if(link&&(link.content_category==='video'||(link.content_type&&link.content_type.indexOf('video/')===0)))attachmentType='video';
else if(link)attachmentType='link';
else attachmentType='image';
}
return{
author:a.subject||a.headline||'',
text:stripHtml(a.body),
attachmentType:attachmentType,
attachmentUrl:url||undefined,
column:layout==='columns'?(sectionTitleById[String(a.wall_section_id)]||null):null,
color:COLORS[a.color]||'#ffffff',
createdAt:a.created_at?new Date(a.created_at).getTime():Date.now()
};
});
var result={title:title,layout:layout,columns:layout==='columns'?sections.map(function(s){return s.attributes.title||'섹션';}):[],posts:posts};
var blob=new Blob([JSON.stringify(result,null,2)],{type:'application/json'});
var url=URL.createObjectURL(blob);
var a=document.createElement('a');
a.href=url;a.download='padlet-export.json';document.body.appendChild(a);a.click();a.remove();
setTimeout(function(){URL.revokeObjectURL(url);},2000);
alert('padlet-export.json 파일이 다운로드됐어요. 담벼락 앱에서 그 파일을 업로드해주세요!');
}
run()['catch'](function(e){alert('가져오기 중 문제가 발생했습니다: '+e.message);});
})();`

export function bookmarkletHref() {
  return `javascript:${encodeURIComponent(BOOKMARKLET_SOURCE)}`
}
