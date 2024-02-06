<script>
export let show=false;

</script>
{#if show}
<dialog open={show}>
    <article>
		<slot />

        <footer>
            <button on:click={()=>{show=false;}}>Close</button>
        </footer>
    </article>
</dialog>
{/if}



