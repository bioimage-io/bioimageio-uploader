<script charset="utf-8">
    export let name
    export let handleClick = () => {};
</script>

<div class="button">
    {name}
    <button class="delete" on:click={handleClick}></button>
</div>
