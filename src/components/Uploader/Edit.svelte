<script>
    import { createEventDispatcher } from 'svelte';
    import EditForm from './EditForm/index.svelte';
    import Validate from './Validate.svelte';
    export let uploader; 

    const dispatch = createEventDispatcher();

    function completed_step() {
        dispatch('done', {});
    }
</script>

<h2>Edit your submission</h2>

<EditForm {uploader}/>

<Validate {uploader} on:done={completed_step} />

