<template>
  <div :id="id" class="predlozhenie card" :class="{stateZa: model.state==1, stateProtiv: model.state==-1}">
    <template v-if="model.id">
      <div class="card-header d-flex justify-content-between">
        <kopnik-as-link :model="model.author"></kopnik-as-link>
        <span>{{model.created}}</span>
      </div>
      <div class="card-block">
        <div class="value">{{model.value}}</div>
      </div>

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
    </template>
    <template v-else>
            <textarea class="value" v-model="model.value"
                      placeholder="Ваше предложение, которое будет поставлено на голосование на копе"> </textarea>
      <textarea class="note" v-model="model.note" placeholder="Примечание"></textarea>
      <slot></slot>
    </template>
  </div>
</template>

<script>
  import Application from "../Application"
  let models = require("../model")

  module.exports = {
    props: ["id", "model"],
    created: async function () {
      this.log = require("loglevel").getLogger("predlozhenie.vue")

      if (this.model.id) {
        await this.model.loaded();
        await this.model.place.loaded();
        await this.model.place.place.loaded();

        if (!this.model.golosa) {
          await this.model.reloadGolosa();
        }
      }
    },
    methods: {
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
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue")
    }
  }
</script>

<style scoped>
  .predlozhenie {

  }

  .stateZa {
    background-color: green;
  }

  .stateProtiv {
    background-color: red;
  }

  .created {
    font-size: smaller;
  }

  .value {

  }

  .toolbar {
    background-color: rgba(150, 150, 150, 0.5);
    font-size: smaller;
  }
</style>
