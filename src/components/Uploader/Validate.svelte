<script charset="utf-8">
// @ts-nocheck

    import Markdown from '@magidoc/plugin-svelte-marked';
    import toast from 'svelte-french-toast';
    import {router} from 'tinro';
    import ResetUploaderButton from './ResetUploaderButton.svelte';
    export let uploader;

    let validating = false;
    let error;

    if(uploader && !uploader.rdf) router.goto("/");

    async function validate(){
        // Perform RDF validation with Imjoy...
        if(validating) return;
        validating = true;
        try {
            await uploader.validate();
            error = null;
        } catch (e) {
            error = `${e}`;
        }
        if(error){
            console.error("VALIDATION FAILED!");
            console.log(error);
            validating = false;
            // scroll to the error details
            // set timeout for 200ms to allow the error details to render
            setTimeout(()=>{
                const error_details = document.getElementById("error-details");
                if(error_details){
                    error_details.scrollIntoView({behavior: "smooth"});
                }
            }, 200);
            
            throw(error);
        }
        validating = false;
        router.goto("/uploader/review");
    }

    function validate_with_toast(){
        toast.promise(
            validate(), 
            {
                loading: 'Validating...',
                success: 'Success 🥳',
                error: 'Validation Failed 😢, please see the detailed error.',
            });
    }
</script>

{#if validating} 
    <button aria-busy=true> Validating...</button>
{:else}
    <div class="button-row">
        <ResetUploaderButton {uploader} />
        <button class="dominant-button" on:click={validate_with_toast}>Validate</button>
    </div>
{/if}    
{#if error}
    <article style="overflow:scroll" id="error-details">
        <h2>Validation Error Details</h2>
        <p>You have to fix this issue before you can upload your model.</p>
        <p>Details:</p>
        <Markdown
        source={error}
            options={{breaks: true}}
        />
    </article>
{/if}

