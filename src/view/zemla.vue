<template>
  <ul :id="id" class="zemla">
    <ul class="list-group list-group-flush flex-column-reverse ">
      <li v-for="eachKopa of model.kopi" class="list-group-item list-group-item-action"
         :href="`/?body=Kopa:${eachKopa.id}`" @click.prevent="kopa_click(eachKopa)">
        <kopa-as-list-item class="w-100" :model="eachKopa"></kopa-as-list-item>
      </li>
      <li class="list-group-item">
        <kopa-as-list-item :id="id+'_new'" class="w-100" :model="model.newKopa" mode="editor">
          <button class="btn btn-block btn-primary mt-2" @click="kopaCreate_click">Созвать новую копу...</button>
        </kopa-as-list-item>
      </li>
    </ul>
  </div>
</template>

<script>
  import Application from "../Application"
  import StateManager from "../StateManager"
  let models = require("../model")

  export default{
    data: function () {
      return {
        newKopi: new Map(),
      }
    },
    props: ["id", "model"],
    components: {
      "kopa-as-list-item": require("./kopa-as-list-item.vue"),
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
    computed: {
    },
    methods: {
      /**
       * возвращает новую копу для земли model
       *
       */
      getNewKopa(){
        let result = new models.Kopa()
        result.place = this.model
        result.inviter = Application.getInstance().user
        return result
      },
      kopa_click(kopa){
        Application.getInstance().goTo(kopa)
        StateManager.getInstance().pushState()
      },

      loadModel: async function () {
        await this.model.loaded()
        if (!this.model.kopi) {
          await this.model.reloadKopi();
        }
      },


      /**
       * Создает новую копу
       *
       */
      kopaCreate_click: async function () {
        let newKopa = this.model.newKopa

        /**
         * model.newKopa является моделью для вьюшки новой копы
         * поэтому надо сначала ее переназначить а потом уже
         * упражняться с ней
         */
        this.model.newKopa= this.getNewKopa()

        newKopa = await models.Kopa.create(newKopa)
        await newKopa.invite()
        this.log.warn("remove immid inviting");
      }
    },
    created: function () {
      this.log = require("loglevel").getLogger("zemla.vue")
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
