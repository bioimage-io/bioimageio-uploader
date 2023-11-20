<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';
    import Notification from './Notification.svelte';
    export let files;
    export let server;
    export let rdf;
    export let status_url;
    export let rdf_url;
    import JSONTree from 'svelte-json-tree';
    let all_done = false;
    let error;
    let storage;
    let storage_info;
    let uploading = false;
    let model_name_message = "[UNSET]";
    let model_name;
    let status_urls;
    const hostname = browser ? `${window.location.protocol}//${window.location.host}` : "";
    //const generate_name_url = "https://rococo-quokka-67157b.netlify.app/.netlify/functions/generate_name";
    const generate_name_url = `${hostname}/.netlify/functions/generate_name`;
    let notify_ci_message = "";
    let notify_ci_failed = false;
    const notify_ci_url = `${hostname}/.netlify/functions/notify_ci`;
    console.log(`
        hostname                : ${hostname}
        generate_name_url       : ${generate_name_url}
        notify_ci_url           : ${notify_ci_url}`);

    const dispatch = createEventDispatcher();
    let status_message = "";
    
    async function upload_file(file){
        if(!model_name) return;
        const filename = `${model_name.name}/${file.name}`; 
        status_message = `Uploading ${filename}`;

        let url_put = await storage.generate_presigned_url(
            storage_info.bucket, 
            storage_info.prefix + filename,
            {client_method: "put_object", _rkwargs: true}
        )
         let url_get = await storage.generate_presigned_url(
             storage_info.bucket, 
             storage_info.prefix + filename
         )
        console.log("Used bucket and prefix:", storage_info.bucket, storage_info.prefix);

        try{
            let response = await fetch(url_put, {method:"PUT", body:file});
            console.log("Upload result:", await response.text());
            return {'get': url_get, 'put': url_put};
        }catch(err){
            console.error("Upload failed!");
            console.error(err);
            error = err.message;
        }
        return null;
    }

    async function publish(){
        console.log("Publishing...");
        // let workspace = server.config.workspace;
        storage = await server.get_service("s3-storage");
        storage_info = await storage.generate_credential();

        uploading = true;
        const status_file = new File([
            new Blob([JSON.stringify({status:'uploaded'}, null, 2)], {type: "application/json"})],
            "status.json");
        status_urls = await upload_file(status_file);
        if(!status_urls){
            uploading = false;
            return
        }
        console.log("SUCCESS: status_urls:");
        console.log(status_urls);
        status_url = status_urls.get;
        let rdf_file = files.filter(item => item.name === "rdf.yaml")
        if(rdf_file.length !== 1){
            throw new Error("Could not find RDF file in file list");
        }
        rdf_file = rdf_file[0];

        // TODO: The following still needs work
        rdf_url = (await upload_file(rdf_file)).get;
        if(!rdf_url){
            uploading = false;
            return
        }
        console.log("SUCCESS: rdf_url:" + rdf_url);
        console.log("Uploading:");
        for(const file of files){
            if(file.name === "rdf.yaml") continue
            console.log(file.name);
            const result = await upload_file(file);
            if(!result){
                uploading = false;
                return
            }
        }
        uploading = false;
        await refresh_status();
        await notify_ci_bot();
        if(notify_ci_failed) return;

        await new Promise(r => setTimeout(r, 1000));

        is_done();
    }

    onMount(async ()=>{
        await regenerate_alias();
    })

    async function regenerate_alias(){
        model_name_message = "generating...";
        try{
            model_name = await (await fetch(generate_name_url)).json(); 
            model_name_message = "";
        }catch(err){
            console.error("Failed to generate name:")
            console.error(err);
            model_name_message = "ERROR";
        }    
    }
        
    function is_done() {
        dispatch('done', {part:'review'});
    }
    
    async function notify_ci_bot() {
        if(!notify_ci_url){
            console.error("notify_ci_url not set")
            return 
        } 
        if(!status_urls){
            console.error("status_urls not set");
            return 
        }

        notify_ci_message = "⌛ Trying to notify bioimage-bot for the new item...";
        notify_ci_failed = false;
        // trigger CI with the bioimageio bot endpoint
        try{
            let resp = await fetch(notify_ci_url, {
                    method: 'POST', 
                    headers: {"Content-Type": "application/json"}, 
                    body: JSON.stringify({'status_url': status_urls.put})});
            if (resp.status === 200) {
                notify_ci_message =
                    "🎉 bioimage-bot has successfully detected the item: " +
                    (await resp.json())["message"];
            } else {
                notify_ci_failed = true;
                notify_ci_message =
                    "😬 bioimage-bot failed to detected the new item, please report the issue to the admin team of bioimage.io: " +
                    (await resp.text());
            }
        }catch(e){
            notify_ci_message = `😬 Failed to reach to the bioimageio-bot, please report the issue to the admin team of bioimage.io: ${e}`;
            notify_ci_failed = true;
        }
    }
    
    async function refresh_status(){
        try{
            console.log("Refreshing status...");
            console.log(status_url);
            if(!status_url){
                console.log("No status_url");
                return 
            }
            status_message = "Contacting server...";
            let resp = await fetch(status_url);
            console.log(resp); 
            status_message = "Interpreting result...";
            let status = await resp.json();
            console.log(status);
            if(!status){
                console.log("Status not readable at url");
                console.log(status_url);
                return
            }
                
            status_message = status.status;

        }catch(err){
            console.warn("Refresh failed:");
            console.error(err);
        }
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
    <p class="level">Your model alias is: 
        {#if model_name_message }({model_name_message}){/if}
        {#if model_name}
            <code style="min-width:10em;">{model_name.name} {model_name.icon}&nbsp;</code>
        {/if}
        <button class="button is-primary" on:click={regenerate_alias}>Regenerate alias</button>
    </p>
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
{#if notify_ci_message}
    <p>🤖: {notify_ci_message}</p>
{/if}
{#if status_message}
    <div>Upload status: {status_message}</div> 
{/if}
