<script>
    export let current=0;
    export let max_step=0;
    export let steps=[];
</script>

<style>
    ul{
        list-style-type: none;
        display: flex;
    }
    li{
        padding: 0 5px;
    }
    .boo{
        color: grey;
    }
</style>

<!--h1>Current: {steps[current].text}</h1-->
<ul>
    {#each steps as step, i}
        {#if i<=max_step}
            <li on:click={()=> {current=i}}>{step.text}</li>
        {:else}
            <li class="boo">{step.text}</li>
        {/if}
    {/each}
</ul>


