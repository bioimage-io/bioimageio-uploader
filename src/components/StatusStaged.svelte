<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    
    import { Search } from 'lucide-svelte';

    import FullScreenConfetti from './FullScreenConfetti.svelte';
    import SingleLineInputs from './SingleLineInputs.svelte';
    import ErrorBox from './ErrorBox.svelte';
    import { get_json } from '../lib/utils';
    import { RESOURCE_URL } from '../lib/config';
    import Chat from './Chat.svelte';
    import Review from './Review.svelte';
    import Log from './Log.svelte';
    import user_state from "../stores/user";

    export let resource_id="";
    export let version_number=""; 

    let step = 0;
    let last_message = "Getting status...";
    let num_steps;
    let error = "";
    //let error;
    //let error_element;
    //let last_error_object;
    let input_value;
    let is_finished = false;
    let value='0';
    let max='0';
    let timeout_id;

    // Get the reviewer status
    let is_reviewer: boolean;

    let is_logged_in: boolean;

    let status;

    user_state.subscribe((user) => {
        is_logged_in = user.is_logged_in;
        is_reviewer = user.is_reviewer;
    });

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
                const resp_version = await get_json(`${RESOURCE_URL}/${resource_id}/versions.json`);
                status = resp_version.staged[version_number].status;
                last_message = status.description;
                step = status.step;
                num_steps = status.num_steps;
                error = "";
            }catch(err){
                //messages = ["Error polling status 😬. Please let the dev-team know 🙏"];
                last_message = "Error polling status 😬. Please let the dev-team know 🙏";
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
        }

        if(!is_finished){
            timeout_id = setTimeout(poll_status, 5000);
        }
    }

    function set_resource_id(text: string){
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
                {#if +max > 0 }
                    <br>
                    <progress value="{value}" max="{max}">{value}</progress>
                {:else}
                    <br>
                    <progress max="{max}">Running</progress>
                {/if}
            {:else}
                <FullScreenConfetti /> 
            {/if}

            <Log {resource_id} staged={true} {version_number} />

        </article> 
    {/if}

    {#if is_logged_in}
        <Chat {resource_id} staged={true} version_number={version_number} /> 
        {#if is_reviewer}
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
