<script lang="ts">
    import {Route, router} from 'tinro'; 
    import Main from './Main.svelte';
    import Embedded from './Embedded.svelte';
</script>
<Route firstmatch> 
    <Route path="/embed/*">
        <Embedded />
    </Route>
    <Route path="/*">
        <Main />
    </Route>
</Route>
