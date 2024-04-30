<script lang="ts">
    import SingleLineInputs from './SingleLineInputs.svelte';
    import { Search } from 'lucide-svelte';
    import {router} from 'tinro';
	  import { COLLECTION_URL_PUBLISHED, COLLECTION_URL_STAGED } from '../lib/config';
	  import { get_json } from '../lib/utils';
	import { onMount } from 'svelte';

    export let collection_url_published: string;
    export let collection_url_staged: string;

    $: if(!collection_url_published) collection_url_published=COLLECTION_URL_PUBLISHED;
    $: if(!collection_url_staged) collection_url_staged=COLLECTION_URL_STAGED;

    //let error;
    //let error_element;
    //let last_error_object;
    let input_value: string;

    function set_resource_id(resource_id: string){
        resource_id = resource_id.trim();
        router.goto(`/status/${resource_id}`);
    }

    let all_published = [];
    let all_staged = [];
    let published = [];
    let staged = [];

    onMount(async ()=> {
        all_published = (await get_json(collection_url_published)).collection;
        all_staged = (await get_json(collection_url_staged)).collection;
        console.log(all_published);
        console.log(all_staged);
        published = all_published;
        staged = all_staged;
    })

</script>

<form>
<SingleLineInputs>
    <input type="search" bind:value={input_value} placeholder="Enter resource ID, e.g. affable-shark"/>
    <button class="icon" on:click={()=>set_resource_id(input_value)} ><Search /></button>
</SingleLineInputs>
</form>

<h3>Staged Resources</h3>
{#each staged as {id, id_emoji}}
    <a href="/status/{id}">
    <article>
        {id_emoji} {id}
    </article>
    </a>
{/each}

<h3>Published Resources</h3>

<!--div class="grid" -->
{#each published as {id, id_emoji}}
    <a href="/status/{id}">
    <article>
        {id_emoji} {id}
    </article>
    </a>
{/each}
<!--/div-->
