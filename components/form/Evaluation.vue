<template>
  <ValidationObserver ref="form" v-slot="{ handleSubmit }">
    <v-form :disabled="formBusy" @submit.prevent="handleSubmit(submit)">
      <v-alert v-if="formError" class="mt-5" dense outlined type="error">
        {{ $t(formError) }}
      </v-alert>

      <v-card>
        <v-card-text>
          <v-row>
            <v-col cols="12" :md="edit ? 6 : 5">
              <assessment-select
                v-model="assessment"
                :course-code="courseCode"
                :disabled="edit"
                @change="onSelectAssessment"
              />
            </v-col>

            <v-col cols="12" :md="edit ? 6 : 5">
              <learner-select
                v-model="learner"
                :course-code="courseCode"
                :disabled="edit"
                :multiple="massCreation"
                @change="onSelectLearner"
              />
            </v-col>

            <v-col v-if="!edit" cols="12" md="2">
              <v-switch
                v-model="massCreation"
                class="mt-0"
                dense
                hide-details
                :label="$t('evaluation.mass_creation')"
                @change="learner = null"
              />
            </v-col>
          </v-row>

          <div v-if="showInstanceSelector">
            <assessment-instance-selector
              v-model="config"
              :assessment-id="assessment"
              :course-code="courseCode"
              :edit="edit"
              :evaluation-id="evaluation?.id"
              :learner="learner"
              @change="updateForm"
            >
              <template #body="{ hasUnpublishedEvaluations, selected }">
                <v-alert
                  v-if="hasUnpublishedEvaluations"
                  class="mx-4"
                  dense
                  outlined
                  type="warning"
                >
                  {{ $t('evaluation.unpublished_warning') }}
                </v-alert>

                <v-divider class="mb-3 mt-3" />

                <v-row>
                  <v-col cols="12" md="6">
                    <date-time-picker-with-validation
                      v-model="evalDate"
                      :label="$t('evaluation.date')"
                      vid="evalDate"
                    />
                  </v-col>
                </v-row>

                <h4>{{ $t('evaluation.competencies.in_progress') }}</h4>

                <assessment-competencies-list
                  v-if="assessment"
                  v-model="selectedCompetencies"
                  :assessment-id="assessment"
                  :course-code="courseCode"
                  :edit="edit"
                  form
                  hide-checklist
                  :phase="config?.phase"
                  :selected="initialCompetencies ?? selected"
                />

                <h4>{{ $t('evaluation.comment._') }}</h4>

                <v-row>
                  <v-col cols="12" md="12">
                    <v-textarea
                      v-model="comment"
                      auto-grow
                      clear-icon="mdi-close-circle"
                      clearable
                      filled
                      hide-details
                      :label="$t('evaluation.comment.public')"
                    />
                  </v-col>
                </v-row>

                <v-row>
                  <v-col cols="12" md="12">
                    <v-textarea
                      v-model="note"
                      auto-grow
                      clear-icon="mdi-close-circle"
                      clearable
                      filled
                      hide-details
                      :label="$t('evaluation.note.private')"
                    />
                  </v-col>
                </v-row>
              </template>
            </assessment-instance-selector>
          </div>
        </v-card-text>
      </v-card>

      <div
        v-if="showActions || edit || (massCreation && showInstanceSelector)"
        class="text-right mt-5"
      >
        <reset-btn :disabled="formBusy" @click="resetForm" />
        <submit-btn :action="action" :loading="formBusy" />
      </div>
    </v-form>
  </ValidationObserver>
</template>

<script>
import { ValidationObserver } from 'vee-validate'

import datetime from '@/mixins/datetime.js'

export default {
  name: 'FormEvaluation',
  components: { ValidationObserver },
  mixins: [datetime],
  props: {
    courseCode: {
      type: String,
      required: true,
    },
    evaluation: {
      type: Object,
      default: null,
    },
    edit: {
      type: Boolean,
      default: false,
    },
    value: {
      type: String,
      default: null,
    },
  },
  data() {
    return {
      assessment: null,
      comment: '',
      config: null,
      evalDate: '',
      formBusy: false,
      formError: null,
      initialCompetencies: null,
      learner: null,
      massCreation: false,
      note: '',
      selectedCompetencies: [],
      showActions: false,
    }
  },
  computed: {
    action() {
      return !this.edit ? 'create' : 'edit'
    },
    showInstanceSelector() {
      return this.assessment && this.learner
    },
  },
  mounted() {
    this.reset()
  },
  methods: {
    async createEvaluation(mutation, data, learner) {
      if (learner) {
        data.learner = learner
      }

      try {
        const response = await this.$apollo
          .mutate({
            mutation,
            variables: data,
          })
          .then(
            ({ data }) => data && (data.createEvaluation ?? data.editEvaluation)
          )

        if (response) {
          return response.id
        }
      } catch (err) {
        if (err.graphQLErrors?.length) {
          const gqlError = err.graphQLErrors[0]
          if (gqlError.extensions?.formErrors) {
            this.$refs.form.setErrors(gqlError.extensions.formErrors)
          } else {
            this.formError = `error.${gqlError.message}`
          }
        }
      }

      if (!this.formError) {
        this.formError = 'error._'
      }
      return null
    },
    onSelectAssessment() {
      this.config = null
      this.$emit('assessmentSelected', this.assessment)
    },
    onSelectLearner() {
      this.config = null
      this.$emit('learnerSelected', this.learner)
    },
    reset() {
      const evaluation = this.evaluation

      const evalDate =
        evaluation &&
        ((evaluation.status === 'UNPUBLISHED' &&
          evaluation.created !== evaluation.date) ||
          (evaluation.status === 'ACCEPTED' &&
            evaluation.accepted !== evaluation.date))
          ? evaluation.date
          : undefined

      this.assessment = evaluation?.assessment?.id ?? null
      this.comment = evaluation?.comment ?? ''
      this.config = {
        instance: evaluation?.instance?.id ?? null,
        phase: evaluation?.phase ?? null,
      }
      this.evalDate = evalDate ?? ''
      this.initialCompetencies =
        evaluation?.competencies?.map((c) => ({
          checklist: c.checklist,
          competency: c.competency.code,
          learningOutcomes: c.learningOutcomes,
          selected: c.selected,
        })) ?? null
      this.learner = evaluation?.learner?.username ?? null
      this.note = evaluation?.note ?? ''
      this.selectedCompetencies = []
    },
    resetForm() {
      this.reset()
      this.formError = null
      this.$refs.form.reset()
    },
    async submit() {
      this.formBusy = true

      const data = {
        comment: this.comment,
        competencies: this.selectedCompetencies
          .filter((c) => !c.disabled)
          .map((c) => ({
            checklist: {
              ...c.checklist,
              __typename: undefined,
            },
            competency: c.competency,
            learningOutcomes: c.learningOutcomes?.map(
              (lo) => lo.selected && !lo.disabled
            ),
            selected: c.selected,
          })),
        evalDate: this.evalDate,
        note: this.note,
      }

      if (this.edit) {
        data.id = this.evaluation.id
      } else {
        data.assessment = this.assessment
        data.instance = this.config?.instance
        data.phase = this.config?.phase
      }
      const mutation = require(`~/gql/teach/${this.action}Evaluation.gql`)

      if (this.edit) {
        const result = await this.createEvaluation(mutation, data, null)

        if (result) {
          this.$router.push({
            name: 'teach-courses-code-evaluations-id',
            params: { code: this.courseCode, id: result },
          })
        }
      } else {
        const learners = this.massCreation ? this.learner : [this.learner]
        const result = await Promise.all(
          learners.map(
            async (l) => await this.createEvaluation(mutation, data, l)
          )
        )

        if (result.every((r) => !!r)) {
          this.$notificationManager.displaySuccessMessage(
            this.$t(`success.EVALUATION_${this.action.toUpperCase()}`)
          )

          if (!this.massCreation) {
            this.$router.push({
              name: 'teach-courses-code-evaluations-id',
              params: { code: this.courseCode, id: result[0] },
            })
          }
        } else {
          this.$router.push({
            name: 'teach-courses-code-evaluations',
            params: { code: this.courseCode },
          })
        }
      }

      this.formBusy = false
    },
    updateForm(canAddEvaluation) {
      this.showActions = canAddEvaluation
    },
  },
}
</script>
