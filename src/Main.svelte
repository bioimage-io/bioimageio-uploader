<script lang="ts">
    // import "@picocss/pico/css/pico.css"; 
    import "./app.scss";
    import {Route, router} from 'tinro'; 
    import { Toaster } from 'svelte-french-toast';
    //import user_state from "./stores/user";
    //import {fade} from 'svelte/transition';

    import { Unplug } from 'lucide-svelte'
    import Uploader from './components/Uploader/index.svelte';
    import Status from './components/Status.svelte';
    import Nav from './components/Nav.svelte';
    import Notification from './components/Notification.svelte';
    import StatusList from './components/StatusList.svelte';
    import StatusPublished from './components/StatusPublished.svelte';
    import StatusStaged from './components/StatusStaged.svelte';
    // import Transition from './components/Transition.svelte';
    import Chat from './components/Chat.svelte';
    import { hypha_version } from './stores/hypha';

    import { Uploader as UploaderClass } from './lib/uploader';
    import { update_token } from './lib/hypha';
    router.mode.hash();
    let uploader = new UploaderClass();
    let auth_offline = false;

    // Extract global query parameters from the router
    // router.subscribe( ({url, from, path, hash, query})=> {
    router.subscribe( ({query})=> {
        console.log("Query changed: ", query); 
        if(query.token) update_token(query.token);     
    });
    
</script>

<header class="container-fluid">
    <Nav /> 
</header>

<Toaster />

<main class="container">    
{#if auth_offline}
    <Notification classes="warning" deletable={true}>
        <span slot="header">
            <Unplug /> Login system offline   
        </span>
        You will not be able to upload or chat.<br> 
        You can still use the <a href="#/uploader">Uploader</a> to create a resource locally. 
        <span slot="footer">
            If this problem persists, please contact a member of the BioImage.IO team or create an Issue.
        </span>
    </Notification>
{/if}
<!-- NOTE: Transition disabled for now as disrupts rendering on route-change -->
<!--Transition --> 
    <Route path="/" redirect="/uploader/add">
    </Route>
    <Route path="/uploader/*" let:meta>
        <Uploader {uploader}/>
    </Route>
    <Route path="/status" let:meta>
        <Status 
            collection_url_published={meta.query.collection_published} 
            collection_url_staged={meta.query.collection_staged} 
        />
    </Route>
    <Route path="/status/:resource_id" let:meta>
        <StatusList resource_id={meta.params.resource_id} />
    </Route>
    <Route path="/status/:resource_id/:version" let:meta>
        <StatusPublished resource_id={meta.params.resource_id} version={meta.params.version} />
    </Route>
    <Route path="/status/:resource_id/staged/:version" let:meta>
        <StatusStaged resource_id={meta.params.resource_id} version={`staged/${meta.params.version}`} />
    </Route>
    <Route path="/chat/:resource_id/:version" let:meta>
        <Chat resource_id={meta.params.resource_id} version={meta.params.version} />
    </Route>
    <Route path="/chat/:resource_id/staged/:version" let:meta>
        <Chat resource_id={meta.params.resource_id} version={`staged/${meta.params.version}`} />
    </Route>
    <Route fallback redirect="/uploader/add">No subpage found</Route>
<!--/Transition -->

{#if $hypha_version}
    <hr>
    <footer>
        <a href="https://ai4life.eurobioimaging.eu/" target="_blank"><img src="https://ai4life.eurobioimaging.eu/wp-content/uploads/2022/09/AI4Life-logo_giraffe-nodes-2048x946.png" alt="AI4Life Icon" style="height: 80px; margin-right: 10px">
        </a>
    
        <a href="https://bioimage.io" target="_blank"><img src="https://bioimage.io/static/img/bioimage-io-logo.svg" alt="BioImage.IO" style="height: 50px; margin-left: 10px"></a>
        <br>
        <p style="font-family:monospace">Hypha: {$hypha_version}</p>
    </footer>
{/if}
</main>

