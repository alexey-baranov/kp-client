/**
 * Created by alexey2baranov on 8/20/16.
 */

require("./RemoteModel"); //для того чтобы правильно работали рекурсивные ссылки модулей
let Zemla= require("./Zemla");
let Kopnik= require("./Kopnik");
let Kopa= require("./Kopa");
let Predlozhenie= require("./Predlozhenie");
let Slovo= require("./Slovo");
let Golos= require("./Golos");
let File= require("./File");

module.exports={
    Zemla: Zemla,
    Kopnik: Kopnik,
    Kopa: Kopa,
    Predlozhenie: Predlozhenie,
    Slovo: Slovo,
    Golos: Golos,
    File: File,
};