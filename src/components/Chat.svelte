<script lang="ts">
    import { onMount } from 'svelte';

    import { functions } from '../lib/hypha';
    import { get_json, time_ago } from '../lib/utils';
    import { RESOURCE_URL } from '../lib/config';

    
    export let resource_id="";
    export let staged: boolean;
    export let version_number="";

    let chats=[];

    onMount(async () =>{
        get_chat();
    })
    let chat_message="";

    async function get_chat(){
        if(resource_id && version_number && get_json){
            //let new_chats = await get_chats(resource_id);
            let url = staged ? `${RESOURCE_URL}/${resource_id}/staged/${version_number}/chat.json` : `${RESOURCE_URL}/${resource_id}/${version_number}/chat.json`;
            const chat_json = await get_json(url);
            console.log(`CHAT - staged is ${staged}`);
            console.log(`URL: ${url}`);
            console.log(chat_json);
            chats = chat_json.messages || [];
        }

    }

    async function update_remote_chat(){
        if(!resource_id) return;
        if(!version_number) return;
        let text=chat_message;
        let version_string = staged ? `staged/${version_number}` : `${version_number}`;
        await functions.chat(resource_id, version_string, text);
        get_chat();
        chat_message = "";
    }
</script>

<h1>Chat</h1>
{#each chats as message}
    <div>
        <code title="{message.timestamp}">[{message.author} | {time_ago(message.timestamp)}]</code> : {message.text}
    </div>
{/each}
<form>
<input bind:value={chat_message} />
<button on:click={update_remote_chat}>Send</button>
</form>
