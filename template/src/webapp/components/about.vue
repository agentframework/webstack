<template>

  <section>
    <h1>About</h1>
    <p>
      <b>version: <span v-html="version"></span></b>
    </p>
  </section>

</template>


<script lang="ts">

  export default {

    mounted() {
      this.$store.dispatch('refresh');
    }

  }

</script>
