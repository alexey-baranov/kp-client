class WS{
    constructor(){
        // this.log= log4javascript.getLogger("WS");
    }

    call(url, data) {
        data= data||{};
        Object.assign(data, {anticache:new Date().getTime()}, WS.extraData);

        var this2= this;
        var result = new Promise(function (resolve, reject) {
            global.$.ajax({
                url: `${WS.SCHEMA}://${WS.HOST}/${WS.PATH}/${url}`,
                data: data,
                dataType: "json",
                success: function (data, textStatus, jqXHR ) {
                    resolve(data);
                },
                error: function(jqXHR, textStatus, errorThrown) {
                    let error= jqXHR.responseJSON || jqXHR.responseText || errorThrown;
                    console.error(`${WS.SCHEMA}://${WS.HOST}/${WS.PATH}/${url}?`, global.$.map(data, (val, name)=>`${name}=${val}`).join("&"), "throws", error);
                    reject(errorThrown);
                },
                complete: function (jqXHR, textStatus ) {

                }
            });
        });
        
        return result;
    }
}

/**
 * Дата которая добавляется к аргументу data в каждом запросе
 * @type {{}}
 */
WS.extraData={};

module.exports= WS;