<script lang="ts">
    import Modal    from '../Modal.svelte';
    import Notification from './Notification.svelte';
    import { Uploader } from '../../lib/uploader';
    export let uploader : Uploader;
    let show_modal = false;
    let agree_email = false;



    if (uploader !== null) {
        if(!uploader.token){
            show_modal = true;
        }
        uploader.show_login_window = (url) => {
            console.debug(url);
            show_modal = true;
        }
    }
</script>

{#key uploader.token}
{#if !uploader.token}
    <Notification deletable={false} >
    {#if uploader.login_url}
        <!--<button on:click={()=>{uploader.init();}}>Login to BioEngine</button>-->
        <Modal show={show_modal}   >
            <h1>Login</h1>
            <p>
                <input bind:checked={agree_email} type="checkbox" />
                I agree that the email address I use to login will be <br> 
                added to my upload and published as the "uploader" field 
            </p>

            {#if agree_email}
            <iframe title="Login" src="{uploader.login_url}" width="400" height="400"></iframe>
            {/if}
        </Modal>
    {/if}
    </Notification>
{:else if !uploader.server}
    <Notification>
    <span aria-busy="true">Initializing login</span>
    </Notification>
{/if}
{/key}
