<script lang="ts">
    //import toast, { Toaster } from 'svelte-french-toast';
    import { Toaster } from 'svelte-french-toast';

    import { Uploader } from '../../lib/uploader';

    import Modal    from '../Modal.svelte';
    //import Nav      from './Nav.svelte';
    import Add      from './Add.svelte';
    import Edit     from './Edit.svelte';
    import Review   from './Review.svelte';
    import UploadStatus   from './UploadStatus.svelte';
    import Notification from './Notification.svelte';
    import ButtonWithConfirmation from './ButtonWithConfirmation.svelte';

    let show_modal = false;

    let uploader = new Uploader();
    if(window) window.uploader = uploader;
    uploader.show_login_window = (url) => {
        console.debug(url);
        show_modal = true;
    }
    let step = "add";
    let rerender = false;

    uploader.add_render_callback(() => {
        rerender = !rerender;
    });

    function reset(){
        uploader.reset();
        step = "add";
    }

    //if((!uploader.token && !uploader.server)) uploader.init();
    if(!uploader.server) uploader.init();

</script>

<Toaster />
{#key rerender}
{#if !uploader.token}
    <Notification deletable={false} >
    {#if uploader.login_url}
        <!--<button on:click={()=>{uploader.init();}}>Login to BioEngine</button>-->
        <Modal show={show_modal}   >
            <h1>Login</h1>
            <iframe title="Login" src="{uploader.login_url}" width="400" height="400"></iframe>
        </Modal>

    {:else}
        <!--<span aria-busy="true">Connecting to the BioEngine...</span>-->
        <button on:click={()=>{uploader.init();}}>Login to BioEngine</button>
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
    <UploadStatus {uploader} on:done={()=>{step="add"}} />
<!--{:else if step == "done"}-->
    <!--<a href="/status/{uploader.resource_path.name}">Go to status page</a>-->
{:else}
    <Notification>
        Opps! something went wrong 😬
    </Notification>
{/if}

<!--{#if step != "add"}-->
{#if uploader.rdf && (["add", "edit", "review"].includes(step))}
    <ButtonWithConfirmation confirm={reset}>
        Clear model + start again
    </ButtonWithConfirmation>
{/if}
<!--{/if}-->
