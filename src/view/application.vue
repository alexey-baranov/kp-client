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


<style>
    * {
        font-size: 25px;
    }

    .material-icons.md-1em{
        font-size: 1em;
    }

    .material-icons.md-dark {
        color: rgba(0, 0, 0, 0.54);
    }

    .material-icons.md-dark.md-inactive {
        color: rgba(0, 0, 0, 0.26);
    }

    ul {
        margin: 0;
    }


</style>

<style scoped>
    .header {
        background-color: #cccccc;
        font-size: smaller;
    }




</style>