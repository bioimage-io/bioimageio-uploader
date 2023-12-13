<script>
    import SingleLineInputs from './SingleLineInputs.svelte';
    import refresh_status from "../lib/status.js";
    import { Search } from 'lucide-svelte';

    export let modelName="";
    let status;
    let status_step = 0;
    let status_message = "";
    let status_num_steps;
    let error;
    let error_element;
    let last_error_object;
    let input_value;
    let is_finished = false;
    let value=0;
    let max=0;

    let notify_ci_message = "";
    let notify_ci_failed = false;

    async function poll_status(){
        if(modelName){ 
            const resp = await refresh_status(modelName);
            status_message = resp.status;
            status_step = resp.step;
            status_num_steps = resp.num_steps;
            console.log(status);
        }
        is_finished = status_message.startsWith("Publishing complete");
        if(status_step > 0){
            //value = `{status_step}`; 
            console.log(value);
            value = `${status_step}`; 
            max = `${status_num_steps}`; 
            console.log("value and max");
            console.log(value);
            console.log(max);
        }
        if(!is_finished) setTimeout(poll_status, 2000);
    }

    function set_model_name(name){
        modelName = name;
        poll_status();
    }
    
    if(modelName) poll_status();

</script>

{#if modelName }
    <h2>Model: <code>{modelName}</code></h2>
    <article>Status:
        {#if status_message}
            <code>{status_message}</code>
        {:else}
            <code aria-busy="true"></code>
        {/if}

        <!--{@debug value} -->
        <!--{@debug max} -->
        {#if !is_finished }
            {#if max > 0 }
                <br>
                <progress value="{value}" max="{max}">15%</progress>
            {:else}
                <br>
                <progress max="{max}">15%</progress>
            {/if}
        {/if}
        <!--<progress {value} {max}>15%</progress>-->

    </article> 
    {#if notify_ci_message}
        <p>🤖: {notify_ci_message}</p>
    {/if}
{:else}
    <SingleLineInputs>
        <input type="text" bind:value={input_value} placeholder="Enter model name, e.g. affable-shark"/>
        <button class="icon" on:click={()=>set_model_name(input_value)} ><Search /></button>
    </SingleLineInputs>
{/if}
