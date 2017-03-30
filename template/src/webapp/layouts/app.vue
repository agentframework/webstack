<template>

  <section class="layout-column">
    <div class="layout-column">
      <h1>Menu</h1>
      <p class="layout-row">
        <router-link to="/welcome" class="menu-item">Welcome</router-link>
        <router-link to="/about" class="menu-item">About</router-link>
      </p>
    </div>
    <div class="flex layout-column">
      <router-view></router-view>
    </div>
  </section>

</template>

<style>

  .menu-item {
    padding-right: 16px;
  }

</style>
<style src="../assets/layout.css"></style>
<style src="../assets/typo.css"></style>
