<script charset="utf-8">
    export let value;
    export let placeholder;
    export let maxlength;

</script>
<input {placeholder} bind:value {maxlength} {...$$restProps}/> 
