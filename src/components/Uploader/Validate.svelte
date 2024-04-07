<script charset="utf-8">
    import toast from 'svelte-french-toast';
    import JSONTree from 'svelte-json-tree';
    import {router} from 'tinro';
    import ResetUploaderButton from './ResetUploaderButton.svelte';
    export let uploader;

    let validating = false;
    let error;

    if(uploader && !uploader.rdf) router.goto("/");
    if(!uploader.validator) uploader.load_validator();


    async function validate(){
        // Perform RDF validation with Imjoy...
        if(validating) return;
        validating = true;
        console.log("Validating RDF:");

        try {
            await uploader.validate();
        } catch (e) {
            window.DB_ERR = e;
            error = e.message;
        }
        if(error){
            console.error("VALIDATION FAILED!");
            console.log(error);
            validating = false;
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
                error: 'Could not validate 😕',
            });
    }
</script>

{#if validating} 
    <button aria-busy=true> Validating...</button>
{:else}
    <ResetUploaderButton {uploader} />
    <button on:click={validate_with_toast}>Validate</button>
{/if}    
{#if error}
    <article>
        <p>A validation error occurred!</p>
        <p>You have to fix this issue before you can upload your model.</p>
        <p>Details:</p>
        {#if typeof error === "string" || error instanceof String}
            <p>{error}</p>
        {:else}
            <JSONTree value={error}/>
        {/if}
    </article>
{/if}

