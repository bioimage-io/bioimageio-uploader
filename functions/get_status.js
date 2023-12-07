export default async (event) => {
    const data = await event.json();
    const url = data.url;
    let obj = {};
    try{
        obj = await (await fetch(url)).json();
    }catch(err){
        obj = {status: "CI not started yet"};
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
