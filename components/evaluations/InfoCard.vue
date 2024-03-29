<template>
  <ApolloQuery
    v-slot="{ isLoading, result: { error } }"
    :query="require('~/gql/cards/getEvaluationsInfo.gql')"
    :variables="{ courseCode }"
    @result="setResult"
  >
    <generic-info-card
      icon="mdi-clipboard-edit"
      :link="link"
      :loading="!!isLoading"
      :title="$tc('evaluation._', 2)"
    >
      <template #default>
        <stats-list v-if="!error" entity="evaluation" :items="stats" />
        <span v-else>{{ $t('error.unexpected') }}</span>
      </template>

      <template v-if="showCreateButton" #actions>
        <v-btn color="success" outlined small :to="createLink">
          <v-icon left>mdi-plus</v-icon>
          <span>{{ $t('general.create') }}</span>
        </v-btn>
      </template>
    </generic-info-card>
  </ApolloQuery>
</template>

<script>
import { DateTime } from 'luxon'

export default {
  name: 'EvaluationsInfoCard',
  props: {
    courseCode: {
      type: String,
      required: true,
    },
    hideCreateButton: {
      type: Boolean,
      default: false,
    },
    space: {
      type: String,
      required: true,
    },
    teacherView: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      course: null,
      evaluations: null,
    }
  },
  computed: {
    createLink() {
      return {
        name: 'teach-courses-code-evaluations-create',
        params: { code: this.courseCode },
      }
    },
    hasEvaluations() {
      return this.evaluations?.length > 0
    },
    link() {
      return {
        icon: 'mdi-view-list',
        text: this.$t('general.list'),
        to: {
          name: `${this.space}-courses-code-evaluations`,
          params: { code: this.courseCode },
        },
      }
    },
    showCreateButton() {
      return (
        !this.hideCreateButton &&
        (this.course?.isCoordinator || this.course?.isTeacher)
      )
    },
    stats() {
      if (!this.hasEvaluations) {
        return null
      }

      const items = [
        {
          text: this.$t('evaluation.status.published'),
          filter: (e) => e.status === 'PUBLISHED',
        },
        {
          text: this.$t('evaluation.status.requested'),
          filter: (e) => e.status === 'REQUESTED',
        },
      ]

      if (this.teacherView) {
        items.push({
          text: this.$t('evaluation.status.unpublished'),
          filter: (e) => e.status === 'UNPUBLISHED',
        })
      }

      // Compute the evaluations stats.
      const stats = items.map((i) => ({
        ...i,
        value: this.evaluations.filter(i.filter)?.length ?? 0,
      }))

      // Check the oldest evaluation request, if any.
      const requested = stats[1]
      if (this.teacherView && requested.value) {
        const oldest = this.evaluations
          .filter(requested.filter)
          .map((e) => DateTime.fromISO(e.requested))
          .sort((a, b) => a - b)[0]

        const days = Math.trunc(DateTime.now().diff(oldest, 'days').values.days)
        if (days > 5) {
          requested.alert = this.$t(`evaluation.request.too_old`, { days })
        }
      }

      return stats
    },
  },
  methods: {
    setResult({ data }) {
      if (!data) {
        return
      }

      this.course = data.course
      this.evaluations = data.evaluations
    },
  },
}
</script>
