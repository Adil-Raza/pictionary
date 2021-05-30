<template>
  <div>
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
    if(this.$route.hash){
      let token = this.$route.hash;
      token = token.substr(1);
      token = token.substr(6);

      if(token && token.length > 0) {
        localStorage.setItem('token', token);
        this.$router.push({name: 'mainmenu'});
      }
    }
  },
  methods: {
  },
  data() {
    return {}
  },
}
</script>

<style scoped>

</style>
