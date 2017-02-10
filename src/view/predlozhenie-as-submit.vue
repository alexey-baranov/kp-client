<template>
  <div :id="id" class="predlozhenie-as-submit card" :class="{'predlozhenie-as-submit--empty': !model.value}">
    <div class="card-block">
            <textarea class="form-control" v-model="model.value"
                      placeholder="Ваше предложение, которое будет поставлено на голосование на этой копе"  @keyup.ctrl.enter="submit_click"> </textarea>
      <button class="btn btn-block btn-primary mt-2" @click="submit_click">Предложить на голосование</button>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  let models = require("../model")

  module.exports = {
//    mixins:[logMixin],
    name:"predlozhenie-as-submit",
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
      await this.model.place.place.joinedLoaded();
    },
  }
</script>

<style scoped>
  .predlozhenie-as-submit textarea {
    height: 6em;
  }

  .predlozhenie-as-submit--empty textarea {
    height: 2em;
  }

  .predlozhenie-as-submit--empty button {
    display: none;
  }
</style>
