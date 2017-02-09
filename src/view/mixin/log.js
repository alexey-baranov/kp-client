/**
 * Created by alexey2baranov on 07.02.17.
 */

export default {
  created(){
    this.log= require("loglevel").getLogger(this.$data.name+".vue")
  }
}
