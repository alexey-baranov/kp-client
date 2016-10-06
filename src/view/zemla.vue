<template>
    <div :id="id" class="zemla">
        <div class="header">
            <span class="name">{{model2.name}}</span>
        </div>
        <div class="bottom">
        </div>
        <ul class="kopi">
            <kopa-as-list-item :model="createdKopa">
                <button @click="onKopaCreate">Сохранить черновик</button>
            </kopa-as-list-item>
            <kopa-as-list-item v-for="eachKopa of model2.kopi" :model="eachKopa"></kopa-as-list-item>
        </ul>
    </div>
</template>

<script>
    let models = require("../model");

    export default{
        data: function () {
            return {
            /*
             Эта копа передается во вьюшку перед списком коп
             */
                createdKopa: null
            };
        },
        props: ["id", "model"],
        components: {
            "kopa-as-list-item": require("./kopa-as-list-item.vue"),
            "kopa": require("./kopa.vue"),
        },
        watch: {
            /**
             * Переход с одной земли на другую через сайдбар
             */
            $route(){
                this.createdKopa= this.getEmptyKopa();
                this.reloadModel();
            }
        },
        created: function () {
            this.createdKopa= this.getEmptyKopa();
            this.reloadModel();
        },
        computed: {
            /**
             * Модель из свойства :model или из маршрута :ZEMLA
             * @return {*}
             */
            model2(){
                if (!this.model && this.$route.params.ZEMLA) {
                    return models.Zemla.getReference(this.$route.params.ZEMLA)
                }
                else {
                    return this.model;
                }
            },

        },
        methods: {
            reloadModel: async function () {
                await this.model2.loaded();
                if (!this.model2.kopi) {
                    await this.model2.reloadKopi();
                }
            },

            /**
             * Пустая копа-кандидат для земли model2
             * Уходит во вьюшку перед списком коп, ее можно заполнить и создать
             *
             * @return {{place: *, inviter: *, question: null, note: null, result: *[]}}
             */
            getEmptyKopa(){
                return {
                    place: this.model2,
                    inviter: models.Kopnik.current,
                    question: null,
                    note: null,
                    result: [{
                        author: models.Kopnik.current,
                        value: null,
                        note: null
                    }]
                };
            },
            /**
             * Создает новую копу
             */
            onKopaCreate: async function () {
                let kopaCandidate= this.createdKopa;

                /**
                 * this.createdKopa - модель для kopa-as-list-item-view,
                 * поэтому нужно привязать новую модель к ней и только потом химичить с ее предложениями и др. свойствами
                 */
                this.createdKopa = this.getEmptyKopa();

                let resultCandidate=  kopaCandidate.result[0];
                kopaCandidate.result.length=0; //это нужно потому что пока в cteate() происходит assign() всех свойств

                let kopa = await models.Kopa.create(kopaCandidate);
                await kopa.invite();
                console.log("remove immid inviting");

                if (resultCandidate.value) {
                    resultCandidate.place = kopa;
                    let result= await models.Predlozhenie.create(resultCandidate);
//                    kopa.result=[result];
                }
            }
        }
    }
</script>


<style scoped>
    .header {
        background-color: #cccccc;
        font-size: smaller;
    }
</style>