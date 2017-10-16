<template>
  <slovo-as-item-abstract :id="id" :model="model">
    <template slot="middle">
      <template v-if="userMode !='editor'">
        <div class="text-preX kp-markdown" style="overflow-x: hidden;" v-html="modelMarkdownValue"></div>
                <!--скрываю v-show чтобы не было лишних маргинов-->
        <files v-show="model.attachments && model.attachments.length" :id="id+'_attachments'" class="my-2" :model="model.attachments"></files>
      </template>
      <template v-else>
        <mu-text-field ref="model_value" class="my-0" fullWidth multiLine
                       hintText="Ваше слово..." :rows="1" :rowsMax="5"
                       v-model="model.value" @keyup.native.ctrl.enter="save_click"/>
        <files :id="id+'_attachments'" mode="editor" :model="model.attachments" class="my-2"></files>
        <mu-row gutter>

          <mu-col width="100" tablet="50">
            <mu-raised-button fullWidth primary icon="done" :disabled="!model.value" @click="save_click"
                              label="Да"></mu-raised-button>
          </mu-col>
          <mu-col width="100" tablet="50">
            <mu-raised-button fullWidth secondary icon="cancel" @click="cancel_click"
                              label="Нет"></mu-raised-button>
          </mu-col>
        </mu-row>
      </template>
    </template>

<!--    <mu-icon-menu v-if="canManage" slot="right" icon="more_vert"
                  :anchorOrigin="{horizontal: 'right', vertical: 'bottom'}"
                  :targetOrigin="{horizontal: 'right', vertical: 'top'}">
      <mu-menu-item title="Поправить" icon="edit" :disabled="!canEdit" @click.prevent="edit_click"/>
      &lt;!&ndash;<mu-menu-item title="Удалить" icon="close" :disabled="false" @click.prevent="destroy_click"/>&ndash;&gt;
    </mu-icon-menu>-->

  </slovo-as-item-abstract>
</template>

<script>
  import {Converter} from "showdown"

  import Application from "../Application"
  import logMixin from "./mixin/log"
  import humanize from "./mixin/humanize"
  let models = require("../model")

  export default  {
    mixins:[logMixin, humanize],
    name: "slovo-as-list-item",
    data() {
      return {
        /**
         * установленный пользователем режим поверх props.mode
         */
        localMode: undefined,
      }
    },
    props: ["id", "model", "mode"],
    mixins: [require("./mixin/humanize")],
    components: {
      "files": require("./files.vue"),
      "slovo-as-item-abstract": require("./slovo-as-list-item-abstract.vue"),
    },
    computed:{
      modelMarkdownValue(){
        let converter= new Converter({simplifiedAutoLink: true, simpleLineBreaks: true})
        return converter.makeHtml(this.model.value)
      },
      userMode(){
        return this.localMode || this.mode
      },
      canManage(){
        return this.model.owner == Application.getInstance().user
      },
      canEdit(){
        return this.model.owner == Application.getInstance().user
      }
    },
    methods: {
      async save_click(){
        await this.model.save()
        this.localMode = "viewer"
        this.$emit("modeChange", this)
      },
      async cancel_click(){
        await this.model.reload()
        this.localMode = "viewer"
        this.$emit("modeChange", this)
      },
      async edit_click(){
        this.localMode = "editor"
        this.$emit("modeChange", this)
        await Promise.resolve()
        this.$refs.model_value.focus()
      },
    },
    created: async function () {
      if (this.model.id) {
        await this.model.joinedLoaded();
      }
    },
  }
</script>

<style>

</style>
<style scoped>
  .slovo-as-list-item {

  }
</style>
