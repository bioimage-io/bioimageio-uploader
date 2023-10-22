<script charset="utf-8">
    export let name
    export let handleClick = () => {};
</script>

<style type="text/css" media="screen">
.button{
    padding-right:0rem
}    
.button-small {
    font-size: .8rem;
    height: 2.8rem;
    line-height: 2.8rem;
    padding: 0 1.5rem;
}
</style>

<div class="button button-outline">
    {name}
    <div class="button button-small" on:click={handleClick}>❌</div>
</div>
