<template>
    <ol class="location breadcrumb">
      <li v-for="eachNode of nodes" class="breadcrumb-item">
        <zemla-as-link v-if="eachNode.constructor.name=='Zemla'" :target="target" :model="eachNode"></zemla-as-link>
        <kopa-as-link v-if="eachNode.constructor.name=='Kopa'" :target="target" :model="eachNode"></kopa-as-link>
        <kopnik-as-link v-if="eachNode.constructor.name=='Kopnik'" :target="target" :model="eachNode"></kopnik-as-link>
      </li>
    </ol>
</template>

<script>
  import logMixin from "./mixin/log"
  import models from '../model'

  export default{
//    mixins:[logMixin],
    name:"location",
    data() {
      return {
        nodes: []
      }
    },
    props: ["id", "model", "full", "target"],
    watch: {
      model: async function () {
        await this.fillNodes()
      }
    },
    components: {
      "zemla-as-link": require('./zemla-as-link.vue'),
      "kopa-as-link": require('./kopa-as-link.vue'),
      "kopnik-as-link": require('./kopnik-as-link.vue'),
    },
    computed: {
      modelClassName(){
        let result = this.model.constructor.name
        this.log.debug(result)
        return result
      }
    },
    methods: {
      fillNodes: async function () {
        this.log.debug(`filling nodes for ${this.model}`)
        /**
         * за время пока ноды асинхронно загружаются уже может быть выбран иной body
         * и в таком случае старый цикл нод должен прерваться
         * переписать на rxjs?
         */
        let localModel= this.model
        this.nodes = []
        if (this.full=="true" /*&& (this.model instanceof models.Zemla || this.model instanceof models.Kopnik)*/){
            this.nodes.push(this.model)
        }
        await this.model.joinedLoaded()
        let initialNode
        switch (this.modelClassName) {
          case "Zemla":
          case "Kopnik":
            initialNode = this.model.parent
            break;
          case "Kopa":
            initialNode = this.model.place
            break;
          default:
            throw new Error(`Incorrect model class ${this.modelClassName}`)
        }

        for (let eachNode = initialNode; eachNode; eachNode = eachNode.parent) {
          await eachNode.joinedLoaded()
          if (this.model==localModel) {
            this.nodes.unshift(eachNode)
          }
          else{
              break
          }
        }
      },
      getClassName: function(instance){
        return instance.constructor.name
      }
    },
    created() {
      this.log = require("loglevel").getLogger(this.$options.name+".vue")
      this.fillNodes()
    },
    mounted() {
    },
  }

</script>

<style scoped>
  ol{
    list-style: none;
  }
</style>

<style>
</style>
