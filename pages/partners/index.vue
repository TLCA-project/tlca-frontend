<template>
  <ApolloQuery :query="require('../../gql/getPartners.gql')">
    <template #default="{ result: { error, data }, isLoading }">
      <div v-if="isLoading || data">
        <list-page
          :title="title"
          :prop-name="propName"
          :component="component"
          :items="data && data.partners"
        />
      </div>

      <div v-else-if="error">An error occurred</div>
    </template>
  </ApolloQuery>
</template>

<script>
import PartnerCard from '~/components/cards/PartnerCard.vue'

export default {
  name: 'PartnersPage',
  data() {
    return {
      propName: 'partner',
      component: PartnerCard,
    }
  },
  head() {
    return {
      title: this.title,
    }
  },
  computed: {
    title() {
      return this.$tc('partner._', 2)
    },
  },
  meta: {
    roles: ['guest'],
  },
}
</script>
