<template>
  <div :id="id" class="card kopa">
    <template v-if="(localMode||mode)=='editor'">
      <div class="card-header text-muted text-small d-flex flex-wrap">
        <small>{{model.invited}}</small>
      </div>
      <div class="card-block">
        <textarea class="form-control" v-model="model.question"
                  placeholder="Вопрос, который нужно обсудить на копе"></textarea>
        <div class="d-flex flex-wrap align-self-end mt-4">
          <button class="btn btn-primary mr-3" @click="save_click">Сохранить</button>
          <button v-if="model.id" class="btn btn-primary" @click="cancel_click">Отменить</button>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="card-header text-muted text-small d-flex flex-wrap">
        <small>{{model.invited}}</small>
        <button class="btn btn-sm btn-secondary ml-auto" @click.prevent="edit_click">
          <span class="material-icons md-dark md-1em">edit</span>
          Править
        </button>
      </div>
      <div class="card-block">
        <div class="card-text">{{model.question}}</div>
      </div>
    </template>
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <predlozhenie-as-list-item :id="id+'_new_predlozhenie'" class="w-100" :model="model.newResult" mode="editor">
          <button class="btn btn-block btn-primary mt-2" @click="resultCreate_click">Предложить</button>
        </predlozhenie-as-list-item>
      </li>
      <li v-for="eachResult of model.result" class="list-group-item">
        <predlozhenie-as-list-item :id="id+'_result_'+eachResult.id" class="w-100"
                                   :model="eachResult"></predlozhenie-as-list-item>
      </li>
    </ul>
    <ul class="list-group list-group-flush">
      <li class="list-group-item">
        <slovo-as-list-item :id="id+'_new_slovo'" class="w-100" :model="model.newSlovo" mode="editor">
          <button class="btn btn-block btn-primary mt-2" @click="slovoCreate_click">Сказать слово</button>
        </slovo-as-list-item>
      </li>
      <li v-for="eachSlovo of model.dialog" class="list-group-item">
        <slovo-as-list-item :model="eachSlovo"></slovo-as-list-item>
      </li>
    </ul>
    <slot></slot>
  </div>
</template>

<script>
  import $ from "jquery"

  import Application from "../Application"
  let log = require("loglevel").getLogger("kopa.vue")
  const models = require("../model");

  export default{
    data: function () {
      return {
        /**
         * установленный пользователем режим поверх props.mode
         */
        localMode: undefined,
        /*
         Это предложение-кандидат передается во вьюшку перед списком предложений
         */
        createdPredlozhenie: null,
        createdSlovo: null,
        /**
         * намерение задать вопрос возникает когда пользователь встает на поле "Вопрос"
         * и используется для раздвигания виьюшки из short="true"
         */
        questionIntention: false
      };
    },
    /**
     * mode= viewer || editor || editor-short
     */
    props: ["id", "model", "mode", "short"],
    components: {
      "predlozhenie-as-list-item": require("./predlozhenie-as-list-item.vue"),
      "slovo-as-list-item": require("./slovo-as-list-item.vue")
    },
    watch: {
      model(){
        this.loadModel()
        if (!this.model.newResult) {
          this.model.newResult = this.getNewResult()
        }
        if (!this.model.newSlovo) {
          this.model.newSlovo = this.getNewSlovo()
        }
      }
    },

    computed: {
      /*        isShort(){
       debugger
       return this.short===true && !this.model.question/!* && !this.questionIntention*!/
       },*/
    },
    methods: {
      /**
       * возвращает новое предложение - модель для predlozhenie-as-list-item.vue
       *
       */
      getNewResult(){
        let result = new models.Predlozhenie()
        result.place = this.model
        result.author = Application.getInstance().user
        return result
      },

      /**
       * возвращает новое слово - модель для slovo-as-list-item.vue
       *
       */
      getNewSlovo(){
        let result = new models.Slovo()
        result.place = this.model
        result.owner = Application.getInstance().user
        return result
      },

      resultCreate_click: async function () {
        let newResult = this.model.newResult

        /**
         * model.newResult является моделью для вьюшки нового предложения
         * поэтому его сначала ее переназначить а потом уже
         * упражняться с ним
         */
        this.model.newResult = this.getNewResult()

        newResult = await models.Result.create(newResult)
      },

      slovoCreate_click: async function () {
        let newSlovo = this.model.newSlovo

        /**
         * model.newSlovo является моделью для вьюшки нового слова
         * поэтому его сначала ее переназначить а потом уже
         * упражняться с ним
         */
        this.model.newSlovo = this.getNewSlovo()

        newSlovo = await models.Slovo.create(newSlovo)
      },

      edit_click(){
        this.localMode = "editor"
      },
      async save_click(){
        await this.model.save()
        this.localMode = "viewer"
      },
      async cancel_click(){
        await this.model.reload()
        this.localMode = "viewer"
      },
      async loadModel() {
        await this.model.loaded();
        if (!this.model.result) {
          await this.model.loadResult();
        }
        if (!this.model.dialog) {
          await this.model.loadDialog();
        }
      },

      /**
       * Пустое предложение-кандидит для копы model2
       * Уходит во вьюшку перед списком предложение, его можно заполнить и создать
       *
       * @return {{place: *, author: *, value: null, note: null}}
       */
      getEmptyPredlozhenie(){
        return {
          value: null,
          place: this.model2,
          author: models.Kopnik.current,
          note: null,
        };
      },
      /**
       * Создает новое предложение
       */
      onPredlozhenieCreate: async function () {
        let result = await
          models.Predlozhenie.create(this.createdPredlozhenie);
        console.log("this.createdPredlozhenie", result);

        this.createdPredlozhenie = this.getEmptyPredlozhenie();
      },


      /**
       * Пустое слово-кандидит для копы model2
       * Уходит во вьюшку перед списком слово, его можно заполнить и создать
       *
       * @return {{place: *, author: *, value: null, note: null}}
       */
      getEmptySlovo(){
        return {
          value: null,
          place: this.model2,
          author: models.Kopnik.current,
          note: null,
        };
      },
      /**
       * Создает новое слово
       */
      onSlovoCreate: async function () {
        let result = await models.Slovo.create(this.createdSlovo);
        console.log("this.createdSlovo", result);

        this.createdSlovo = this.getEmptySlovo();
      },
    },
    created: function () {
      this.log = require("loglevel").getLogger("kopa.vue")

      if (this.model.id) {
        this.loadModel();

        if (!this.model.newResult) {
          this.model.newResult = this.getNewResult()
        }
        if (!this.model.newSlovo) {
          this.model.newSlovo = this.getNewSlovo()
        }
      }
    },
  }
</script>


<style scoped>

</style>
