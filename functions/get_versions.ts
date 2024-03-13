export default async (event:  Request) => {
    const data = await event.json();
    const url = data.url;
    let obj = {};

    try{
        const resp = await fetch(url);
        try{
            obj = await resp.json();
        }catch(err){
            obj = {'error': "Versions file not present", 'err': err};
        }
    }catch(err){
        obj = {'error': "Versions file not present", 'err': err};
    }
    console.log("Got versions for");
    console.log(url);
    const res = Response.json(obj);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.append("Access-Control-Allow-Headers", "*");
    res.headers.append("Access-Control-Allow-Methods", "*");
    return res;
}
