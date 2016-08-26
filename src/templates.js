var Handlebars = require("handlebars");  var template = Handlebars.template, templates = Handlebars.templates = Handlebars.templates || {};
templates['Kopnik'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.Message,depth0,{"name":"Message","data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div id=\""
    + alias4(((helper = (helper = helpers.io || (depth0 != null ? depth0.io : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"io","hash":{},"data":data}) : helper)))
    + "\">\n    <div id=\""
    + alias4(((helper = (helper = helpers.io || (depth0 != null ? depth0.io : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"io","hash":{},"data":data}) : helper)))
    + "_fullName\">"
    + alias4(((helper = (helper = helpers.fullName || (depth0 != null ? depth0.fullName : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"fullName","hash":{},"data":data}) : helper)))
    + "</div>\n    <div id=\""
    + alias4(((helper = (helper = helpers.io || (depth0 != null ? depth0.io : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"io","hash":{},"data":data}) : helper)))
    + "_birth\">"
    + alias4(((helper = (helper = helpers.birth || (depth0 != null ? depth0.birth : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"birth","hash":{},"data":data}) : helper)))
    + "</div>\n    <div id=\""
    + alias4(((helper = (helper = helpers.io || (depth0 != null ? depth0.io : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"io","hash":{},"data":data}) : helper)))
    + "_email\">"
    + alias4(((helper = (helper = helpers.email || (depth0 != null ? depth0.email : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"email","hash":{},"data":data}) : helper)))
    + "</div>\n\n    <div id=\""
    + alias4(((helper = (helper = helpers.io || (depth0 != null ? depth0.io : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"io","hash":{},"data":data}) : helper)))
    + "_zemla\"></div>\n\n\n"
    + ((stack1 = helpers.each.call(alias1,((stack1 = (depth0 != null ? depth0.model : depth0)) != null ? stack1.messages : stack1),{"name":"each","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "\n    <button id=\""
    + alias4(((helper = (helper = helpers.io || (depth0 != null ? depth0.io : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"io","hash":{},"data":data}) : helper)))
    + "_reload\">Обновить</button>\n</div>";
},"usePartial":true,"useData":true});
templates['Message'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div id=\""
    + alias4(((helper = (helper = helpers.id || (depth0 != null ? depth0.id : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"id","hash":{},"data":data}) : helper)))
    + "\"><div class=\"text\">"
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "</div></div>\n";
},"useData":true});
templates['Node'] = template({"1":function(container,depth0,helpers,partials,data) {
    var stack1;

  return ((stack1 = container.invokePartial(partials.Node,(depth0 != null ? depth0.child : depth0),{"name":"Node","hash":{"HTML_ID":(helpers.getIO || (depth0 && depth0.getIO) || helpers.helperMissing).call(depth0 != null ? depth0 : {},(depth0 != null ? depth0.HTML_ID : depth0),"child",{"name":"getIO","hash":{},"data":data})},"data":data,"indent":"        ","helpers":helpers,"partials":partials,"decorators":container.decorators})) != null ? stack1 : "");
},"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var stack1, helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div id=\""
    + alias4(((helper = (helper = helpers.HTML_ID || (depth0 != null ? depth0.HTML_ID : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"HTML_ID","hash":{},"data":data}) : helper)))
    + "\">\n    "
    + alias4(((helper = (helper = helpers.text || (depth0 != null ? depth0.text : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"text","hash":{},"data":data}) : helper)))
    + "\n"
    + ((stack1 = helpers["if"].call(alias1,(depth0 != null ? depth0.child : depth0),{"name":"if","hash":{},"fn":container.program(1, data, 0),"inverse":container.noop,"data":data})) != null ? stack1 : "")
    + "</div>";
},"usePartial":true,"useData":true});
templates['Zemla'] = template({"compiler":[7,">= 4.0.0"],"main":function(container,depth0,helpers,partials,data) {
    var helper, alias1=depth0 != null ? depth0 : {}, alias2=helpers.helperMissing, alias3="function", alias4=container.escapeExpression;

  return "<div id=\""
    + alias4(((helper = (helper = helpers.io || (depth0 != null ? depth0.io : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"io","hash":{},"data":data}) : helper)))
    + "\">\n    Земля <span id=\""
    + alias4(((helper = (helper = helpers.io || (depth0 != null ? depth0.io : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"io","hash":{},"data":data}) : helper)))
    + "_name\">"
    + alias4(((helper = (helper = helpers.name || (depth0 != null ? depth0.name : depth0)) != null ? helper : alias2),(typeof helper === alias3 ? helper.call(alias1,{"name":"name","hash":{},"data":data}) : helper)))
    + "</span>\n</div>";
},"useData":true});
