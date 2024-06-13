<script lang="ts">
    import { onMount } from 'svelte';

    import SingleLineInputs from './SingleLineInputs.svelte';
    import ErrorBox from './ErrorBox.svelte';
    import { functions } from '../lib/hypha';
    import { get_json, time_ago } from '../lib/utils';
    import { RESOURCE_URL } from '../lib/config';

    
    export let resource_id="";
    // export let staged: boolean;

    let chats:any = [];
    let error = ""

    onMount(async () =>{
        await get_chat();
    })
    let chat_message="";

    async function get_chat(){
        if(!resource_id){
            error = "Resource ID missing";
            return;
        }

        //let new_chats = await get_chats(resource_id);
        try{
            // let url = staged ? `${RESOURCE_URL}/${resource_id}/staged/${version_number}/chat.json` : `${RESOURCE_URL}/${resource_id}/${version_number}/chat.json`;
            let url = `${RESOURCE_URL}/${resource_id}/draft/chat.json`;
            const chat_json = await get_json(url);
            console.log(`URL: ${url}`);
            console.log(chat_json);
            chats = chat_json.messages || [];
        }catch(err){
            if(err.message.startsWith("Not found:")){
                chats = [];
            }
            else{
                error = err.message;
            }
        }
    }

    async function update_remote_chat(){
        if(!resource_id) return;
        let text=chat_message;
        // let version_string = staged ? `staged/${version_number}` : `${version_number}`;
        await functions.chat(resource_id, "draft", text);
        await get_chat()
        chat_message = "";
    }
</script>

<h1>Chat</h1>
<ErrorBox title="Chat" error={error} show_copy={false}>
    <span slot="preamble" />
</ErrorBox>
{#each chats as message}
    <div>
        <code title="{message.timestamp}">[{message.author} | {time_ago(message.timestamp)}]</code> : {message.text}
    </div>
{/each}
<form on:submit|preventDefault={update_remote_chat}>
<SingleLineInputs>
<input bind:value={chat_message} />
<button style="white-space:nowrap;margin-bottom:var(--pico-spacing);">Send</button>
</SingleLineInputs>
</form>
