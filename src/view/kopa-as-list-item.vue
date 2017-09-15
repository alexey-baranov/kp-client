<template>
  <mu-card>
    <mu-card-header class="d-flex justify-content-between">
      <sign v-if="model.owner" :owner="model.owner" :date="model.invited"/>
    </mu-card-header>
    <mu-card-text class="kp-no-font-size">
      <a :href="`?body=Kopa:${model.id}`" class="kp-no-color"" @click="question_click">
      <div class="text-pre ">{{model.question}}</div>
      </a>
      <template v-for="eachResult in model.result">
        <predlozhenie-as-internal-list-item v-if="eachResult.state>0"
                                            :model="eachResult"></predlozhenie-as-internal-list-item>
      </template>
    </mu-card-text>
  </mu-card>
</template>

<script>
  import $ from "jquery"
  import Application from "../Application"

  let RemoteModel = require("../model/RemoteModel");
  const log = require("loglevel").getLogger("kopa-as-list-item.vue")
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
    mixins: [/*logMixin, */require("./mixin/humanize")],
    name: "kopa-as-list-item",
    props: ["id", "model"],
    components: {
      "sign": require("./sign.vue"),
      "predlozhenie-as-internal-list-item": require("./predlozhenie-as-internal-list-item.vue")
    },
    methods: {
      async question_click(e){
        e.preventDefault()
        Application.getInstance().goTo(this.model, true)
        await Promise.resolve()
        StateManager.getInstance().pushState()
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
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
