<script charset="utf-8">
    import { X } from 'lucide-svelte'
    export let tags;
    export let add_keys = [9, 13, 32];
    export let min_length = 2;
    export let autocomplete = [];
    export let placeholder = "";

    let invalid_tag = false;
    let matches = [];

    $: tags = tags || [];
    add_keys = new Set(add_keys);


    let value; 

    const add_tag = (name) => {
        matches = [];
        name = name.trim();
        if(tags.includes(name)){
            invalid_tag = true;
            return 
        }
        tags.push(name);
        tags = tags;
        value = "";
    }

    const remove_tag = (index)=>{
        tags.splice(index, 1);
        tags = tags;
    } 

    const find_matches = async(name) => {
        // Use trie here if needed
        matches = autocomplete.filter((item) => item.startsWith(name));
        
    }

    const update_tag = (evt)=>{
        matches = [];
        const name = value.trim();
        invalid_tag = false;
        if(name.length !== 0) find_matches(name);
        if(name.length < min_length){
            return
        }
        if(tags.includes(name)){
            invalid_tag = true;
            return
        }


        const key = evt.keyCode;
        if (add_keys.has(evt.keyCode)){
            if (value) evt.preventDefault();
            //if (autoComplete && document.getElementById(matchsID)) {
            if (key === false) {
                //add_tag(arrelementsmatch?.[autoCompleteIndex]?.label);
                console.log("IMPLEMENT AUTOCOMPLETE");
            } 
            if(name.length < min_length){
                invalid_tag = true;
            }else{
                add_tag(name);
            }
        }

    }


</script>
<style>
    .tags {
        display: flex;
        width: 100%;
        flex-direction: row;
        -webkit-flex-wrap: wrap;
        gap: 2px;
    }
    ul {
        width: 100%;
    }
    li {
        list-style:none;
        padding:5px;
        border-radius: 2px;
        cursor:pointer;
    }
    li:hover {
        background:var(--contrast);
        color:var(--primary);
        outline:none;
    }
</style>


<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<div class="tags">
    {#each tags as tag, i}
        <kbd>{tag} <span on:click={()=>remove_tag(i)}><X/></span></kbd>
    {/each}
    <input on:keyup={update_tag}  bind:value {placeholder}/>
    {#if matches.length > 0}
        <ul>
            {#each matches as match}  
                <li on:click|preventDefault={() => add_tag(match)}>{match}</li>
            {/each}
        </ul>
    {/if}
</div>

