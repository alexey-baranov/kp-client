/**
 * Created by alexey2baranov on 09.02.17.
 */

let _ = require("lodash")

module.exports = {
  methods: {
    getScrollItem(){
      return

      let itemViews = this.getScrollItemViews(false),
        result,
        resultOffset = Infinity,
        screenOffset = $(document).scrollTop(),
        isScrolled = false

      for (let eachItemView of itemViews) {
        let eachItemViewOffset = $(eachItemView.$el).offset().top

        if (eachItemViewOffset <= screenOffset) {
          isScrolled = true
        }

        if (screenOffset < eachItemViewOffset && eachItemViewOffset < resultOffset) {
          result = eachItemView.model
          resultOffset = eachItemViewOffset
        }
      }

      if (isScrolled) {
        this.log.debug("scroll item", result)
        return result
      }
    },
    async setScrollItem(value){
      return
      let itemViews = await this.getScrollItemViews(true)
      valueView = itemViews.find(eachView => eachView.model == value)
      if (valueView) {
        let offset = $(valueView.$el).offset().top - 1
        this.log.debug("scroll item", value, "scroll offset", offset)
        $(document).scrollTop(offset)
      }
    },

    getScrollItemViews(async = false){
      throw new Error("getItemViews() not implemented")
    }
  }
}
