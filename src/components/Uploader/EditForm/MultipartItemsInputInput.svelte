<script charset="utf-8">
    export let placeholder = "";
    export let value = "";
    export let type = "text";  
    export let props = {};

    const handleInput = e => {
        // in here, you can switch on type and implement
        // whatever behaviour you need
        value = type.match(/^(number|range)$/)
            ? +e.target.value
            : e.target.value;
    };
</script>
<input {type} {value} {placeholder} on:input={handleInput} {...props}/>
