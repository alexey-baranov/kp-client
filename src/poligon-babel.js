/**
 * Created by alexey2baranov on 8/31/16.
 */
"use strict";

function staff() {
    console.log("do some staff");
}

async function register(handler, context) {
    let result = setTimeout(async(args, kwargs, details)=> {
        try {
            await handler.call(context);
        }
        catch (err) {
            this.log.error(this.toString(), `error on "${topic}" handler`, err);
            throw err;
        }
    }, 2000);
}


async function main() {
    await register(staff, this);
}

main();