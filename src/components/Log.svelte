<script lang="ts">
    import { get_json } from '../lib/utils';
    import { RESOURCE_URL } from '../lib/config';

    import ErrorBox from './ErrorBox.svelte';

    export let resource_id="";
    export let staged: boolean;
    export let version_number = "";

    let last_message = "";
    let error = "";
    let timeout_id;
    let log = {}; // {_: string, Array<{}> } = {};
    let details = [];

    async function poll(){
        if(resource_id && version_number){ 
            try{
                log = await get_json(`${RESOURCE_URL}/${resource_id}/staged/${version_number}/log.json`);
                const details_json= await get_json(`${RESOURCE_URL}/${resource_id}/staged/${version_number}/details.json`);
                last_message = details_json.status.name;
                details = details_json.messages;
                error = "";
            }catch(err){
                //messages = ["Error polling status 😬. Please let the dev-team know 🙏"];
                last_message = "Error polling logs 😬. Please let the dev-team know 🙏";
                console.error("Error polling logs:");
                console.error(err);
                error = `😬 Opps - an error occurred while getting the log: ${err.message}`
                return;
            }

        }
        timeout_id = setTimeout(poll, 5000);
    }
    if(resource_id) poll();
</script>

<details>
<summary>Log</summary>
<ErrorBox title="Log" {error} />
{#each details as message}
<code>
    <span title="{message.timestamp}" >{message.text} </span><br>
</code>
{/each}
<details>
    {#each Object.entries(log) as [category, logs_messages]}
        {#each logs_messages as message}
            <code>{category}</code><span title="{message.timestamp}" >{message.log.name} {message.log.status}</span><br>
        {/each}
    {/each}
</details>
</details>
