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
            await uploader.validate_json_schema();
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

<h2>Validation</h2>

<p>You are using a schema-version that will be checked with JSON-Schema</p>

{#if validating} 
    <button aria-busy=true>Validating</button>
{:else}
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

