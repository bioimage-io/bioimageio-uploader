<script>
    import Dropzone from "svelte-file-dropzone";
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
        //if(selected_files.length !== 1){
            //console.error(`Currently only a zip file is supported: ${selected_files.length}`);
            //return 
        //}
        if(selected_files.length === 1){
            const input_file = selected_files[0];
            console.log("Processing file:", input_file); 
            try{
                await uploader.load_from_file(input_file);
            }catch(err){
                toast.error(err.message);
                return
            }
        }else{
            const input_files = selected_files;
            console.log("Processing files:", input_files); 
            try{
                await uploader.load_from_files(input_files);
            }catch(err){
                toast.error(err.message);
                return
            }
        }
        completed_step();
    }
    
</script>


<p>Upload models file. This may be a single zip-archive containing all required files, 
or you may select / drag and drop the individual files to use.</p>

<p>An <code>rdf.yaml</code> will be required for the upload. You can create this in the next step.</p>

<Dropzone on:drop={handle_files_select} multiple={true}>
    {#if file_info.length === 0}
        Click here to select or drag/drop files
    {:else}
        {#each file_info as line}
            {line}<br>
        {/each}
    {/if}
</Dropzone>
