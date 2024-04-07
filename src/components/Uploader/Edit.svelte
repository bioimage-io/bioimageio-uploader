<script>
    import EditForm from './EditForm/index.svelte';
    import Validate from './Validate.svelte';
    import {router} from 'tinro';

    export let uploader; 

    if(uploader && !uploader.rdf) router.goto("/");
</script>

<h2>Edit your submission</h2>

<EditForm {uploader}/>

<Validate {uploader} />

<ResetUploaderButton {uploader} />
