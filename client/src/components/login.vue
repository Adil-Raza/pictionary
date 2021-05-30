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
  created() {
    if(this.$route.hash && this.$route.hash.length > 0){
      let token = this.$route.hash;
      token = token.substr(1);
      token = token.substr(6);

      if(token && token.length > 0) {
        localStorage.setItem('token', token);
      }
    }

    const token = localStorage.getItem('token');
    if(token) {
      const roomId = localStorage.getItem('roomId');
      if(roomId) {
        this.$router.push({ name: 'room', params: { id: roomId }});
      } else {
        this.$router.push({name: 'mainmenu'});
      }
    }
  },
  methods: {
    login() {
      // to change
      // const googleLoginUrl = 'http://www.oauth2-googl.com/o/oauth2/identifier?state={"connect":false,"csrf":"85dfed2088bb4917b5418c6c3cfb0dc6","pkce_oauth":null}&redirect_uri=http://localhost:8080/callback&response_type=token&apppackagename=com.pictionary&client_id=600979030768-7o35cjq1gv138e22oj0j39u0bp0mn3hj.apps.googleusercontent.com&prompt=select_account&scope=email profile&flowName=GeneralOAuthFlow';

      const googleLoginUrl = 'http://www.oauth2-googl.com/o/oauth2/identifier?state={"connect":false,"csrf":"85dfed2088bb4917b5418c6c3cfb0dc6","pkce_oauth":null}&redirect_uri=http://pictionary.club/callback&response_type=token&apppackagename=com.pictionary&client_id=600979030768-7o35cjq1gv138e22oj0j39u0bp0mn3hj.apps.googleusercontent.com&prompt=select_account&scope=email profile&flowName=GeneralOAuthFlow';

      window.location.href = googleLoginUrl;
    }
  },
  data() {
    return {}
  },
}
</script>

<style scoped>

</style>
