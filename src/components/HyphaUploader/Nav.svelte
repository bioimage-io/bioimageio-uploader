<script>
    export let max_step=0;
    export let steps = [];
</script>
<nav>
    <ul>
    {#each steps as step, i}
        {#if i<=max_step}
            <li><a href="{step.url}">{step.text}</a></li>
        {:else}
            <li>{step.text}</li>
        {/if}
    {/each}
    </ul>
</nav>

