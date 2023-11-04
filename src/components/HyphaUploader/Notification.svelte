<script charset="utf-8">
    export let deletable=true;
    export let show=true;
    export let classes="";
</script>


{#if show}
    <div class="notification {classes}">
        {#if deletable}
            <button class="delete" on:click={()=>{show=false;}}></button>
        {/if}
        <slot />
    </div>
{/if}
