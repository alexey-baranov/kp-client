if (!!!templates) var templates = {};

      var Hogan= require('hogan.js');
      module.exports= new Hogan.Template({code: function (c,p,i) { var t=this;t.b(i=i||"");t.b("<div id=\"");t.b(t.v(t.f("io",c,p,0)));t.b("\" class=\"Page\">");t.b("\n" + i);t.b("    <div id=\"");t.b(t.v(t.f("io",c,p,0)));t.b("_doms\" class=\"doms\">");t.b("\n" + i);if(t.s(t.f("domsViews",c,p,1),c,p,0,93,219,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <span class=\"delimiter\"> > </span>");t.b("\n" + i);t.b("            <span class=\"Zemla dom\" id=\"");t.b(t.v(t.f("io",c,p,0)));t.b("\">");t.b(t.v(t.d("model.name",c,p,0)));t.b("</span>");t.b("\n" + i);});c.pop();}t.b("    </div>");t.b("\n");t.b("\n" + i);t.b("    <div id=\"");t.b(t.v(t.f("io",c,p,0)));t.b("_header\">");t.b("\n");t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("    <div id=\"");t.b(t.v(t.f("io",c,p,0)));t.b("_body\">");t.b("\n" + i);if(t.s(t.d("model.kopa",c,p,1),c,p,0,337,404,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("            <div>KopaView</div>");t.b("\n" + i);t.b(t.rp("<KopaView0",c,p,"            "));});c.pop();}if(!t.s(t.d("model.kopa",c,p,1),c,p,1,0,0,"")){if(t.s(t.f("domView",c,p,1),c,p,0,468,561,"{{ }}")){t.rs(c,p,function(c,p,t){t.b("                <div>ZemlaAsListView</div>");t.b("\n" + i);t.b(t.rp("<ZemlaAsListView1",c,p,"                "));});c.pop();}};t.b("\n" + i);t.b("    </div>");t.b("\n" + i);t.b("</div>");return t.fl(); },partials: {"<KopaView0":{name:"KopaView", partials: {}, subs: {  }},"<ZemlaAsListView1":{name:"ZemlaAsListView", partials: {}, subs: {  }}}, subs: {  }});