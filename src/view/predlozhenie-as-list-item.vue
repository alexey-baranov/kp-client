<template>
  <div :id="id" class="predlozhenie-as-list-item card" :class="{stateZa: model.state==1, stateProtiv: model.state==-1}">
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
                placeholder="Предложение, которое будет поставлено на голосование на копе"> </textarea>
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
        <button class="btn btn-success d-flex justify-content-between w-100" @click.prevent="za_click">
          <span>{{model.totalZa}}</span><span>За</span><span v-if="zemlaLoaded">({{model.totalZa/model.place.place.obshinaSize*100}}%)</span>
        </button>
        <button class="btn btn-success" data-toggle="collapse" :href="`#${id}_voted_za`">
          <i class="material-icons" title="Показать голосовавших">expand_more</i>
        </button>
      </div>
      <div class="collapse" :id="`${id}_voted_za`">
        <div class="card card-block">
          <kopnik-as-link v-for="eachZa of model.za" :model="eachZa.owner">
            (+{{eachZa.owner.voiskoSize}})
          </kopnik-as-link>
        </div>
      </div>

      <!--protiv-->
      <div class="btn-group w-100" role="group">
        <button class="btn btn-danger d-flex justify-content-between w-100" @click.prevent="protiv_click">
          <span>{{model.totalProtiv}}</span><span>Против</span><span v-if="zemlaLoaded">({{model.totalProtiv/model.place.place.obshinaSize*100}}%)</span>
        </button>
        <button class="btn btn-danger" data-toggle="collapse" :href="`#${id}_voted_protiv`">
          <i class="material-icons" title="Показать голосовавших">expand_more</i>
        </button>
      </div>
      <div class="collapse" :id="`${id}_voted_protiv`">
        <div class="card card-block">
          <kopnik-as-link v-for="eachProtiv of model.protiv" :model="eachProtiv.owner">
            (+{{eachProtiv.owner.voiskoSize}})
          </kopnik-as-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
  import Application from "../Application"
  let models = require("../model")

  module.exports = {
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
          return this.model.owner==Application.getInstance().user && this.model.golosa && this.model.golosa.length==0
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
      this.log = require("loglevel").getLogger("predlozhenie-as-list-item.vue")

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
