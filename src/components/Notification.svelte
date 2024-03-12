<script charset="utf-8">
    export let deletable=true;
    export let show=true;
    export let classes="";
</script>


{#if show}
    <article class="notification {classes}">
        <!--{#if deletable}-->
            <!--<button class="close" on:click={()=>{show=false;}}></button>-->
        <!--{/if}-->
        <slot />
    </article>
{/if}
