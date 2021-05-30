<template>
  <div class="home">
    <SignInUser  />
  </div>
</template>

<script>
// @ is an alias to /src
import SignInUser from "@/components/SignInUser.vue";

export default {
  components: {
    SignInUser,
  },
};
</script>
