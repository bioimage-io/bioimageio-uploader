<script lang="ts" charset="utf-8">
    import { X } from 'lucide-svelte'
    export let deletable=true;
    export let show=true;
    export let classes="";
</script>


{#if show}
    <article class="{classes}" >
        <header>
            {#if deletable}
                <span style="float:right;" on:click={()=>{show=false;}} on:keydown={()=>{}} tabindex=0 title="Dismiss"><X/></span>
            {/if}
            <slot name="header"/>
        </header>
        <slot />
        <footer><slot name="footer"/></footer>
    </article>
{/if}
