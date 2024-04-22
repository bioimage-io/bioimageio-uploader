<script>
    import MultipartItemsInput from './MultipartItemsInput.svelte';
    import InputLabel from './InputLabel.svelte';
    import Select from './Select.svelte';
    import Input from './Input.svelte';
    import Files from './Files.svelte';
    import Tags from "./Tags.svelte";
    import site_config from "../../../site.config.json";
    import spdxLicenseList from "spdx-license-list/full";
    export let uploader; 
    let filenames = [];

    if(uploader.zip_package){
        filenames = Object.keys(uploader.zip_package.files);
    }else if (uploader.files){
        filenames = uploader.files.map((item)=> item.name);
    }

    const types = site_config.resource_categories.map(cat => cat.type);
    let all_tags =  [];
    for (let cat of site_config.resource_categories) {
        const tag_cats = cat.tag_categories || [];
        for (let cat in tag_cats) {
            all_tags = all_tags.concat(tag_cats[cat]);
        }
    }


    const licenses = Object.keys(spdxLicenseList).sort();
    const author_fields = [
        {placeholder:"Full name", key:"name", props:{maxlength:"1000", required:true}},
        {placeholder:"Affiliation", key:"affiliation", props:{maxlength:"1000"}},
        {placeholder:"ORCID", key:"orcid", props:{maxlength:"1000"}},
    ];
    const maintainer_fields = [
        {placeholder:"Name", key:"name", props:{maxlength:"1000"}},
        {placeholder:"Github", key:"github_user", props:{maxlength:"1000"}},
        {placeholder:"Email", key:"email", props:{maxlength:"1000"}},
    ];
    const citation_fields = [
        {placeholder:"Citation text", key:"text", props:{maxlength:"1000"}},
        {placeholder:"DOI", key:"doi", props:{maxlength:"100"}},
        {placeholder:"url", key:"url", props:{maxlength:"1000"}},
    ];

    //let {
        //type,
        //name,
        //description, 
        //authors,
        //maintainers,
        //version,
        //license,
        //git_repo,
        //tags,
        //cite,
        //source,
        //links,
    //} = uploader.rdf;

    // let resource_item_ids = resource_items.map(item => item.id);
    async function handle_files_select(e){
        const { acceptedFiles } = e.detail;
        // files = acceptedFiles;
        // filenames ... 



    }

    function remove_file(e,filename, index){
        console.log("RUNNING");
        e.cancelBubble=true;
        e.stopPropagation();
        // Remove filename from zip_package and filenames list
        filenames.splice(index, 1);
        filenames = filenames;
    
    }

    // TODO: Cant get validation working on tags 😬
    // See 
    //const pattern = /^[-0-9a-z+*#;./%@:]/

    //function validate_tags(){
        //console.log(tags);
        //if(!tags) return tags;
        //let new_tags = tags.filter((tag) => tag.search(pattern) !== -1);
        //if(new_tags.length !== tags.length){
            //console.log("Invalid tags removed!");
            //tags = new_tags;
            //console.log(tags);
            //return new_tags;
        //}
        //return tags;
    //}

    //$: tags = validate_tags();
</script>


<form>
    <InputLabel label="Type" required>
        <Select bind:selected={uploader.rdf.type} options={types}/>
    </InputLabel>
    
    <InputLabel label="Name" required>
        <svelte:fragment slot="help">The name of your deposit (note: / is not allowed in the name)</svelte:fragment>
        <Input placeholder="name" bind:value={uploader.rdf.name} /> 
    </InputLabel>

    <InputLabel label="Description" required>
        <Input placeholder="description" bind:value={uploader.rdf.description} /> 
    </InputLabel>    

    <InputLabel label="Uploader">
        <Input placeholder="Displayed name" bind:value={uploader.rdf.uploader.name} />
        <Input readonly placeholder="Email will be automatically set before uploading" value={uploader.rdf.uploader.email}/>
    </InputLabel>
    
    <InputLabel label="Authors" required>
        <svelte:fragment slot="help">The authors who contributed to this resource item</svelte:fragment>
        <MultipartItemsInput bind:items={uploader.rdf.authors} fields={author_fields} entry_name="author"/>
    </InputLabel>
    
    <InputLabel label="Maintainers" required>
        <svelte:fragment slot="help">The maintainers who maintain this resource item. Importantly, the first maintainer will be contacted for the approval process to the BioImage.IO</svelte:fragment>
        <MultipartItemsInput bind:items={uploader.rdf.maintainers} fields={maintainer_fields} entry_name="maintainer"/>
    </InputLabel>

    <InputLabel label="Version">
        <Input placeholder="Version in MAJOR.MINOR.PATCH format(e.g. 0.1.0)" bind:value={uploader.rdf.version} />
    </InputLabel>

    <InputLabel label="License">
        <svelte:fragment slot="help">
            Choose the license that fits you most, we recommend to use 
            <a target="_blank" href="https://creativecommons.org/licenses/by/4.0/">CC-BY-4.0</a> 
            (free to share and adapt under the condition of attribution). 
            For other license options, please visit here 
            <a target="_blank" href="https://spdx.org/licenses">https://spdx.org/licenses</a>
        </svelte:fragment>
        <Select bind:selected={uploader.rdf.license} options={licenses}/>
    </InputLabel>
    
    <InputLabel label="Git repository">
        <Input placeholder="Git repository URL" bind:value={uploader.rdf.git_repo}/> 
    </InputLabel>

    <InputLabel label="Tags">
        <svelte:fragment slot="help">
            Tags should contain only lower case letters with numbers, or the following characters: +*#;./%@, but no space, then press ENTER, TAB, or SPACE
        </svelte:fragment>
        <!-- NB minChars 0 means show autocomplete on focus -->
        <Tags   style="color:black"
                placeholder="Add a tag" 
                bind:tags={uploader.rdf.tags}  
                autocomplete={all_tags} />
    </InputLabel>

    <InputLabel label="Citation">
        <svelte:fragment slot="help">How this resource item should be cited</svelte:fragment>
        <MultipartItemsInput bind:items={uploader.rdf.cite} fields={citation_fields} entry_name="citation"/>
    </InputLabel>

    <InputLabel label="Source">
        <svelte:fragment slot="help">The source url of your deposit</svelte:fragment>
        <Input placeholder="Source URL" bind:value={uploader.rdf.source}/> 
    </InputLabel>

    <InputLabel label="Links">
        <!-- NB minChars 0 means show autocomplete on focus -->
        <Tags   style="color:black"
                placeholder="Add a link (resource item ID)" 
                bind:tags={uploader.rdf.links} />
    </InputLabel>

    <InputLabel label="Files">
        <svelte:fragment slot="help">Click anywhere not on a file in this box to add more files</svelte:fragment>
        <Files bind:files={filenames} {handle_files_select} {remove_file} />
    </InputLabel>
</form>

