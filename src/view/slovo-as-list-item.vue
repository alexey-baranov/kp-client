<template>
  <div :id="id" class="slovo-as-list-item card" >
    <template v-if="(localMode||mode)!='editor'">
      <div class="card-header d-flex flex-wrap kp-small">
        <kopnik-as-link :model="model.owner"></kopnik-as-link>
        <div>{{model.created}}</div>
        <button v-if="isEditorAllowed" class="btn btn-sm btn-secondary ml-auto" @click.prevent="edit_click">
          <span class="material-icons md-dark md-1em">edit</span>
          Править
        </button>
      </div>
      <div class="card-block">
        <div class="card-text">{{model.value}}</div>
      </div>
    </template>
    <template v-else>
      <div class="card-header d-flex kp-small">
        <kopnik-as-link :model="model.owner"></kopnik-as-link>
        <span>{{model.created}}</span>
      </div>
      <div class="card-block d-flex flex-column">
      <textarea class="form-control" v-model="model.value"
                placeholder="Ваше предложение, которое будет поставлено на голосование на копе"> </textarea>
        <div class="d-flex flex-wrap align-self-end mt-4">
          <button class="btn btn-danger mr-3" @click="cancel_click">Отменить</button>
          <button class="btn btn-success" @click="save_click">Сохранить</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  let models = require("../model")

  module.exports = {
    mixins:[logMixin],
    name:"slovo-as-list-item",
    data: function () {
      return {
        /**
         * установленный пользователем режим поверх props.mode
         */
        localMode: undefined,
      }
    },
    props: ["id", "model", "mode"],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue")
    },
    computed:{
      isEditorAllowed(){
          return this.model.owner==Application.getInstance().user
      }
    },
    methods: {
      async save_click(){
        await this.model.save()
        this.localMode = "viewer"
      },
      async cancel_click(){
        await this.model.reload()
        this.localMode = "viewer"
      },
      edit_click(){
        this.localMode = "editor"
      },
    },
    created: async function () {
      this.log = require("loglevel").getLogger("slovo-as-list-item.vue")
      if (this.model.id) {
        await this.model.joinedLoaded();
      }
    },
  }
</script>

<style scoped>
  .slovo-as-list-item {

  }
</style>
