function pug_attr(t,e,n,f){return e!==!1&&null!=e&&(e||"class"!==t&&"style"!==t)?e===!0?" "+(f?t:t+'="'+t+'"'):("function"==typeof e.toJSON&&(e=e.toJSON()),"string"==typeof e||(e=JSON.stringify(e),n||e.indexOf('"')===-1)?(n&&(e=pug_escape(e))," "+t+'="'+e+'"'):" "+t+"='"+e.replace(/'/g,"&#39;")+"'"):""}
function pug_escape(e){var a=""+e,t=pug_match_html.exec(a);if(!t)return e;var r,c,n,s="";for(r=t.index,c=0;r<a.length;r++){switch(a.charCodeAt(r)){case 34:n="&quot;";break;case 38:n="&amp;";break;case 60:n="&lt;";break;case 62:n="&gt;";break;default:continue}c!==r&&(s+=a.substring(c,r)),c=r+1,s+=n}return c!==r?s+a.substring(c,r):s}
var pug_match_html=/["&<>]/;function template(locals) {var pug_html = "", pug_mixins = {}, pug_interp;;var locals_for_with = (locals || {});(function (IO, name, patronymic, surname, zemla) {pug_mixins["Zemla"] = pug_interp = function(model, IO){
var block = (this && this.block), attributes = (this && this.attributes) || {};
pug_html = pug_html + "\u003Cdiv" + (" class=\"zemla\""+pug_attr("id", IO, true, false)) + "\u003Eid:" + (pug_escape(null == (pug_interp = model.id) ? "" : pug_interp)) + ",name:" + (pug_escape(null == (pug_interp = model.name) ? "" : pug_interp)) + "\u003C\u002Fdiv\u003E";
};
pug_html = pug_html + ("\u003Cdiv" + (" class=\"kopnik\""+pug_attr("id", IO, true, false)) + "\u003E" + (pug_escape(null == (pug_interp = surname) ? "" : pug_interp)) + " " + (pug_escape(null == (pug_interp = name) ? "" : pug_interp)) + " " + (pug_escape(null == (pug_interp = patronymic) ? "" : pug_interp)));
pug_mixins["Zemla"](zemla, IO+'_zemla');
pug_html = pug_html + "\u003C\u002Fdiv\u003E";}.call(this,"IO" in locals_for_with?locals_for_with.IO:typeof IO!=="undefined"?IO:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"patronymic" in locals_for_with?locals_for_with.patronymic:typeof patronymic!=="undefined"?patronymic:undefined,"surname" in locals_for_with?locals_for_with.surname:typeof surname!=="undefined"?surname:undefined,"zemla" in locals_for_with?locals_for_with.zemla:typeof zemla!=="undefined"?zemla:undefined));;return pug_html;}