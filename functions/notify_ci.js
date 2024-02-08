const { GITHUB_URL, GITHUB_TOKEN, GITHUB_BRANCH } = process.env;
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
    const data = await event.json();
    if (!data.resource_path) {
        const error_message = "Failed: resource_path not found in request json";
        console.error()
        const res = Response.json({ 'message': error_message, 'status': 500 });
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.append("Access-Control-Allow-Headers", "*");
        res.headers.append("Access-Control-Allow-Methods", "*");
        return res;
    }
    if (!data.package_url) {
        const error_message = "Failed: package_url not found in request json";
        console.error()
        const res = Response.json({ 'message': error_message, 'status': 500 });
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.append("Access-Control-Allow-Headers", "*");
        res.headers.append("Access-Control-Allow-Methods", "*");
        return res;
    }


    const options = {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
            'ref': GITHUB_BRANCH,
            'inputs': {
                'resource_path': data.resource_path,
                'package_url': data.package_url,
            }
        })
    };
    let resp_obj = {};

    try {
        const resp = await fetch(GITHUB_URL, options);
        if (resp.status === 204) {
            // According to API docs, just expect a 204
            resp_obj = { 'status': resp.status };
        } else {
            console.error("Bad response from CI: ${resp.status}");
            let text = "";
            try {
                text = await resp.text()
            } catch {
                text = "(no-text)";
            }
            const res = Response.json(
                { 'message': `Failed to decode json from CI [status: ${resp.status}, content: ${text}]` },
                { 'status': 500 });
            res.headers.set("Access-Control-Allow-Origin", "*");
            res.headers.append("Access-Control-Allow-Headers", "*");
            res.headers.append("Access-Control-Allow-Methods", "*");
            return res;
        }

    } catch (err) {
        console.error("Failed to fetch from CI endpoint:");
        console.error(GITHUB_URL);
        console.error(err);
        const res = Response.json(
            { 'message': `Failed: ${err.message}` },
            { status: 500 });
        res.headers.set("Access-Control-Allow-Origin", "*");
        res.headers.append("Access-Control-Allow-Headers", "*");
        res.headers.append("Access-Control-Allow-Methods", "*");
        return res;
    }
    // const res = new Response("Success");
    const reply_obj = { "message": `Contacted CI: ${resp_obj.message}`, 'status': 200 };
    console.log("Response from CI:");
    console.log(resp_obj);
    const res = Response.json(reply_obj);
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.append("Access-Control-Allow-Headers", "*");
    res.headers.append("Access-Control-Allow-Methods", "*");
    return res;
}
