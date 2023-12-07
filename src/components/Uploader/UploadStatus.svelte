<script>
    import FullScreenConfetti from '../FullScreenConfetti.svelte';
    export let uploader;
    let status;
    let status_message = "";
    status_message = "Contacting server...";
    let error;
    let error_element;
    let last_error_object;
    let uploading = uploader.is_uploading;
    
    let notify_ci_message = "";
    let notify_ci_failed = false;

    uploader.add_render_callback((data) => {
        uploader = uploader;
        uploading = uploader.is_uploading;
    });

</script>

{#key uploader.is_finished}
{#if uploader.is_finished}
    <h4>Almost there,</h4> 

    <p><b>There's nothing you need to do right now. Your model is uploaded and the CI-bots have started their work!</b><p>
    <!--<FullScreenConfetti /> -->
    <p>You can check the status of the CI at any point from <a href="/status/{uploader.model_nickname.name}">here</a></p>
{:else}        
{#if uploading}
    <p>Uploading</p> 
    <progress max="100">15%</progress>
{/if}

{#if error}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <article bind:this={error_element} data-placement="bottom" on:click={copy_error_to_clipboard}>
        <p>Oops! Something went wrong 😟</p>
        <p>Please review the error, and try again. If the issue persists, please contact support</p>
        <code>{error}</code>
        <p>Click this box to copy the error message to your clipboard</p>
    </article>
{/if}
{#key uploader.upload_status}
<article>Status: <code>{uploader.upload_status}</code></article> 
{/key}
{#key uploader.ci_status}
{#if uploader.ci_status}
    <p>🤖: {uploader.ci_status}</p>
{/if}
{/key}

{/if} 
{/key}

