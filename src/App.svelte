<script>
    // import "@picocss/pico/css/pico.css"; 
    import "./app.scss";
    import {Route, router} from 'tinro'; 
    //import {Home} from 'lucide-svelte';
    //import {fade} from 'svelte/transition';
    import Uploader from './components/Uploader/index.svelte';
    import Status from './components/Status.svelte';
    import Transition from './components/Transition.svelte';
    import Hypha from './lib/hypha.ts';

    const hypha = new Hypha();
    router.mode.hash();
</script>
<style>
</style>

<nav class="container-fluid">
    <ul>
        <li><strong>BioImage.IO</strong></li>
    </ul>
    <ul>
        <li><a href="/">Uploader</a></li>
        <li><a href="/status">Status</a></li>
    </ul>
</nav>

<Transition> 
    <Route path="/">
        <Uploader {hypha}/>
    </Route>
    <Route path="/status">
        <Status {hypha}/>
    </Route>
    <Route path="/status/:resource_id" let:meta>
        <Status resource_id={meta.params.resource_id} {hypha}/>
    </Route>
</Transition>
