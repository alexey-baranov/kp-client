<template>
    <li :id="id" class="predlozhenie-as-list-item" :class="{stateZa: model.state==1, stateProtiv: model.state==-1}">
        <template v-if="model.id">
            <div class="value">{{model.value}}</div>
            <div class="note">{{model.note}}</div>
            <div class="toolbar">
                <div class="golosa">
                    <a href="#" @click.prevent="onZa">За</a>: {{model.totalZa}}
                    <template v-if="zemlaLoaded">({{model.totalZa/model.place.place.obshinaSize*100}}%)</template>
                    <kopnik-as-link v-for="eachZa of model.za" :model="eachZa.owner"> (+{{eachZa.owner.voiskoSize}})
                    </kopnik-as-link>
                    <a href="#" @click.prevent="onProtiv">Против</a>: {{model.totalProtiv}}
                    <template v-if="zemlaLoaded">({{model.totalProtiv/model.place.place.obshinaSize*100}}%)</template>
                    <kopnik-as-link v-for="eachProtiv of model.protiv" :model="eachProtiv.owner">
                        (+{{eachProtiv.owner.voiskoSize}})
                    </kopnik-as-link>
                </div>
                Автор:
                <kopnik-as-link :model="model.author"></kopnik-as-link>
                Дата: {{model.created}}
            </div>
        </template>
        <template v-else>
            <textarea class="value" v-model="model.value"
                      placeholder="Ваше предложение, которое будет поставлено на голосование на копе"> </textarea>
            <textarea class="note" v-model="model.note" placeholder="Примечание"></textarea>
            <slot></slot>
        </template>
    </li>
</template>

<script>
    let models = require("../model");

    module.exports = {
        props: ["id", "model"],
        created: async function () {
            if (this.model.id) {
                await this.model.loaded();
                await this.model.place.loaded();
                await this.model.place.place.loaded();

                if (!this.model.golosa) {
                    await this.model.reloadGolosa();
                }
            }
        },
        methods: {
            zemlaLoaded(){
                return this.model.place && this.model.place.place && this.model.place.place._isLoaded;
            },
            onZa: async function () {
                if (this.model.golosa.find(eachGolos=>eachGolos.owner == models.Kopnik.current && eachGolos.value == 1)) {
                    await models.Kopnik.current.vote(this.model, 0);
                }
                else {
                    await models.Kopnik.current.vote(this.model, 1);
                }
            },
            onProtiv: async function () {
                if (this.model.golosa.find(eachGolos=>eachGolos.owner == models.Kopnik.current && eachGolos.value == -1)) {
                    await models.Kopnik.current.vote(this.model, 0);
                }
                else {
                    await models.Kopnik.current.vote(this.model, -1);
                }
            }
        },
        components: {
            "kopnik-as-link": require("./kopnik-as-link.vue")
        }
    }
</script>

<style scoped>
    .predlozhenie-as-list-item {
        border: solid black 1px;
    }

    .stateZa {
        background-color: green;
    }

    .stateProtiv {
        background-color: red;
    }

    .created {
        font-size: smaller;
    }

    .value {

    }

    .toolbar {
        background-color: rgba(150, 150, 150, 0.5);
        font-size: smaller;
    }
</style>