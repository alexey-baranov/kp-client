/**
 * Created by alexey2baranov on 07.02.17.
 */

module.exports = {
  created(){
    this.log= require("loglevel").getLogger(this.$options.name+".vue")
  }
}
