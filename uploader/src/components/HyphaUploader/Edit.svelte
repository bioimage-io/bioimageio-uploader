<script>
    import { createEventDispatcher } from 'svelte';
    import EditForm from './EditForm/index.svelte';
    import Validate from './Validate.svelte';
    
    export let rdf; 
    export let zip_package;
    export let api;

    const dispatch = createEventDispatcher();

    function completed_step() {
        dispatch('done', {});
    }
</script>

<h2>Edit your submission</h2>

<EditForm bind:rdf bind:zip_package/>

<Validate {rdf} on:done={completed_step} {api}/>

<button on:click={completed_step}>Next</button>
