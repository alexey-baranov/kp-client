/**
 * Created by alexey2baranov on 8/20/16.
 */

require("./RemoteModel"); //для того чтобы правильно работали рекурсивные ссылки модулей
let Kopnik= require("./Kopnik");

module.exports={
    Kopnik: Kopnik
};