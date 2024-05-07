<script>
    import EditForm from './EditForm/index.svelte';

    import Validate from './Validate.svelte';
    import {router} from 'tinro';

    export let uploader; 

    if(uploader && !uploader.rdf) router.goto("/");
</script>

<h2>Review and edit your {uploader.rdf.type || 'submission'}</h2>

<EditForm {uploader}/>

<Validate {uploader} />
