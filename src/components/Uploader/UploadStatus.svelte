<script lang="ts">
    import {Uploader, UploaderStep} from '../../lib/uploader';
    import ResetUploaderButton from './ResetUploaderButton.svelte';
    import ErrorBox from '../ErrorBox.svelte';
    export let uploader: Uploader;
    import {router} from 'tinro';
    //let status;
    let status_message: string = "Contacting server...";
    let upload_value: string = null;
    let upload_max: string = null;
    let error: string;
    let error_object: Error;
    let step: UploaderStep = uploader.status.step;
    let model_name = null;
    if(uploader){
        if(uploader.resource_path){
            model_name = uploader.resource_path.id;
        }else{
            router.goto("/");
        }
    }

    uploader.add_render_callback(() => {
        uploader = uploader;
        step = uploader.status.step;
        status_message = uploader.status.message;
        upload_value = uploader.status.upload_progress_value;
        upload_max = uploader.status.upload_progress_max;

        if( step === UploaderStep.FAILED){
            error_object = uploader.error_object;
            error = uploader.status.message;
        }
    });

    function restart(){
        uploader.reset();
        router.goto("/");
    }

</script>


{#if model_name}
    <h2>Model: <a href="#/status/{model_name}" target="_blank"><code>{model_name}</code></a></h2>
{/if}

{#if error}
    <ErrorBox title="Upload" {error} {error_object}>
        <ResetUploaderButton {uploader} />
    </ErrorBox>
{/if}


{#if step === UploaderStep.FINISHED }
    <h4>Almost there,</h4>
    <p><b>There's nothing you need to do right now. Your model is uploaded and the CI-bots have started their work!</b><p>
    <p>You can check the status of the CI at any point from <a href="#/status/{uploader.resource_path.id}" target="_blank">here</a></p>
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
