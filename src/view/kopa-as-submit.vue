<template>
  <div :id="id" class="kopa-as-submit card" :class="{'kopa-as-submit--empty': !model.question}">
    <div class="card-block">
            <textarea class="form-control" v-model="model.question"
                      placeholder="Вопрос, по которому вы хотите созвать копу" @keyup.ctrl.enter="submit_click"> </textarea>
      <button class="btn btn-block btn-primary mt-2" @click="submit_click">Созвать копу...</button>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  let models = require("../model")

  module.exports = {
//    mixins:[logMixin],
    name:"kopa-as-submit",
    props: ["id", "model"],
    methods: {
        submit_click(){
            this.$emit("submit", this)
        }
    },
    components: {
    },
    created: async function () {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")

      await this.model.place.joinedLoaded();
    },
  }
</script>

<style scoped>
  .kopa-as-submit textarea {
    height: 6em;
  }

  .kopa-as-submit--empty textarea {
    height: 2em;
  }

  .kopa-as-submit--empty button {
    display: none;
  }
</style>
