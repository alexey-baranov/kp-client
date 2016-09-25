if (!!!templates) var templates = {};

var Hogan = require('hogan.js');
module.exports = new Hogan.Template({
    code: function (c, p, i) {
        var t = this;
        t.b(i = i || "");
        t.b("<div id=\"");
        t.b(t.v(t.f("io", c, p, 0)));
        t.b("\" class=\"Zemla\">");
        t.b("\n" + i);
        t.b("    <div id=\"");
        t.b(t.v(t.f("io", c, p, 0)));
        t.b("_name\" class=\"header\">");
        t.b(t.v(t.d("model.name", c, p, 0)));
        t.b("</div>");
        t.b("\n");
        t.b("\n" + i);
        t.b("    <div id=\"");
        t.b(t.v(t.f("io", c, p, 0)));
        t.b("_kopas\">");
        t.b("\n" + i);
        if (t.s(t.f("kopasViews", c, p, 1), c, p, 0, 146, 193, "{{ }}")) {
            t.rs(c, p, function (c, p, t) {
                t.b(t.rp("<KopaAsListItemView0", c, p, "            "));
            });
            c.pop();
        }
        t.b("    </div>");
        t.b("\n" + i);
        t.b("</div>");
        return t.fl();
    }, partials: {"<KopaAsListItemView0": {name: "KopaAsListItemView", partials: {}, subs: {}}}, subs: {}
});