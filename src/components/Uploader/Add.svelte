<script>
    import Dropzone from "svelte-file-dropzone";
    import toast  from 'svelte-french-toast';
	import { onDestroy } from 'svelte';
    import {router} from 'tinro';
    import semver from 'semver';
    
    export let uploader;

    let file_info = [];

    onDestroy(() => {
        uploader.clear_render_callback();
	});

    function completed_step() {
        if(((uploader.rdf.type === "model") &&
           (semver.lt(uploader.rdf.format_version, "0.5.0")))
            || !uploader.rdf.type
          ){
            //step="edit";
            router.goto("/uploader/edit");
        }else{
            console.debug("Falling back to JSON-Schema validation");
            // step="validate-json";
            router.goto("/uploader/validate");
        }
    }

    async function handle_files_select(evt){
        console.log("handle_files_select"); 
        const selected_files = evt.detail.acceptedFiles;
        console.log("selected_files"); 
        console.log(selected_files); 
        const input_files = selected_files;
        console.log("Processing files:", input_files); 
        try{
            await uploader.load(input_files);
        }catch(err){
            toast.error(err.message);
            return
        }
        completed_step();
    }
    
</script>


<p>Upload <i>resource file</i>. This may be a single zip-archive containing all required files, 
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
