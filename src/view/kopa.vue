<template>
  <div :id="id" class="kopa">
    <div class="card">
      <template v-if="(localMode||mode)=='editor'">
        <div class="card-header text-muted text-small d-flex flex-wrap">
          <small>{{model.invited}}</small>
        </div>
        <div class="card-block d-flex flex-column">
        <textarea class="form-control" v-model="model.question"
                  placeholder="Вопрос, который нужно обсудить на копе"></textarea>
          <div class="d-flex flex-wrap align-self-end mt-4">
            <button class="btn btn-danger mr-3" @click="cancel_click">Отменить</button>
            <button class="btn btn-success" @click="save_click">Сохранить</button>
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
      <slot></slot>
    </div>
    <ul class="list-group">
      <li v-for="eachResult of model.result" class="list-group-item  border-0 px-0">
        <predlozhenie-as-list-item :id="id+'_result_'+eachResult.id"
                                   :class="{'w-100':!eachResult.state, 'w-50':eachResult.state, 'mr-auto': eachResult.state==1}"
                                   :model="eachResult"></predlozhenie-as-list-item>
      </li>
      <li class="list-group-item border-0 px-0">
        <predlozhenie-as-submit :id="id+'_new_predlozhenie'" class="w-100" :model="model.newResult"
                                @submit="predlozhenie_submit">
        </predlozhenie-as-submit>
      </li>
    </ul>
    <ul class="list-group">
      <li v-for="eachSlovo of model.dialog" class="list-group-item border-0 px-0">
        <slovo-as-list-item :id="id+'_slovo'+eachSlovo.id" class="w-100" :model="eachSlovo"></slovo-as-list-item>
      </li>
      <li class="list-group-item list-group-item-info border-0 px-0 py-0 fixed-bottom">

        <slovo-as-submit :id="id+'_new_slovo'" class="w-100" :model="model.newSlovo"
                         @submit="slovo_submit">
        </slovo-as-submit>
      </li>
    </ul>
  </div>
</template>

<script>
  import $ from "jquery"
//  import Rx from 'rxjs/Rx';

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
      "slovo-as-list-item": require("./slovo-as-list-item.vue"),
      "predlozhenie-as-submit": require("./predlozhenie-as-submit.vue"),
      "slovo-as-submit": require("./slovo-as-submit.vue")
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
      $(){
        return $
      },
      isEditorAllowed(){
        return this.model.owner == Application.getInstance().user
      }
    },
    methods: {
      holdBottom(){
        //если пользователь расположен в самом низу (последние 20 пикселей) копных обсуждений
        if ($(document).scrollTop() + window.innerHeight + 20 >= $(document).height()) {
          $(document.body).stop().animate({scrollTop: $(document).height()}, '1000', 'swing');
        }
      },
      /**
       * возвращает новое предложение - модель для predlozhenie-as-list-item.vue
       *
       */
      getNewResult(){
        let result = new models.Predlozhenie()
        result.place = this.model
        result.owner = Application.getInstance().user
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

      predlozhenie_submit: async function (sender) {
        let newResult = this.model.newResult
        newResult.created = new Date()

        /**
         * model.newResult является моделью для вьюшки нового предложения
         * поэтому его сначала ее переназначить а потом уже
         * упражняться с ним
         */
        this.model.newResult = this.getNewResult()

        newResult = await models.Predlozhenie.create(newResult)
      },

      slovo_submit: async function () {
        let newSlovo = this.model.newSlovo
        newSlovo.created = new Date()


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
       * @return {{place: *, owner: *, value: null, note: null}}
       */
      getEmptyPredlozhenie(){
        return {
          value: null,
          place: this.model2,
          owner: models.Kopnik.current,
          note: null,
        };
      },
      /**
       * Пустое слово-кандидит для копы model2
       * Уходит во вьюшку перед списком слово, его можно заполнить и создать
       *
       * @return {{place: *, owner: *, value: null, note: null}}
       */
      getEmptySlovo(){
        return {
          value: null,
          place: this.model2,
          owner: models.Kopnik.current,
          note: null,
        };
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

      /**
       автоскролинг
       */
      this.model.on(models.Kopa.event.slovoAdd, this.holdBottom)
    },
    destroyed(){
      this.model.removeListener(models.Kopa.event.slovoAdd, this.holdBottom);
    }
  }
</script>


<style scoped>
  .kopa {
    padding-bottom: 10em;
  }
</style>
