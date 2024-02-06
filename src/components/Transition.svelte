<script>
    import {router} from 'tinro';
    import {fade} from 'svelte/transition';
</script>

{#key $router.path}
    <main class="container" in:fade="{{ duration: 700 }}">
        <slot></slot>
    </main>
{/key}
