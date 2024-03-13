
const PREFIX = "https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/";
const SUFFIX = "/versions.json";

const hostname = `${window.location.protocol}//${window.location.host}`;
const version_url = `${hostname}/.netlify/functions/get_versions`;


/* 
 * Get staging_version for a resource
 * @param resource
 */
export default async function get_staging_version(resource: string){
    const url = `${PREFIX}${resource}${SUFFIX}`;

    try{
        // Using netlify middle-man
        const resp = await fetch(version_url, {
            method: 'POST', 
            headers: {"Content-Type": "application/json"}, 
            body: JSON.stringify({url: url}),
        });
        // If we query EBI-S3 directly
        //const resp = await fetch(url);
        const versions = await resp.json();
        if(!versions){
            return {error: "Unable to get extract versions (json failed on response)"};
        }
        
        // Now get the staging version
        let staging_index = -1;
        for(let index=0; index < versions.length; index++){
            if(versions[index].status === 'staging'){
                if(staging_index !== -1){
                    throw Error("This resource appears to have multiple staging versions");
                }
                staging_index = index;
            }
        }
        const staging_version = versions[staging_index];
        return staging_version;
    }catch(err){
        console.error(`Failed to get versions.json: ${err.message}`);
        console.debug(err);
        throw err; 
    }
}



