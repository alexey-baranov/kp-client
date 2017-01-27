<template>
  <a :href="'/zemla/'+model.id" class="zemla-as-link" @click="a_click">{{model.name}}</a>
</template>

<script>
  import Application from "../Application"
  const log = require("loglevel").getLogger("zemla-as-link.vue")

  export default  {
    props: ["id", "model"],
    methods: {
      a_click: function (e) {
        Application.getInstance().setBody(this.model)
        e.preventDefault()
      }
    },
    created: function () {
      this.model.loaded();
    },
  }
</script>

<style scoped>
</style>
