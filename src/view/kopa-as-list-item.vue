<template>
  <div :id="id" class="kopa-as-list-item" :class="{'kopa-as-list-item--empty':mode=='editor' && !model.question}">
    <template v-if="mode=='editor'">
    <textarea class="form-control" v-model="model.question"
              placeholder="Вопрос, который нужно обсудить на копе"></textarea>
    </template>
    <template v-else>
      <div>{{model.question}}</div>
      </tempdiv>
    </template>
    <slot></slot>
  </div>
</template>

<script>
  import $ from "jquery"
  import Application from "../Application"

  let RemoteModel = require("../model/RemoteModel");
  const log = require("loglevel").getLogger("kopa-as-list-item.vue")
  import StateManager from "../StateManager"

  export default  {
    props: ["id", "model", "mode"],
    methods: {
      a_click(e){
        Application.getInstance().goTo(this.model)
        StateManager.getInstance().pushState()
      }
    },
    created: function () {
      if (this.model.id) {
        this.model.loaded();
      }
    }
  }
</script>

<style scoped>
  .kopa-as-list-item {
  }

  .kopa-as-list-item textarea {
    height: 6em;
  }

  .kopa-as-list-item--empty textarea {
    height: 2.5em;
  }

  .kopa-as-list-item--empty button {
    display: none;
  }
</style>
