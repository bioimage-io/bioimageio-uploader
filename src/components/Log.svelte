<script lang="ts">
    import { onDestroy } from 'svelte';
    import { get_json } from '../lib/utils';
    import { RESOURCE_URL } from '../lib/config';

    import ErrorBox from './ErrorBox.svelte';

    export let resource_id="";
    export let version = "";

    let error = "";
    let error_object: Error;
    let timeout_id : ReturnType<typeof setTimeout>;
    let log = {}; // {_: string, Array<{}> } = {};
    let details = [];

    ///
    /// Clear timeout when navigating away from this page
    /// 
    onDestroy(()=>{
        clearTimeout(timeout_id);
    });

    async function poll(){
        if(resource_id && version){ 
            try{
                log = await get_json(`${RESOURCE_URL}/${resource_id}/${version}/log.json`);
                // console.debug(log);
                error = "";
            }catch(err){
                console.error("Error polling logs:");
                console.error(err);
                error = `😬 Opps - an error occurred while getting the log: ${err.message}`
                error_object = err;
                return;
            }

        }
        timeout_id = setTimeout(poll, 5000);
    }
    if(resource_id) poll();
</script>

<details>
<summary>Log</summary>
<ErrorBox title="Log" {error} {error_object} />
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
