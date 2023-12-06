<script>
    import toast, { Toaster } from 'svelte-french-toast';
    import {Route, router} from 'tinro';
    router.mode.hash();
    
    import Uploader from './index.js';

    import Nav      from './Nav.svelte';
    import Add      from './Add.svelte';
    import Edit     from './Edit.svelte';
    import Review   from './Review.svelte';
    import Status   from './Status.svelte';
    import Notification from './Notification.svelte';

    import Confetti from '../Confetti.svelte';

    let uploader = new Uploader();
    let rerender = false;
    
    uploader.add_render_callback(() => {
        rerender = !rerender; 
    });


    let steps = [
        { text: 'Add', url:'add'},
        { text: 'Edit', url:'edit'},
        { text: 'Review & Upload', url:'review'},
        { text: 'Status', url:'status'},
    ]

    function reset(){
        uploader.reset();
    }

</script>

<Nav {steps}/>
<Toaster />

{#key rerender}
{#if !uploader.token}
    <Notification deletable={false} >
    {#if router.location.hash === "review" }
        <p>You must now login to publish</p>
    {/if}
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
<Route path="">
    <Add bind:uploader on:done={()=>{router.goto('edit')}} />
</Route>
<Route path="add">
    <Add bind:uploader on:done={()=>{router.goto('edit')}} />
</Route>
{#if uploader.rdf}
<Route path="edit">
    <Edit bind:uploader on:done={()=>{router.goto('review')}}/>
</Route>
{/if }
<Route path="review">
    <Review {uploader} on:done={()=>{router.goto('status')}}/>
</Route>
<Route path="status">
    <Status {uploader}/>
</Route>
