<script>
    import { onDestroy } from 'svelte';
    import FullScreenConfetti from './FullScreenConfetti.svelte';
    import SingleLineInputs from './SingleLineInputs.svelte';
    import refresh_status from "../lib/status.js";
    import { Search } from 'lucide-svelte';
    import { is_string } from '../lib/utils.js';

    export let modelName="";
    let step = 0;
    let messages = [];
    let last_message = "Getting status...";
    let num_steps;
    let polling_error = false;
    //let error;
    //let error_element;
    //let last_error_object;
    let input_value;
    let is_finished = false;
    let value=0;
    let max=0;
    let timeout_id;

    ///
    /// Clear timeout when navigating away from this page
    /// 
    onDestroy(()=>{
        clearTimeout(timeout_id);
    });

    async function poll_status(){
        if(modelName){ 
            try{
                const resp = await refresh_status(modelName);
                last_message = resp.last_message;
                messages = resp.messages;
                if((!Array.isArray(messages)) || (!is_string(last_message))){
                    console.debug(resp);
                    throw new Error("Unable to get status messages from server response");
                }
                step = resp.step;
                num_steps = resp.num_steps;
                polling_error = false;
            }catch(err){
                //messages = ["Error polling status 😬. Please let the dev-team know 🙏"];
                last_message = "Error polling status 😬. Please let the dev-team know 🙏";
                messages = [];
                console.error("Error polling status:");
                console.error(err);
                polling_error = true;
                return;
            }
        }
        is_finished = last_message.startsWith("Publishing complete");
        if(step > 0){
            //value = `{status_step}`; 
            value = `${step}`; 
            max = `${num_steps}`; 
        }
        if(!is_finished){
            timeout_id = setTimeout(poll_status, 2000);
        }
    }

    function set_model_name(name){
        modelName = name;
        poll_status();
    }
    
    if(modelName) poll_status();

</script>

{#if modelName }
    <h2>Model: <code>{modelName}</code></h2>

    {#if polling_error}
        <article>
            😬 Opps - an error occurred while getting the status. 
        </article>
    {:else}
        <article>Status:
            {#if last_message}
                <code>{last_message}</code>
            {:else}
                <code aria-busy="true"></code>
            {/if}
            {#if messages.length > 0}
            <h3>Log</h3>
                <code>
                {#each messages as message}
                    <span title="{message.timestamp}" >{message.text} </span><br>
                {/each}
                </code>
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
            <!--<progress {value} {max}>15%</progress>-->
        </article> 
    {/if}

    <!--{#if notify_ci_message}-->
        <!--<p>🤖: {notify_ci_message}</p>-->
    <!--{/if}-->
{:else}
    <SingleLineInputs>
        <input type="text" bind:value={input_value} placeholder="Enter model name, e.g. affable-shark"/>
        <button class="icon" on:click={()=>set_model_name(input_value)} ><Search /></button>
    </SingleLineInputs>
{/if}
