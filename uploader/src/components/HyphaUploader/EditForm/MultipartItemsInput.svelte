<script>
    import SvgIcon from '@jamescoyle/svelte-icon';
    import { mdiPlus, mdiDeleteVariant } from '@mdi/js';
    import MultipartItemsInputInput from "./MultipartItemsInputInput.svelte";
    export let items =[];
    export let error = null;
    export let fields = [];
    export let entry_name = "item";

    const newentry = ()=>fields.reduce((acc, field) => ({ ...acc, [field.key]: "" }), {});

    function delete_at_index(index){
        items.splice(index, 1);
        items = items;
    }
</script>

<div class="field">

    {#each items as item, index}   
        <div class="field is-grouped has-addons">
        {#each fields as field}
            <p class="control is-expanded">
            <MultipartItemsInputInput 
                placeholder={field.placeholder}
                bind:value={item[field.key]}
                type={field.type}
                props={field.props}
               />
            </p>
        {/each}
        <button 
            class="button is-danger" 
            title="Delete entry for {item[fields[0].key]}"
            on:click={()=> delete_at_index(index)}>
            <SvgIcon type="mdi" path={mdiDeleteVariant}/>
        </button>
        </div>
    {/each}

    <div class="control">
    <button 
        class="button is-success" 
        title="Add {entry_name}"
        on:click={()=> {items = [...items, newentry()]}}>
        <SvgIcon type="mdi" path={mdiPlus}/>
    </button>
    </div>
    {#if error }
        <div class="notification is-error">{error }</div>
    {/if}
</div>
