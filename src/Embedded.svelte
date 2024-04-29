<script lang="ts">
    import "./app.scss";
    import {Route, router} from 'tinro'; 
    import { Toaster } from 'svelte-french-toast';
    import Uploader from './components/Uploader/index.svelte';
    import Status from './components/Status.svelte';
    import StatusList from './components/StatusList.svelte';
    import StatusPublished from './components/StatusPublished.svelte';
    import StatusStaged from './components/StatusStaged.svelte';
    import Chat from './components/Chat.svelte';

    import { Uploader as UploaderClass } from './lib/uploader';
    import { update_token } from './lib/hypha';
    router.mode.hash();
    let uploader = new UploaderClass();

    // Extract global query parameters from the router
    // router.subscribe( ({url, from, path, hash, query})=> {
    router.subscribe( ({query, ..._route_params})=> {
        console.log("Query changed: ", query); 
        if(query.token) update_token(query.token);     
    });
      
</script>

<Toaster />

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
