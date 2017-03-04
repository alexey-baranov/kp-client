<template>
  <div :id="id" class="predlozhenie-as-internal-list-item card">
    <div v-if="false" class="card-header d-flex kp-small">
      <kopnik-as-link v-if="model.owner" class="mr-1" target="_blank" :model="model.owner"></kopnik-as-link>
      <span>{{model.created|humanize}}</span>
    </div>

    <div class="card-block d-flex flex-column">
      <div class="card-text text-pre">{{model.value}}</div>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  let models = require("../model")

  export default {
//    mixins:[logMixin],
    mixins: [require("./mixin/humanize"), /*require("./mixin/log")*/],
    name: "predlozhenie-as-list-item",
    data() {
      return {}
    },
    props: ["id", "model"],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue")
    },
    computed: {},
    methods: {},
    created: async function () {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      await this.model.joinedLoaded();
    },
  }
</script>

<style scoped>
  .predlozhenie-as-internal-list-item {

  }
</style>
