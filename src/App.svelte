<script>
    // import "@picocss/pico/css/pico.css"; 
    import "./app.scss";
    import {Route, router} from 'tinro'; 
    import { onMount } from 'svelte';
    //import user_state from "./stores/user";
    //import {fade} from 'svelte/transition';
    import Uploader from './components/Uploader/index.svelte';
    import Status from './components/Status.svelte';
    import StatusList from './components/StatusList.svelte';
    import StatusPublished from './components/StatusPublished.svelte';
    import StatusStaged from './components/StatusStaged.svelte';
    import Transition from './components/Transition.svelte';

    import { Uploader as UploaderClass } from './lib/uploader';
    // TODO: REMOVE / REPLACE WITH HYPHA FUNCTIONS?
    import { functions } from './lib/firebase';
    import LoginButton from './components/LoginButton.svelte';

    router.mode.hash();
    let uploader = new UploaderClass();
    // TODO: REMOVE / REPLACE WITH REGISTERING HYPHA FUNCTIONS?
    uploader.register_firebase_functions(functions);

    let show_login = false;
</script>


<header class="container-fluid">
    <nav>
    <!--<nav class="container-fluid">-->
        <ul>
            <li><strong>BioImage.IO</strong></li>
        </ul>
        <ul>
            <li><a href="/uploader">Uploader</a></li>
            <li><a href="/status">Status</a></li>
            <li>
                <LoginButton bind:show={show_login}/>
            </li>
        </ul>
    </nav>
</header>

<main>    
<Transition> 
    <Route path="/" redirect="/uploader">
    </Route>
    <Route path="/uploader/*">
        <Uploader { uploader } />
    </Route>
    <Route path="/status">
        <Status />
    </Route>
    <Route path="/status/:resource_id" let:meta>
        <StatusList resource_id={meta.params.resource_id} />
    </Route>
    <Route path="/status/:resource_id/:version" let:meta>
        <StatusPublished resource_id={meta.params.resource_id} version={meta.params.version} />
    </Route>
    <Route path="/status/:resource_id/staged/:version_number" let:meta>
        <StatusStaged resource_id={meta.params.resource_id} version_number={meta.params.version_number} />
    </Route>
    <Route fallback redirect="/uploader/add">No subpage found</Route>
</Transition>
</main>
