/**
 * Created by alexey2baranov on 8/31/16.
 */

async function f1(p1,p2){
    await f2(p2);
}

async function f2(){
    return new Promise((res,rej)=>{
        setTimeout(()=> {
            console.log("f2-promise");
            rej();
        },1000);
        });
}

f1(123,456);