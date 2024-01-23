<script>
    import { createEventDispatcher } from 'svelte';
    import toast from 'svelte-french-toast';
    export let uploader;
    //let status;
    //let status_message = "";
    //status_message = "Contacting server...";
    let error;
    let error_element;
    let last_error_object;
    let uploading = uploader.is_uploading;
    const dispatch = createEventDispatcher();
    
    //let notify_ci_message = "";
    //let notify_ci_failed = false;


    function copy_error_to_clipboard(text){
        // Copy the text inside the text field
        if(navigator){
            if(navigator.clipboard){
                const error_log = {
                    text: text,
                    message:  last_error_object.message, 
                    stack: last_error_object.stack, 
                    name: last_error_object.name,
                    cause: last_error_object.cause 
                };
                navigator.clipboard.writeText(JSON.stringify(error_log));
                toast.success("Copied error to clipboard");
                return 
            }
        }
        console.error("Clipboard unavailable");

        toast.error("Clipboard unavailable");
    }

    //uploader.add_render_callback((data) => {
    uploader.add_render_callback(() => {
        uploader = uploader;
        uploading = uploader.is_uploading;
        if(uploader.ci_failed || (uploader.is_finished && !uploader.upload_succeeded)){
            last_error_object = uploader.error_object;
            if(uploader.ci_failed){
                error = uploader.ci_status;
            }else{
                error = uploader.upload_status;
            }
        }
    });

    function restart(){
        uploader.reset();
        dispatch('done', {});
    }


</script>

{#if error}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <article bind:this={error_element} data-placement="bottom" on:click={()=>{copy_error_to_clipboard(error);}}>
        <p>Oops! Something went wrong 😟</p>
        <p>Please review the error, and try again. If the issue persists, please contact support</p>
        <code>{error}</code>
        <p>Click this box to copy the error message to your clipboard</p>
        <button on:click={restart}>Start again</button>
    </article>
{/if}

{#key uploader.is_finished}
{#if uploader.is_finished}
    <h4>Almost there,</h4> 

    <p><b>There's nothing you need to do right now. Your model is uploaded and the CI-bots have started their work!</b><p>
    <p>You can check the status of the CI at any point from <a href="#/status/{uploader.model_nickname.name}">here</a></p>


    <button on:click={restart}>Upload another model</button>
{:else}        
    {#if uploading}
        <p>Uploading</p> 
        <progress max="100">15%</progress>
    {/if}

    <!--{#key uploader.upload_status}-->
    <!--<article>Status: <code>{uploader.upload_status}</code></article> -->
    <!--{/key}-->
    <!--{#key uploader.ci_status}-->
    <!--{#if uploader.ci_status}-->
        <!--<p>🤖: {uploader.ci_status}</p>-->
    <!--{/if}-->
    <!--{/key}-->

{/if} 
{/key}

