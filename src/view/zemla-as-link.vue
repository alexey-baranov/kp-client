<template>
  <a :href="'/zemla/'+model.id" class="zemla-as-link" @click.prevent="a_click">{{model.name}}</a>
</template>

<script>
  import Application from "../Application"
  import StateManager from "../StateManager"
  const log = require("loglevel").getLogger("zemla-as-link.vue")

  export default  {
    props: ["id", "model"],
    methods: {
      a_click: function (e) {
        Application.getInstance().goTo(this.model)
        StateManager.getInstance().pushState()
      }
    },
    created: function () {
      this.model.joinedLoaded();
    },
  }
</script>

<style scoped>
</style>
