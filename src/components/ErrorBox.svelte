<script lang="ts">
    export let error="";
</script>
{#if error}
    <article>
        {error}
    </article>
{/if}
