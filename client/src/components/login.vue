<template>
  <div style="position: relative">
    <div class="card text-center" style="width: 30rem; padding: 30px; position: absolute; left: 50%; top: 50%; transform: translate(-50%, 50%);box-shadow: 5px 10px #888888; box-shadow: rgb(134 129 129 / 72%) 3px 5px; background-color: black;" >
      <div class="card-body">
        <b-row class="my-3">
          <b-col>
            <h3 class="card-title" style="color: aliceblue;">
              💣😾  𝐏เᑕ𝕋ⓘｏηคгу  💜👊
            </h3>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col>
            <h4 class="card-subtitle mb-2 text-muted">Log In / Sign Up</h4>
          </b-col>
        </b-row>
        <b-row class="my-3">
          <b-col>
            <button type="button" class="btn btn-light" @click="login">
              <img width="15px" style="margin-bottom:3px; margin-right:5px; box-shadow: rgb(204 195 195 / 72%) 1px 2px;" alt="Google login" src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/53/Google_%22G%22_Logo.svg/512px-Google_%22G%22_Logo.svg.png" />
              With Google</button>
          </b-col>
        </b-row>
        <br />
        <div class="card-footer text-muted" style="background-color: black; font-size: smaller;">
          By creating an account, you agree to our <a href="#">Terms of Service</a> and acknowledge our <a href="#">Privacy Policy</a>.
        </div>
      </div>
    </div>
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
  created() {},
  methods: {
    login() {
      this.$router.push({name: 'mainmenu'});
    }
  },
  data() {
    return {}
  },
}
</script>

<style scoped>

</style>
