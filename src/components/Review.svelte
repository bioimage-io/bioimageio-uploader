<script lang="ts">
    import Hypha from '../lib/hypha.ts';
    import { get_chats, update_chat } from "../lib/chat.ts";
    export let resource_id="";
    export let hypha: Hypha; 

    let chats=[];

    if(resource_id){
        let new_chats = get_chats(resource_id);
        console.log(new_chats);
    }
    let chat_message="";

    async function update_remote_chat(){
        if(!resource_id) return;
        let text=chat_message;
        const resp = await update_chat(resource_id, text);

        // chats.push({time: new Date().toString(), text, user: hypha.user_email});
        //chats = chats;
        chat_message = "";
    }
</script>

<h1>Review</h1>
{#each chats as message}
    <div>
        <code title="{message.time}">[{message.user}]</code> : {message.text}
    </div>
{/each}
<form>
<input bind:value={chat_message} />
<button on:click={update_remote_chat}>Send</button>
</form>
<button>Request Changes</button>
<button>Accept</button>


