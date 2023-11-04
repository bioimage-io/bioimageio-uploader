<script>
    //import { Steps } from 'svelte-steps';
    //import Steps  from './Steps.svelte';
    export let current=0;
    export let max_step=0;
    export let steps = [];
    //export let steps= new Map();

    //let ssteps = Array.from(steps.values());
    //let clickables = Array.from(
        //{length: ssteps.length},
        //(_, index) => index <= max_step
    //);


</script>

<style>
    .boo{
        color: grey;
    }
</style>

<nav class="navbar is-fixed-top" aria-label="uploader steps">
    <div class="navbar-brand">
    {#each steps as step, i}
        {#if i<=max_step}
            <div 
                class="navbar-item is-hoverable" 
                role="button"
                tabindex="0"
                on:click={()=> {current=i}}
                  on:keypress={() => {current=i}}
                >{step.text}</div>
        {:else}
            <div class="navbar-item boo">{step.text}</div>
        {/if}
    {/each}
    </div>
</nav>

<!--</ul>-->

<!--<nav class="navbar" aria-label="uploader steps">-->
    <!--<div class="navbar-menu">-->
    <!--{#each [...steps] as [key, step], i}-->
        <!--{#if i<=max_step}-->
            <!--<!-- class="navbar-item is-hoverable" href="#{key}">-->
            <!--<a class="navbar-item is-hoverable" href="#{key}">-->
                <!--{step.text}-->
            <!--</a>-->
        <!--{:else}-->
            <!--<a class="navbar-item boo" disabled>{step.text}</a>-->
        <!--{/if}-->
    <!--{/each}-->
    <!--</div>-->
<!--</nav>-->
<!--<Steps steps={ssteps} {clickables}/>-->

