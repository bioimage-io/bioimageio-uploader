<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    
    import { Search } from 'lucide-svelte';

    import ErrorBox from './ErrorBox.svelte';
    import refresh_status from "../lib/status";
    import { time_ago, get_json } from '../lib/utils';
    import { RESOURCE_URL } from '../lib/config';

    export let resource_id="";


    let error = null;
    let timeout_id;
    let versions_info;
    let staged = {};
    let published = {};

    onMount(async() => {
    });



    ///
    /// Clear timeout when navigating away from this page
    /// 
    onDestroy(()=>{
        clearTimeout(timeout_id);
    });


    async function poll_status(){
        if(resource_id){ 
            try{
                versions_info = await get_json(`${RESOURCE_URL}/${resource_id}/versions.json`);
                staged = versions_info.staged;
                published = versions_info.published;
                error = "";
            }catch(err){
                //messages = ["Error polling status 😬. Please let the dev-team know 🙏"];
                error = "Unable to get versions. If you just submitted, this is normal. If the problem persists, please let the dev-team know 🙏";
                versions_info = null;
                staged = [];
                published = [];
                console.error("Error polling status:");
                console.error(err);
                return;
            }
        }else{
            console.log("Resource id not set");
        }
        timeout_id = setTimeout(poll_status, 5000);
    }

    if(resource_id) poll_status();
</script>

{#if resource_id }
    <h2>Resource ID: <code>{resource_id}</code></h2>

    <ErrorBox {error} />

    <h3>Versions</h3>

    {#if versions_info}
        <h4>Staged</h4>
        <ul>
        {#each Object.entries(staged) as [version_number, details]}
                <li title="Submitted at {details.timestamp}"><a href="#/status/{resource_id}/staged/{version_number}">{version_number}</a> [{time_ago(details.timestamp)}] : {details.status.name}</li>    
        {/each }
        </ul>
        <h4>Published</h4>
        <ul>
        {#each Object.entries(published) as [version_number, details]}
                <li><a href="#/status/{resource_id}/published/{version_number}">{version_number}</a> [{details.timestamp}] : {details.status.name}</li>    
        {/each }
        </ul>
    {/if}
{/if }


