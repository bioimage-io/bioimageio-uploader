<script lang="ts">
    import { onMount } from 'svelte';
    //import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
    import { auth, functions } from "../lib/hypha";
    import user_state from "../stores/user";
    import {login_url, token} from '../stores/hypha'; 
    import type UserInfo from "../lib/user_info";
    import { CircleUserRound } from 'lucide-svelte'
    import toast  from 'svelte-french-toast';

    export let show = false;
    export let user = null;
    export let auth_offline=false;

    onMount(async () => {
        auth.onAuthStateChanged((new_user: UserInfo) => {
            user_state.set({
                is_logged_in: new_user !== null,
                user_info: new_user,
            });
            console.log("Auth state changed, user (in Login element) is");
            console.log(new_user);
            user = new_user;
            show=false;
        });

        try{
            const details = await functions.check_hypha();
            console.log(`Hypha responded: ${JSON.stringify(details)}`);
            toast.success("Login available"); 
        }catch{
            toast.error("Login not available!");
            auth_offline = true;
        }

    })
    
    login_url.subscribe((url) => {
        if(!url) return 
        console.log("Doing stuff with login url...")
        show = true;
    });

    async function handleSignout(){
        auth.signOut(); 
        show=false;
    }

</script> 
<style>
iframe{      
    display: block;  /* iframes are inline by default */   
    height: 100vh;  /* Set height to 100% of the viewport height */   
    width: 100%;  /* Set width to 100% of the viewport width */     
    border: none; /* Remove default border */
}
</style>

{#if auth_offline}
    <span title="Authentication system is offline">Login Temporarily<br>Unavailable</span>
{:else}
    {#if user === null}
        <button on:click={()=>{auth.login();}}>
            Login
        </button>
    {:else}
        <button on:click={()=>{show=true;}}>{user.email}</button>
    {/if}
{/if}


<dialog open={show}>
    <article>
        {#if user === null && $login_url} 
            <iframe title="Login" src="{$login_url}"></iframe>
        {:else}
            <button on:click={handleSignout}>Logout</button>
        {/if}
    </article>
</dialog>
