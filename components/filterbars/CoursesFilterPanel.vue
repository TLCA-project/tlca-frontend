<template>
  <v-card>
    <v-card-title class="grey lighten-2 py-2">
      <v-icon left size="20">mdi-filter-cog</v-icon>
      <span v-t="'general.filter._'" class="subtitle-1"></span>
    </v-card-title>
    <v-card-text>
      <v-form class="mt-5">
        <v-select
          v-if="!hideStatus"
          dense
          multiple
          clearable
          :value="value.status"
          :items="statusList"
          :label="$t('course.filter.status')"
          @input="update('status', $event)"
        >
        </v-select>
        <v-select
          v-if="!hideRole"
          dense
          multiple
          clearable
          :value="value.role"
          :items="rolesList"
          :label="$t('course.filter.role')"
          @input="update('role', $event)"
        >
        </v-select>
      </v-form>
    </v-card-text>
  </v-card>
</template>

<script>
export default {
  name: 'CoursesFilterPanel',
  props: {
    hideRole: {
      type: Boolean,
      default: false,
    },
    hideStatus: {
      type: Boolean,
      default: false,
    },
    hideUnpublished: {
      type: Boolean,
      default: false,
    },
    value: {
      type: Object,
      default: () => {
        return {
          status: null,
          role: null,
        }
      },
    },
  },
  computed: {
    statusList() {
      const status = []

      if (!this.hideUnpublished) {
        status.push({
          text: this.$t('course.status.unpublished'),
          value: 'UNPUBLISHED',
        })
      }

      status.push(
        { text: this.$t('course.status.published'), value: 'PUBLISHED' },
        { text: this.$t('course.status.archived'), value: 'ARCHIVED' }
      )
      return status
    },
    rolesList() {
      return [
        { text: this.$t('course.coordinator'), value: 'COORDINATOR' },
        { text: this.$tc('course.teacher', 1), value: 'TEACHER' },
      ]
    },
  },
  methods: {
    update(field, value) {
      this.$emit('input', { ...this.value, [field]: value })
    },
  },
}
</script>
