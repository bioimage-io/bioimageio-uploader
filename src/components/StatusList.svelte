<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import FullScreenConfetti from './FullScreenConfetti.svelte';
    import SingleLineInputs from './SingleLineInputs.svelte';
    import ErrorBox from './ErrorBox.svelte';
    import refresh_status from "../lib/status.ts";
    import { Search } from 'lucide-svelte';
    import { is_string } from '../lib/utils.ts';

    import Chat from './Chat.svelte';
    import Review from './Review.svelte';

    export let resource_id="";
    export let get_json;

    let error = null;
    let timeout_id;
    let versions;

    onMount(async() => {
    });


    ///
    /// Clear timeout when navigating away from this page
    /// 
    onDestroy(()=>{
        clearTimeout(timeout_id);
    });


    async function poll_status(){
        if(resource_id && get_json){ 
            try{
                const resp = await get_json({'url': `https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/${resource_id}/versions.json`});
                versions = resp.data;
                error = "";
            }catch(err){
                //messages = ["Error polling status 😬. Please let the dev-team know 🙏"];
                error = "Error polling versions 😬. Please let the dev-team know 🙏";
                messages = [];
                console.error("Error polling status:");
                console.error(err);
                return;
            }
        }
        timeout_id = setTimeout(poll_status, 5000);
    }

    if(resource_id) poll_status();
</script>

{#if resource_id }
    <h2>Resource ID: <code>{resource_id}</code></h2>

    <ErrorBox {error} />

    <h3>Versions</h3>

    {#if versions}
        {#each Object.entries(versions) as [name, items]}
            <h4>{name}</h4>
            <ul>
            {#each Object.entries(items) as [version_number, details]}
                <li><a href="#/status/{resource_id}/{name}/{version_number}">{version_number}</a> [{details.timestamp}] : {details.status.name}</li>    
            {/each }
            </ul>
        {/each}
    {/if}
{/if }


