<script lang="ts">
	import { onDestroy } from 'svelte';
    import { createEventDispatcher } from 'svelte';
    //import toast from 'svelte-french-toast';
    import Notification from './Notification.svelte';
    import HyphaLogin from './HyphaLogin.svelte';
    import ButtonWithConfirmation from './ButtonWithConfirmation.svelte';
    import { Uploader } from '../../lib/uploader';

    export let uploader : Uploader;

    import JSONTree from 'svelte-json-tree';
    let model_name_message = "";
    let rerender = false;
    let resource_path = uploader.resource_path;
    let rdf = uploader.rdf;
    let ready_to_publish = uploader.ready_to_publish();
    const dispatch = createEventDispatcher();

    onDestroy(() => {
        uploader.clear_render_callback();
	});

    function is_done() {
        dispatch('done');
    }

    function reset(){
        dispatch('reset');
    }

    async function publish(){
        uploader.publish();
        is_done();
    }

    function toggle_rerender(){
        resource_path = uploader.resource_path;
        ready_to_publish = uploader.ready_to_publish();
        rerender = !rerender;
    }

    async function regenerate_nickname(){
        await uploader.regenerate_nickname();
        console.log("Ready to publish?", ready_to_publish);
        rdf = uploader.rdf;
        toggle_rerender();
    }

    if(!resource_path) regenerate_nickname();
    if(uploader){
        uploader.add_render_callback(toggle_rerender);
        if(!uploader.server){
            uploader.loginHypha()
        }
    }

</script>

{#key rerender}

{#key uploader.hypha.server}
    {#if !uploader.hypha.server}
        <Notification deletable={false} >
            Login to the BioEngine to enable Upload 
            <HyphaLogin {uploader} modal={false} />
        </Notification>
    {:else}
        {#key uploader.hypha.user_email }
            {#if uploader.hypha.user_email}
                <p class="level">
                    {#if model_name_message }({model_name_message}){/if}
                    {#if resource_path}
                        Your model nickname is:
                        <code style="min-width:10em;">{resource_path.id} {resource_path.emoji}&nbsp;</code>
                    {/if}
                    <button on:click={regenerate_nickname}>Regenerate nickname</button>
                </p>
                <p>Please review your submission carefully, then press Upload</p>
                
                {#if ready_to_publish}
                    <button class="button is-primary" on:click={publish}>Upload</button>
                {/if}


            {:else}
                <article>Populating RDF with user-email</article>
            {/if}
        {/key}
    {/if}
{/key}

<ButtonWithConfirmation confirm={reset}>
    Clear model + start again
</ButtonWithConfirmation>

<article class="contrast" style="--card-background-color: var(--contrast)">
    {#key uploader.hypha.user_email }
    <JSONTree defaultExpandedLevel={1} value={rdf}/>
    {/key}
</article>

{/key}
