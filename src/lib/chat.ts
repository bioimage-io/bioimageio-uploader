const STATUS_PREFIX = "https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/";
const STATUS_SUFFIX = "/staged/1/chat.json";

const hostname = `${window.location.protocol}//${window.location.host}`;
const update_url = `${hostname}/.netlify/functions/update_resource`;
const get_url = `${hostname}/.netlify/functions/get_chats`;


/* 
 * Get chats for a resource
 * @param resource_id
 */
export async function get_chats(resource_id: string){
    const url = `${STATUS_PREFIX}${resource_id}${STATUS_SUFFIX}`;
    console.log("Getting:", url); 

    try{
        // Using netlify middle-man
        const resp = await fetch(get_url, {
            method: 'POST', 
            headers: {"Content-Type": "application/json"}, 
            body: JSON.stringify({url: url}),
        });

        // If we query EBI-S3 directly
        //const resp = await fetch(url);
        const chats = await resp.json();
        return chats;
    }catch(err){
        console.error(`Get chat failed: ${err.message}`);
        console.debug(err);
        throw err; 
    }
}


/* 
 * Get chats for a resource
 * @param resource_id
 */
export async function update_chat(resource_id: string, text: string){
    const url = `${STATUS_PREFIX}${resource_id}${STATUS_SUFFIX}`;
    try{
        // Using netlify middle-man
        const resp = await fetch(update_url, {
            method: 'POST', 
            headers: {"Content-Type": "application/json"}, 
            body: JSON.stringify({resource_id, text}),
        });

        const ret = await resp;
        return ret
    }catch(err){
        console.error(`Update chat failed: ${err.message}`);
        console.debug(err);
        throw err; 
    }
}

