<script charset="utf-8">
    import { createEventDispatcher } from 'svelte';
    import toast from 'svelte-french-toast';
    import JSONTree from 'svelte-json-tree';
    export let uploader;

    let validating = false;
    let error;

    const dispatch = createEventDispatcher();

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
        dispatch('done', {});
        validating = false;
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

<button aria-busy={validating} on:click={validate_with_toast}>Validate</button>
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

