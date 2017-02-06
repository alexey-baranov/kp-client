<template>
  <div class="location">
    <ol class="breadcrumb">
      <li v-for="eachNode of nodes" class="breadcrumb-item">
        <zemla-as-link v-if="modelClassName=='Zemla'" :model="eachNode"></zemla-as-link>
        <zemla-as-link v-if="modelClassName=='Kopa'" :model="eachNode"></zemla-as-link>
        <kopnik-as-link v-if="modelClassName=='Kopnik'" :model="eachNode"></kopnik-as-link>
      </li>
    </ol>
  </div>
</template>

<script>
  import models from '../model'

  export default{
    data: function () {
      return {
        nodes: []
      }
    },
    props: ["id", "model", "full"],
    watch: {
      model: async function () {
        await this.fillNodes()
      }
    },
    components: {
      "zemla-as-link": require('./zemla-as-link.vue'),
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
        if (this.full=="true" && (this.model instanceof models.Zemla || this.model instanceof models.Kopnik)){
            this.nodes.push(this.model)
        }
        await this.model.loaded()
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
          await eachNode.loaded()
          if (this.model==localModel) {
            this.nodes.unshift(eachNode)
          }
          else{
              break
          }
        }
      },
    },
    created: function () {
      this.log = require("loglevel").getLogger("location.vue")
      this.fillNodes()
    },
    mounted: function () {
    },
  }

</script>

<style scoped>
</style>

<style>
</style>
