<script>
    // import {login,  connectToServer } from '$lib/imjoy-rpc-hypha/websocket-client';

    import toast, { Toaster } from 'svelte-french-toast';
    import * as imjoyRPC from 'imjoy-rpc';
    import * as imjoyCore from 'imjoy-core'
    //import IconPlus from '../icons/IconPlus.svelte';
    //import SvgIcon from '@jamescoyle/svelte-icon';
    //import {mdiPlus, mdiPencil, mdiPublish} from '@mdi/js';
    //import { page } from "$app/stores";
    //import { slide } from 'svelte/transition';
    //import { quintOut } from 'svelte/easing';
    // import { onMount } from 'svelte';
    import {Route, router} from 'tinro';
    router.mode.hash();

    import DevBox   from './DevBox.svelte';
    import Nav      from './Nav.svelte';
    import Add      from './Add.svelte';
    import Edit     from './Edit.svelte';
    import Review   from './Review.svelte';
    import Status   from './Status.svelte';
    import Notification from './Notification.svelte';

    import Confetti from '../Confetti.svelte';

    let zip_package;
    let rdf = [];
    let files;
    const server_url = "https://ai.imjoy.io";
    //const server_url = "https://hypha.bioimage.io";
    let server; 
    //let token = browser ? window.sessionStorage.getItem('token') ?? '' : '';
    let token = window.sessionStorage.getItem('token');
    //let token = '';
    let connection_retry = 0;
    let api;
    let status_url;
    let rdf_url;
    const MAX_CONNECTION_RETRIES = 3;
    
    let login_url = "";
    let steps = [
        { text: 'Add', url:'add'},
        { text: 'Edit', url:'edit'},
        { text: 'Review & Upload', url:'review'},
        { text: 'Status', url:'status'},
    ]

    function reset(){
        status_url = null;
        rdf = null;
        zip_package = null;
        all_done = false;
    }

    function sessionStore(field, value) {
        window.sessionStorage.setItem(field, value);
    }

    async function initHypha(){

        // Init Imjoy-Core
        const imjoy = new imjoyCore.ImJoy({
            imjoy_api: {},
            //imjoy config
        });
        imjoy.start({workspace: 'default'}).then(async ()=>{
            console.log('ImJoy started');
            api = imjoy.api;
        })

        // Init Imjoy-Hypha
        if(connection_retry > MAX_CONNECTION_RETRIES){
            console.error("Max retries reached. Please try again later or contact support"); 
            return;
        }
        console.log("Initializing Hypha...");
        console.log(`  connecting to ${server_url}`); 
        if(!token){
            console.log("Getting token...");
            console.log("from");
            console.log(imjoyRPC);
            token = await imjoyRPC.hyphaWebsocketClient.login({
                server_url:server_url, 
                login_callback: show_login_message,
            });
            sessionStore('token', token);
            console.log('    token saved');
        }
        console.log(`Token: ${token.slice(0,5)}...`);
        
        try{
            server = await imjoyRPC.hyphaWebsocketClient.connectToServer({
                    name: 'BioImageIO.uploader',
                    server_url,
                    token,
            });
            window.server = server;
        }catch(error){
            console.error("Connection to Hypha failed:");
            console.error(error);
            connection_retry = connection_retry + 1;
            token = null;
            sessionStore('token', '');
            initHypha();
        }
        console.log("server");
        console.log(server);
        connection_retry = 0;
        console.log("Hypha connected");
    }

    //if (browser){
    initHypha();
    

    
    function show_login_message(context){
        login_url = context.login_url;
    }

</script>

<Nav {steps}/>
<Toaster />

{#if server}
    <!--<DevBox {server} />-->
{/if}

{#if !token}
    <Notification deletable={false} >
    {#if router.location.hash === "review" }
        <p>You must now login to publish</p>
    {/if}
    {#if login_url}
        <button on:click={()=>{window.open(login_url, '_blank')}}>Login to BioEngine</button>
    {:else}
        <span aria-busy="true">Connecting to the BioEngine...</span>
    {/if}
    </Notification>
{:else if !server}
    <Notification>
    <span aria-busy="true">Initializing...</span>
    </Notification>
{/if}
<Route path="">Welcome</Route>
<Route path="add">
    <Add bind:files bind:rdf bind:zip_package on:done={()=>{router.goto('edit')}} />
</Route>
<Route path="edit">
    <Edit bind:files bind:rdf {api} on:done={()=>{router.goto('review')}}/>
</Route>
<Route path="review">
    <Review {server} {rdf} {files} bind:status_url bind:rdf_url on:done={()=>{router.goto('status')}}/>
</Route>
<Route path="status">
    <Review {status_url} {rdf_url}/>
</Route>
