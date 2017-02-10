<template>
  <div class="kopnik-as-druzhe">
    <div class="fio px-2 py-2" @click="toggle_click">
      <span class="material-icons md-dark md-1em" :class="{invisible: !model.voiskoSize}">{{druzhinaDisplay?'keyboard_arrow_down':'keyboard_arrow_right'}}</span>
      <kopnik-as-link target="blank" :model="model"></kopnik-as-link>
    </div>
    <div v-show="druzhinaDisplay" class="druzhina">
      <ul class="list-group" v-show="model.druzhina">
        <li class="list-group-item border-0 py-0" v-for="eachDruzhe of model.druzhina">
          <kopnik-as-druzhe class="w-100" :model="eachDruzhe"></kopnik-as-druzhe>
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
  const models = require("../model");
  const log = require("loglevel").getLogger("kopnik-as-druzhe.vue")
  import logMixin from "./mixin/log"

  export default{
//    mixins:[logMixin],
    name: "kopnik-as-druzhe",
    data() {
      return {
        /**
         * значение druzhina.display= true || false
         */
        druzhinaDisplay: false,
      };
    },
    props: ["id", "model"],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue"),
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
      this.loadModel()
    },
    methods: {
      loadModel: async function () {
        await this.model.joinedLoaded()
      },

      /**
       * Создает новое слово
       */
      toggle_click: async function () {
        this.druzhinaDisplay = !this.druzhinaDisplay
        if (this.druzhinaDisplay && !this.model.druzhina) {
          this.model.loadDruzhina()
        }
      }
    }
  }
</script>


<style scoped>
  .fio:hover {
    background-color: #f7f7f9
  }


  li {
    cursor: pointer;;
  }
</style>
