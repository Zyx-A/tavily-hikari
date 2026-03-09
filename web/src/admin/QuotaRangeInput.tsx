import * as React from 'react'

import { cn } from '../lib/utils'

const QuotaRangeInput = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="range"
    className={cn('h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent quota-slider', className)}
    {...props}
  />
))

QuotaRangeInput.displayName = 'QuotaRangeInput'

export default QuotaRangeInput
