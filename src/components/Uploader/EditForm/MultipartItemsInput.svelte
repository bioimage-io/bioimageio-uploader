<script>
    import { X, Plus } from 'lucide-svelte'
    import MultipartItemsInputInput from "./MultipartItemsInputInput.svelte";
    import SingleLineInputs from "../../SingleLineInputs.svelte";
    export let items =[];
    export let error = null;
    export let fields = [];
    export let entry_name = "item";

    if(!Array.isArray(items)) items = [];

    const newentry = ()=>fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {});

    function delete_at_index(index){
        items.splice(index, 1);
        items = items;
    }
</script>
<style>
    .icon{
        width: 64px;
    }
</style>

{#each items as item, index}   
<SingleLineInputs>
    {#each fields as field}
    <MultipartItemsInputInput 
        placeholder={field.placeholder}
        bind:value={item[field.key]}
        type={field.type}
        props={field.props}
       />
    {/each}
    <button 
        class="icon contrast"
        title="Delete entry for {item[fields[0].key]}"
        on:click={()=> delete_at_index(index)}>
        <X />
    </button>
</SingleLineInputs>

{/each}

<button 
    title="Add {entry_name}"
    on:click={()=> {items = [...items, newentry()]}}>
    <Plus />
</button>
{#if error }
    <div class="notification is-error">{error }</div>
{/if}
