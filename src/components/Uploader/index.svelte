<script lang="ts">
    import { Toaster } from 'svelte-french-toast';
    import { Uploader } from '../../lib/uploader';
    import Add      from './Add.svelte';
    import Edit     from './Edit.svelte';
    import Review   from './Review.svelte';
    import UploadStatus   from './UploadStatus.svelte';
    import Notification from './Notification.svelte';
    import ButtonWithConfirmation from './ButtonWithConfirmation.svelte';

    let uploader = new Uploader();
    let step = "add";

    function reset(){
        uploader.reset();
        step = "add";
    }

    if(!uploader.api) uploader.init();

</script>

<Toaster />
{#if step == "add"}
    <Add {uploader} on:done={()=>{step="edit"}} />
{:else if step == "edit"}
    <Edit {uploader} on:done={()=>{step="review"}} />
{:else if step == "review"}
    <Review {uploader} on:done={()=>{step="uploading"}} on:reset={()=>{reset();}}/>
{:else if step == "uploading"}
    <UploadStatus {uploader} on:done={()=>{step="add"}} />
<!--{:else if step == "done"}-->
    <!--<a href="/status/{uploader.resource_path.id}">Go to status page</a>-->
{:else}
    <Notification>
        Opps! something went wrong 😬
    </Notification>
{/if}

{#if uploader.rdf && (["add", "edit"].includes(step))}
    <ButtonWithConfirmation confirm={reset}>
        Clear model + start again
    </ButtonWithConfirmation>
{/if}
