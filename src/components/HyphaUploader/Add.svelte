<script>
    import Dropzone from "svelte-file-dropzone/Dropzone.svelte";
    import toast  from 'svelte-french-toast';
    import JSZip from "jszip";
    import yaml from "js-yaml";
    import { createEventDispatcher } from 'svelte';
    
    export let zip_package;
    export let rdf;
    export let files = [];

    let rdf_text; 
    let file_info = [];
    let processing = false;

    const regex_zip = /\.zip$/gi 
    const regex_rdf = /(rdf\.yml|rdf\.yaml)$/gi
    const dispatch = createEventDispatcher();

    function completed_step() {
        dispatch('done', {});
    }

    async function read_model(rdf_text){
        rdf = yaml.load(rdf_text);
        console.log('RDF:');
        console.log(rdf);
    }

    async function load_zip_file(zip_file){
        console.log("Loading zip file...");
        zip_package = await JSZip.loadAsync(zip_file);
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
        // Empty files and repopulate from the zip file
        files = [];
        console.log("About to read");


        for(let item of Object.values(zip_package.files)){
            console.log(item);
            files.push( await FileFromJSZipZipOject(item))
        };
        // files = new_files;
        console.log("Files:");
        console.log(files);

        file_info = [
            `Zip file: ${zip_file.name}`,
            `with ${Object.keys(zip_package.files).length} entries`,
            `And RDF file: ${rdf_file.name}`];
    }

    async function load_rdf_file(rdf_file){
        file_info = [`RDF file given: ${rdf_file.name}`];
        rdf_text = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {resolve(event.target.result);};
            reader.onerror = reject;
            reader.readAsText(rdf_file);
        });
    }

    async function FileFromJSZipZipOject(zipObject){
        console.log("Creating file entry from:");
        console.log(zipObject);
        if(zipObject.dir) throw new Error("Zip file must be flat (no internal folders)");
        let res =  new File([await zipObject.async("blob")], zipObject.name);
        console.log("Created:");
        console.log(res);
        return res;

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
        if(input_file.name.search(regex_zip) !== -1){
            await load_zip_file(input_file);
        }else if (input_file.name.search(regex_rdf) !== -1){
            await load_rdf_file(input_file);
        }else{
            file_info = ["Invalid file given"];
            toast.error("Invalid file given");

            return
        }
        read_model(rdf_text);
        completed_step();
    }
    
</script>

<!--<h2>Add model information</h2>-->

{#if processing}
    Reading model... <div aria-busy="true" /> 
    <button on:click={completed_step()}>Next</button>
{:else}
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
{/if}

