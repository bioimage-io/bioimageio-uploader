<script>
    // import {login,  connectToServer } from '$lib/imjoy-rpc-hypha/websocket-client';

    import * as imjoyRPC from 'imjoy-rpc?client';
    import * as imjoyCore from 'imjoy-core?client'
    //import IconPlus from '../icons/IconPlus.svelte';
    //import SvgIcon from '@jamescoyle/svelte-icon';
    //import {mdiPlus, mdiPencil, mdiPublish} from '@mdi/js';
    //import { page } from "$app/stores";
    import { browser } from '$app/environment';
    //import { slide } from 'svelte/transition';
    //import { quintOut } from 'svelte/easing';
    // import { onMount } from 'svelte';
    import {Route, router} from 'tinro';

    import DevBox   from './DevBox.svelte';
    import Nav      from './Nav.svelte';
    import Add      from './Add.svelte';
    import Edit     from './Edit.svelte';
    import Review   from './Review.svelte';
    import Status   from './Status.svelte';
    import Notification from './Notification.svelte';

    import Confetti from '../Confetti.svelte';

    router.mode.hash();

    // let current_step = 0;
    let zip_package;
    let rdf = [];
    let files;
    const server_url = "https://ai.imjoy.io";
    //const server_url = "https://hypha.bioimage.io";
    let server; 
    let token = browser ? window.sessionStorage.getItem('token') ?? '' : '';
    //let token = '';
    let connection_retry = 0;
    let api;
    let all_done = false;
    let status_url;
    let rdf_url;
    const MAX_CONNECTION_RETRIES = 3;
    

    let components = [
        {name: "Add", url: "#add", _component: Add, props: {zip_package, rdf, files}},
        {name: "Edit", _component: Edit, props: {files, rdf}},
        {
            name: "Review", 
            _component: Review, 
            props:{token, server, rdf, files, api, status_url, rdf_url}},
        {
            name: "Status", 
            _component: Status, 
            props:{status_url, rdf_url, files}},
    ];
    let login_url = "";
    let current = 0;
    let max_step = 0;
    let steps = [
        { text: 'Add', url:'add'},
        { text: 'Edit'},
        { text: 'Review & Upload'},
        { text: 'Status'},
    ]

    function reset(){
        status_url = null;
        rdf = null;
        zip_package = null;
        all_done = false;
        current = 0;
    }

    function next(data){
        if(data && data.part === 'review'){
            current = 0;
            all_done = true;
        }
        current = current + 1;
        console.log("Current is now:", current);
        console.log("All done:", all_done);
        console.log(steps);
        if(current >= steps.length){
            current = 0;
            all_done = true;
            return;
        }
        max_step = Math.max(max_step, current);
    }
    
    function sessionStore(field, value) {
        if (browser) window.sessionStorage.setItem(field, value);
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

    if (browser){
        if(!server) initHypha();
    }

    
    function show_login_message(context){
        login_url = context.login_url;
    }

</script>

<Nav bind:current={current} {max_step} {steps}/>

<section class="container">

{#if server}
    <!--<DevBox {server} />-->
{/if}


<a href="add">Add</a>

{#if !token}
    <Notification deletable={false} >
    {#if (current === (steps.length - 1))}
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
{:else if all_done}
    <Notification>
        <p>🥳🎉 Congratulations!!</p>
        <p>You are all done. <button class="contrast" on:click={reset}>Press here to upload another model</button></p>
        <div style="
            position: fixed;
            top: -50px;
            left: 0;
            height: 100vh;
            width: 100vw;
            display: flex;
            justify-content: center;
            overflow: hidden;
            pointer-events: none;">
            <Confetti x={[-5, 5]} y={[0, 0.1]} delay={[500, 2000]} infinite duration=5000 amount=200 fallDistance="100vh" />
        </div>
        </Notification>
{/if}
{#if (!all_done) }
    <Route path="/">Home sweet home</Route>
    <Route path="/add"><Add /></Route>
    <Route path="/edit"><Edit /></Route>

<!--<svelte:component -->
        <!--this={components[current]._component} -->
        <!--{token}-->
        <!--{server_url}-->
        <!--{server}-->
        <!--{api}-->
        <!--bind:zip_package-->
        <!--bind:files-->
        <!--bind:status_url-->
        <!--bind:rdf_url-->
        <!--bind:rdf-->
     <!--on:done={next}/>-->
{/if}
</section>
