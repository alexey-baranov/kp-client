<template>
  <mu-drawer :docked="docked" :open="open" class="sidebar" :class="{'d-noneX':!open}" @close="drawer_close">
    <!--докнутый сайдбар пепеопределяется снаружи на position=sticky-->
<!--
<div class="d-flexX">
      <kopnik-as-avatar class="p-2 mx-auto":model="application.user">
        <span class="pl-2">{{application.user.name}}</span>
      </kopnik-as-avatar>
    </div>-->
    <mu-appbar class="sticky-top" title="kopnik.org"></mu-appbar>

    <mu-list ref="items" class="p-0 m-0" style="overflow-x: hidden; background: white;" @itemClick="listItem_click">
      <mu-list-item v-for="eachUserDom of userDoma" :href="'?state=main&body=Zemla:'+eachUserDom.id"
                    @click.prevent="zemla_list_item_click(eachUserDom)" :title="eachUserDom.name">

        <!--{{eachUserDom.name}}-->

        <span slot="right">({{eachUserDom.obshinaSize}})</span>
        <mu-icon slot="left" value="home"></mu-icon>
      </mu-list-item>
      <mu-divider/>
      <mu-list-item v-if="application.user && application.user.registrations && application.user.registrations.length"
                    href="?state=verification" @click.prevent="verification_click">
        Регистрации
        <mu-icon slot="left" value="folder"></mu-icon>
      </mu-list-item>
      <mu-list-item href="https://www.youtube.com/channel/UCJRtg8s94PTFXEfZ6sEnlGw" target="_blank" @click="">
        Youtube
        <mu-icon slot="left" value="videocam"></mu-icon>
      </mu-list-item>
      <mu-list-item href="https://github.com/alexey-baranov/kp-client-issues/issues" target="_blank" @click="">
        Техподдержка
        <mu-icon slot="left" value="chat"></mu-icon>
      </mu-list-item>
      <mu-list-item v-if="application.user" @click.prevent="close_click">
        Выход
        <mu-icon slot="left" value="exit_to_app"></mu-icon>
      </mu-list-item>
    </mu-list>
  </mu-drawer>
</template>

<script>
  let $ = require("jquery")
  import Vue from "vue"
  import KopnikAsAvatar from "./kopnik-as-avatar";
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
    },
    components: {
      KopnikAsAvatar,
      "zemla-as-link": require('./zemla-as-link.vue'),
    },
    computed: {},
    methods: {
      drawer_close(){
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
      async setupTop(){
        debugger
        if (this.open){
            $(this.$el).css("top", $("#appbar").height())
        }
        let height = $(window).height() - $(this.$el).offset().top + $(document).scrollTop() - 0
        this.log.debug("window height", $(window).height(), "height", height)
        $(this.$el).height(height)
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
//      this.setupTop()
//      window.addEventListener('resize', this.setupTop.bind(this))
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
/*

  .floating {
    position: fixed;
    max-width: 15em;
  }

  .docked {
    position: sticky;
    !*высота аппбара*!
    top: 64px;
  }

  .sidebar > .mu-list {
    overflow-y: auto;
    !*height: 10rem;*!
    !*border: solid black 1px;*!
  }

  .title {

  }
*/
</style>

<style>

</style>
