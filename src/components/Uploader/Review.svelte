<script lang="ts">
	import { onDestroy } from 'svelte';
    import Notification from '../Notification.svelte';
    import ResetUploaderButton from './ResetUploaderButton.svelte';
    import { Uploader } from '../../lib/uploader';
    import type { ResourceId } from '../../lib/uploader';
    import yaml from "js-yaml";
    import Highlight from "svelte-highlight";
    import {yaml as yamlsyntax} from "svelte-highlight/languages/yaml";
    import atlas from "svelte-highlight/styles/atlas";
    import user_state from "../../stores/user";
    import toast  from 'svelte-french-toast';
    import {router} from 'tinro';
    import JSONTree from 'svelte-json-tree';

    export let uploader : Uploader;

    let model_name_message = "";
    let rerender = false;
    let resource_path:  ResourceId = uploader.resource_path;
    let can_regenerate = true;
    let rdf = uploader.rdf;

    onDestroy(() => {
        uploader.clear_render_callback();
	});

    let user=null;
    let error="";

    async function stage(){
        try{
            console.log("Checking ready to stage");
            if(!uploader.rdf){
                error = "No RDF data to upload";
                return;
            }
            if(!uploader.files){
                error = "No files to upload";
                return;
            }
            if(!uploader.resource_path){
                error = "No nickname specified";
                return;
            }
            if(!uploader.user_email){
                error = "No user email specified, please login before uploading";
                return;
            }
            uploader.stage();
            router.goto("/uploader/uploading");
        }catch(err){
            error = `Failed to stage: ${err.message}. See the dev console for details.`;
            console.error(err);
        }
    }

    user_state.subscribe(async (newuser) => {
        console.log("In review, user changed:");
        console.log(newuser);
        error = "";
        if(newuser !== null){
            if(!newuser.is_logged_in){
                user = null;
                uploader.set_email(null);
                rdf = uploader.rdf;
            }else{
                uploader.set_email(newuser.user_info.email);
                rdf = uploader.rdf;
                if(newuser.user_info.email === null){
                    error = "You must use an account that is linked to an email address";
                    toast(error, {icon: "⚠️"});
                }else{
                    user = newuser.user_info;
                }
            }
        }else{
            user = null;
            uploader.set_email(null);
            rdf = uploader.rdf;
        }
        toggle_rerender();
    });

    
    console.log(user_state);

    function toggle_rerender(){
        resource_path = uploader.resource_path;
        rerender = !rerender;
    }

    async function regenerate_nickname(){
        await uploader.regenerate_nickname();
        rdf = uploader.rdf;
        toggle_rerender();
    }

    if(!resource_path){
        regenerate_nickname();
    }else{
        can_regenerate = false;
    }

    if(uploader){
        if(!uploader.rdf) router.goto("/");
        uploader.add_render_callback(toggle_rerender);
    }
</script>

<svelte:head>
    {@html atlas}
</svelte:head>

{#if error}
    <article>
        <p>{error}</p>
    </article>
{/if}

<p class="level">
    {#if model_name_message }({model_name_message}){/if}
    {#if resource_path}
        Your {uploader.rdf.type} nickname is:
        <code style="min-width:10em;">{resource_path.id} {resource_path.emoji}&nbsp;</code>
    {/if}
    {#if can_regenerate}
    <button on:click={regenerate_nickname}>Regenerate nickname</button>
    {/if}
</p>

{#if user}
    <p>Hi there, please review your submission carefully, then press Upload</p>
    
    <button class="button is-primary" on:click={stage}>Upload</button>
{:else}

    <p>You need to be logged in with an account linked to an email address to upload to the BioImage Model Zoo.</p>
    <p>Use the login button at the top-right of this page</p>

{/if}

<details>
<article class="contrast" style="--card-background-color: var(--contrast)">
    <!--JSONTree defaultExpandedLevel={1} value={rdf}/-->
    <Highlight language={yamlsyntax} code={yaml.dump(rdf)} /> 
</article>
</details>

