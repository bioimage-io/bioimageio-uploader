const { GITHUB_URL, GITHUB_TOKEN } = process.env;
const return_cors_headers = {
    'Access-Control-Allow-Origin': 'https://bioimage.io',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST'
};
const headers = {
    'Accept': 'application/vnd.github.v3+json', 
    'Authorization': `token ${GITHUB_TOKEN}` 
};
    // 'user-agent': 'bioimage-bot'

export default async (event, context) => {
    //const data = await JSON.parse(event.body)

    const data = await event.json();
    const options = {     
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            'ref': 'uploader-object',
            'inputs':{
                //'status_url': data.status_url,
                'model_nickname': data.model_nickname,
            }
        })
    };
    let resp_obj = {};

    if(!data.status_url){
        const res = Response.json({'message': "Failed: status_url not found in request json"});
        res.status = 500;
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.append("Access-Control-Allow-Headers", "*");
        res.headers.append("Access-Control-Allow-Methods", "*");
        return res;
        
    }else{
        try{
            let resp = await fetch(GITHUB_URL, options);
            try{
                resp_obj = await resp.json();
            }catch(err){
                console.log("No JSON in response");
            }

        }catch(err){
            console.error("Failed to fetch:");
            console.error(err);
            const res = Response.json(
                {'message': `Failed: ${err.message}`},
                {status: 500});
            res.headers.set("Access-Control-Allow-Origin", "*");
            res.headers.append("Access-Control-Allow-Headers", "*");
            res.headers.append("Access-Control-Allow-Methods", "*");
            return res;
        }
        // const res = new Response("Success");
        const reply_obj = {"status":`Contacted CI: ${resp_obj.message}`};
        console.log("Response from CI:");
        console.log(resp_obj);
        const res = Response.json(reply_obj);
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.append("Access-Control-Allow-Headers", "*");
        res.headers.append("Access-Control-Allow-Methods", "*");
        return res;
    }
}
