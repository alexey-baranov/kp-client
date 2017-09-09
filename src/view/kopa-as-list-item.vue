<template>
  <div :id="id" class="kopa-as-list-item card" >
      <div class="card-header d-flex flex-wrap kp-small">
        <kopnik-as-link v-if="model.owner" class="mr-1" target="_blank" :model="model.owner"></kopnik-as-link>
        <div>{{(model.invited || null) | humanize}}</div>
      </div>
      <div class="card-body">
        <div class="card-text text-pre" @click.prevent="question_click">{{model.question}}</div>
        <ul class="list-group">
          <li v-for="eachResult in model.result" v-if="eachResult.state>0" class="list-group-item border-0 mx-0 my-0 pb-0">
            <predlozhenie-as-internal-list-item :model="eachResult"></predlozhenie-as-internal-list-item>
          </li>
        </ul>
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
      "kopnik-as-link": require("./kopnik-as-link.vue"),
      "predlozhenie-as-internal-list-item": require("./predlozhenie-as-internal-list-item.vue")
    },
    methods: {
      async question_click(){
        Application.getInstance().goTo(this.model, true)
        await Promise.resolve()
        StateManager.getInstance().pushState()
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
      this.model.joinedLoaded()
      if (!this.model.result) this.model.joinedLoadResult()
    }
  }
</script>

<style scoped>
  .kopa-as-list-item {
    cursor: pointer;
  }
</style>
