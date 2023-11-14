const { GITHUB_WORKFLOW_URL, GITHUB_TOKEN } = process.env;
const return_cors_headers = {
    'Access-Control-Allow-Origin': 'https://bioimage.io',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET, POST'
};
const options = {
    'method': 'POST', 
    'Accept': 'application/vnd.github.v3+json', 
    'Authorization': `token ${GITHUB_TOKEN}`, 
    'user-agent': 'bioimage-bot'
};

export default async (event, context) => {
    //const data = await JSON.parse(event.body)

    const data = await event.json();
    console.log(data);
    //if(data.status_url
    await fetch(
        GITHUB_WORKFLOW_URL, 
        {...options, 
            body: JSON.stringify({
                'ref': 'main',
                'inputs':{'status_url': data.status_url}
            })
        });
    const res = new Response("Success");
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.append("Access-Control-Allow-Headers", "*");
    res.headers.append("Access-Control-Allow-Methods", "*");
    return res;
}
