<script>
    import Dropzone from "svelte-file-dropzone/Dropzone.svelte";
    import JSZip from "jszip";
    import yaml from "js-yaml";
    import { createEventDispatcher } from 'svelte';
    
    export let zip_package;
    export let rdf;

    let rdf_text; 
    let files = [];
    let file_info = [];
    let processing = false;

    const dispatch = createEventDispatcher();

    function completed_step() {
        dispatch('done', {});
    }

    async function read_model(rdf_text){
        rdf = yaml.load(rdf_text);
        console.log('RDF:');
        console.log(rdf);
        completed_step();
    }

    async function handle_files_select(e){
        const regex_zip = /\.zip$/gi 
        const regex_rdf = /(rdf\.yml|rdf\.yaml)$/gi
        const { acceptedFiles } = e.detail;
        files = acceptedFiles;
        if(files.length !== 1){
            console.error(`File-count not supported: ${files.length}`);
            return 
        }
        let file = files[0];
        if(file.name.search(regex_zip) !== -1){
            zip_package = await JSZip.loadAsync(file);
            console.log(zip_package);
            // Obtain the RDF file
            let file_names = Object.keys(zip_package.files);
            let candidates = file_names.filter((file) => file.search(regex_rdf) !== -1)
            console.log(file_names);
            console.log(candidates);
        

            if(candidates.length === 0){
                console.error("Unable to find any RDF files in Zip");
                file_info = [
                    "Invalid Zip file: no RDF file found!",
                    "Entries in zip file:",
                    ...Object.keys(zip_package.files)
                ];

                return 
            }
            const rdf_file = zip_package.files[candidates[0]];
            rdf_text = await rdf_file.async("string");

            file_info = [
                `Zip file: ${file.name}`,
                `with ${Object.keys(zip_package.files).length} entries`,
                `And RDF file: ${rdf_file.name}`];


        }else if (file.name.search(regex_rdf) !== -1){
            file_info = [`RDF file given: ${file.name}`];
            rdf_text = await new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = (event) => {resolve(event.target.result);};
                reader.onerror = reject;
                reader.readAsText(file);
            });
        }else{
            file_info = ["Invalid file given"];
            return
        }
        read_model(rdf_text);
    }
    
</script>

<h2>Add model information</h2>

{#if processing}
    Reading model... <div class="is-loading" /> 
    <button class="button" on:click={completed_step()}>Next</button>
{:else}
    Please upload your model zip file here 

    <Dropzone on:drop={handle_files_select} multiple={false}>
        {#if files.length === 0}
            Click here or drop files
        {:else}
            {#each file_info as line}
                {line}<br>
            {/each}
        {/if}

    </Dropzone>
{/if}

