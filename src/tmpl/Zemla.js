if (!!!templates) var templates = {};
define(["hogan.js"], function (Hogan) {
    return new Hogan.Template({
        code: function (c, p, i) {
            var t = this;
            t.b(i = i || "");
            t.b("<div id=\"");
            t.b(t.v(t.f("io", c, p, 0)));
            t.b("\">");
            t.b("\n" + i);
            t.b("    Земля <span id=\"");
            t.b(t.v(t.f("io", c, p, 0)));
            t.b("_name\">");
            t.b(t.v(t.d("model.name", c, p, 0)));
            t.b("</span>");
            t.b("\n" + i);
            t.b("</div>");
            return t.fl();
        }, partials: {}, subs: {}
    });
});