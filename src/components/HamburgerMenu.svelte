<script lang="ts">
    import LoginButton from './LoginButton.svelte';
    import Menu from 'lucide-svelte/icons/menu';
    import X from 'lucide-svelte/icons/x';
    export let hypha_version;
    let show=false;
</script>
<style>
article{
  direction: rtl;
}
nav{
  text-align: center;
}
button{
}
</style>
<dialog open={show}>
    <article>
        
        <button on:click={()=>{show=false;}}><X /></button>
        
        <aside> 
            <nav>
                <ul>
                    {#if $hypha_version}
                        <li><span style="font-family:monospace;">Hypha: {$hypha_version}</span></li>
                    {/if}
                    <li><a href="/uploader" style="color: white;">New Upload</a></li>
                    <li><a href="/status" style="color: white;">Overview</a></li>
                    <li><LoginButton /></li>      
                </ul>
            </nav>
        </aside>
    </article>
</dialog>

  
{#if !show}
  <button on:click={()=>{show = true;}}>
  <Menu  />
  </button>
{/if}
