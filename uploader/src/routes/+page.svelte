<script>
    import Steps    from '../components/Steps.svelte';
    // import {Steps}  from 'svelte-steps';
    import Start    from '../components/Start.svelte';
    import Edit     from '../components/Edit.svelte';
    import Review   from '../components/Review.svelte';
    import Publish  from '../components/Publish.svelte';

    // let current_step = 0;
    let components = [
        {name: "Start", _component: Start},
        {name: "Edit", _component: Edit},
        {name: "Review", _component: Review},
        {name: "Publish", _component: Publish},
    ];
    let current = 0;
    let max_step = 0;
    let steps = [
        { text: 'Start'},
        { text: 'Edit'},
        { text: 'Review'},
        { text: 'Publish'},
    ]
    function next(){
        current = current + 1;
        max_step = Math.max(max_step, current);
        console.log("Max step is now " + max_step);
    }

</script>

<!--Steps 
    {steps} 
    current={current_step}
    clickable={false}
    on:click={(e) => {
        console.log("clicked me");
        // if(max_step >= e.detail.current){
        //     current_step = e.detail.current;
        // }else{
        //     current_step = e.detail.last;
        //     e.preventDefault();
        // }
    }}

/-->

<Steps bind:current={current} {max_step} {steps}/>

<svelte:component this={components[current]._component} on:done={next}/>
