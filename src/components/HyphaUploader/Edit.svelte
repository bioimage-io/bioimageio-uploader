<script>
    import { createEventDispatcher } from 'svelte';
    import EditForm from './EditForm/index.svelte';
    import Validate from './Validate.svelte';
    import {router} from 'tinro';
    
    export let rdf; 
    export let zip_package;
    export let api;
    export let files;

    const dispatch = createEventDispatcher();

    function completed_step() {
        dispatch('done', {});
    }

    if (!rdf) router.goto("add");
    if (rdf.length === 0) router.goto("add");
</script>

<h2>Edit your submission</h2>

<EditForm bind:rdf bind:zip_package/>

<Validate {rdf} on:done={completed_step} {api}/>

