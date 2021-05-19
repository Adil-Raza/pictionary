
<template>
  <div>
    /<span>Loading...</span>
  </div>
</template>

<script>
//installed components go here

//user Defined components go here

//ordering => components, props, watch, mounted, created, method, data
export default {
  components: {},
  props: [],
  watch: {},
  mounted() {},
  created() {
    this.$router.push({ name: 'login' })
  },
  methods: {},
  data() {
    return {}
  },
}
</script>

<style scoped>

</style>
