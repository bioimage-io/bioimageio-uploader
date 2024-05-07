<script lang="ts">
    import LoginButton from './LoginButton.svelte';
    import { hypha_version } from '../stores/hypha';
    import { SANDBOX } from '../lib/config';
    import HamburgerMenu  from './HamburgerMenu.svelte';
</script>
<style>
/* Desktop etc*/ 
@media only screen and (min-width: 600px){
    .right-menu.hamburger{
        display: none;
    }
}


/* Mobile */
@media only screen and (max-width: 600px) {
    .right-menu.horizontal{
        display: none;
    }
}    

</style>

<nav>
<!--<nav class="container-fluid">-->
    <ul>
        <li><strong>BioImage.IO {#if SANDBOX}SANDBOX{/if}</strong></li>
    </ul>
    <ul class="right-menu horizontal">
        {#if $hypha_version}
            <li><span style="font-family:monospace;">Hypha: {$hypha_version}</span></li>
        {/if}
        <li><a href="/uploader">New Upload</a></li>
        <li><a href="/status">Overview</a></li>
        <li>
            <LoginButton />
        </li>
    </ul>
    <ul class="right-menu hamburger">
        <HamburgerMenu {hypha_version}/>
    </ul>
</nav>
