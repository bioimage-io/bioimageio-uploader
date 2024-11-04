<script lang="ts">
    import { onMount } from 'svelte';
    import { router } from 'tinro';
    import github from '../../static/github.svg';
    import { COLLECTION_URL_STAGED } from '../lib/config';
    import { get_json } from '../lib/utils';
    import ScrollToTop from './ScrollToTop.svelte';
    import SingleLineInputs from './SingleLineInputs.svelte';

    export let collection_url_staged: string;

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

    let all_staged = [];
    $: staged = search_staged(input_value);

    onMount(async ()=> {
        all_staged = (await get_json(collection_url_staged)).collection;
        console.log(all_staged);
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

<!-- <a href="#staged" on:click|preventDefault={scrollIntoView} >Pending</a> -->

<ScrollToTop />

<section id="staged">
<h3>Pending Uploads</h3>
{#each staged as {id, nickname_icon, info, description, authors, created}}

    <article>
        <a href="/status/{id}">
        <h2>{nickname_icon} {id}</h2>
        </a>
        created: {Date(created)} by:
        <ul>
            {#each authors as author}
            <li>{author.name || ''} {#if author.email}(<a href= "mailto: {author.email}"> {author.email}</a>){/if}</li>
          {/each}
        </ul>
        <p>{description}</p>
        {#if info}
            {#if info.status}
                <p>⏳ {info.status.name} ({info.status.step}/{info.status.num_steps})</p>
                <p>{info.status.description}</p>
                <p>{new Date(info.status.timestamp).toString()}</p>
                <a href={info.status.run_url} target="_blank"><img src="{github}" alt="github icon">Github CI Logs</a>
            {/if}
        {/if}
    </article>

{/each}
</section>
