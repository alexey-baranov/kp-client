/**
 * Created by alexey2baranov on 09.02.17.
 */
module.exports= {
  filters: {
    humanize: function (value) {
      if (value instanceof Date) {
        return value.toLocaleString()
      }
    }
  }
}
