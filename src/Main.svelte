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
    import Transition from './components/Transition.svelte';
    import Chat from './components/Chat.svelte';

    import { Uploader as UploaderClass } from './lib/uploader';
    import { update_token } from './lib/hypha';
    router.mode.hash();
    let uploader = new UploaderClass();
    let auth_offline = false;

    // Extract global query parameters from the router
    // router.subscribe( ({url, from, path, hash, query})=> {
    router.subscribe( ({query, ..._route_params})=> {
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
        You can still use the <a href="/uploader">Uploader</a> to create a resource locally. 
        <span slot="footer">
            If this problem persists, please contact a member of the BioImage.IO team or create an Issue.
        </span>
    </Notification>
{/if}
<Transition> 
    <Route path="/" redirect="/uploader">
    </Route>
    <Route path="/uploader/*" let:meta>
        <Uploader {uploader}/>
    </Route>
    <Route path="/status" let:meta>
        <Status collection_url={meta.query.collection}/>
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
</Transition>
</main>
