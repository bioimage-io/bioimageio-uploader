<script>
    import {active} from 'tinro';
    export let max_step=0;
    export let steps = [];

</script>
<style>
	:global(.active){font-weight: bold; text-decoration: underline}
	a {outline : none}
</style>
<nav>
    <ul>
    {#each steps as step, i}
        {#if i<=max_step}
            <li><a use:active href="{step.url}">{step.text}</a></li>
        {:else}
            <li>{step.text}</li>
        {/if}
    {/each}
    </ul>
</nav>

