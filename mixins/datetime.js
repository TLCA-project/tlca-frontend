import { DateTime } from 'luxon'

export default {
  methods: {
    isInPast(datetime) {
      return datetime <= DateTime.now()
    },
    formatDateTime(datetime, format) {
      if (datetime instanceof String || typeof datetime === 'string') {
        if (datetime.match(/^[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}$/g)) {
          datetime = DateTime.fromFormat(datetime, 'yyyy-LL-dd hh:mm')
        } else {
          datetime = DateTime.fromISO(datetime)
        }

        if (!datetime.invalid) {
          return datetime.setLocale(this.$i18n.locale).toLocaleString(format)
        }
      }

      return ''
    },
    formatDateFull(datetime) {
      return this.formatDateTime(datetime, DateTime.DATE_MED_WITH_WEEKDAY)
    },
    formatDateTimeFull(datetime) {
      return this.formatDateTime(datetime, DateTime.DATETIME_MED_WITH_WEEKDAY)
    },
  },
}
