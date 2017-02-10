<template>
  <div :id="id" class="kopa-as-list-item card" >
      <div class="card-header d-flex flex-wrap kp-small">
        <kopnik-as-link v-if="model.owner" class="mr-1" target="_blank" :model="model.owner"></kopnik-as-link>
        <div>{{(model.invited || null) | humanize}}</div>
      </div>
      <div class="card-block">
        <div class="card-text">{{model.question}}</div>
      </div>
  </div>
</template>

<script>
  import $ from "jquery"
  import Application from "../Application"

  let RemoteModel = require("../model/RemoteModel");
  const log = require("loglevel").getLogger("kopa-as-list-item.vue")
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
    mixins:[/*logMixin, */require("./mixin/humanize")],
    name:"kopa-as-list-item",
    props: ["id", "model"],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue")
    },
    methods: {
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
      if (this.model.id) {
        this.model.joinedLoaded();
      }
    }
  }
</script>

<style scoped>
  .kopa-as-list-item {
    cursor: pointer;
  }
</style>
