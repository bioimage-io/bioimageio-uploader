<script>
    import toast, { Toaster } from 'svelte-french-toast';

    import Uploader from './index.js';

    import Nav      from './Nav.svelte';
    import Add      from './Add.svelte';
    import Edit     from './Edit.svelte';
    import Review   from './Review.svelte';
    import UploadStatus   from './UploadStatus.svelte';
    import Notification from './Notification.svelte';

    let uploader = new Uploader();
    let step = "add";
    let rerender = false;
    
    uploader.add_render_callback(() => {
        rerender = !rerender; 
    });

    function reset(){
        uploader.reset();
    }

</script>

<Toaster />

{#key rerender}
{#if !uploader.token}
    <Notification deletable={false} >
    <!--{#if router.location.hash === "review" }-->
        <p>You must now login to publish</p>
    <!--{/if}-->
    {#if uploader.login_url}
        <button on:click={()=>{window.open(uploader.login_url, '_blank')}}>Login to BioEngine</button>
    {:else}
        <span aria-busy="true">Connecting to the BioEngine...</span>
    {/if}
    </Notification>
{:else if !uploader.server}
    <Notification>
    <span aria-busy="true">Initializing...</span>
    </Notification>
{/if}
{/key}

{#if step == "add"}
    <Add {uploader} on:done={()=>{step="edit"}} />
{:else if step == "edit"}
    <Edit {uploader} on:done={()=>{step="review"}} />
{:else if step == "review"}
    <Review {uploader} on:done={()=>{step="uploading"}} />
{:else if step == "uploading"}
    <UploadStatus {uploader} on:done={()=>{step="done"}} />
{:else if step == "done"}
    <a href="/status/{uploader.model_nickname.name}">Go to status page</a>
{:else}
    <Notification>
        Opps! something went wrong 😬
    </Notification>
{/if}
