<template>
    <li class="kopa-as-list-item">
        <template v-if="model.id">
            <div class="question">
                <router-link :to="{ name: 'kopa', params: { KOPA: model.id }}">{{model.question}}</router-link>
            </div>
        </template>
        <template v-else>
            <textarea class="question" v-model="model.question"
                      placeholder="Вопрос, который нужно обсудить на копе">            </textarea>
            <textarea class="note" v-model="model.note" placeholder="Примечание">            </textarea>
            <textarea class="predlozhenie" v-model="model.result[0].value"
                      placeholder="Предложение, которое будет поставлено на голосование на копе">            </textarea>
            <slot></slot>
        </template>
    </li>
</template>

<script>
    let RemoteModel = require("../model/RemoteModel");

    export default  {
        props: ["id", "model"],
        created: function () {
            if (this.model.id) {
                this.model.loaded();
            }
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