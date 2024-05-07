<script lang="ts">
    import SingleLineInputs from './SingleLineInputs.svelte';
    import {router} from 'tinro';
    import ScrollToTop from './ScrollToTop.svelte'
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

    const search_staged = (query: string) => {	
        if(!query) return all_staged;
		    return staged = all_staged.filter(item => {
			      let id = item.id.toLowerCase();
			      return id.includes(query.toLowerCase())
		    })
	  }

    let all_published = [];
    let all_staged = [];
    let published = [];
    $: staged = search_staged(input_value);

    onMount(async ()=> {
        all_published = (await get_json(collection_url_published)).collection;
        all_staged = (await get_json(collection_url_staged)).collection;
        console.log(all_published);
        console.log(all_staged);
        published = all_published;
        staged = all_staged;
    })

    $: staged 

    function scrollIntoView(element){
        let query = element;
        if(typeof query !== "string"){
            query = element.target.getAttribute('href'); 
        }
        const el = document.querySelector(query);
        console.log(el);
		    if (!el){
		        console.log(`Nopers: ${query}`);
		        return
		    }
        el.scrollIntoView({
            behavior: 'smooth'
        });
    }
    
</script>

<section id="search">
    <form>
        <SingleLineInputs>
            <input type="search" bind:value={input_value} placeholder="Enter resource ID, e.g. affable-shark"/>
            <!--button class="icon" on:click={()=>set_resource_id(input_value)} ><Search /></button-->
        </SingleLineInputs>
    </form>
</section>

<a href="#staged" on:click|preventDefault={scrollIntoView} >Pending</a>

<a href="#published" on:click|preventDefault={scrollIntoView}>Published</a>

<ScrollToTop />

<section id="staged">
<h3>Pending Resources</h3>
{#each staged as {id, id_emoji, info, description, version_number}}
    
    <article>
        <a href="/status/{id}/{version_number}">
        <h2>{id_emoji} {id} ({version_number})</h2>
        </a>
        <p>{description}</p>
        {#if info}
            {#if info.status}
                <p>⏳ {info.status.name} ({info.status.step}/{info.status.num_steps})</p>
                <p>{info.status.description}</p>
                <p>{new Date(info.status.timestamp).toString()}</p>
                <a href={info.status.run_url} target="_blank"><img src="static/github.svg" alt="github icon">Github CI Logs</a>
            {/if}
        {/if}
    </article>
    
{/each}
</section>

<section id="published">
<h3>Published Resources</h3>

<!--div class="grid" -->
{#each published as {id, id_emoji, info, version_number, description}}
<article>
    <a href="/status/{id}">
    <h2>{id_emoji} {id}</h2>
    </a>
    <p>{description}</p>
    <p>Version: {version_number}</p>
</article>
{/each}
<!--/div-->
</section>

