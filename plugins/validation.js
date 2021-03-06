/* eslint-disable camelcase */

import { extend } from 'vee-validate'
import { alpha_dash, between, required } from 'vee-validate/dist/rules'

extend('alpha_dash', {
  ...alpha_dash,
  message: 'This field can only contain characters and dashes',
})

extend('stars_required', {
  validate(value) {
    return between.validate(value, { min: 1, max: 3 })
  },
  message: 'This field is required',
})

extend('required', {
  ...required,
  message: 'This field is required',
})
