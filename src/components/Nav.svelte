<script lang="ts">
    import LoginButton from './LoginButton.svelte';
    import { hypha_version } from '../stores/hypha';
    import { SANDBOX } from '../lib/config';
</script>
<style>
/* Desktop etc*/ 

/* Mobile */
    

</style>

<nav>
<!--<nav class="container-fluid">-->
    <ul>
        <li><strong>BioImage.IO {#if SANDBOX}SANDBOX{/if}</strong></li>
    </ul>
    <ul class="right-menu">
        {#if $hypha_version}
            <li><span style="font-family:monospace;">Hypha: {$hypha_version}</span></li>
        {/if}
        <li><a href="/uploader">Uploader</a></li>
        <li><a href="/status">Status</a></li>
        <li>
            <LoginButton />
        </li>
    </ul>
</nav>
