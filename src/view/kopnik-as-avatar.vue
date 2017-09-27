<template>
  <div class="kopnik-as-avatar d-flex align-items-center flex-nowrap">
    <mu-avatar :class="{'mr-3':$slots && $slots.default}" style="flex: 0 0 auto" :color="color" :backgroundColor="backgroundColor">
      <b>{{model.name ? model.name.substring(0, 1) : ""}}</b>
    </mu-avatar>
    <div>
      <slot/>
    </div>
  </div>
</template>

<script>
  import Application from '../Application'
  import humanize from "./mixin/humanize"
  import logMixin from "./mixin/log"
  import StateManager from "../StateManager"

  export default  {
    mixins: [logMixin, humanize],
    name: "kopnik-as-avatar",
    data(){
      return {
        colors: [{color: "white", background: "red500"},
          {color: "Black", background: "lime500"},
          {color: "Black", background: "yellow500"},
          {color: "Black", background: "green500"},
          {color: "Black", background: "lightBlue500"},
          {color: "white", background: "blue500"},
          {color: "white", background: "purple500"},
        ],
      }
    },
    props: ["id", "model", "target"],
    components: {
      "kopnik-as-link": require("./kopa-as-link.vue")
    },
    computed: {
      color(){
        let result
        if (this.model.name) {
          result = this.colors[this.getNameIndex()].color
        }
//        this.log.debug("color", result)
        return result
      },
      backgroundColor(){
        let result
        if (this.model.name) {
          result = this.colors[this.getNameIndex()].background
        }
//        this.log.debug("background color", result)
        return result
      }
    },
    methods: {
      /**
       * весь алфавит делится на семь групп
       * каждой группе соотвествует свой цветиз кажыый охотник желает знать...
       * @return {number}
       */
      getNameIndex(){
        let A = this.model.name.toUpperCase().substr(0, 1)
        if (A.match(/[А-Я]/)) {
          return Math.floor((A.charCodeAt(0) - "А".charCodeAt(0)) / 4.72)
        }
        else if (A.match(/[A-Z]/)) {
          return Math.floor((A.charCodeAt(0) - "A".charCodeAt(0)) / 3.72)
        }
        else {
          return 6
        }
      },
    },
    created()
    {
      this.model.joinedLoaded()
    },
    mounted(){
    }
  }
</script>

<style scoped>
  .kopnik-as-avatar {
  }
</style>
