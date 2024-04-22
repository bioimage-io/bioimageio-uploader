<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import FullScreenConfetti from './FullScreenConfetti.svelte';
    import Log from './Log.svelte';
    import ErrorBox from './ErrorBox.svelte';
    import { is_string, get_json } from '../lib/utils';
    import { RESOURCE_URL } from '../lib/config';
    import user_state from "../stores/user";

    import Chat from './Chat.svelte';
    import Review from './Review.svelte';

    export let resource_id="";
    export let version=""; 

    let step = 0;
    let messages = [];
    let last_message = "Getting status...";
    let num_steps: "";
    let error = null;
    let error_object: Error;
    //let error;
    //let error_element;
    //let last_error_object;
    let is_finished = false;
    let value='0';
    let max='0';
    let timeout_id : ReturnType<typeof setTimeout>;

    let is_reviewer: boolean;
    let is_logged_in: boolean;

    let versions;
    let details;

    user_state.subscribe((user) => {
        is_logged_in = user.is_logged_in;
        is_reviewer = user.is_reviewer;
    });

    onMount(async() => {
        //if(hypha !== null){

            //await hypha.login(); 
            //reviewer = hypha.is_reviewer();
            //logged_in = hypha.is_logged_in();
                
            //console.log("Logged in :", logged_in);
        //} 
    });
    ///
    /// Clear timeout when navigating away from this page
    /// 
    onDestroy(()=>{
        clearTimeout(timeout_id);
    });

    async function poll_status(){
        await get_status();
        if(!is_finished) timeout_id = setTimeout(get_status, 5000, true);
    }

    async function get_status(): Promise<boolean>{
        if(!resource_id) return;
        if(!version) return;
         
        try{
            details = await get_json(`${RESOURCE_URL}/${resource_id}/${version}/details.json`);
            last_message = details.status.name;
            messages = details.messages;
            if((!Array.isArray(messages)) || (!is_string(last_message))){
                console.debug(details);
                throw new Error("Unable to get status messages from server response");
            }
            step = details.status.step;
            num_steps = details.status.num_steps;
            error = "";
        }catch(err){
            last_message = "Error getting status 😬. Please let the dev-team know 🙏";
            messages = [];
            console.error("Error polling status:");
            console.error(err);
            error_object = err;
            error = "Error polling status. Please let the dev-team know";
            return;
        }
        is_finished = last_message.startsWith("Publishing complete");
        if(step > 0){
            //value = `{status_step}`; 
            value = `${step}`; 
            max = `${num_steps}`; 
        }
    }
</script>

{#if !is_logged_in}
    <button>Login to access Reviewer tools</button>
{/if}

<h2>Resource <code>{resource_id}/{version}</code></h2>

<ErrorBox {error} {error_object} />

<Chat {resource_id} {version}/> 
{#if is_reviewer}
    <!--Review {resource_id} {version}/--> 
{/if}
