<script charset="utf-8">
    import { createEventDispatcher } from 'svelte';
    import JSONTree from 'svelte-json-tree';
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
                "https://raw.githubusercontent.com/jmetz/spec-bioimage-io/dev/scripts/bio-rdf-validator.imjoy.html"
            );
            const results = await validator.validate(rdf);
            if (results.error){
                //error = JSON.stringify(results, null, "  ");
                error = results;
            }
            // eslint-disable-next-line no-useless-catch
        } catch (e) {
            error = e.message;

        }
        if(error){
            console.error("VALIDATION FAILED!");
            console.error(error);
            console.error("DEBUG|DEV: CONTINUINIG...");
            //validating = false;
            //return
        }
        dispatch('done', {});
        validating = false;
    }
</script>

{#if validating}
<button class="button is-loading">Validate</button>
{:else}
<button class="button is-primary" on:click={validate}>Validate</button>
{/if}
{#if error}
    <div>
        <p>A validation error occurred!</p>
        <p>You have to fix this issue before you can upload your model.</p>
        <p>Details:</p>
        {#if typeof error === "string" || error instanceof String}
            <p>{error}</p>
        {:else}
            <JSONTree value={error}/>
        {/if}
    </div>
{/if}

