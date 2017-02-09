/**
 * Created by alexey2baranov on 07.02.17.
 */
import logMixin from "./log"

export default {
  // mixins: [logMixin],
  mounted() {
    //отложенная инициализация капчи, потому что иногда не успевает подгрузиться
    this.captchaInterval = setInterval(() => {
      if (global.grecaptcha) {
        clearInterval(this.captchaInterval)
        this.captchaInterval = undefined
        try {
          grecaptcha.render(
            "g-recaptcha",
            {
              "sitekey": "6Le-9BMUAAAAAIx-D7vLPKysleUXNU6tzOlcX8Kr", "theme": "light",
              "size": $(window).width() < 500 ? "compact" : "normal",
              callback: (response) => {
                this.log.debug(captchthis.response)
                this.captchaCallback(response)
              },
              "expired-callback": () => {
                this.log.debug("captcha expired")
                this.captchaExpiredCallback()
              },
            }
          )
        }
        catch (err) {
          Notifier.getInstance().pushNotification("Google Антибот недоступен")
          this.log.error(err)
        }
      }
      else {
        this.log.warn("grecaptcha not ready")
      }
    }, 1000)
  },
  beforeDestroy(){
    /**
     * переход на другую вьюшку произошел до того как капча инициализировалась
     */
    if (this.captchaInterval) {
      this.log.debug("clearing capture interval")
      clearInterval(this.captchaInterval)
    }
  }
}
