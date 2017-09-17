<template>
  <slovo-as-item-abstract :id="id" :model="model">
    <template slot="middle">
      <template v-if="userMode !='editor'">
        <div class="text-pre">{{model.value}}</div>
        <!--скрываю v-show чтобы не было лишних маргинов-->
        <files v-show="model.attachments && model.attachments.length" :id="id+'_attachments'" class="my-2" :model="model.attachments"></files>
        <!--golosa-->
        <div class="my-1 d-flex flex-wrap">
          <div class=" mr-4">
            <!--za-->
            <div class="d-flex flex-nowrap w-100">
              <mu-raised-button primary icon="thumb_up"
                                :label="zemlaLoaded?(model.totalZa / model.place.place.obshinaSize * 100)+'%':''"
                                :disabled="model.state!=null" style="flex-grow:1;" @click.prevent="za_click"/>
              <mu-raised-button primary icon="expand_more"title="Показать голосовавших" style="min-width: 3em;"
                                @click="showZa_click"/>
            </div>
            <mu-card :id="`${id}_voted_za`" class="collapse p-2 v-show" style="positionX: absolute; z-indexX: 100;">
                <sign v-for="eachZa of model.za" v-if="eachZa.owner" class="" :owner="eachZa.owner"
                      :date="eachZa.created"/>
            </mu-card>
          </div>
          <div >
            <!--protiv-->
            <div class="d-flex flex-nowrap w-100">
              <mu-raised-button secondary icon="thumb_down"
                                :label="zemlaLoaded?(model.totalProtiv / model.place.place.obshinaSize * 100)+'%':''"
                                :disabled="model.state!=null" style="flex-grow:1;" @click.prevent="protiv_click"/>
              <mu-raised-button secondary icon="expand_more" title="Показать голосовавших" style="min-width: 3em"
                                @click="showProtiv_click"/>
            </div>
            <div :id="`${id}_voted_protiv`" class="collapse">
              <div class="bg-none p-2">
                <sign v-for="eachProtiv of model.protiv" v-if="eachProtiv.owner" class="" :owner="eachProtiv.owner"
                      :date="eachProtiv.created"/>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <mu-text-field ref="model_value" class="my-0" fullWidth multiLine
                       hintText="Ваше предложение..." :rows="1" :rowsMax="5"
                       v-model="model.value" @keyup.native.ctrl.enter="save_click"/>
        <files :id="id+'_attachments'" mode="editor" class="my-2" :model="model.attachments"></files>
        <mu-row gutter>

          <mu-col width="100" tablet="50" desktop="33">
            <mu-raised-button fullWidth primary icon="done" :disabled="!model.value" @click="save_click"
                              label="Да"></mu-raised-button>
          </mu-col>
          <mu-col width="100" tablet="50" desktop="33">
            <mu-raised-button fullWidth secondary icon="cancel" @click="cancel_click"
                              label="Нет"></mu-raised-button>
          </mu-col>
        </mu-row>
      </template>
    </template>
    <mu-icon-menu v-if="canManage" slot="right" icon="more_vert"
                  :anchorOrigin="{horizontal: 'right', vertical: 'bottom'}"
                  :targetOrigin="{horizontal: 'right', vertical: 'top'}">
      <mu-menu-item title="Поправить" icon="edit" :disabled="!canEdit" @click.prevent="edit_click"/>
      <mu-menu-item title="Снять с гооосования" icon="close" :disabled="!canDestroy" @click.prevent="destroy_click"/>
    </mu-icon-menu>
  </slovo-as-item-abstract>
</template>

<script>
  import Application from "../Application"
  import logMixin from "./mixin/log"
  import kopnikAsLink from "./kopnik-as-link.vue"
  let models = require("../model")

  export default  {
//    mixins:[logMixin],
    mixins: [require("./mixin/humanize")],
    name: "predlozhenie-as-list-item",
    data() {
      return {
        /**
         * установленный пользователем режим поверх props.mode
         */
        localMode: undefined,
      }
    },
    props: ["id", "model", "mode"],
    components: {
      "slovo-as-item-abstract": require("./slovo-as-list-item-abstract.vue"),
      "files": require("./files.vue"),
      "sign": require("./sign.vue"),
      kopnikAsLink
    },
    computed: {
      userMode(){
        return this.localMode || this.mode
      },
      canManage(){
        return this.model.owner == Application.getInstance().user
      },
      canEdit(){
        return this.model.owner == Application.getInstance().user && this.model.golosa && this.model.golosa.length == 0
      },
      canDestroy(){
        return this.model.owner == Application.getInstance().user && !this.model.state
      }
    },
    methods: {
      showZa_click(){
        document.getElementById(`${this.id}_voted_za`).classList.toggle('show')
      },
      showProtiv_click(){
        document.getElementById(`${this.id}_voted_protiv`).classList.toggle('show')
      },
      async destroy_click(){
        if (this.canDestroy) {
          await this.model.destroy()
        }
      },
      async edit_click(){
        if (this.canEdit) {
          this.localMode = "editor"
          this.$emit("modeChange", this)
          await Promise.resolve()
          this.$refs.model_value.focus()
        }
      },
      async save_click(){
        if (this.model.value) {
          await this.model.save()
          this.localMode = "viewer"
          this.$emit("modeChange", this)
        }
      },
      async cancel_click(){
        await this.model.reload()
        this.localMode = "viewer"
        this.$emit("modeChange", this)
      },
      zemlaLoaded(){
        return this.model.place && this.model.place.place && this.model.place.place._isLoaded;
      },
      za_click: async function () {
        if (this.model.golosa.find(eachGolos =>
            eachGolos.owner == Application.getInstance().user && eachGolos.value == 1
          )) {
          await Application.getInstance().user.vote(this.model, 0);
        }
        else {
          await Application.getInstance().user.vote(this.model, 1);
        }
      },
      protiv_click: async function () {
        if (this.model.golosa.find(eachGolos =>
            eachGolos.owner == Application.getInstance().user && eachGolos.value == -1
          )) {
          await Application.getInstance().user.vote(this.model, 0);
        }
        else {
          await Application.getInstance().user.vote(this.model, -1);
        }
      }
    },
    created: async function () {
      this.log = require("loglevel").getLogger(this.$options.name + ".vue")

      if (this.model.id) {
        await this.model.joinedLoaded();
        await this.model.place.joinedLoaded();
        await this.model.place.place.joinedLoaded();

        if (!this.model.golosa) {
          await this.model.reloadGolosa();
        }
      }
    },
  }
</script>

<style scoped>
  .slovo-as-list-item-abstract {

  }
</style>
