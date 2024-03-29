<template>
  <div>
    <v-speed-dial
      v-if="showActionsMenu"
      v-model="fab"
      bottom
      class="fab"
      direction="top"
      fixed
      open-on-hover
      right
      transition="slide-y-reverse-transition"
    >
      <template #activator>
        <v-btn v-model="fab" color="blue darken-2" dark fab>
          <v-icon v-if="fab">mdi-close</v-icon>
          <v-icon v-else>mdi-arrow-top-right-bold-box-outline</v-icon>
        </v-btn>
      </template>

      <v-btn
        v-if="editLink"
        color="green"
        dark
        fab
        small
        @click.stop="goToEditPage"
      >
        <v-icon>mdi-pencil</v-icon>
      </v-btn>

      <v-btn
        v-if="createLink"
        color="green"
        dark
        fab
        small
        @click.stop="goToCreatePage"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>

      <v-btn
        v-if="deleteAction"
        color="red"
        dark
        fab
        small
        @click.stop="showDeleteDialog"
      >
        <v-icon>mdi-delete</v-icon>
      </v-btn>

      <template v-if="customActions">
        <v-tooltip
          v-for="(action, i) in customActions"
          :key="i"
          :disabled="!action.tooltip"
          left
          open-delay="500"
        >
          <template #activator="{ on, attrs }">
            <v-btn
              color="primary"
              dark
              fab
              small
              v-bind="attrs"
              v-on="on"
              @click.stop="() => $emit('customActionClicked', action.key)"
            >
              <v-icon>{{ action.icon }}</v-icon>
            </v-btn>
          </template>

          <span>{{ action.tooltip }}</span>
        </v-tooltip>
      </template>
    </v-speed-dial>

    <!-- Delete confirmation dialog -->
    <v-dialog
      v-if="deleteAction"
      v-model="dialog"
      :fullscreen="$vuetify.breakpoint.xsOnly"
      max-width="290"
      :persistent="loading"
    >
      <v-card>
        <v-card-title class="text-h5">
          {{ $t('general.confirmation') }}
        </v-card-title>

        <v-card-text>
          {{ $t(`${deleteAction.entity}.delete.dialog_instructions`) }}
        </v-card-text>

        <v-card-actions>
          <v-spacer />

          <v-btn :disabled="loading" text @click="cancelDelete">
            {{ $t('general.cancel') }}
          </v-btn>

          <v-btn
            :disabled="loading"
            :loading="loading"
            text
            @click="deleteEntity"
          >
            {{ $t('general.delete') }}
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: 'ActionsMenu',
  props: {
    createLink: {
      type: Object,
      default: null,
    },
    customActions: {
      type: Array,
      default: null,
    },
    deleteAction: {
      type: Object,
      default: null,
    },
    editLink: {
      type: Object,
      default: null,
    },
  },
  data() {
    return {
      dialog: false,
      fab: false,
      loading: false,
    }
  },
  computed: {
    showActionsMenu() {
      return (
        !!this.createLink ||
        (!!this.customActions && this.customActions.length > 0) ||
        !!this.deleteAction ||
        !!this.editLink
      )
    },
  },
  methods: {
    cancelDelete() {
      this.dialog = false
    },
    async deleteEntity() {
      this.loading = true

      const { entity } = this.deleteAction
      const { mutation, variables } = this.deleteAction.query
      const name = entity
        .split('.')
        .map((o) => o.charAt(0).toUpperCase() + o.slice(1))
        .join('')
      const notifName = entity.replace('.', '_').toUpperCase()

      try {
        const response = await this.$apollo
          .mutate({
            mutation,
            variables,
          })
          .then(({ data }) => data && data[`delete${name}`])

        if (response) {
          this.dialog = false
          this.$router.push(this.deleteAction.link)

          this.$notificationManager.displaySuccessMessage(
            this.$t(`success.${notifName}_DELETE`)
          )
        }
      } catch (err) {
        this.$notificationManager.displayErrorMessage(
          this.$t(`error.${notifName}_DELETE`)
        )
      } finally {
        this.loading = false
      }
    },
    goToCreatePage() {
      this.$router.push(this.createLink)
    },
    goToEditPage() {
      this.$router.push(this.editLink)
    },
    showDeleteDialog() {
      this.dialog = true
    },
  },
}
</script>

<style scoped>
.fab {
  margin-bottom: 50px;
}
</style>
