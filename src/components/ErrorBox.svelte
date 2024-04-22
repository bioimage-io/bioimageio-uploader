<script lang="ts">
    import toast from 'svelte-french-toast';
    export let error="";
    export let error_object: Error=null;
    export let title="";
    export let code=false;

    interface ErrorLog{
        text: string,
        message: string,
        stack: string,
        name: string,
        cause: unknown
    }

    function copy_error_to_clipboard(){
        // Copy the text inside the text field
        console.log("Copying error to clipboard")

        if(navigator){
            if(navigator.clipboard){
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
                navigator.clipboard.writeText(JSON.stringify(error_log));
                toast.success("Copied error to clipboard");
                return
            }
        }
        console.error("Clipboard unavailable");
        toast.error("Clipboard unavailable");
    }
</script>
{#if error}
    <h4>{title} Error</h4>

    <!-- svelte-ignore a11y-no-noninteractive-element-interactions a11y-click-events-have-key-events -->
    <article data-placement="bottom" on:click={()=>{copy_error_to_clipboard()}}>
        <p>Oops! Something went wrong 😟</p>
        <p>Please review the error, and try again. If the issue persists, please contact support</p>
        {#if code}
            <pre>
                {error}
            </pre>
        {:else}
            {error}
        {/if}
        <p>Click this box to copy the error message to your clipboard</p>
    </article>
{/if}
