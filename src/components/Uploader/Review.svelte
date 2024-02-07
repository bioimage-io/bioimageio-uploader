<script>
    import { createEventDispatcher } from 'svelte';
    //import toast from 'svelte-french-toast';
    import Notification from './Notification.svelte';

    export let uploader;

    import JSONTree from 'svelte-json-tree';
    let model_name_message = "";
    let resource_path = uploader.resource_path;
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
        resource_path = uploader.resource_path;
        ready_to_publish = uploader.ready_to_publish();
        console.log("Ready to publish?", ready_to_publish);
        rdf = uploader.rdf;
        //rerender = !rerender;
    }

    if(!resource_path) regenerate_nickname();

</script>

{#if !uploader.logged_in()}
    <Notification deletable={false} >
        Please login to the BioEngine to complete upload
    </Notification>
{/if}

<!--{#key rerender}-->
<p class="level">
    {#if model_name_message }({model_name_message}){/if}
    {#if resource_path}
        Your model nickname is:
        <code style="min-width:10em;">{resource_path.name} {resource_path.icon}&nbsp;</code>
    {/if}
    <button on:click={regenerate_nickname}>Regenerate nickname</button>
</p>
<!--{/key}-->
<p>Please review your submission carefully, then press Upload</p>

<article class="contrast" style="--card-background-color: var(--contrast)">
    <JSONTree defaultExpandedLevel={1} value={rdf}/>
</article>

{#if ready_to_publish}
    <button class="button is-primary" on:click={publish}>Upload</button>
{/if}
