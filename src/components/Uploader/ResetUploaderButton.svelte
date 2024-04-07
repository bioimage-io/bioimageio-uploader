<script lang="ts"> 
    import ButtonWithConfirmation from './ButtonWithConfirmation.svelte';
    import {router} from 'tinro';
</script>

<ButtonWithConfirmation confirm={()=>{uploader.reset(); router.goto("/")}}>
    Clear model + start again
</ButtonWithConfirmation>
