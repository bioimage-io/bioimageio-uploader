
const STATUS_PREFIX = "https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/";
const STATUS_SUFFIX = "/staged/1/details.json";

const hostname = `${window.location.protocol}//${window.location.host}`;
const status_url = `${hostname}/.netlify/functions/get_status`;


/* 
 * Get status for a model
 * @param model_name
 */
export default async function refresh_status(model_name: string){
    const url = `${STATUS_PREFIX}${model_name}${STATUS_SUFFIX}`;
    console.log("Getting:", url); 

    try{
        // Using netlify middle-man
        //const resp = await fetch(status_url, {
            //method: 'POST', 
            //headers: {"Content-Type": "application/json"}, 
            //body: JSON.stringify({url: url}),
        //});

        // If we query EBI-S3 directly
        const resp = await fetch(url);
        const status = await resp.json();
        if(!status){
            return {last_message:"No status", messages:[]};
        }
        return status;
    }catch(err){
        console.error(`Refresh failed: ${err.message}`);
        console.debug(err);
        throw err; 
    }
}



