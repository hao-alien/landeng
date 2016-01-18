import * as pro from 'lantern-pro-js-client'

const Plans = [{
  id : pro.ONE_MONTH_PLAN,
  title: 'Monthly Plan',
  monthlyRate: 799,
  months: 1,
}, {
  id : pro.ONE_YEAR_PLAN,
  title: 'Anual Plan',
  monthlyRate: 499,
  months: 12,
  bestValue: true,
}]

export default Plans
