<script>
    import Input from './Input.svelte';
    export let authors =[];
    export let error;
    export let affiliation=false;
    export let orcid=false;
    export let email=false;
    export let github=false;

    function delete_author_at_index(index){
        authors.splice(index, 1);
        authors = authors;
    }
</script>

<div class="field">
    <div class="field is-grouped has-addons">
    {#each authors as author, index}   
        <Input
            type="text"
            placeholder="Full Name (required)"
            bind:value={author.name}
            maxlength="1000"
            />
        {#if affiliation}
        <Input
            type="text"
            placeholder="Affiliation (optional)"
            bind:value={author.affiliation}
            maxlength="100"
            />
        {/if}
        {#if orcid}
        <Input
            type="text"
            placeholder="ORCID (optional)"
            bind:value={author.orchid}
            maxlength="100"
            />
        {/if}
        {#if email}
            <p class="control">    
            <Input
                type="text"
                placeholder="Email (optional)"
                bind:value={author.email}
                maxlength="100"
                />
            </p>     
        {/if}
        {#if github}
            <p class="control">    
            <Input
                type="text"
                placeholder="Github username (required)"
                bind:value={author.github_user}
                maxlength="100"
                />
            </p>
        {/if}
        <p class="control">
        <button 
            class="button is-danger" 
            on:click={()=> delete_author_at_index(index)}></button>
           <i class="fa fa-trash"></i>
        </p>
    {/each}
    </div>

    <br>
    <button 
        class="button is-success" 
        on:click={()=> {authors = [...authors, {}]}}>Add</button>

<!--
    <div class="control">
      <div v-for="(author, i) in value" :key="i">
        <b-field>
          <b-input
            @input="commitValue"
            type="text"
            placeholder="Full Name (required)"
            v-model="author.name"
            maxlength="1000"
          >
          </b-input>
          <b-input
            @input="commitValue"
            type="text"
            v-if="item.options.includes('affiliation')"
            placeholder="Affiliation (optional)"
            v-model="author.affiliation"
            maxlength="100"
          >
          </b-input>
          <b-input
            @input="commitValue"
            type="text"
            v-if="item.options.includes('orcid')"
            placeholder="ORCID (optional)"
            v-model="author.orcid"
            maxlength="1000"
          >
          </b-input>
          <b-input
            @input="commitValue"
            type="text"
            v-if="item.options.includes('github_user')"
            placeholder="Github User (required)"
            v-model="author.github_user"
            maxlength="100"
          >
          </b-input>
          <b-input
            @input="commitValue"
            type="text"
            v-if="item.options.includes('email')"
            placeholder="Email (optional)"
            v-model="author.email"
            maxlength="1000"
          >
          </b-input>

          <b-button
            v-if="value.length > 1"
            style="text-transform:none;"
            class="button"
            icon-left="delete"
            @click="removeAuthor(author)"
          ></b-button>
          <b-button
            v-if="
              i === value.length - 1 && !(!author.name || author.name === '')
            "
            style="text-transform:none;"
            class="button"
            icon-left="plus"
            @click="addNewAuthor"
          ></b-button>
        </b-field>
      </div>
-->      
    {#if error }
        <p class="help is-danger">{error }</p>
    {/if}
</div>
