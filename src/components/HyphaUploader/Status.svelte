<script>
    //import { createEventDispatcher } from 'svelte';
    import { browser } from '$app/environment';
    export let status_url;
    export let rdf_url;
    let status;
    //const dispatch = createEventDispatcher();
    // let upload_headers = {
    //     Authorization: `Bearer ${token}`,
    // };

    let status_message = "unset";

    
    if (browser){
        refresh_status();
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
            status = await resp.json();
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

<div>Status: {status_message}</div> 
