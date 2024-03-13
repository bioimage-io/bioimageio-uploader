<script lang="ts">
    import { Toaster } from 'svelte-french-toast';
    import semver from 'semver';
    import { Uploader } from '../../lib/uploader';
    import Hypha from '../../lib/hypha';
    import Add      from './Add.svelte';
    import Edit     from './Edit.svelte';
    import Review   from './Review.svelte';
    import ValidateJson from './ValidateJson.svelte';
    import UploadStatus   from './UploadStatus.svelte';
    import Notification from '../Notification.svelte';
    import ButtonWithConfirmation from './ButtonWithConfirmation.svelte';


    export let hypha: Hypha;
    let uploader = new Uploader();

    let step = "add";

    function reset(){
        uploader.reset();
        step = "add";
    }

    function handle_add(data){
        // Handle 
        if(((uploader.rdf.type === "model") &&
           (semver.lt(uploader.rdf.format_version, "0.5.0")))
            || !uploader.rdf.type
          )
            {
            step="edit";
        }else{
            console.debug("Falling back to JSON-Schema validation");
            step="validate-json";
        }
    }

    if(!hypha.api) hypha.init_imjoy();
    window.uploader = uploader;
    
</script>

<Toaster />
{#if step == "add"}
    <Add {uploader} on:done={handle_add} />
{:else if step == "edit"}
    <Edit {uploader} on:done={()=>{step="review"}} />
{:else if step == "validate-json"}
    <ValidateJson {uploader} on:done={()=>{step="review"}} />
{:else if step == "review"}
    <Review {uploader} {hypha} on:done={()=>{step="uploading"}} on:reset={()=>{reset();}}/>
{:else if step == "uploading"}
    <UploadStatus {uploader} on:done={()=>{step="add"}} />
<!--{:else if step == "done"}-->
    <!--<a href="/status/{uploader.resource_path.id}">Go to status page</a>-->
{:else}
    <Notification>
        Opps! something went wrong 😬
    </Notification>
{/if}

{#if uploader.rdf && (["add", "edit"].includes(step))}
    <ButtonWithConfirmation confirm={reset}>
        Clear model + start again
    </ButtonWithConfirmation>
{/if}
