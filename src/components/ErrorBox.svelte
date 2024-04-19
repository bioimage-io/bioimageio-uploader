<script lang="ts">
    export let error="";
    export let title="";
</script>
{#if error}
    <h4>{title} Error</h4>
    <article>
        {error}
    </article>
{/if}
