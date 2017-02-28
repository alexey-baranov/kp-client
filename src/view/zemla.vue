<template>
  <div :id="id" class="zemla">
    <ul class="list-group flex-column-reverse ">
      <a v-for="eachKopa of model.kopi" class="list-group-item no-color border-0 px-0 py-0 my-3"
         :href="`?body=Kopa:${eachKopa.id}`" @click.prevent="kopa_click(eachKopa)">
        <kopa-as-list-item class="w-100" :model="eachKopa"></kopa-as-list-item>
      </a>

      <!--новая копа-->
      <li class="list-group-item border-0 px-0">
        <kopa-as-submit v-if="starshinaNaZemle===null" :id="id+'_new'" class="w-100" :model="model.newKopa"
                        @submit="kopa_submit" @draft="kopa_draft"></kopa-as-submit>
        <div v-if="starshinaNaZemle" class="alert alert-info">Ваш старшина на {{model.name}}
          <kopnik-as-link target="_blank" :model="starshinaNaZemle"></kopnik-as-link>
        </div>
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
        areKopiLoaded: false,
        starshinaNaZemle: undefined
      }
    },
    props: ["id", "model"],
    components: {
      "kopa-as-list-item": require("./kopa-as-list-item.vue"),
      "kopa-as-submit": require("./kopa-as-submit.vue"),
      "kopa": require("./kopa.vue"),
      "kopnik-as-link": require("./kopnik-as-link.vue"),
    },
    watch: {
      async model(){
        await this.onModel()
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

      async onModel () {
        this.starshinaNaZemle = undefined
        /**
         * таким образом новая копа сохраняется за землей между переходами пользователя
         */
        if (!this.model.newKopa) {
          this.model.newKopa = this.getNewKopa()
        }

        await this.model.joinedLoaded()

        if (!this.model.kopi) {
          await this.model.loadKopi();
        }

        this.starshinaNaZemle = await Application.getInstance().user.getStarshinaNaZemle(this.model)
      },

      /**
       * Созыает новую копу
       *
       */
      async kopa_submit () {
        let newKopa = this.model.newKopa

        /**
         * model.newKopa является моделью для вьюшки новой копы
         * поэтому надо сначала ее переназначить а потом уже
         * упражняться с ней
         */
        this.model.newKopa = this.getNewKopa()

        newKopa = await models.Kopa.create(newKopa)
        await newKopa.invite()
      },
      /**
       * Создает черновик копы
       *
       */
      async kopa_draft() {
        let newKopa = this.model.newKopa

        /**
         * model.newKopa является моделью для вьюшки новой копы
         * поэтому надо сначала ее переназначить а потом уже
         * упражняться с ней
         */
        this.model.newKopa = this.getNewKopa()

        newKopa = await models.Kopa.create(newKopa)
      }
    },
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      await this.onModel()
    },
  }
</script>


<style scoped>
  a.no-color {
    color: inherit;
  }
</style>
