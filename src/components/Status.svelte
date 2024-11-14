<script lang="ts">
    import { onMount } from 'svelte';
    import { router } from 'tinro';
    import github from '../../static/github.svg';
    import { COLLECTION_URL_STAGED } from '../lib/config';
    import { get_json } from '../lib/utils';
    import ScrollToTop from './ScrollToTop.svelte';
    import SingleLineInputs from './SingleLineInputs.svelte';
    import SvelteMarkdown from 'svelte-markdown';

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
<h3>Under Review</h3>
These uploaded resource drafts can also be browsed at <a href="https://bioimage.io/#/?repo=https%3A%2F%2Fuk1s3.embassy.ebi.ac.uk%2Fpublic-datasets%2Fbioimage.io%2Fcollection_draft.json"> bioimage.io pointing to the collection_draft.json</a>.
{#each staged as {id, nickname_icon, status, description, authors, created, uploader}}

    <article>
        <a href="/status/{id}">
        <h2>{nickname_icon} {id}</h2>
        </a>
        Uploaded by {uploader.name || ''} <a href= "mailto: {uploader.email}"> {uploader.email}</a> on {new Date(created)}<br>
        Authored by:
        <ul>
            {#each authors as author}
            <li>{#if author.email}<a href= "mailto: {author.email}">{author.name || author.email}</a>{:else}{author.name || unknown}{/if}</li>
          {/each}
        </ul>
        <SvelteMarkdown source={description} />
        {#if status}
            <p>⏳ {status.name} ({status.step}/{status.num_steps}) {new Date(status.timestamp)}</p>
            <p>{status.description}</p>
        {/if}
    </article>

{/each}
</section>
