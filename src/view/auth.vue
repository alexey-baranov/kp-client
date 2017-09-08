<template>
  <div :id="id" class="auth">
      <form class="row">
        <div class="col-10 col-sm-7 col-md-5 col-lg-3 mx-auto my-auto">
          <div class="form-group w-100">
            <input type="text" class="form-control" required placeholder="Электронная почта" v-model="email">
          </div>
          <div class="form-group w-100">
            <input type="password" class="form-control" required placeholder="Пароль" v-model="password">
          </div>
          <div class="form-group w-100">
            <div id="g-recaptcha"></div>
          </div>
          <div class="form-group w-100">
            <input type="submit" class="btn btn-primary btn-block mt-3" value="Войти" :disabled="false && !((captchaResponse || email==unittest2Username) && email && password )"
                   @click.prevent="submit_click">
          </div>
          <div>
            Или перейдите на <a href="/?state=registration" @click.prevent="registration_click">страницу регистрации</a>
          </div>

          <!--<iframe width="100%" height="auto" src="https://www.youtube.com/embed/Zo77aWoW_vc?list=PL8t968Ip0ARlvJj1gAUQCjPNzOORGIMTR" frameborder="0" allowfullscreen></iframe>-->
        </div>
      </form>
  </div>
</template>

<script>
  import $ from "jquery"

  import Application from "../Application"
  import captcha from './mixin/captcha'
  import config from "../../cfg/main"
  import logMixin from "./mixin/log"
  import Notifier from "../Notifier"
  import StateManager from "../StateManager"

  export default{
    name:"auth",
//    mixins:[logMixin, captcha],
    mixins:[captcha],
    data() {
      return {
        email: null, //"unittest2@domain.ru",
        password: null, //"qwerty",
        captchaResponse: undefined,
        unittest2Username: config.unittest2.username,
      }
    },
    props: ["id"],
    components: {},
    methods: {
      captchaCallback(response){
        this.captchaResponse = response
      },
      captchaExpiredCallback(){
        this.captchaResponse = undefined
      },
      registration_click(event){
        Application.getInstance().section = Application.Section.Registration
        StateManager.getInstance().pushState()
        event.preventDefault()
      },
      submit_click() {
        this.$emit("input", this.$data)
        this.captchaResponse= undefined
        global.grecaptcha.reset()
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
    },
    mounted() {
    },
    beforeDestroy(){
    }
  }

</script>

<style scoped>
  .auth form {
    min-height: 70vh;
    /*width: 17rem*/
  }

  iframe{
    margin-top: 2rem;
  }
</style>
