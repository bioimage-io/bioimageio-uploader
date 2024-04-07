<script lang="ts">
    import { createEventDispatcher } from 'svelte';
    import toast from 'svelte-french-toast';
    import {Uploader, UploaderStep} from '../../lib/uploader.ts';
    import ResetUploaderButton from './ResetUploaderButton.svelte';
    export let uploader: Uploader;
    import {router} from 'tinro';
    //let status;
    let status_message: string = "Contacting server...";
    let upload_value: string = null;
    let upload_max: string = null;
    let error: string;
    let error_element: Object;
    let last_error_object: Error;
    let step: UploaderStep = uploader.status.step;
    let model_name = null;
    if(uploader){
        if(uploader.resource_path){
            model_name = uploader.resource_path.id;
        }else{
            router.goto("/");
        }
    }

    function copy_error_to_clipboard(text: string){
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

    uploader.add_render_callback(() => {
        uploader = uploader;
        step = uploader.status.step;
        status_message = uploader.status.message;
        upload_value = uploader.status.upload_progress_value;
        upload_max = uploader.status.upload_progress_max;

        if( step === UploaderStep.FAILED){
            last_error_object = uploader.error_object;
            error = uploader.status.message;
        }
    });

    function restart(){
        uploader.reset();
        router.goto("/");
    }

</script>


{#if model_name}
    <h2>Model: <a href="#/status/{model_name}"><code>{model_name}</code></a></h2>
{/if}

{#if error}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <article bind:this={error_element} data-placement="bottom" on:click={()=>{copy_error_to_clipboard(error);}}>
        <p>Oops! Something went wrong 😟</p>
        <p>Please review the error, and try again. If the issue persists, please contact support</p>
        <code>{error}</code>
        <p>Click this box to copy the error message to your clipboard</p>
        <ResetUploaderButton {uploader} />
    </article>
{/if}


{#if step === UploaderStep.FINISHED }
    <h4>Almost there,</h4>

    <p><b>There's nothing you need to do right now. Your model is uploaded and the CI-bots have started their work!</b><p>
    <p>You can check the status of the CI at any point from <a href="#/status/{uploader.resource_path.id}">here</a></p>


    <button on:click={restart}>Upload another model</button>
{:else}
    {status_message}
    {step}
    {#if step === UploaderStep.UPLOADING }
        <p>Uploading</p>
        {#if upload_value}
            <progress value="{upload_value}" max="{upload_max}">{upload_value}</progress>
        {:else}
            <progress max="100">Progress</progress>
        {/if}
    {/if}
{/if}

