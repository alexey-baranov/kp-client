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
            t.b("    <div id=\"");
            t.b(t.v(t.f("io", c, p, 0)));
            t.b("_fullName\">");
            t.b(t.v(t.d("model.fullName", c, p, 0)));
            t.b("</div>");
            t.b("\n" + i);
            t.b("    <div id=\"");
            t.b(t.v(t.f("io", c, p, 0)));
            t.b("_birth\">");
            t.b(t.v(t.d("model.birth", c, p, 0)));
            t.b("</div>");
            t.b("\n" + i);
            t.b("    <div id=\"");
            t.b(t.v(t.f("io", c, p, 0)));
            t.b("_email\">");
            t.b(t.v(t.d("model.email", c, p, 0)));
            t.b("</div>");
            t.b("\n");
            t.b("\n" + i);
            t.b("    ");
            t.b("_zemla\"></div> --}}");
            t.b("\n");
            t.b("\n" + i);
            if (t.s(t.f("zemlaView", c, p, 1), c, p, 0, 236, 258, "{{ }}")) {
                t.rs(c, p, function (c, p, t) {
                    t.b(t.rp("<Zemla0", c, p, "    "));
                });
                c.pop();
            }
            t.b("\n" + i);
            if (t.s(t.f("messageViews", c, p, 1), c, p, 0, 295, 323, "{{ }}")) {
                t.rs(c, p, function (c, p, t) {
                    t.b(t.rp("<Message1", c, p, "        "));
                });
                c.pop();
            }
            t.b("\n" + i);
            t.b("    <button id=\"");
            t.b(t.v(t.f("io", c, p, 0)));
            t.b("_reload\">Обновить</button>");
            t.b("\n" + i);
            t.b("</div>");
            return t.fl();
        },
        partials: {
            "<Zemla0": {name: "Zemla", partials: {}, subs: {}},
            "<Message1": {name: "Message", partials: {}, subs: {}}
        },
        subs: {}
    });
});