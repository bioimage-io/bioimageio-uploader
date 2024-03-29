export default async (event) => {
    const data = await event.json();
    const url = data.url;
    let obj = {};

    try{
        const resp = await fetch(url);
        try{
            obj = await resp.json();
        }catch(err){
            obj = {last_message: "Status file not present yet", messages:[]};
        }
    }catch(err){
        obj = {last_message: "Status file not present yet", messages:[]};
    }
    console.log("Got status for");
    console.log(url);
    console.log("Answer:");
    console.log(obj);
    const res = Response.json(obj);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.append("Access-Control-Allow-Headers", "*");
    res.headers.append("Access-Control-Allow-Methods", "*");
    return res;

}
