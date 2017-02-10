<template>
  <div :id="id" class="zemla">
    <ul class="list-group flex-column-reverse ">
      <li v-for="eachKopa of model.kopi" class="list-group-item border-0 px-0"
          :href="`/?body=Kopa:${eachKopa.id}`" @click.prevent="kopa_click(eachKopa)">
        <kopa-as-list-item class="w-100" :model="eachKopa"></kopa-as-list-item>
      </li>

      <!--новая копа-->
      <li class="list-group-item border-0 px-0">
        <kopa-as-submit :id="id+'_new'" class="w-100" :model="model.newKopa" @submit="kopa_submit"></kopa-as-submit>
      </li>
    </ul>
    <mu-infinite-scroll :loading="areKopiLoaded" loadingText="Подождите..." @load="scroll_load"/>
  </div>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"
  let models = require("../model")

  export default{
//    mixins:[logMixin],
    name: "zemla",
    data() {
      return {
        areKopiLoaded: false
      }
    },
    props: ["id", "model"],
    components: {
      "kopa-as-list-item": require("./kopa-as-list-item.vue"),
      "kopa-as-submit": require("./kopa-as-submit.vue"),
      "kopa": require("./kopa.vue"),
    },
    watch: {
      model(){
        this.loadModel()
        if (!this.model.newKopa) {
          this.model.newKopa = this.getNewKopa()
        }
      }
    },
    computed: {},
    methods: {
      async scroll_load(){
        if (!this.model.areAllKopiLoaded && !this.areKopiLoaded) {
          this.areKopiLoaded = true
          await this.model.loadKopi()
          this.areKopiLoaded = false
        }
      },
      /**
       * возвращает новую копу для земли model
       *
       */
      getNewKopa(){
        let result = new models.Kopa()
        result.place = this.model
        result.owner = Application.getInstance().user
        return result
      },
      kopa_click(kopa){
        Application.getInstance().goTo(kopa)
        StateManager.getInstance().pushState()
      },

      loadModel: async function () {
        await this.model.joinedLoaded()
        if (!this.model.kopi) {
          await this.model.loadKopi();
        }
      },


      /**
       * Создает новую копу
       *
       */
      kopa_submit: async function () {
        let newKopa = this.model.newKopa

        /**
         * model.newKopa является моделью для вьюшки новой копы
         * поэтому надо сначала ее переназначить а потом уже
         * упражняться с ней
         */
        this.model.newKopa = this.getNewKopa()

        newKopa = await models.Kopa.create(newKopa)
        await newKopa.invite()
        this.log.warn("remove immid inviting");
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
      this.loadModel()

      /**
       * таким образом новая копа сохраняется за землей между переходами пользователя
       */
      if (!this.model.newKopa) {
        this.model.newKopa = this.getNewKopa()
      }
    },
  }
</script>


<style scoped>

</style>
