<template>
  <div class="sidebar" :class="{'d-none':!open, docked, floating:!docked, 'mu-card':!docked}"
       style="flex-basis: auto; flex-shrink: 0; overflow-x: hidden; overflow-y: auto; z-index: 1">
    <div v-show="!docked && open" class="shadow kp-pos-fixed" ref="shadow"
         style="z-indexX: 9; background: rgba(0,0,0,0.5); left:0; top:0; right: 0; bottom:0;" @click="shadow_click"></div>

    <mu-list  ref="items" class="p-0 m-0" style="background: white;" @itemClick="listItem_click">
      <mu-list-item v-for="eachUserDom of userDoma" :href="'?state=main&body=Zemla:'+eachUserDom.id"
                    @click.prevent="zemla_list_item_click(eachUserDom)">
        {{eachUserDom.name}}
        <small>({{eachUserDom.obshinaSize}})</small>
      </mu-list-item>
      <mu-list-item v-if="application.user && application.user.registrations && application.user.registrations.length"
                    href="?state=verification" @click.prevent="verification_click">
        Регистрации
      </mu-list-item>
      <mu-list-item href="https://www.youtube.com/channel/UCJRtg8s94PTFXEfZ6sEnlGw" target="_blank" @click="">
        Youtube
      </mu-list-item>
      <mu-list-item href="https://github.com/alexey-baranov/kp-client-issues/issues" target="_blank" @click="">
        Техподдержка
      </mu-list-item>
      <mu-list-item v-if="application.user" @click.prevent="close_click">
        Выход
      </mu-list-item>
    </mu-list>
  </div>
</template>

<script>
  let $ = require("jquery")
  import Vue from "vue"
  import CookieAuth from "./cookie-auth";

  import Application from "../Application"
  import logMixin from "./mixin/log"
  import Notifier from "../Notifier"
  import Grumbler from "../Grumbler"
  import StateManager from "../StateManager"
  import Connection from "../Connection"

  export default{
    name: "sidebar",
    mixins: [logMixin],
    data(){
      return {
        userDoma: [],
      }
    },
    props: ["id", "application", "open", "docked"],
    watch: {
      "application.user": async function () {
        this.log.debug("user watcher")
        if (this.application.user) {
          await this.application.user.joinedLoaded()
          this.userDoma = [await this.application.user.dom.joinedLoaded()].concat(await this.application.user.dom.getParents()).reverse()
        }
        else {
          this.userDoma = null
        }
      },
      async open(cur){
        if (cur) {
          await Promise.resolve()
          this.setupSize()
        }
      }
    },
    components: {
      "zemla-as-link": require('./zemla-as-link.vue'),
    },
    computed: {},
    methods: {
      shadow_click(){
          this.$emit("close")
        },
      async zemla_list_item_click(dom){
        Application.getInstance().goTo(dom, true)
        await Promise.resolve()
        StateManager.getInstance().pushState()
      },
      listItem_click(){
        if (!this.docked) {
          this.$emit("close")
        }
      },
      /**
       * resize() делается на mu-list потому что он белый и перекрывает собой черную подложку
       */
      async setupSize(){
        let height = $(window).height() - $(this.$el).offset().top + $(document).scrollTop() - 0
        this.log.debug("height", height)
        $(this.$refs.items.$el).height(height)
      },
      close_click(){
        this.application.logout()
      },
      verification_click(){
        this.application.setSection(Application.Section.Verification)
        StateManager.getInstance().pushState()
      },
    },
    async created() {
      if (this.application.user) {
        await this.application.user.reloadRegistrations()
        this.userDoma = [await this.application.user.dom.joinedLoaded()].concat(await this.application.user.dom.getParents()).reverse()
      }
    },
    mounted() {
      this.setupSize()
      window.addEventListener('resize', this.setupSize.bind(this))
/*      new ResizeObserver(entries=>{
          debugger
        let left = entries[0].contentRect.width
        this.log.debug("shadow left", left)
        $(this.$refs.shadow).css("left", left+"px")
      }).observe(this.$el)*/
    },
    async beforeDestroy(){
    }
  }
</script>

<style scoped>
  .floating {
    position: fixed;
  }

  .docked {
    position: sticky;
    /*высота аппбара*/
    top: 64px;
  }

  .sidebar > .mu-list {
    overflow-y: auto;
    /*height: 10rem;*/
    /*border: solid black 1px;*/
  }

  .title {

  }
</style>

<style>

  @mediaX (max-width: 575px) {
    .mu-item {
      padding-left: 0.5rem;
      padding-right: 0.5rem;
    }
  }
</style>
