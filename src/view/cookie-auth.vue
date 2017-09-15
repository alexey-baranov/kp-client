<template>
  <div classX="cookie-auth alert alert-success">
    <!--<h4 class="alert-heading text-center">-->
      <!--{{zapoved.title}}-->
    <!--</h4>-->
    <!--<div class="text-justify">-->
      <!--{{zapoved.description}}-->
    <!--</div>-->
  </div>
</template>

<script>
  import _ from "lodash"
  import $ from "jquery"

  import Application from "../Application"
  import captcha from './mixin/captcha'
  import config from "../../cfg/main"
  import logMixin from "./mixin/log"
  import Notifier from "../Notifier"
  import StateManager from "../StateManager"

  export default{
    name: "cookie-auth",
    mixins: [logMixin],
    data() {
      return {
        zapoved: undefined
      }
    },
    props: [],
    components: {},
    methods: {
      setZapoved(){
        let index = _.random(Application.getInstance().zapovedi.length - 1)
        this.log.debug(index)
        this.zapoved = Application.getInstance().zapovedi[index]
      }
    },
    created() {
      this.setZapoved()
      this.zapovediTimer = setInterval(this.setZapoved.bind(this), 10000)
    },
    mounted() {
    },
    beforeDestroy(){
      clearInterval(this.zapovediTimer)
    }
  }
</script>

<style scoped>
  .cookie-auth {
    position: fixed;
    left: 0;
    top: 60px;
    bottom: 0;
    right: 0;

    /*font-size: 100px;*/
    /*background-image: url("/static/logo/logo512x512.png");*/
    background-repeat: no-repeat;

    /*background-size: auto 50%;*/
    /*background-position: center bottom;*/
    background-size: contain;
    background-position: center;
  }
</style>
