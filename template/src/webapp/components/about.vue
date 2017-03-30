<template>

  <section>
    <h1>About</h1>
    <p>
      <b>version: {{version}}</b>
    </p>
  </section>

</template>


<script>

  import { IState } from '../store'
  import { mapState } from 'vuex'

  export default {

    computed: mapState({
      version: (state: IState) => state.version
    }),

    mounted() {
      this.$store.dispatch('refresh');
    }

  }

</script>
