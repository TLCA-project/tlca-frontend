<template>
  <div>
    <page-title :value="title" />

    <v-row>
      <v-col cols="12" md="9">
        <form-evaluation
          :course-code="courseCode"
          @assessmentSelected="onAssessmentSelected"
          @learnerSelected="onLearnerSelected"
        />
      </v-col>

      <v-col
        cols="12"
        md="3"
        :order="$vuetify.breakpoint.smAndDown ? 'first' : undefined"
      >
        <assessment-info-panel
          v-if="assessment"
          class="mb-5"
          :assessment-id="assessment"
          non-info-panel
        />
        <learner-info-panel
          v-if="showLearnerInfo"
          class="mb-5"
          :course-code="courseCode"
          :learner="learner"
          non-info-panel
        />
        <course-schedule-panel :course-code="courseCode" />
      </v-col>
    </v-row>
  </div>
</template>

<script>
import titles from '@/mixins/titles.js'

export default {
  name: 'TeachCreateEvaluationPage',
  mixins: [titles],
  data() {
    return {
      assessment: null,
      learner: null,
    }
  },
  head() {
    return {
      title: this.getTitle(this.title, null, 'teach'),
    }
  },
  computed: {
    courseCode() {
      return this.$route.params.code
    },
    showLearnerInfo() {
      return this.learner && !Array.isArray(this.learner)
    },
    title() {
      return this.$t('evaluation.create')
    },
  },
  methods: {
    onAssessmentSelected(assessment) {
      this.assessment = assessment
    },
    onLearnerSelected(learner) {
      this.learner = learner
    },
  },
  meta: {
    roles: ['teacher'],
  },
}
</script>
