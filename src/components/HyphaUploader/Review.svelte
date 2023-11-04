<script>
    import { createEventDispatcher } from 'svelte';

    export let token;
    //export let files;
    export let zip_package;
    export let server;
    export let rdf;
    export let api;
    export let presigned_url;
    //import yaml from "js-yaml";
    import JSONTree from 'svelte-json-tree';
    let all_done = false;
    let error;
    let storage;
    let storage_info;
    let uploading = false;
    let upload_headers = {
        Authorization: `Bearer ${token}`,
    };
    const server_url = "https://ai.imjoy.io";
    const dispatch = createEventDispatcher();

    async function upload_file(file){
        const filename = file.name; 
        url = await storage.generate_presigned_url(
            storage_info["bucket"], 
            storage_info["prefix"] + filename,
            {client_method: "put_object", _rkwargs: true}
        )
        try{
            let response = await fetch(
                url, 
                {
                    method:"PUT", 
                    body:file, 
                    credentials:"include", 
                    mode: "cors",
                    headers:upload_headers
                });
            console.log("Upload result:", await response.text());
            let presigned_url = await storage.generate_presigned_url(
                storage_info["bucket"], 
                storage_info["prefix"] + filename
            )
            return presigned_url;
        }catch(err){
            console.error("Upload failed!");
            console.error(err);
            error = err.message;
        }
        return null;
    
    }

    async function publish(){
        console.log("Publishing...");
        console.log("Uploading files...");

        let workspace = server.config.workspace;

        storage = await server.get_service("s3-storage");
        console.log("storage");
        console.log(storage);
        storage_info = await storage.generate_credential();


        // console.log(files);
        //console.log(files);
        console.log(zip_package);
        //window.files = files;
        window.zip_package = zip_package;
        uploading = true;
        //let filename = zip_package.filename;
        presigned_url = await upload_file(zip_package);

        //for(const file of files){
            // let presigned_url = await upload_file(url, file); 
        //}
        uploading = false;
        console.log(presigned_url);
        if(!presigned_url){
            return;
        }

        await new Promise(r => setTimeout(r, 2000));

        is_done();
    }
        
    function is_done() {
        dispatch('done', {part:'review'});
    }
</script>

<!--<h2>Review & Publish</h2>-->

{#if uploading}
    <p>Uploading</p> 
    <progress class="progress is-small is-primary" max="100">15%</progress>
{:else if all_done}
    <p>All done!</p>
{:else if error}
    <p>Oops! Something went wrong 😟</p>
    <p>Please review the error, and try again. If the issue persists, please contact support</p>
    <code>{error}</code>
{:else}
    <p>Please review your submission carefully, then press Publish</p>

    <JSONTree value={rdf}/>

    <br>
    <button class="button is-primary" on:click={publish}>Publish</button>
{/if}
