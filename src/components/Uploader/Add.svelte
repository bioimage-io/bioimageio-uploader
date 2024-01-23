<script>
    import Dropzone from "svelte-file-dropzone/Dropzone.svelte";
    import toast  from 'svelte-french-toast';
    import { createEventDispatcher } from 'svelte';
    
    export let uploader;

    //let rdf_text; 
    let file_info = [];
    //let processing = false;

    const dispatch = createEventDispatcher();

    function completed_step() {
        dispatch('done', {});
    }


    async function handle_files_select(evt){
        console.log("handle_files_select"); 
        const selected_files = evt.detail.acceptedFiles;
        console.log("selected_files"); 
        console.log(selected_files); 
        if(selected_files.length !== 1){
            console.error(`Currently only one zip file or rdf file supported: ${selected_files.length}`);
            return 
        }
        let input_file = selected_files[0];
        console.log("Processing file:", input_file); 
        try{
            await uploader.load_from_file(input_file);
        }catch(err){
            toast.error(err.message);
            return
        }

        completed_step();
    }
    
</script>


Upload model zip file 

<Dropzone on:drop={handle_files_select} multiple={false}>
    {#if file_info.length === 0}
        Click here or drop files
    {:else}
        {#each file_info as line}
            {line}<br>
        {/each}
    {/if}
</Dropzone>
