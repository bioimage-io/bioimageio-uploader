<script lang="ts">
    import toast from 'svelte-french-toast';
    import { copy_to_clipboard } from '../lib/utils';
    export let error="";
    export let error_object: Error=null;
    export let title="";
    export let code=false;
    export let show_copy=true;

    console.log("Show copy:", show_copy);

    interface ErrorLog{
        text: string,
        message: string,
        stack: string,
        name: string,
        cause: unknown
    }

    function handle_click(){
        if(!show_copy) return;
        console.log("Copying error to clipboard")
        let error_log : ErrorLog = {
            text: error,
            message: "",
            stack: "",
            name: "",
            cause: ""
        };
        if(error_object){
            error_log.message = error_object.message,
            error_log.stack = error_object.stack,
            error_log.name = error_log.name,
            error_log.cause = error_object.cause
        }
        const error_log_string = JSON.stringify(error_log);

        if(copy_to_clipboard(error_log_string)){
            toast.success("Copied error to clipboard");
        }else{
            toast.error("Clipboard unavailable");
        }
    }
</script>
{#if error}
    <h4>{title + ' ' || ''}Error</h4>

    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <article data-placement="bottom" on:click={handle_click}>
        <slot name="preamble">
            <p>Oops! Something went wrong 😟</p>
            <p>Please review the error, and try again. If the issue persists, please contact support</p>
        </slot>
        {#if code}
            <pre>
                {error}
            </pre>
        {:else}
            {error}
        {/if}
        {#if show_copy}
            <p>Click this box to copy the error message to your clipboard</p>
        {/if}
    </article>
{/if}
