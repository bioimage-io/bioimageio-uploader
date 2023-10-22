<script charset="utf-8">
    import { createEventDispatcher } from 'svelte';
    import { Diamonds } from 'svelte-loading-spinners';
    import yaml from "js-yaml";
    export let rdf;
    export let api;

    let validating = false;
    let error;

    const dispatch = createEventDispatcher();

    async function validate(){
        // Perform RDF validation with Imjoy...
        validating = true;
        if(!api) alert("Imjoy API not ready");
        console.log("Validating RDF:");
        console.log(rdf);

        try {
            rdf = yaml.load(yaml.dump(rdf));
            delete rdf._metadata;
            if (rdf?.config?._deposit) delete rdf.config._deposit;
            console.log("RDF after cleaning: ", rdf);
            const validator = await api.getPlugin(
                "https://raw.githubusercontent.com/bioimage-io/spec-bioimage-io/main/scripts/bio-rdf-validator.imjoy.html"
            );
            const results = await validator.validate(rdf);
            if (results.error){
                error = JSON.stringify(results, null, "  ");
            }
            // eslint-disable-next-line no-useless-catch
        } catch (e) {
            error = e.message;
        }
        if(error){
            validating = false;
            return
        }
        dispatch('done', {});
        validating = false;
    }
</script>

{#if error}
    <p>A validation error occurred!</p>
    <p>{error}</p>
{/if}

{#if validating}
<Diamonds />
<button disabled>Validation in progress</button>
{:else}
<button on:click={validate}>Validate</button>
{/if}
