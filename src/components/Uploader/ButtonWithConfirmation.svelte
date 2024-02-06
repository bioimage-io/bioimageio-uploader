<script charset="utf-8">
    import { Trash } from 'lucide-svelte'

    export let confirm;

    let show_confirm = false;

    function confirmed(){
        unconfirm();
        confirm();
    }

    function unconfirm(){
        show_confirm = false;
    }

    function ask_confirmation(){
        show_confirm = true;
    }
</script>
<style>
    .icon{
        width: 64px;
    }
    .delete{
        background-color: crimson;
        --background-color: crimson;
        outline-color: black;
    }
    .list-container {
        display: flex;
        flex-direction: column;
        align-items: flex-start;
    }

    .list-item {
        display: flex;
        width: 100%;
        gap: 10px;
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
    }
</style>


<div class="list-container">
    <div class="list-item">
        {#if show_confirm}
            Are you sure?
            <button class="icon delete" on:click={confirmed}><Trash /></button>
            <button on:click={unconfirm}>No</button>
        {:else}
            <button class="contrast" on:click={ask_confirmation}>
                <slot/>
            </button>
        {/if}
    </div>
</div>
