<template>
  <div :id="id" class="kopa">
    <div class="mu-card p-3 mb-4" style="">
      <template v-if="userMode =='editor'">
        <sign v-if="model.owner" :owner="model.owner" class="py-3" :date="model.invited" />
        <div class="py-3">
          <mu-text-field ref="model_question" class="my-0" fullWidth multiLine hintText="Вопрос, который нужно обсудить на копе" :rows="1"
                         :rowsMax="5"
                         v-model="model.question" @keyup.native.ctrl.enter="save_click"/>
          <files :id="id+'_files' " ref="attachments" mode="editor" :model="model.attachments"></files>
        </div>
        <mu-card-actions>
          <mu-row gutter>
            <mu-col width="50" tablet="33">
              <mu-raised-button fullWidth primary icon="done" :disabled="!model.question" @click="save_click"
                                label="Да"></mu-raised-button>
            </mu-col>
            <mu-col width="50" tablet="33">
              <mu-raised-button fullWidth secondary icon="cancel" @click="cancel_click"
                                label="Нет"></mu-raised-button>
            </mu-col>
          </mu-row>
        </mu-card-actions>
      </template>
      <template v-else>
        <div class="py-3 d-flex justify-content-between">
          <sign v-if="model.owner" :owner="model.owner" :date="model.invited" />

          <mu-icon-menu v-if="canManage" icon="more_vert" :anchorOrigin="{horizontal: 'right', vertical: 'bottom'}" :targetOrigin="{horizontal: 'right', vertical: 'top'}">
            <mu-menu-item title="Поправить" icon="edit" :disabled="!canEdit" @click.prevent="edit_click"/>
            <mu-menu-item title="Распустить" icon="close" :disabled="!canDestroy" @click.prevent="destroy_click"/>
          </mu-icon-menu>
        </div>
        <!--mu-card-text пришлось забраковать потому что он устававливает малый шрифт
а font-size= inherit на сотике через раз не срабатывает
-->
        <div class="py-3 kp-markdown" style="overflow-x: hidden;" v-html="modelMarkdownQuestion"></div>
        <div v-if="model.attachments && model.attachments.length" class="py-3">
          <files :id="id+'_files' " ref="attachments" :model="model.attachments"></files>
        </div>
        <mu-card-actions v-if="!model.invited" class="px-0">
          <mu-raised-button primary fullWidth @click="invite_click" label="Созвать копу"></mu-raised-button>
        </mu-card-actions>
      </template>
    </div>

    <predlozhenie-as-list-item v-for="eachResult in model.result" :model="eachResult" :id="id+'_result_'+eachResult.id" ref="result" class="mb-4" @modeChange="view_modeChange"></predlozhenie-as-list-item>
    <mu-raised-button v-if="model.dialog && (model.firstSlovo===undefined || model.firstSlovo && model.dialog[0]!=model.firstSlovo)"
       fullWidth :label="`Показать предыдущие ${model.constructor.loadPrevSize}`"
      class="mb-3" @click="prev10_click" />
    <slovo-as-list-item v-for="eachSlovo of model.dialog" :id="id+'_slovo_'+eachSlovo.id" ref="dialog" class="mb-4" :model="eachSlovo"
                            @modeChange="view_modeChange"></slovo-as-list-item>
    <!--Новое слово-->

    <template v-if="model.invited && (1 || !editors.length) && userMode !='editor'">
      <slovo-as-submit v-if="starshinaNaKope===null" :id="id+'_slovo_new'" class="kp-pos-sticky" style="bottom:0"
                       :model="model.newSlovo" @submit="slovo_submit" @predlozhenie="slovo_predlozhenie">
      </slovo-as-submit>
      <div v-if="starshinaNaKope" class="alert alert-info mb-0">Ваш старшина на копе
        <kopnik-as-link target="_blank" :model="starshinaNaKope"></kopnik-as-link>
      </div>
    </template>
  </div>
</template>

<script>
  import {Converter} from "showdown"

  import $ from "jquery"
  import mobile from "is-mobile"
  //  import Rx from 'rxjs/Rx';

  import Application from "../Application"
  let log = require("loglevel").getLogger("kopa.vue")
  import humanize from "./mixin/humanize"
  import logMixin from "./mixin/log"

  const models = require("../model")
  import StateManager from "../StateManager"

  export default{
    mixins:[logMixin, humanize, require("./mixin/scroll")],
    name: "kopa",
    data() {
      return {
          files:[],
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
      "sign": require("./sign.vue"),
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
      modelMarkdownQuestion(){
        let converter= new Converter({simplifiedAutoLink: true, simpleLineBreaks: true})
        return converter.makeHtml(this.model.question)
      },
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
      async prev10_click(){
        await this.model.loadDialog()
      },
      async waitUntilScrollReady(value){
        await this.model.joinedLoaded()
        if (!this.model.result) {
          await this.model.joinedLoadResult()
        }
        /**
         * последнее по счету предложение без диалога не поднимится,
         * потому что помешает пустой экран внизу.
         * чтобы экран под предложение заполнить подгружаем хоть одну порцейку диалога
         */
        if (!this.model.dialog) {
          await this.model.joinedLoadDialog()
        }
        if (value instanceof models.Predlozhenie) {
          return
        }
        if (this.model.dialog.indexOf(value) < 0) {
          await this.model.joinedLoadDialog(null, value)
        }
      },
      getScrollItemViews() {
        let result = [].concat(this.$refs.result, this.$refs.dialog).filter(eachView => eachView)
        return result
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
        let user = Application.getInstance().user
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

      async edit_click(){
        if (this.canEdit) {
          this.localMode = "editor"
          this.$emit("modeChange", this)
          await Promise.resolve()
          this.$refs.model_question.focus()
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
      this.bindedHoldBottom = this.holdBottom.bind(this)
      Application.getInstance().user.on(models.Kopnik.event.starshinaChange, this.user_starshinaChange = async () => {
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
    /*padding-bottom: 13em;*/
    /*padding-bottom: 1em;*/
  }
</style>
