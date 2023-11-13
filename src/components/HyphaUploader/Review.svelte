<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import Notification from './Notification.svelte';

    // export let token;
    export let files;
    export let server;
    export let rdf;
    // export let api;
    export let status_url;
    export let rdf_url;
    //import yaml from "js-yaml";
    import JSONTree from 'svelte-json-tree';
    let all_done = false;
    let error;
    let storage;
    let storage_info;
    let uploading = false;
    let model_name = "[UNSET]";
    const generate_name_url = "https://rococo-quokka-67157b.netlify.app/.netlify/functions/generate_name";
    // let upload_headers = {
    //     Authorization: `Bearer ${token}`,
    // };
    const dispatch = createEventDispatcher();

    async function upload_file(file){
        const filename = file.name; 

        console.log("file");
        console.log(file);
        console.log("filename");
        console.log(filename);


        let url = await storage.generate_presigned_url(
            storage_info.bucket, 
            storage_info.prefix + filename,
            {client_method: "put_object", _rkwargs: true}
        )
        console.log("Used bucket and prefix:", storage_info.bucket, storage_info.prefix);

        try{
            let response = await fetch(
                url, 
                {
                    method:"PUT", 
                    body:file, 
                    //credentials:"include", 
                    // mode: "cors",
                    // headers:upload_headers
                });
            console.log("Upload result:", await response.text());
            // let presigned_url = await storage.generate_presigned_url(
            //     storage_info["bucket"], 
            //     storage_info["prefix"] + filename
            // )
            // return presigned_url;
            return url;
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
        console.log("workspace");
        console.log(workspace);

        storage = await server.get_service("s3-storage");
        console.log("storage");
        console.log(storage);
        storage_info = await storage.generate_credential();
        console.log("storage-info");
        console.log(storage_info);

        // console.log(files);
        //console.log(files);
        //window.files = files;
        uploading = true;
        //let filename = zip_package.filename;
        //presigned_url = await upload_file(zip_package);
        // Create a status file
        const status_file = new File([
            new Blob([JSON.stringify({status:'uploaded'}, null, 2)], {type: "application/json"})],
            "status.json");
        status_url = await upload_file(status_file);
        if(!status_url) return
        
        console.log("SUCCESS: status_url:" + status_url);
        let rdf_file = files.filter(item => item.name === "rdf.yaml")
        if(rdf_file.length !== 1){
            throw new Error("Could not find RDF file in file list");
        }
        rdf_file = rdf_file[0];

        // TODO: The following still needs work
        rdf_url = await upload_file(rdf_file);
        if(!rdf_url) return
        console.log("SUCCESS: rdf_url:" + rdf_url);
        console.log("Uploading:");
        for(const file of files){
            if(file.name === "rdf.yaml") continue
            console.log(file.name);
            await upload_file(file); 
        }
        uploading = false;

        await new Promise(r => setTimeout(r, 2000));

        is_done();
    }

    onMount(async ()=>{
        model_name = await regenerate_alias();
    })

    async function regenerate_alias(){
        model_name = "generating...";
        let {name, icon} = await (await fetch(generate_name_url)).json(); 
        model_name = `${name} ${icon}`;
        return model_name;
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
    <p class="level">Your model alias is: <code style="min-width:10em;">{model_name} &nbsp;</code> <button class="button is-primary" on:click={regenerate_alias}>Regenerate alias</button></p>
    <p>Please review your submission carefully, then press Publish</p>

    <JSONTree value={rdf}/>

    <br>
    {#if server}
        <button class="button is-primary" on:click={publish}>Publish</button>
    {:else}
        <Notification deletable={false} >
            Please login to the BioEngine to publish
        </Notification>
    {/if}
{/if}
