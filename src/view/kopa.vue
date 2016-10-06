<template>
    <div :id="id" class="kopa">
        <div class="header">
            <span class="inviter">{{model2.invited}}</span>
            <span class="created">{{model2.created_at}}</span>
        </div>
        <div class="question">
            {{model2.question}}
        </div>
        <div class="note">{{model2.note}}</div>
        <ul class="result">
            <predlozhenie-as-list-item :model="createdPredlozhenie">
                <button @click="onPredlozhenieCreate">Предложить</button>
            </predlozhenie-as-list-item>
            <predlozhenie-as-list-item v-for="eachPredlozhenie of model2.result" :model="eachPredlozhenie"></predlozhenie-as-list-item>
        </ul>
        <ul class="dialog">
            <slovo-as-list-item :model="createdSlovo">
                <button @click="onSlovoCreate">Говорить</button>
            </slovo-as-list-item>
            <slovo-as-list-item v-for="eachSlovo of model2.dialog" :model="eachSlovo" :id="id"></slovo-as-list-item>
        </ul>
    </div>
</template>

<script>
    const models = require("../model");
    export default{
        data: function () {
            return {
                /*
                 Это предложение-кандидат передается во вьюшку перед списком предложений
                 */
                createdPredlozhenie: null,
                createdSlovo: null,
            };
        },
        props: ["id", "model"],
        components: {
            "predlozhenie-as-list-item": require("./predlozhenie-as-list-item.vue"),
            "slovo-as-list-item": require("./slovo-as-list-item.vue")
        },
        watch: {
            /**
             * Переход с одной копы на другую (на всякий случай)
             */
            $route(){
                console.warn("странно что это выполняется");
                this.createdPredlozhenie = this.getEmptyPredlozhenie();
                this.createdSlovo = this.getEmptySlovo();
                this.reloadModel();
            }
        },
        created: function () {
            this.createdPredlozhenie = this.getEmptyPredlozhenie();
            this.createdSlovo = this.getEmptySlovo();
            this.reloadModel();
        },
        computed: {
            model2(){
                if (!this.model && this.$route.params.KOPA) {
                    return models.Kopa.getReference(this.$route.params.KOPA)
                }
                else {
                    return this.model;
                }
            }
        },
        methods: {
            reloadModel: async function () {
                await this.model2.loaded();
                if (!this.model2.result) {
                    await this.model2.loadResult();
                }
                if (!this.model2.dialog) {
                    await this.model2.loadDialog();
                }
            },

            /**
             * Пустое предложение-кандидит для копы model2
             * Уходит во вьюшку перед списком предложение, его можно заполнить и создать
             *
             * @return {{place: *, author: *, value: null, note: null}}
             */
            getEmptyPredlozhenie(){
                return {
                    value: null,
                    place: this.model2,
                    author: models.Kopnik.current,
                    note: null,
                };
            },
            /**
             * Создает новое предложение
             */
            onPredlozhenieCreate: async function () {
                let result = await models.Predlozhenie.create(this.createdPredlozhenie);
                console.log("this.createdPredlozhenie", result);

                this.createdPredlozhenie = this.getEmptyPredlozhenie();
            },


            /**
             * Пустое слово-кандидит для копы model2
             * Уходит во вьюшку перед списком слово, его можно заполнить и создать
             *
             * @return {{place: *, author: *, value: null, note: null}}
             */
            getEmptySlovo(){
                return {
                    value: null,
                    place: this.model2,
                    author: models.Kopnik.current,
                    note: null,
                };
            },
            /**
             * Создает новое слово
             */
            onSlovoCreate: async function () {
                let result = await models.Slovo.create(this.createdSlovo);
                console.log("this.createdSlovo", result);

                this.createdSlovo = this.getEmptySlovo();
            },
        }
    }
</script>


<style scoped>
    .header {
        background-color: #cccccc;
        font-size: smaller;
    }
</style>