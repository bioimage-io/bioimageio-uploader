<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import FullScreenConfetti from './FullScreenConfetti.svelte';
    import SingleLineInputs from './SingleLineInputs.svelte';
    import refresh_status from "../lib/status.ts";
    import { Search } from 'lucide-svelte';
    import { is_string } from '../lib/utils.ts';

    import Chat from './Chat.svelte';
    import Review from './Review.svelte';

    export let resource_id="";
    export let get_json;

    let step = 0;
    let messages = [];
    let last_message = "Getting status...";
    let num_steps;
    let error = false;
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

    onMount(async() => {
        //if(hypha !== null){

            //await hypha.login(); 
            //reviewer = hypha.is_reviewer();
            //logged_in = hypha.is_logged_in();
                
            //console.log("Logged in :", logged_in);
        //} 
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
                    const resp_v = await get_json({'url': `https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/${resource_id}/versions.json`});
                    const resp = await get_json({'url': `https://uk1s3.embassy.ebi.ac.uk/public-datasets/sandbox.bioimage.io/${resource_id}/staged/1/details.json`});
                    console.log(resp);
                    const data = resp.data;
                    versions = resp_v.data;
                    console.log(versions);

                //const resp = await refresh_status(resource_id);
                    last_message = data.status.name;
                    messages = data.messages;
                    if((!Array.isArray(messages)) || (!is_string(last_message))){
                        console.debug(resp);
                        throw new Error("Unable to get status messages from server response");
                    }
                    step = data.status.step;
                    num_steps = data.status.num_steps;
                    error = false;
                }else{
                    console.debug("get_json not set");
                }
            }catch(err){
                //messages = ["Error polling status 😬. Please let the dev-team know 🙏"];
                last_message = "Error polling status 😬. Please let the dev-team know 🙏";
                messages = [];
                console.error("Error polling status:");
                console.error(err);
                error = true;
                return;
            }
            is_finished = last_message.startsWith("Publishing complete");
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

{#if !logged_in}
    <button>Login to access Reviewer tools</button>
{/if}

{#if resource_id }
    <h2>Resource ID: <code>{resource_id}</code></h2>

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


    <Chat {resource_id} {get_json}/> 
    {#if reviewer}
        <Review {resource_id} /> 
    {/if}
    <!--{#if notify_ci_message}-->
        <!--<p>🤖: {notify_ci_message}</p>-->
    <!--{/if}-->
{:else}
    <form>
    <SingleLineInputs>
        <input type="text" bind:value={input_value} placeholder="Enter resource ID, e.g. affable-shark"/>
        <button class="icon" on:click={()=>set_resource_id(input_value)} ><Search /></button>
    </SingleLineInputs>
    </form>
{/if}
