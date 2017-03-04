<template>
  <div :id="id" class="slovo-as-list-item card" >
    <template v-if="userMode !='editor'">
      <div class="card-header d-flex flex-wrap kp-small">
        <kopnik-as-link v-if="model.owner" class="mr-1" target="_blank" :model="model.owner"></kopnik-as-link>
        <div>{{model.created|humanize}}</div>

        <div v-if="canManage" class="dropdown ml-auto">
          <a :id="id+'_actions'" class="btn btn-secondary btn-sm dropdown-toggle" href="#" data-toggle="dropdown"
             aria-haspopup="true" aria-expanded="false">
            ...
          </a>

          <div class="dropdown-menu dropdown-menu-right" :aria-labelledby="id+'_actions'">
            <a href="#" class="dropdown-item" :class="{disabled: !canEdit}" @click.prevent="edit_click">
              <span class="material-icons md-dark md-1em">edit</span>
              Править
            </a>
          </div>
        </div>
      </div>
      <div class="card-block">
        <div class="card-text text-pre">{{model.value}}</div>
        <files :id="id+'_attachments'" :model="model.attachments"></files>
      </div>
    </template>
    <template v-else>
      <div class="card-header d-flex kp-small">
        <kopnik-as-link v-if="model.owner" class="mr-1" target="_blank" :model="model.owner"></kopnik-as-link>
        <span>{{model.created|humanize}}</span>
      </div>
      <div class="card-block d-flex flex-column">
        <mu-text-field class="my-0" fullWidth multiLine hintText="Ваше слово на копе" :rows="1" :rowsMax="5"
                       v-model="model.value" @keyup.native.ctrl.enter="save_click"/>
<!--
      <textarea class="form-control" v-model="model.value"
                placeholder="Ваше предложение, которое будет поставлено на голосование на копе"> </textarea>
-->
        <files :id="id+'_attachments'" mode="editor" :model="model.attachments"></files>
        <div class="d-flex flex-wrap align-self-end mt-4">
          <button class="btn btn-danger mr-3" @click="cancel_click">Отменить</button>
          <button class="btn btn-success" :disabled="!model.value" @click="save_click">Сохранить</button>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  let models = require("../model")

  export default  {
//    mixins:[logMixin],
    name:"slovo-as-list-item",
    data() {
      return {
        /**
         * установленный пользователем режим поверх props.mode
         */
        localMode: undefined,
      }
    },
    props: ["id", "model", "mode"],
    mixins:[require("./mixin/humanize")],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue"),
      "files": require("./files.vue")
    },
    computed:{
      userMode(){
        return this.localMode || this.mode
      },
      canManage(){
        return this.model.owner == Application.getInstance().user
      },
      canEdit(){
          return this.model.owner==Application.getInstance().user
      }
    },
    methods: {
      async save_click(){
        await this.model.save()
        this.localMode = "viewer"
        this.$emit("modeChange", this)
      },
      async cancel_click(){
        await this.model.reload()
        this.localMode = "viewer"
        this.$emit("modeChange", this)
      },
      edit_click(){
        this.localMode = "editor"
        this.$emit("modeChange", this)
      },
    },
    created: async function () {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
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
