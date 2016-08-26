function template(locals) {
    var pug_html = "", pug_mixins = {}, pug_interp;
    pug_mixins["Mixin"] = pug_interp = function () {
        var block = (this && this.block), attributes = (this && this.attributes) || {};
        pug_html = pug_html + "\u003Cdiv\u003Ethis is mixin\u003C\u002Fdiv\u003E";
    };
    pug_html = pug_html + "\u003Cdiv\u003Ethis is template";
    pug_mixins["Mixin"]();
    pug_html = pug_html + "\u003C\u002Fdiv\u003E";
    ;
    return pug_html;
}