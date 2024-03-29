<template>
  <ApolloQuery
    v-slot="{ isLoading, result: { error } }"
    :query="require('~/gql/manage/getAssessment.gql')"
    :variables="{ courseCode, assessmentId }"
    @result="setResult"
  >
    <page-title :loading="!!isLoading" :spaces="spaces" :value="title" />

    <v-row v-if="!error && canShowContent">
      <v-col cols="12" md="9">
        <v-card>
          <v-tabs v-model="currentTab" show-arrows>
            <v-tab href="#description">
              {{ $t('assessment.description') }}
            </v-tab>
            <v-tab v-if="showPhases" href="#phases">
              {{ $tc('assessment.phase._', 2) }}
            </v-tab>
            <v-tab href="#competencies">
              {{ $tc('competency._', 2) }}
            </v-tab>
            <v-tab v-if="showProvider" href="#provider">
              {{ $t('provider._') }}
            </v-tab>
          </v-tabs>

          <v-card-text class="text--primary">
            <v-tabs-items v-model="currentTab">
              <v-tab-item value="description">
                <description-content :text="assessment?.description" />
              </v-tab-item>

              <v-tab-item v-if="showPhases" value="phases">
                <assessment-phases v-slot="{ phase }" :assessment="assessment">
                  <description-content :text="phase.description" />
                </assessment-phases>
              </v-tab-item>

              <v-tab-item value="competencies">
                <assessment-competencies-list
                  :assessment-id="assessmentId"
                  :course-code="courseCode"
                />
              </v-tab-item>

              <v-tab-item v-if="showProvider" value="provider">
                {{ assessment?.providerConfig }}
              </v-tab-item>
            </v-tabs-items>
          </v-card-text>
        </v-card>
      </v-col>
      <v-col
        cols="12"
        md="3"
        :order="$vuetify.breakpoint.smAndDown ? 'first' : undefined"
      >
        <assessment-info-panel :assessment-id="assessmentId" teacher-view />
      </v-col>

      <actions-menu :delete-action="deleteAction" :edit-link="editLink" />
    </v-row>

    <div v-else>{{ $t('error.unexpected') }}</div>
  </ApolloQuery>
</template>

<script>
import titles from '@/mixins/titles.js'

export default {
  name: 'ManageAssessmentPage',
  mixins: [titles],
  data() {
    return {
      assessment: null,
      course: null,
      currentTab: 0,
      title: '',
    }
  },
  head() {
    return {
      title: this.getTitle(this.title, null, 'manage'),
    }
  },
  computed: {
    assessmentId() {
      return this.$route.params.id
    },
    canShowContent() {
      return !this.course || this.course.isCoordinator
    },
    courseCode() {
      return this.$route.params.code
    },
    deleteAction() {
      return {
        entity: 'assessment',
        link: {
          name: 'manage-courses-code-assessments',
          params: { code: this.courseCode },
        },
        query: {
          mutation: require('~/gql/manage/deleteAssessment.gql'),
          variables: { id: this.assessmentId },
        },
      }
    },
    editLink() {
      return {
        name: 'manage-courses-code-assessments-id-edit',
        params: { code: this.courseCode, id: this.assessmentId },
      }
    },
    showPhases() {
      return !!this.assessment?.phases?.length
    },
    showProvider() {
      return !!this.assessment?.hasProvider
    },
    spaces() {
      if (!this.course) {
        return null
      }

      const items = {}

      if (this.course.isPublished || this.course.isArchived) {
        items.teach = {
          name: 'teach-courses-code-assessments-id',
          params: { code: this.courseCode, id: this.assessmentId },
        }
      }

      return items
    },
  },
  methods: {
    setResult({ data }) {
      if (!data) {
        return
      }

      this.assessment = data.assessment
      this.course = data.course
      this.title = data.assessment?.name ?? ''
    },
  },
  meta: {
    roles: ['teacher'],
  },
}
</script>
