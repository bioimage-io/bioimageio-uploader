<script>
    import { onMount, createEventDispatcher } from 'svelte';
    import toast from 'svelte-french-toast';
    import Notification from './Notification.svelte';

    export let uploader;

    import JSONTree from 'svelte-json-tree';
    let uploading = false;
    let model_name_message = "";
    let model_nickname = uploader.model_nickname;
    let rdf = uploader.rdf;
    let ready_to_publish = uploader.ready_to_publish();

    const dispatch = createEventDispatcher();
    
    function is_done() {
        dispatch('done');
    }

    function publish(){
        uploader.publish();
        is_done();
    }

    async function regenerate_nickname(){
        await uploader.regenerate_nickname();
        model_nickname = uploader.model_nickname;
        ready_to_publish = uploader.ready_to_publish();
        console.log("Ready to publish?", ready_to_publish);
        rdf = uploader.rdf;
        //rerender = !rerender;
    }

    if(!model_nickname) regenerate_nickname();
    
</script>

{#if !uploader.logged_in()}
    <Notification deletable={false} >
        Please login to the BioEngine to publish
    </Notification>
{/if}

{#key rerender}
<p class="level">
    {#if model_name_message }({model_name_message}){/if}
    {#if model_nickname}
        Your model nickname is: 
        <code style="min-width:10em;">{model_nickname.name} {model_nickname.icon}&nbsp;</code>
    {/if}
    <button on:click={regenerate_nickname}>Regenerate nickname</button>
</p>
{/key}
<p>Please review your submission carefully, then press Publish</p>

<article class="contrast" style="--card-background-color: var(--contrast)">
    <JSONTree defaultExpandedLevel={1} value={rdf}/>
</article>

{#if ready_to_publish}
    <button class="button is-primary" on:click={publish}>Publish</button>
{/if}
