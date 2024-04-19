<script lang="ts">
    import SingleLineInputs from './SingleLineInputs.svelte';
    import { Search } from 'lucide-svelte';
    import {router} from 'tinro';

    //let error;
    //let error_element;
    //let last_error_object;
    let input_value: string;

    function set_resource_id(resource_id: string){
        resource_id = resource_id.trim();
        router.goto(`/status/${resource_id}`);
    }
    
</script>

<form>
<SingleLineInputs>
    <input type="text" bind:value={input_value} placeholder="Enter resource ID, e.g. affable-shark"/>
    <button class="icon" on:click={()=>set_resource_id(input_value)} ><Search /></button>
</SingleLineInputs>
</form>
