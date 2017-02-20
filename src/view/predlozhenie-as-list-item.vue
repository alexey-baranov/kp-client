<template>
  <div :id="id" class="predlozhenie-as-list-item card" :class="{stateZa: model.state==1, stateProtiv: model.state==-1}">
    <template v-if="(localMode||mode)!='editor'">
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
            <!--<div class="dropdown-divider"></div>-->
            <a href="#" class="dropdown-item" :class="{disabled: !canDestroy}" @click.prevent="destroy_click">
              <span class="material-icons md-dark md-1em">close</span>
              Снять с голосования
            </a>
          </div>
        </div>
      </div>
      <div class="card-block">
        <div class="card-text">{{model.value}}</div>
        <files :id="id+'_attachments'" :model="model.attachments"></files>
      </div>
    </template>
    <template v-else>
      <div class="card-header d-flex kp-small">
        <kopnik-as-link v-if="model.owner" class="mr-1" target="_blank" :model="model.owner"></kopnik-as-link>
        <span>{{model.created|humanize}}</span>
      </div>
      <div class="card-block d-flex flex-column">
        <textarea class="form-control" v-model="model.value"
                  placeholder="Предложение, которое будет поставлено на голосование на копе"> </textarea>
        <files :id="id+'_attachments'" mode="editor" :model="model.attachments"></files>
        <div class="d-flex flex-wrap align-self-end mt-4">
          <button class="btn btn-danger mr-3" @click="cancel_click">Отменить</button>
          <button class="btn btn-success" @click="save_click">Сохранить</button>
        </div>
      </div>
    </template>
    <!--golosa-->
    <div class="card-block">
      <!--za-->
      <div class="btn-group w-100" role="group">
        <button class="btn btn-success d-flex justify-content-between w-100" :disabled="model.state>0"
                @click.prevent="za_click">
          <span>{{model.totalZa}}</span><span>За</span><span v-if="zemlaLoaded">({{model.totalZa/model.place.place.obshinaSize*100}}%)</span>
        </button>
        <button class="btn btn-success" data-toggle="collapse" :href="`#${id}_voted_za`">
          <i class="material-icons" title="Показать голосовавших">expand_more</i>
        </button>
      </div>
      <div class="collapse" :id="`${id}_voted_za`">
        <div class="card card-block">
          <kopnik-as-link v-if="eachZa.owner" v-for="eachZa of model.za" target="_blank" :model="eachZa.owner">
            <!--(+{{eachZa.owner.voiskoSize}})-->
          </kopnik-as-link>
        </div>
      </div>

      <!--protiv-->
      <div class="btn-group w-100" role="group">
        <button class="btn btn-danger d-flex justify-content-between w-100" :disabled="model.state>0"
                @click.prevent="protiv_click">
          <span>{{model.totalProtiv}}</span><span>Против</span><span v-if="zemlaLoaded">({{model.totalProtiv/model.place.place.obshinaSize*100}}%)</span>
        </button>
        <button class="btn btn-danger" data-toggle="collapse" :href="`#${id}_voted_protiv`">
          <i class="material-icons" title="Показать голосовавших">expand_more</i>
        </button>
      </div>
      <div class="collapse" :id="`${id}_voted_protiv`">
        <div class="card card-block">
          <kopnik-as-link v-if="eachProtiv.owner" v-for="eachProtiv of model.protiv" target="_blank"
                          :model="eachProtiv.owner">
            <!--(+{{eachProtiv.owner.voiskoSize}})-->
          </kopnik-as-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  let models = require("../model")

  export default  {
//    mixins:[logMixin],
    mixins: [require("./mixin/humanize")],
    name: "predlozhenie-as-list-item",
    data() {
      return {
        /**
         * установленный пользователем режим поверх props.mode
         */
        localMode: undefined,
      }
    },
    props: ["id", "model", "mode"],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue"),
      "files": require("./files.vue"),
    },
    computed: {
      canManage(){
        return this.model.owner == Application.getInstance().user
      },
      canEdit(){
        return this.model.owner == Application.getInstance().user && this.model.golosa && this.model.golosa.length == 0
      },
      canDestroy(){
        return this.model.owner == Application.getInstance().user && !this.model.state
      }
    },
    methods: {
      async destroy_click(){
        if (this.canDestroy) {
          await this.model.destroy()
        }
      },
      edit_click(){
        if (this.canEdit) {
          this.localMode = "editor"
        }
      },
      async save_click(){
        await this.model.save()
        this.localMode = "viewer"
      },
      async cancel_click(){
        await this.model.reload()
        this.localMode = "viewer"
      },
      zemlaLoaded(){
        return this.model.place && this.model.place.place && this.model.place.place._isLoaded;
      },
      za_click: async function () {
        if (this.model.golosa.find(eachGolos => eachGolos.owner == Application.getInstance().user && eachGolos.value == 1)) {
          await Application.getInstance().user.vote(this.model, 0);
        }
        else {
          await Application.getInstance().user.vote(this.model, 1);
        }
      },
      protiv_click: async function () {
        if (this.model.golosa.find(eachGolos => eachGolos.owner == Application.getInstance().user && eachGolos.value == -1)) {
          await Application.getInstance().user.vote(this.model, 0);
        }
        else {
          await Application.getInstance().user.vote(this.model, -1);
        }
      }
    },
    created: async function () {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")

      if (this.model.id) {
        await this.model.joinedLoaded();
        await this.model.place.joinedLoaded();
        await this.model.place.place.joinedLoaded();

        if (!this.model.golosa) {
          await this.model.reloadGolosa();
        }
      }
    },
  }
</script>

<style scoped>
  .predlozhenie-as-list-item {

  }

  .stateZa {
    background-color: green;
  }

  .stateProtiv {
    background-color: red;
  }
</style>
