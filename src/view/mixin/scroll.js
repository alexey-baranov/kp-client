/**
 * Created by alexey2baranov on 09.02.17.
 */

let _ = require("lodash")

/**
 * отвечает за весь скрол.
 * если пользователь скрол не выполнил, то скролом считается последний запомненый model.scrollItem
 * если выполнил то находится scrollItem и он запоминается в model.scrollItem
 *
 * установка скрола происходит асинхронно потому что это может быть связано с подгрузкой моделей и списков
 *
 * для определения каждая дочерняя вьюха обязана переопределить getScrollItemViews()
 * который используется для определения и установки текущего scrollItem
 *
 * @type {{watch: {model: module.exports.methods.model_change}, methods: {model_change: ((current?, prev?)), getScrollItem: (()), setScrollItem: ((value?)=>Promise), getScrollItemViews: ((async?))}, mounted: (()), beforeDestroy: (())}}
 */
module.exports = {
  watch: {
    model: this.model_change
  },
  methods: {
    model_change(current, prev){
      if (prev) {
        window.removeEventListener("scroll", this.window_scroll)
      }
      if (current) {
        this.scrolled = false
        window.addEventListener('scroll', this.window_scroll = (e) => {
          this.scrolled = true
        })
      }
    },
    getScrollItem(){
      if (!this.scrolled) {
        this.log.debug("window is not scrolled. return persisted scroll item", this.model.scrollItem)
        return this.model.scrollItem
      }

      let itemViews = this.getScrollItemViews(false)

      if (!itemViews) {
        this.log.debug("scroll views is undefined. just now goTo? return persistent scroll item", this.model.scrollItem)
        return this.model.scrollItem
      }

      let result,
        resultOffset = Infinity,
        screenOffset = global.pageYOffset,//$(document).scrollTop(),

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
      }
      else {
        this.log.debug("scroll position is on top. scroll item = null")
        result = null
      }
      this.model.scrollItem = result
      return result

    },
    async setScrollItem(value){
      if (!value) {
        $(document).scrollTop(0)
      }
      else {
        let itemViews = await this.getScrollItemViews(true)
        valueView = itemViews.find(eachView => eachView.model == value)
        if (valueView) {
          let offset = $(valueView.$el).offset().top - 1
          this.log.debug("scroll item", value, "scroll offset", offset)
          $(document).scrollTop(offset)

        }
      }
    },
    getScrollItemViews(async = false){
      if (async) {
        return (async() => {
          throw new Error("getItemViews() not implemented")
        })()
      }
      else {
        throw new Error("getItemViews() not implemented")
      }
    }
  },
  mounted(){
    this.model_change(this.model)
  },
  beforeDestroy(){
    this.model_change(null, this.model)
  }
}
