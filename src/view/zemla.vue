<template>
  <div class="d-flex flex-column-reverse">
    <kopa-as-list-item v-for="eachKopa of model.kopi" :id="id+'_kopi_'+eachKopa.id" ref="kopi" class="mb-3"
                       :model="eachKopa"></kopa-as-list-item>

    <!--новая копа-->
    <kopa-as-submit v-if="starshinaNaZemle===null" :id="id+'_new'" class="w-100 mb-3" :model="model.newKopa"
                    @submit="kopa_submit" @draft="kopa_draft"></kopa-as-submit>
    <div v-if="starshinaNaZemle" class="alert alert-info">Ваш старшина на {{model.name}}
      <kopnik-as-link target="_blank" :model="starshinaNaZemle"></kopnik-as-link>
      .
      Если у вас есть вопросы, которые вы хотите обсудить на {{model.name}}, обратитесь к своему старшине с просьбой
      созвать копу.
    </div>
  </div>
  <!--<mu-infinite-scroll :loading="areKopiLoaded" loadingText="Подождите..." @load="scroll_load"/>-->
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"
  let models = require("../model")

  export default{
    mixins: [require("./mixin/scroll")],
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
      async waitUntilScrollReady(value){
        await this.model.joinedLoaded()
        if (!this.model.kopi) {
          await this.model.joinedLoadKopi()
        }
        if (this.model.kopi.indexOf(value) < 0) {
          await this.model.joinedLoadKopi(null, value)
        }
      },

      getScrollItemViews(async = false){
        let result = [].concat(this.$refs.kopi).filter(eachView => eachView)
        return result
      },

      getState(recalculate = false){
        let scrollItem = this.getScrollItem(),
          result = {}

        if (scrollItem) {
          result.scroll = scrollItem.constructor.name + ":" + scrollItem.id
        }
        return result
      },
      async setState(state) {
        if (state.scroll) {
          let scroll = models.RemoteModel.factory(state.scroll)

          await this.model.joinedLoaded()
          await this.setScrollItem(scroll)
        }
      },
      async scroll_load(){
        if (!this.model.areAllKopiLoaded && !this.areKopiLoaded) {
          this.areKopiLoaded = true
          await this.model.joinedLoadKopi()
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
          await this.model.joinedLoadKopi();
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
      Application.getInstance().user.on(models.Kopnik.event.starshinaChange, this.user_starshinaChange = async () => {
        this.starshinaNaZemle = await Application.getInstance().user.getStarshinaNaZemle(this.model)
      })
      await this.onModel()
    },
    beforeDestroy(){
      /**
       * возможно был совершен выход и поэтому юзера уже нет
       */
      if (Application.getInstance().user) {
        Application.getInstance().user.removeListener(models.Kopnik.event.starshinaChange, this.user_starshinaChange)
      }
    }
  }
</script>

<style scoped>
  a.no-color {
    color: inherit;
  }
</style>
