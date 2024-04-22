<script lang="ts">
    import ErrorBox from './ErrorBox.svelte';
    import SingleLineInputs from './SingleLineInputs.svelte';
    import { functions } from '../lib/hypha';
    export let resource_id="";
    export let version="";

    let error="";
    let text_input="";
    let error_object :Error;
        
    function accept(){return review("publish");};
    function request_changes(){return review("requestchanges");}

    async function review(action: string){
        if(!resource_id){
            error = "Resource ID must be set";
            return 
        }
        if(!version){
            error = "Version must be set";
            return
        }
        const message = text_input;
        text_input = "";
        console.log(`Requesting review of ${resource_id}/${version} - ${action} - ${message}`);
        try{
            const resp = await functions.review(resource_id, version, action, message);
            console.log("Review request response:", resp);
            if(!resp.success){
                error = (resp.error || []).join('\n');
            }
        }catch(err){
            error= `Review action failed: ${err.message}`;
            error_object = err;
            console.error(err);
        }   
    }

</script>

<strong>Review Area</strong>
<ErrorBox title="Review" {error} {error_object} code={true} />
<form on:submit|preventDefault={() => {request_changes();}}>
<SingleLineInputs>
<input bind:value={text_input} placeholder="Message for request changes" /> 
<button>Request Changes</button>
</SingleLineInputs>
</form>
<button on:click={()=>{accept()}}>Accept</button>
