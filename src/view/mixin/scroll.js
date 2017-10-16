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
    /**
     * ожидает до тех пор, когда можно выполнить скрол
     * например подгрузить диалог, список коп, подгрузить другие поля и т.д.
     */
    waitUntilScrollReady(value){
      throw new Error("waitUntilScrollReady() not implemented")
    },
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
        appbarHeight= $("#appbar").height()

        isScrolled = false

      for (let eachItemView of itemViews) {
        let eachItemViewOffset = $(eachItemView.$el).offset().top

        /**
         * -1 это другими словами означает что
         * вплотную подошел - тоже считается за скролл
         */
        if (eachItemViewOffset-1 <= screenOffset + appbarHeight) {
          isScrolled = true
        }

        if (screenOffset + appbarHeight < eachItemViewOffset && eachItemViewOffset < resultOffset) {
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
        await this.waitUntilScrollReady(value)
        let itemViews = await this.getScrollItemViews(),
          appbarHeight= $("#appbar").height()
        valueView = itemViews.find(eachView => eachView.model == value)
        if (valueView) {
          let offset = $(valueView.$el).offset().top - appbarHeight- 1
          this.log.debug("scroll item", value, "scroll offset", offset)
          $(document).scrollTop(offset)
        }
        else{
          this.log.warn("scroll item", value, "value view not found. Scroll to top")
          $(document).scrollTop(0)
        }
      }
    },
    getScrollItemViews(){
      throw new Error("getItemViews() not implemented")
    }
  },
  mounted(){
    this.model_change(this.model)
  },
  beforeDestroy(){
    this.model_change(null, this.model)
  }
}
