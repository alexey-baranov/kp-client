/**
 * Created by alexey2baranov on 8/20/16.
 */
"use strict";

let RemoteModel= require("./RemoteModel"); //для того чтобы правильно работали рекурсивные ссылки модулей
let Zemla= require("./Zemla");
let Registration= require("./Registration")
let Kopnik= require("./Kopnik");
let Kopa= require("./Kopa");
let Predlozhenie= require("./Predlozhenie");
let Slovo= require("./Slovo");
let Golos= require("./Golos");
let File= require("./File");

module.exports={
    RemoteModel: RemoteModel,
    Zemla: Zemla,
    Registration: Registration,
    Kopnik: Kopnik,
    Kopa: Kopa,
    Predlozhenie: Predlozhenie,
    Slovo: Slovo,
    Golos: Golos,
    File: File,
}
