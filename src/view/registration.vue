<template>
  <div :id="id" class="application">
    <auth v-if="model.state=='auth'"></auth>
    <registration v-if="model.state=='register'"></registration>
    <work v-if="model.state=='main'"></work>
  </div>
</template>

<script>
  export default{
    props: ["id"],
    components: {
      "auth": require('./auth.vue'),
      "registration": require('./registration.vue'),
      "work": require('./work.vue'),
    },
    created: function () {
    },
    mounted: function () {
    },
  }

</script>

<style scoped>
</style>
