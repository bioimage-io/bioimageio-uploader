<script charset="utf-8">
    export let label;
    export let required=false;
</script>

<style type="text/css" media="screen">
    label{
        display: inline;
    }
    .help{
        font-size: small;
        font-style: italic;
        font-weight: normal;
    }
</style>

<span>
    <label>
    {label}
    {#if $$slots.help}<span class="help"><slot name="help"/></span>{/if}
    {#if required}
        <small><sup>*</sup></small>
    {/if}
    <slot/>
    </label>
</span>
