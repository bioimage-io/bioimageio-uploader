<script charset="utf-8">
    import Dropzone from "svelte-file-dropzone";
    import FileEntry from './FileEntry.svelte';
    export let files = [];
    export let handle_files_select = () => {};
    export let remove_file = () => {};
</script>


<Dropzone containerStyles="flex-direction:row;flex-wrap:wrap;" containerClasses="dropzone" on:drop={handle_files_select} multiple={true}>
    {#if files.length === 0}
        Click here or drop files
    {:else}
        {#each files as name, index}
            <FileEntry 
                handleClickDelete={(e)=>{remove_file(e, name, index);}} {name}/>
        {/each}
    {/if}
</Dropzone>
