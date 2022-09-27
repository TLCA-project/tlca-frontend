<template functional>
  <v-list-item>
    <v-list-item-content>
      <v-list-item-title>
        {{ $options.methods.competencyName(props.competency.competency) }}
      </v-list-item-title>

      <v-list-item-subtitle>
        <learning-outcomes-assessment-list
          class="ml-3 mt-3"
          :items="props.competency.learningOutcomes"
        />

        <competency-check-list
          class="ml-3 mt-3"
          :items="props.competency.checklist?.public"
          :name="
            parent.$t(
              `assessment.checklist.${props.studentView ? '_' : 'public'}`
            )
          "
        />

        <competency-check-list
          class="ml-3 mt-3"
          :items="props.competency.checklist?.private"
          :name="parent.$t('assessment.checklist.private')"
        />
      </v-list-item-subtitle>
    </v-list-item-content>

    <v-list-item-action class="align-self-baseline">
      <learning-outcome-chip v-if="props.competency.useLearningOutcomes" />
      <stars-field
        v-else
        :length="3"
        readonly
        :value="props.competency.stars"
      />
    </v-list-item-action>
  </v-list-item>
</template>

<script>
import competencies from '@/mixins/competencies.js'

export default {
  name: 'CompetencyListItem',
  mixins: [competencies],
  props: {
    competency: {
      type: Object,
      required: true,
    },
    studentView: {
      type: Boolean,
      default: false,
    },
  },
}
</script>