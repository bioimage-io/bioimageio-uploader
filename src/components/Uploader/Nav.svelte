<script>
    import {active} from 'tinro';
    export let steps = [];
    let max_step=0;

</script>
<style>
	:global(.active){font-weight: bold; text-decoration: underline}
	a {outline : none}
</style>
<nav>
    <ul>
    {#each steps as step, i}

        <li><a use:active href="{step.url}">{step.text}</a></li>
        <!--{#if i<=max_step}-->
            <!--<li><a use:active href="{step.url}">{step.text}</a></li>-->
        <!--{:else}-->
            <!--<li>{step.text}</li>-->
        <!--{/if}-->
    {/each}
    </ul>
</nav>

