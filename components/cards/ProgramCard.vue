<template>
  <generic-card
    :banner="program.banner"
    :banner-edit-options="bannerEditOptions"
    :label="type"
    :to="link"
  >
    <v-chip v-if="status" id="status" small>
      {{ status }}
    </v-chip>

    <v-card-title>{{ program.code }}</v-card-title>
    <v-card-subtitle>
      <div class="name">{{ program.name }}</div>
    </v-card-subtitle>
  </generic-card>
</template>

<script>
export default {
  name: 'ProgramCard',
  props: {
    program: {
      type: Object,
      required: true,
    },
    linkPrefix: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      link: {
        name: `${this.linkPrefix}programs-code`,
        params: { code: this.program.code },
      },
    }
  },
  computed: {
    bannerEditOptions() {
      if (
        this.$auth?.user?.roles?.includes('teacher') &&
        this.$route.path.startsWith('/manage')
      ) {
        return { code: this.program.code, type: 'PROGRAM' }
      }

      return null
    },
    status() {
      const status = this.program.status?.toLowerCase()
      if (status) {
        return this.$t(`program.status.${status}`)
      }
      return null
    },
    type() {
      const type = this.program.type.toLowerCase()
      return this.$t(`program.type.${type}`)
    },
  },
}
</script>

<style scoped>
.name {
  display: -webkit-box;
  min-height: 20px;
  max-height: 45px;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

#status {
  top: 0px;
  margin: 10px 10px 0px 0;
  position: absolute;
  right: 0px;
}
</style>
