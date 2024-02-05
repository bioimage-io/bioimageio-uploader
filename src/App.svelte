<script>
    import "@picocss/pico/css/pico.css"; 
    import {Route, router} from 'tinro'; 
    //import {Home} from 'lucide-svelte';
    //import {fade} from 'svelte/transition';
    import Uploader from './components/Uploader/index.svelte';
    import Status from './components/Status.svelte';
    import Transition from './components/Transition.svelte';

    router.mode.hash();
</script>
<style>
    :global(.icon){
        width: 64px;

    }
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
        <Uploader />
    </Route>
    <Route path="/status">
        <Status />
    </Route>
    <Route path="/status/:model_name" let:meta>
        <Status modelName={meta.params.model_name} />
    </Route>
</Transition>
