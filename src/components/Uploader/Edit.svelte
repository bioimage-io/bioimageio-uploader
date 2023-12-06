<script>
    import { createEventDispatcher } from 'svelte';
    import EditForm from './EditForm/index.svelte';
    import Validate from './Validate.svelte';
    import {router} from 'tinro';
    
    export let uploader; 

    const dispatch = createEventDispatcher();

    function completed_step() {
        dispatch('done', {});
    }

    if (!uploader){
        router.goto("add");
    }else if (!uploader.rdf){
        router.goto("add");
    }else if (uploader.rdf.length === 0){
        router.goto("add");
    }
</script>

<h2>Edit your submission</h2>

<EditForm bind:uploader/>

<Validate {uploader} on:done={completed_step} />

