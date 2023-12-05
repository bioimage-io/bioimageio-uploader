<script>

    import {router} from 'tinro';
    export let uploader;
    let status;
    let status_message = "";
    status_message = "Contacting server...";
    let error;
    let error_element;
    let last_error_object;
    
    let notify_ci_message = "";
    let notify_ci_failed = false;

    if (!uploader.ready_for_review()) router.goto("add");

    uploader.render = (data) => {
        if(!data) return;
        notify_ci_message = data.notify_ci_message;
        notify_ci_failed = data.notify_ci_failed;
    }

    async function publish(){
        console.log("Publishing...");
        try{
            await uploader.publish();
        }catch(err){
            console.error("Failed to publish:");
            console.error(err);
            return 
        }    
        await new Promise(r => setTimeout(r, 1000));
        is_done();
    }

    async function refresh_status(){
        try{
            console.log("Refreshing status...");
            let status = await uploader.refresh_status();
            if(status.status !== status_message){    
                status_message = status.status;
            }
        }catch(err){
            console.warn("Refresh failed:");
            console.error(err);
        }
        setTimeout(refresh_status, 2000);
    }

    function copy_error_to_clipboard(){
        if(!last_error_object){
            console.error("No last error object to copy");
            return;
        }
        const text = last_error_object.stack;
        copy_text_to_clipboard(text);
        toast.success("Copied");
        console.log("Copied text:", text);
    }

    async function copy_text_to_clipboard(text){
        await navigator.clipboard.writeText(text);
    }

    refresh_status();

</script>

{#if uploading}
    <p>Uploading</p> 
    <progress max="100">15%</progress>
{:else if error}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <article bind:this={error_element} data-placement="bottom" on:click={copy_error_to_clipboard}>
        <p>Oops! Something went wrong 😟</p>
        <p>Please review the error, and try again. If the issue persists, please contact support</p>
        <code>{error}</code>
        <p>Click this box to copy the error message to your clipboard</p>
    </article>
{:else}
    Upload complete (?)
{/if}
<article>Status: <code>{status_message}</code></article> 
{#if notify_ci_message}
    <p>🤖: {notify_ci_message}</p>
{/if}
