<script charset="utf-8">
    export let selected;
    export let options;
</script>

<div class="field">
<div class="select">
<select bind:value={selected}>
    {#each options as option}
        {#if option.name}
            <option value={option.value}>{option.name}</option>
        {:else}
            <option value={option}>{option}</option>
        {/if}
    {/each}
</select>
</div>
</div>
