<template>
  <mu-card>
    <sign v-if="model.owner" class="p-3" :owner="model.owner" :date="model.invited"/>
    <!--mu-card-text пришлось забраковать потому что он устававливает малый шрифт
    а font-size= inherit на сотике через раз не срабатывает
    -->
    <div class="p-3">
      <a :href="`?body=Kopa:${model.id}`" class="kp-no-color d-block text-pre" @click="question_click">{{model.question}}</a>
    </div>
    <div v-if="model.result && model.result.length" class="p-3 kp-font-size-smaller">
      <predlozhenie-as-internal-list-item v-for="eachResult in model.result" v-if="eachResult.state>0"
                                          :model="eachResult"/>
    </div>
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
