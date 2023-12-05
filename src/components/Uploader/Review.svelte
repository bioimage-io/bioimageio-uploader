<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import toast from 'svelte-french-toast';
    import {router} from 'tinro';

    import Notification from './Notification.svelte';

    export let files;
    export let server;
    export let rdf;
    export let status_url;
    export let rdf_url;



    if (!rdf) router.goto("add");
    if (rdf.length === 0) router.goto("add");
    if (!files) router.goto("add");
    if (files.length === 0) router.goto("add");

    import JSONTree from 'svelte-json-tree';
    let storage;
    let storage_info;
    let uploading = false;
    let model_name_message = "";
    let model_name;
    let status_urls;
    const hostname = `${window.location.protocol}//${window.location.host}`;
    const generate_name_url = `${hostname}/.netlify/functions/generate_name`;

    const dispatch = createEventDispatcher();
    

    onMount(async ()=>{
        await regenerate_nickname();
    })

    async function regenerate_nickname(){
        model_name_message = "Generating...";
        try{
            model_name = await (await fetch(generate_name_url)).json(); 
            model_name_message = "";
        }catch(err){
            console.error("Failed to generate name:")
            console.error(err);
            model_name_message = "";
            error = "Error generating model name";
            last_error_object = err;
        }    
    }
        
    function is_done() {
        dispatch('done');
    }

    function publish(){
        router.goto("status");
    }

    
</script>

{#if !server}
    <Notification deletable={false} >
        Please login to the BioEngine to publish
    </Notification>
{/if}

<p class="level">
    {#if model_name_message }({model_name_message}){/if}
    {#if model_name}
        Your model nickname is: 
        <code style="min-width:10em;">{model_name.name} {model_name.icon}&nbsp;</code>
    {/if}
    <button on:click={regenerate_nickname}>Regenerate nickname</button>
</p>
<p>Please review your submission carefully, then press Publish</p>

<article class="contrast" style="--card-background-color: var(--contrast)">
    <JSONTree defaultExpandedLevel={1} value={rdf}/>
</article>

{#if server}
    <button class="button is-primary" on:click={publish}>Publish</button>
{/if}
