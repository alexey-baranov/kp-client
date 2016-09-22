if (!!!templates) var templates = {};

      var Hogan= require('hogan.js');
      module.exports= new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div id=\"");t.b(t.v(t.f("io",c,p,0)));t.b("\" class=\"Slovo SlovoAsListItem\">");t.b("\n" + i);t.b("    <div id=\"");t.b(t.v(t.f("io",c,p,0)));t.b("_value\">");t.b(t.v(t.d("model.value",c,p,0)));t.b("</div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {}, subs: {  }});