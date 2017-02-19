/**
 * Created by alexey2baranov on 09.02.17.
 */

let _ = require("lodash")

module.exports= {
  filters: {
    humanize: function (value) {
      if (value instanceof Date) {
        return value.toLocaleString()
      }
    },

    humanizeDiskSpase: function (diskSpaceInBytes) {
      if (diskSpaceInBytes<1000) {
        return diskSpaceInBytes + " байт"
      }
      else if (diskSpaceInBytes<1000000) {
        return _.round(diskSpaceInBytes/1000,1) + " Кб"
      }
      if (diskSpaceInBytes<1000000000) {
        return _.round(diskSpaceInBytes/1000000,1) + " Мб"
      }
      if (diskSpaceInBytes<1000000000000) {
        return _.round(diskSpaceInBytes/1000000000,1) + " Гб"
      }
    },

    percents(value){
      if (value) {
        return Math.round(value * 100)
      }
      else{
        return 0
      }
    },

    round(value){
      return Math.round(value)
    },

    round1(value){
      return _.round(value,1)
    }
  }
}
