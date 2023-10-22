<script>
    import AuthorsInput from './AuthorsInput.svelte';
    import MultipartItemsInput from './MultipartItemsInput.svelte';
    import InputLabel from './InputLabel.svelte';
    import Select from './Select.svelte';
    import Files from './Files.svelte';
    import site_config from "../../../site.config.json";
    import spdxLicenseList from "spdx-license-list/full";
    import Tags from "svelte-tags-input";
    export let rdf; 
    export let zip_package;
    let filenames = [];

    if(zip_package){
        filenames = Object.keys(zip_package.files);
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
    const citation_fields = [
        {placeholder:"Name", key:"text", props:{maxlength:"1000"}},
        {placeholder:"DOI", key:"doi", props:{maxlength:"100"}},
        {placeholder:"url", key:"url", props:{maxlength:"1000"}},
    ];

    let {
        type,
        name,
        description, 
        authors,
        maintainers,
        version,
        license,
        git_repo,
        tags,
        cite,
        source,
        links,
    } = rdf;

    // let resource_item_ids = resource_items.map(item => item.id);
    async function handle_files_select(e){
        const { acceptedFiles } = e.detail;
        // files = acceptedFiles;
        // filenames ... 
    }

    function remove_file(e,filename, index){
        console.log("RUNNING");
        e.stopPropagation();
        // Remove filename from zip_package and filenames list
        filenames.splice(index, 1);
        filenames = filenames;
    
    }

    console.log(cite);

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
        <Select bind:selected={type} options={types}/>
    </InputLabel>
    
    <InputLabel label="Name" required>
        <span slot="help">The name of your deposit (note: / is not allowed in the name)"</span>
        <input placeholder="name" bind:value={name} /> 
    </InputLabel>

    <InputLabel label="Description" required>
        <input placeholder="description" bind:value={description} /> 
    </InputLabel>    
    
    <InputLabel label="Authors" required>
        <span slot="help">The authors who contributed to this resource item</span>
        <AuthorsInput bind:authors name orcid affiliation/>
    </InputLabel>
    
    <InputLabel label="Maintainers" required>
        <span slot="help">The maintainers who maintain this resource item. Importantly, the first maintainer will be contacted for the approval process to the BioImage.IO</span>
        <AuthorsInput bind:authors={maintainers} name email github />
    </InputLabel>

    <InputLabel label="Version">
        <input placeholder="Version in MAJOR.MINOR.PATCH format(e.g. 0.1.0)" bind:value={version} />
    </InputLabel>

    <InputLabel label="License">
        <span slot="help">
            Choose the license that fits you most, we recommend to use 
            <a target="_blank" href="https://creativecommons.org/licenses/by/4.0/">CC-BY-4.0</a> 
            (free to share and adapt under the condition of attribution). 
            For other license options, please visit here 
            <a target="_blank" href="https://spdx.org/licenses">https://spdx.org/licenses</a>
        </span>
        <Select bind:selected={license} options={licenses}/>
    </InputLabel>
    
    <InputLabel label="Git repository">
        <input placeholder="Git repository URL" bind:value={git_repo}/> 
    </InputLabel>

    <InputLabel label="Tags">
        <span slot="help">
            Tags should contain only lower case letters with numbers, or the following characters: +*#;./%@, but no space, then press ENTER, TAB, or SPACE
        </span>
        <!-- NB minChars 0 means show autocomplete on focus -->
        <Tags   style="color:black"
                placeholder="Add a tag" 
                bind:tags={tags} allowPaste onlyUnique 
                autoComplete={all_tags} 
                minChars={0}
                addKeys={[9, 13, 32]}/>
    </InputLabel>

    <InputLabel label="Citation">
        <span slot="help">How this resource item should be cited</span>
        <MultipartItemsInput bind:items={cite} fields={citation_fields}/>
    </InputLabel>

    <InputLabel label="Source">
        <span slot="help">The source url of your deposit</span>
        <input placeholder="Source URL" bind:value={source}/> 
    </InputLabel>

    <InputLabel label="Links">
        <!-- NB minChars 0 means show autocomplete on focus -->
        <Tags   style="color:black"
                placeholder="Add a link (resource item ID)" 
                bind:tags={links} allowPaste onlyUnique 
                minChars={0}
                addKeys={[9, 13, 32]}/>
    </InputLabel>
        <!--{-->
          <!--label: "Links",-->
          <!--type: "tags",-->
          <!--value: this.rdf.links,-->
          <!--placeholder: "Add a link (resource item ID)",-->
          <!--options: this.resourceItems.map(item => item.id),-->
          <!--allow_new: true,-->
          <!--icon: "vector-link",-->
          <!--isRequired: false-->
        <!--},-->
    <InputLabel label="Files">
        <Files bind:files={filenames} {handle_files_select} {remove_file} />
    </InputLabel>
        <!--{-->
          <!--label: "Files",-->
          <!--type: "files",-->
          <!--value: files,-->
          <!--isRequired: false-->
          <!--},-->
</form>

