<script lang="ts">
    import Modal    from './Modal.svelte';
    import Notification from './Notification.svelte';
    import Hypha from '../lib/hypha';
    export let hypha : Hypha;
    export let modal = true;
    let show_login = false;
    let agree_email = false;


    if (hypha !== null) {
        hypha.show_login_window = (url) => {
            console.debug(url);
            show_login = true;
        }
    }

</script>

{#key hypha.token}
{#key hypha.server}
{#if !hypha.token}
    <Notification deletable={false} >
    {#if hypha.login_url}
        <!--<button on:click={()=>{uploader.init();}}>Login to BioEngine</button>-->
        {#if modal} 
            <Modal show={show_login}   >
                <h1>Login</h1>
                <p>
                    <input bind:checked={agree_email} type="checkbox" />
                    I agree that the email address I use to login will be <br> 
                    added to my upload and published as the "uploader" field 
                </p>

                {#if agree_email}
                    <iframe title="Login" src="{hypha.login_url}" width="400" height="400"></iframe>
                {/if}
            </Modal>
        {:else}
            <h1>Login</h1>
            <p>
                <input bind:checked={agree_email} type="checkbox" />
                I agree that the email address I use to login will be <br> 
                added to my upload and published as the "uploader" field 
            </p>
            {#if agree_email}
                <iframe title="Login" src="{hypha.login_url}" width="400" height="400"></iframe>
            {/if}
        {/if}
    {/if}
    </Notification>
{:else if !hypha.server}
    <Notification>
    <span aria-busy="true">Initializing login</span>
    </Notification>
{:else}
    {hypha.token}
{/if}
{/key}
{/key}
