<script>
    import MultipartItemsInputInput from "./MultipartItemsInputInput.svelte";
    export let items =[];
    export let error = null;
    export let fields = [];

    function delete_at_index(index){
        items.splice(index, 1);
        items = items;
    }
</script>

<div>

    {#each items as item, index}   
        {#each fields as field}
            <MultipartItemsInputInput 
                placeholder={field.placeholder}
                bind:value={item[field.key]}
                type={field.type}
                props={field.props}
                />
        {/each}
        <button 
            class="button button-outline" 
            on:click={()=> delete_at_index(index)}>Delete</button>
    {/each}

    <br>
    <button 
        class="button" 
        on:click={()=> {items = [...items, {}]}}>Add</button>

    {#if error }
        <p class="help is-danger">{error }</p>
    {/if}
</div>
