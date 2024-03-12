<script lang="ts">
    import Hypha from '../lib/hypha.ts';
    import { update_chat } from "../lib/chat.ts";
    export let resource_id="";
    export let hypha: Hypha; 

    async function update_status(){
        if(!resource_id) return;
        //let text=chat_message;
        //const resp = await update_chat(resource_id, text);
        //chat_message = "";
    }
</script>

<strong>Review Area</strong>
<button>Request Changes</button>
<button>Accept</button>


