<script lang="ts">
    import { onDestroy } from 'svelte';
    import { get_json } from '../lib/utils';
    import { RESOURCE_URL } from '../lib/config';
    import github from '../../static/github.svg';
    import ErrorBox from './ErrorBox.svelte';

    export let resource_id="";
    function toTitleCase(str) {
        return str.replace(/_/g, ' ').replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    
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
        if(resource_id){ 
            try{
                log = await get_json(`${RESOURCE_URL}/${resource_id}/draft/log.json`);
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


<ErrorBox title="Log" {error} {error_object} />
{#each details as message}
<code>
    <span title="{message.timestamp}" >{message.text} </span><br>
</code>
{/each}

{#if log.entries}
<h2>Log</h2>
{#each log.entries as message}
<ul>

    <li>
        <p>
            <span title="{message.timestamp}" >
                <code>{message.timestamp}</code> {message.message || ""}
                {#if message.details && message.details.status === 'passed'}
                <span>✔️</span>
                {:else}
                    <span>❌</span>
                {/if}
                {#if message.run_url}
                <a href={message.run_url} target="_blank"><img src="{github}" alt="github icon"> Github CI</a>
                {/if}
            </span>
        </p>
        {#if message.details_formatted}
            <details>
                <summary>Formatted Details</summary>
                <pre>{message.details_formatted}</pre>
            </details>
        {/if}
        {#if message.details}
            
            <details>
                <code>{message.timestamp}</code>
                <pre>{JSON.stringify(message.details, null, "\t")}</pre>
            </details>
            
        {/if}
    </li>

</ul>
{/each}
{/if}
