/**
 * Created by alexey2baranov on 8/9/16.
 */
let pug = require("pug");
require("amd-loader");

let alexey2baranov= {
    id: 82,
    fullName: "Баранов Алексей Юрьевич",
    surname: "Баранов",
    name: "Алексей",
    patronymic: "Юрьевич",
    birth: 1983,
    email: "alexey_baranov@inbox.ru",
    // zemla: {id: 6, name: "Сургут"},
    messages: [
        {id: 1, text: "lexey_baranov@inbox.ru"},
        {id: 2, text: "dlebars.registerPartial("},
        {id: 3, text: "ialzemla, Handleb"},
        {id: 4, text: "emplate = Handlebars.compile(KO"},
    ]
};

let alexey2baranovView= {
    io: "some_io_kopnik_1",
    model:alexey2baranov,
/*    zemlaView:{
        io:"some_io_kopnik_1_zemla",
        model:alexey2baranov.zemla
    },*/
    messageViews:alexey2baranov.messages.map(eachMessage=>{
        return {io:"some_io_kopnik_1_message"+eachMessage.id, model:eachMessage};
    })
};

// console.log(alexey2baranovView);

let hogan= require("hogan.js");
let kopnikTemplate= require("./tmpl/Kopnik");

console.log(kopnikTemplate.render(alexey2baranovView,{
    Zemla: require("./tmpl/Zemla"),
    Message: require("./tmpl/Message"),
}));
