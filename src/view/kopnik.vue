<template>
  <div class="kopnik">
    <kopnik-as-avatar :model="model">
      <span class="h1">
        {{model.fullName}}
      </span>
    </kopnik-as-avatar>
    <div class="my-3" >
      E-mail: <a :href="'mailto:'+model.email">{{model.email}}</a>
    </div>
    <div v-if="model.dom" class="dom">
      Дом:
      <location class="bg-none" target="_blank" full="true" :model="model.dom"></location>
    </div>
    <div v-if="model.starshina" class="starshina mt-3">
      Старшина:
      <kopnik-as-link target="_blank" :model="model.starshina"></kopnik-as-link>
    </div>
    <div class="druzhina mt-3">
      <div style="cursor:pointer" @click="onDruzhinaToggle()">
          <span
            class="material-icons md-dark md-1em">{{druzhinaDisplay ? 'keyboard_arrow_down' : 'keyboard_arrow_right'}}</span>
        Дружина ({{model.voiskoSize}}):
      </div>
      <ul class="list-group mt-2" v-show="druzhinaDisplay">
        <li class="list-group-item border-0 py-0" v-for="eachDruzhe of model.druzhina">
          <kopnik-as-druzhe class="w-100" :model="eachDruzhe"></kopnik-as-druzhe>
        </li>
      </ul>
    </div>
    <template v-if="user!= model">
      <button class="btn btn-block btn-primary mt-5" @click="starshina_click">
        {{user.starshina != model ? "Выбрать копника старшиной" : "Выйти из дружины копника"}}
      </button>
    </template>
  </div>
</template>

<script>
  import Application from '../Application'
  import Grumbler from "../Grumbler"
  import KopnikAsAvatar from "./kopnik-as-avatar";
  const models = require("../model")
  const log = require("loglevel").getLogger("kopnik.vue")
  import logMixin from "./mixin/log"

  export default{
//    mixins:[logMixin],
    name: "kopnik",
    data() {
      return {
        /**
         * значение druzhina.display= true || false
         */
        druzhinaDisplay: false,
        user: Application.getInstance().user,
      };
    },
    props: ["id", "model", "short"],
    components: {
      KopnikAsAvatar,
      "location": require("./location.vue"),
      "kopnik-as-link": require("./kopnik-as-link.vue"),
      "kopnik-as-druzhe": require("./kopnik-as-druzhe.vue"),
    },
    watch: {
      /**
       * Переход с одного копника на другого
       */
      $route(){
//                this.druzhinaDisplay = false;
        this.loadModel();
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      this.loadModel();
    },
    computed: {},
    methods: {
      getState(){
        return {}
      },
      async setState(){
      },
      loadModel: async function () {
        await this.model.joinedLoaded();
      },

      onDruzhinaToggle: async function () {
        this.druzhinaDisplay = !this.druzhinaDisplay;
        if (this.druzhinaDisplay && !this.model.druzhina) {
          this.model.loadDruzhina();
        }
      },

      starshina_click: async function () {
          try {
            if (Application.getInstance().user.starshina == this.model) {
              await Application.getInstance().user.setStarshina(null);
            }
            else {
              await Application.getInstance().user.setStarshina(this.model)
//            .catch(err=>Grumbler.getInstance().pushError(err))
            }
          }
            /**
             * хз почему Grumbler не перехватывает unhandledrejection тут
             */
          catch(err){
              Grumbler.getInstance().pushError(err)
          }
      }
    }
  }

</script>


<style scoped>
  .header {
    background-color: #cccccc;
    font-size: smaller;
  }

  .druzhina-toggler {
    cursor: pointer;
  }

  li {
    cursor: pointer;;
  }
</style>
