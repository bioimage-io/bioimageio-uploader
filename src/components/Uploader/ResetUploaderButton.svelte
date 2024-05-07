<script lang="ts"> 
    import ButtonWithConfirmation from './ButtonWithConfirmation.svelte';
    import {router} from 'tinro';
    export let uploader;
</script>

<ButtonWithConfirmation confirm={()=>{uploader.reset(); router.goto("/")}}>
   Reset Form
</ButtonWithConfirmation>
