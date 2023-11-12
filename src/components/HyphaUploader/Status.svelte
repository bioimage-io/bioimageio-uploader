<script>
    //import { createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';
    export let status_url;
    export let rdf_url;
    export let status;
    //const dispatch = createEventDispatcher();

    let status_message = "...";
    let notify_ci_message;
    let notify_ci_failed = false;

    
    if (browser){
        refrest_status();
    }

    async function refrest_status(){
        if(!status_url) return 
        let resp = await fetch(status_url);
        status = await resp.json();
        if(!status) return
        status_message = status.status;

        if(status.status === "uploaded"){
            await notify_ci_bot();
        }
    }

    async function notify_ci_bot() {
        // debug url: `https://bioimage-6b0000.netlify.live/.netlify/functions/bioimageiobot?action=notify&source=https://zenodo.org/api/files/3f422e1b-a64e-40d3-89d1-29038d2f405d/rdf.yaml`
        if(!rdf_url){
            notify_ci_message = "RDF url not set";
            return
        }

        notify_ci_message = "⌛ Trying to notify bioimage-bot for the new item...";
        notify_ci_failed = false;
        // trigger CI with the bioimageio bot endpoint

        try{
            let resp = await fetch(rdf_url);
            if (resp.status === 200) {
                notify_ci_status =
                    "🎉 bioimage-bot has successfully detected the item: " +
                    (await resp.json())["message"];
            } else {
                notify_ci_failed = true;
                notify_ci_message =
                    "😬 bioimage-bot failed to detected the new item, please report the issue to the admin team of bioimage.io: " +
                    (await resp.text());
            }
        }catch(e){
            notify_ci_status = `😬 Failed to reach to the bioimageio-bot, please report the issue to the admin team of bioimage.io: ${e}`;
            notify_ci_failed = true;
        }
    }


</script>

<div>Status: {status_message}</div> 
