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

    import { functions } from '../lib/firebase';
    
    export let resource_id="";
    export let version_number; 

    const get_json = functions.get_json;

    let step = 0;
    let messages = [];
    let last_message = "Getting status...";
    let num_steps;
    let error = "";
    //let error;
    //let error_element;
    //let last_error_object;
    let input_value;
    let is_finished = false;
    let value=0;
    let max=0;
    let timeout_id;

    // Get the reviewer status
    let reviewer: bool;

    let logged_in: bool;

    let versions;
    let status;
    let chats=[]; 
    let logs;

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
                if (get_json){
                    //console.log(get_json);
                    console.log("Get status:");
                    const resp_version = await get_json({'url': `https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/${resource_id}/versions.json`});
                    const resp_log = await get_json({'url': `https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/${resource_id}/staged/${version_number}/logs.json`});
                    const resp_chat = await get_json({'url': `https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/${resource_id}/staged/${version_number}/chat.json`});
                    console.log(resp_version.data);
                    status = resp_version.data.staged[version_number].status;
                    console.log(status);
                    chats = resp_chat.data.messages;
                    console.log(chats);
                    logs = resp_log.data;

                //const resp = await refresh_status(resource_id);
                    last_message = status.description;
                    step = status.step;
                    num_steps = status.num_steps;
                    error = "";
                }else{
                    console.debug("get_json not set");
                }
            }catch(err){
                //messages = ["Error polling status 😬. Please let the dev-team know 🙏"];
                last_message = "Error polling status 😬. Please let the dev-team know 🙏";
                messages = [];
                console.error("Error polling status:");
                console.error(err);
                error = `😬 Opps - an error occurred while getting the status: ${err.message}`
                return;
            }
            if(last_message) is_finished = last_message.startsWith("Publishing complete");
            if(step > 0){
                //value = `{status_step}`; 
                value = `${step}`; 
                max = `${num_steps}`; 
            }
            console.log(`Value ${value}, max ${max}`);

        }

        if(!is_finished){
            timeout_id = setTimeout(poll_status, 5000);
        }
    }

    function set_resource_id(text){
        resource_id = text;
        poll_status();
    }
    
    if(resource_id) poll_status();

</script>

{#if resource_id }
    <h2>Resource ID: <a href="#/status/{resource_id}">{resource_id}</a> - staged - {version_number}</h2>


    <ErrorBox {error} />
    {#if !error}
        <article>Status:
            {#if last_message}
                <code>{last_message}</code>
            {:else}
                <code aria-busy="true"></code>
            {/if}

            {#if !is_finished }
                {#if max > 0 }
                    <br>
                    <progress value="{value}" max="{max}">{value}</progress>
                {:else}
                    <br>
                    <progress max="{max}">Running</progress>
                {/if}
            {:else}
                <FullScreenConfetti /> 
            {/if}


            {#if messages.length > 0}
            <h3>Log</h3>
                <code>
                {#each messages as message}
                    <span title="{message.timestamp}" >{message.text} </span><br>
                {/each}
                </code>
            {/if}

            <!--<progress {value} {max}>15%</progress>-->
        </article> 
    {/if}

    {#if logged_in}
        <Chat {resource_id} staged={true} version_number={version_number} {get_json}/> 
        {#if reviewer}
            <Review {resource_id} /> 
        {/if}
    {:else}

        <article>Login to chat and maintainer tools for maintainers</article>

    {/if}

{:else}
    <form>
    <SingleLineInputs>
        <input type="text" bind:value={input_value} placeholder="Enter resource ID, e.g. affable-shark"/>
        <button class="icon" on:click={()=>set_resource_id(input_value)} ><Search /></button>
    </SingleLineInputs>
    </form>
{/if}
