<template>
  <div class="application-side-panel">
    <zemla-as-link v-for="eachKopnikDom of kopnikDoma" :model="eachKopnikDom"></zemla-as-link>
  </div>
</template>

<script>
  let log = require("loglevel").getLogger("application-side-panel.vue")

  module.exports = {
    data: function () {
      return {
        kopnikDoma: []
      };
    },
    props: ["id", "application"],
    components: {
      "zemla-as-link": require("./zemla-as-link.vue")
    },
    created: async function () {
      await this.application.user.loaded();
      for (let eachDom = this.application.user.dom; eachDom; eachDom = eachDom.parent) {
        await eachDom.loaded()
        this.kopnikDoma.unshift(eachDom)
      }
    }
  }
</script>

<style scoped>
  .application-side-panel .zemla-as-link {
    display: block;
  }
</style>
