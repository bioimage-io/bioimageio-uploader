<script lang="ts">
    import { onMount } from 'svelte';
    //import { getAuth, signInWithPopup, signOut, GoogleAuthProvider, GithubAuthProvider, signInWithEmailAndPassword } from 'firebase/auth';
    import Hypha from "../lib/hypha";
    import user_state from "../stores/user";
    import { CircleUserRound } from 'lucide-svelte'
    export let show = false;
    export let user = null;


    function login(){
    }


    onMount(async () => {
        console.log(auth);
        auth.onAuthStateChanged((new_user) => {
            user_state.set({
                is_logged_in: new_user !== null,
                user_info: new_user,
                firebase_controlled: true,
            });
            console.log("Auth state changed, user (in Login element) is");
            console.log(new_user);
            user = new_user;
            //if(new_user !== null) show=false;
            show=false;
        });

    })

    async function handleSignout(){
        await signOut(auth); 
        user_state.set(null);
        show=false;
    }

</script> 


<details class="dropdown">
    <summary>
        {#if user === null}
        <span>
            Login
        </span>
        {:else}
            <span>{user.displayName }</span>
        {/if}
    </summary>
    <ul dir="rtl">
        {#if user === null}
            <li><a on:click={()=>{login("google")}}>Google</a></li>
            <li><a on:click={()=>{login("github")}}>Github</a></li>
            <li><a on:click={()=>{login("username")}}>Username + Password</a></li>
        {:else}
            <li><button on:click={handleSignout}>Logout</button></li>
        {/if}
    </ul>
</details>


<dialog open={show}>
    <article>
        {#if user === null} 
            <header>Login using one of the following providers</header>
            <div id="providers" >
            </div>
        {:else}
            <button on:click={handleSignout}>Logout</button>
        {/if}
    </article>
</dialog>
