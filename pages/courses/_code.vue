<template>
  <div v-if="course">
    <v-card flat color="grey lighten-3" class="my-2">
      <v-breadcrumbs divider="/" :items="navItems" class="py-2"></v-breadcrumbs>
    </v-card>
    <h2 v-text="course.name" />
    <div>{{ course }}</div>
  </div>
</template>

<script>
import { gql } from 'graphql-tag';

export default {
  name: 'CoursePage',
  computed: {
    navItems() {
      return [{
        text: this.$tc('course._', 2),
        exact: true,
        to: { name: 'courses' }
      }, {
        text: this.$route.params.code
      }];
    }
  },
  apollo: {
    course: {
      query: gql`query Course($code: String!) {
        course(code: $code) {
          code
          name
          type
        }
      }`,
      variables() {
        return {
          code: this.$route.params.code
        };
      }
    }
  }
}
</script>