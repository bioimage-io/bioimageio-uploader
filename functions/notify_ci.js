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

    console.log("Input event:");
    console.log(event);
    const data = await event.json();
    console.log("Attempting to contact CI...");
    console.log("data");
    console.log(data);
    console.log("typeof data");
    console.log(typeof data);
    console.log('data["status_url"]');
    console.log(data["status_url"]);

    console.log("GITHUB_URL");
    console.log(GITHUB_URL);
    console.log("GITHUB_TOKEN");
    console.log(GITHUB_TOKEN);
    
    const options = {     
        method: "POST",
        headers: headers, 
        body: JSON.stringify({
            'ref': 'main',
            'inputs':{'status_url': data.status_url}
        })
    };

    if(!data.status_url){
        // const res = new Response("Failed: status_url not found in request json");
        const res = Response.json({'message': "Failed: status_url not found in request json"});
        res.status = 500;
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.append("Access-Control-Allow-Headers", "*");
        res.headers.append("Access-Control-Allow-Methods", "*");
        return res;
        
    }else{
        try{
            console.log("CONTACTING CI...");
            console.log("FULL OPTIONS:");
            console.log(options);
            let resp = await fetch(GITHUB_URL, options);
            console.log("RESPONSE FROM CI");
            console.log(resp);
            // console.log(resp.status);
            try{
                console.log(await resp.json());
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
        const res = Response.json({"message":"Success"});
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.append("Access-Control-Allow-Headers", "*");
        res.headers.append("Access-Control-Allow-Methods", "*");
        return res;
    }
}
