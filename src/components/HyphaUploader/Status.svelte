<script>
    //import { createEventDispatcher } from 'svelte';
    //import { browser } from '$app/environment';
    export let status_url;
    let status;
    let status_message = "";
    
    //if (browser){

        status_message = "Contacting server...";
        refresh_status();
    //}

    async function refresh_status(){
        try{
            console.log("Refreshing status...");
            console.log(status_url);
            if(!status_url){
                console.log("No status_url");
                return 
            }
            let resp = await fetch(status_url);
            console.log(resp); 
            status = await resp.json();
            console.log(status);
            if(!status){
                console.log("Status not readable at url");
                console.log(status_url);
                return
            }
            if(status.status !== status_message){    
                status_message = status.status;
            }

        }catch(err){
            console.warn("Refresh failed:");
            console.error(err);
        }
        
        setTimeout(refresh_status, 2000);
    }



</script>

<article>Status: <code>{status_message}</code></article> 
