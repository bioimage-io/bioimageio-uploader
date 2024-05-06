<script lang="ts">
    import ArrowUpToLine from 'lucide-svelte/icons/arrow-up-to-line';
    export let showAtPixel = window.innerHeight;

    let scrollHeight = 0;

    const gotoTop = () => {
		    window.scrollTo({ top: 0, behavior: 'smooth' })
    };

    $: showGotoTop = scrollHeight > showAtPixel;
</script>

{#if showGotoTop}

    <button id="scroll-to-top" on:click={gotoTop}>
        <ArrowUpToLine />
    </button>
{/if}

<svelte:window bind:scrollY={scrollHeight} />

<style>
    #scroll-to-top{
        position: fixed;
        top: calc(100vh - 150px);
        right: 50px;
        z-index: 999;
    }
</style>
