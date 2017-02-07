<template>
  <div :id="id" class="kopa-as-list-item card" >
      <div class="card-header d-flex flex-wrap kp-small">
        <kopnik-as-link :model="model.owner"></kopnik-as-link>
        <div>{{model.invited || null}}</div>
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
  import StateManager from "../StateManager"

  export default  {
    props: ["id", "model"],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue")
    },
    methods: {
    },
    created: function () {
      if (this.model.id) {
        this.model.loaded();
      }
    }
  }
</script>

<style scoped>
  .kopa-as-list-item {
    cursor: pointer;
  }
</style>
