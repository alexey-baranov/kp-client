<template>
    <li :id= "id" class="kopa-as-list-item" >
        <div class="question">{{model.question}}</div>
    </li>
</template>

<script>
    let RemoteModel= require("../model/RemoteModel");

    export default  {
        props: ["id", "model"],
        created: function () {
            this.model.loaded();
        }
    }
</script>

<style scoped>
    .kopa-as-list-item {
        border: solid black 1px;
    }

    .created {
        font-size: smaller;
    }

    .value {

    }

    .toolbar {
        background-color: #cccccc;
        font-size: smaller;
    }
</style>