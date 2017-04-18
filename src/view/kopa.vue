<template>
  <div :id="id" class="kopa">
    <div class="card">
      <template v-if="userMode =='editor'">
        <div class="card-header text-muted text-small d-flex kp-small">
          <kopnik-as-link v-if="model.owner" target="_blank" :model="model.owner"></kopnik-as-link>
          <div class="ml-1">{{model.invited | humanize}}</div>
        </div>
        <div class="card-block d-flex flex-column">
          <mu-text-field class="my-0" fullWidth multiLine hintText="Вопрос, который нужно обсудить на копе" :rows="1"
                         :rowsMax="5"
                         v-model="model.question" @keyup.native.ctrl.enter="save_click"/>
          <!--
                    <textarea class="form-control" v-model="model.question"
                              placeholder="Вопрос, который нужно обсудить на копе"></textarea>
          -->
          <files :id="id+'_files' " ref="attachments" mode="editor" :model="model.attachments"></files>
          <div class="d-flex flex-wrap align-self-end mt-4">
            <button class="btn btn-danger mr-3" @click="cancel_click">Отменить</button>
            <button class="btn btn-success" :disabled="!model.question" @click="save_click">Сохранить</button>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="card-header text-muted text-small d-flex flex-wrap kp-small">
          <kopnik-as-link v-if="model.owner" target="_blank" :model="model.owner"></kopnik-as-link>
          <div class="ml-1">{{model.invited | humanize}}</div>

          <div v-if="canManage" class="dropdown ml-auto">
            <a :id="id+'_actions'" class="btn btn-secondary btn-sm dropdown-toggle" href="#" data-toggle="dropdown"
               aria-haspopup="true" aria-expanded="false">
              ...
            </a>

            <div class="dropdown-menu dropdown-menu-right" :aria-labelledby="id+'_actions'">
              <a href="#" class="dropdown-item" :class="{disabled: !canEdit}" @click.prevent="edit_click">
                <span class="material-icons md-dark md-1em">edit</span>
                Править
              </a>
              <!--<div class="dropdown-divider"></div>-->
              <a href="#" class="dropdown-item" :class="{disabled: !canDestroy}" @click.prevent="destroy_click">
                <span class="material-icons md-dark md-1em">close</span>
                Распустить
              </a>
            </div>
          </div>
          <!--
                    <div class="ml-auto">
                      <button v-if="canEdit" class="btn btn-sm btn-secondary ml-auto" @click.prevent="edit_click">
                        <span class="material-icons md-dark md-1em">edit</span>
                        Править
                      </button>
                      <button v-if="canDestroy" class="btn btn-sm btn-danger" @click.prevent="destroy_click">
                        <span class="material-icons md-dark md-1em">delete</span>
                        Распустить
                      </button>
                    </div>
                    -->
        </div>
        <div :id="id+'_card_block'" class="card-block">
          <div class="card-text text-pre">{{model.question}}</div>
          <files :id="id+'_files' " :model="model.attachments" :drop="id+'_card_block'"></files>
          <button v-if="!model.invited" class="btn btn-block btn-primary mt-2" @click="invite_click">Созвать копу
          </button>
        </div>
      </template>
      <slot></slot>
    </div>
    <ul class="list-group">
      <li v-for="eachResult of model.result" class="list-group-item  border-0 px-0">
        <predlozhenie-as-list-item :id="id+'_result_'+eachResult.id" ref="result" class="w-100"
                                   :model="eachResult" @modeChange="view_modeChange"></predlozhenie-as-list-item>
      </li>
    </ul>
    <ul v-if="model.invited" class="list-group">
      <li v-for="eachSlovo of model.dialog" class="list-group-item border-0 px-0">
        <slovo-as-list-item :id="id+'_slovo_'+eachSlovo.id" ref="dialog" class="w-100" :model="eachSlovo"
                            @modeChange="view_modeChange"></slovo-as-list-item>
      </li>
    </ul>
    <!--Новое слово-->
    <div v-if="model.invited && !editors.length && userMode !='editor'"
         class="border-0 px-0 py-0 fixed-bottom">
      <slovo-as-submit v-if="starshinaNaKope===null" :id="id+'_slovo_new'" class="w-100"
                       :model="model.newSlovo" @submit="slovo_submit" @predlozhenie="slovo_predlozhenie">
      </slovo-as-submit>
      <div v-if="starshinaNaKope" class="alert alert-info mb-0">Ваш старшина на копе
        <kopnik-as-link target="_blank" :model="starshinaNaKope"></kopnik-as-link>
      </div>
    </div>
  </div>
</template>

<script>
  import $ from "jquery"
  import mobile from "is-mobile"
  //  import Rx from 'rxjs/Rx';

  import Application from "../Application"
  let log = require("loglevel").getLogger("kopa.vue")
  import logMixin from "./mixin/log"
  const models = require("../model");
  import StateManager from "../StateManager"

  export default{
//    mixins:[logMixin],
    mixins: [require("./mixin/humanize"), require("./mixin/scroll")],
    name: "kopa",
    data() {
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
        questionIntention: false,
        starshinaNaKope: undefined,
        /**
         * редакторы в данный момент,
         * только если нет ни одного редактора, только в этом случае показывается слово
         * иначе на телефонах оно налазиет на редактор и там ничего не видно
         */
        editors: []
      };
    },
    /**
     * mode= viewer || editor || editor-short
     */
    props: ["id", "model", "mode", "short"],
    components: {
      "kopnik-as-link": require("./kopnik-as-link.vue"),
      "predlozhenie-as-list-item": require("./predlozhenie-as-list-item.vue"),
      "slovo-as-list-item": require("./slovo-as-list-item.vue"),
      "slovo-as-submit": require("./slovo-as-submit.vue"),
      "files": require("./files.vue"),
    },
    watch: {
      model(current, prev){
        this.onModel(current, prev)
      }
    },
    computed: {
      userMode(){
        return this.localMode || this.mode
      },
      $(){
        return $
      },
      canManage(){
        return this.model.owner == Application.getInstance().user
      },
      /**
       * только копы у которых нет принятых предложений
       */
      canEdit(){
        return this.model.owner == Application.getInstance().user && this.model.result && !this.model.result.find(e => e.state)
      },
      /**
       * только копы у которых нет принятых предложений
       */
      canDestroy(){
        return this.model.owner == Application.getInstance().user && this.model.result && !this.model.result.find(e => e.state)
      }
    },
    methods: {
      getScrollItemViews(async = false) {
        if (async) {
          return (async() => {
            if (!this.model.result) {
              await this.model.joinedLoadResult()
            }
            if (!this.model.dialog) {
              await this.model.joinedLoadDialog()
            }
            await Promise.resolve()
            let result = [].concat(this.$refs.result, this.$refs.dialog).filter(eachView => eachView)
            return result
          })()
        }
        else {
          if (this.model.result && this.model.dialog) {
            let result = [].concat(this.$refs.result, this.$refs.dialog).filter(eachView => eachView)
            return result
          }
          else {
            return undefined
          }
        }
      },
      getState(){
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
      playSlovoAdd() {
        if (!mobile()) {
          let sound = new Audio("static/kopa/snd/slovoAdd.mp3")
//          sound.play()
        }
      },
      view_modeChange(sender){
        if (sender.userMode == "editor") {
          this.editors.push(sender)
        }
        else if (this.editors.indexOf(sender) != -1) {
          this.editors.splice(this.editors.indexOf(sender), 1)
        }
      },
      async onModel(current, prev){
        if (prev) {
          prev.removeListener(models.Kopa.event.slovoAdd, this.bindedHoldBottom)
          prev.removeListener(models.Kopa.event.slovoAdd, this.playSlovoAdd)
          prev.removeListener(models.Kopa.event.predlozhenieAdd, this.playSlovoAdd)
        }
        this.starshinaNaKope = undefined
        if (current) {
          if (!current.newSlovo) {
            current.newSlovo = this.getNewSlovo()
          }
          await current.joinedLoaded()
          if (!current.result) {
            await current.joinedLoadResult()
          }
          if (!current.dialog) {
            await current.joinedLoadDialog()
          }

          current.on(models.Kopa.event.slovoAdd, this.bindedHoldBottom)
          current.on(models.Kopa.event.slovoAdd, this.playSlovoAdd)
          current.on(models.Kopa.event.predlozhenieAdd, this.playSlovoAdd)

          this.starshinaNaKope = await Application.getInstance().user.getStarshinaNaKope(current)
        }
      },
      async invite_click(){
        await this.model.invite()
      },
      /**
       *  если автор я сам, то матаем вниз
       *  во всех остальных случаях только если я стою в самом низу
       */
      holdBottom(){
          let user= Application.getInstance().user
        if (this.model.dialog[this.model.dialog.length - 1].owner == user ||
          $(document).scrollTop() + window.innerHeight + 20 >= $(document).height()) {
          $(document.body).stop().animate({scrollTop: $(document).height()}, '1000', 'swing')
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

      async slovo_predlozhenie (sender) {
        let newResult = this.model.newSlovo

        /**
         * model.newSlovo является моделью для вьюшки нового слова
         * поэтому его сначала ее переназначить а потом уже
         * упражняться с ним
         */
        this.model.newSlovo = this.getNewSlovo()

        newResult = await models.Predlozhenie.create(newResult)
        console.log(0)
      },

      async slovo_submit () {
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
        if (this.canEdit) {
          this.localMode = "editor"
          this.$emit("modeChange", this)
        }
      },
      async save_click(){
        await this.model.save()
        this.localMode = "viewer"
        this.$emit("modeChange", this)
      },
      async destroy_click(){
        if (this.canDestroy) {
          Application.getInstance().goTo(this.model.place)
          StateManager.getInstance().replaceState()
          await this.model.destroy()
        }
      },
      async cancel_click(){
        await this.model.reload()
        this.localMode = "viewer"
        this.$emit("modeChange", this)
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
    async created() {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")
      this.bindedHoldBottom = this.holdBottom.bind(this)
      Application.getInstance().user.on(models.Kopnik.event.starshinaChange, this.user_starshinaChange = async() => {
        this.starshinaNaKope = await Application.getInstance().user.getStarshinaNaKope(this.model)
      })
      await this.onModel(this.model)
    },
    mounted(){

      /*      this.bottomPaddingInterval= setInterval(()=>{
       let height= $(`#${this.id}_slovo_new`).height()||10
       this.log.debug("slovo_new height", height)
       $(`#${this.id}`).css('padding-bottom', height)
       },1000)*/
    },
    async beforeDestroy(){
      //равносильно this.model= null и последующая отвязка всех событий от модели
      await this.onModel(null, this.model)

      /**
       * возможно был совершен выход и поэтому юзера уже нет
       */
      if (Application.getInstance().user) {
        Application.getInstance().user.removeListener(models.Kopnik.event.starshinaChange, this.user_starshinaChange)
      }
//      clearInterval(this.bottomPaddingInterval)
    }
  }
</script>


<style scoped>
  .kopa {
    padding-bottom: 13em;
    /*padding-bottom: 1em;*/
  }
</style>
