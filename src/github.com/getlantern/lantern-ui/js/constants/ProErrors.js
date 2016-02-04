const ErrorCodes = new Set([
  'internal_error',
  'bad_input',
  'not_authorized',
  'user_exists',
  'no_such_user',
  'user_already_verified',
  'invalid_user_verification',
  'user_unverified',
  'operation_temporarily_unavailable',
  'wrong_or_inexistent_plan',
  'user_has_active_subscription',
  'payment_error',
  'non_idempotent_operation',
  'no_codes_left',
  'wrong_code',
  'redeeming_own_code_not_allowed',
  'wrong_charge_id',
])

const getErrorString = (t, error) => {
  if (ErrorCodes.has(error)) {
    return t('err.' + error)
  }
  return t('err.unknown_error') + error
}

export default getErrorString
