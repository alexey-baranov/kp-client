<template>
    <div :id="id" class="application">
        <application-header></application-header>
        <side-panel :kopnik="model.kopnik"></side-panel>
        <router-view></router-view>
    </div>
</template>

<script>
    export default{
        props: ["id"],
        components: {
            "application-header": require('./application-header.vue'),
            "side-panel": require('./side-panel.vue'),
        },
        created: function () {
        }
    }
</script>


<style scoped>
    .header {
        background-color: #cccccc;
        font-size: smaller;
    }
</style>