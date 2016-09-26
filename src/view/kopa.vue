<template>
    <div :id="id" class="kopa">
        <div class="header">
            <span class="inviter"> {{ model.invited }} </span>
            <span class="created_at"> {{ model.created_at }} </span>
        </div>
        <div class="question">
            {{ model.question }}
        </div>
        <div class="result">
            [Предложения]
        </div>

        <ul class="dialog">
            <slovo-as-list-item v-for="eachSlovo of model.dialog" :model="eachSlovo" :id="id"></slovo-as-list-item>
        </ul>
    </div>
</template>

<style scoped>
    .header {
        background-color: #cccccc;
        font-size: smaller;
    }
</style>

<script>
    import SlovoAsListItemView from './slovo-as-list-item.vue'
    export default{
        props: ["id", "model"],
        components: {
            "slovo-as-list-item": SlovoAsListItemView,
        }
    }
</script>
