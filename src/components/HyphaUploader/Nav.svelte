<script>
    //import { Steps } from 'svelte-steps';
    //import Steps  from './Steps.svelte';
    //export let current=0;
    export let max_step=0;
    export let steps= new Map();
    //let ssteps = Array.from(steps.values());
    //let clickables = Array.from(
        //{length: ssteps.length},
        //(_, index) => index <= max_step
    //);


</script>

<style>
    /*ul{*/
        /*list-style-type: none;*/
        /*display: flex;*/
    /*}*/
    /*li{*/
        /*padding: 0 5px;*/
    /*}*/
    .boo{
        color: grey;
    }
</style>

<!--h1>Current: {steps[current].text}</h1-->
<!--<ul>-->
    <!--{#each steps as step, i}-->
        <!--{#if i<=max_step}-->
            <!--<li on:click={()=> {current=i}}>{step.text}</li>-->
        <!--{:else}-->
            <!--<li class="boo">{step.text}</li>-->
        <!--{/if}-->
    <!--{/each}-->
<!--</ul>-->

<nav class="navbar" aria-label="uploader steps">
    <div class="navbar-menu">
    {#each [...steps] as [key, step], i}
        {#if i<=max_step}
            <a class="navbar-item is-hoverable" href="#{key}">
                {step.text}
            </a>
        {:else}
            <a class="navbar-item boo" disabled>{step.text}</a>
        {/if}
    {/each}
    </div>
</nav>
<!--<Steps steps={ssteps} {clickables}/>-->

