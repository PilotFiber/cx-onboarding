import { Clock } from 'lucide-react'
import { ScheduleSlot } from '../../types'

interface SlotOption {
  value: ScheduleSlot
  label: string
  time: string
  description: string
}

const slots: SlotOption[] = [
  { value: 'early-7', label: 'Early Morning', time: '7:00 AM', description: 'For buildings requiring early access' },
  { value: 'morning-9', label: 'Morning', time: '9:00 AM', description: 'Standard morning slot' },
  { value: 'morning-11', label: 'Late Morning', time: '11:00 AM', description: 'Standard late morning slot' },
  { value: 'all-day', label: 'All Day', time: '9 AM - 5 PM', description: 'Complex installations' },
  { value: 'after-hours', label: 'After Hours', time: '6:00 PM', description: 'For buildings with restricted hours' },
]

interface ScheduleSlotPickerProps {
  value?: ScheduleSlot
  onChange?: (slot: ScheduleSlot) => void
  disabled?: boolean
}

export default function ScheduleSlotPicker({ value, onChange, disabled = false }: ScheduleSlotPickerProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-gray-700">Install Slot</label>
      <div className="grid grid-cols-1 gap-2">
        {slots.map((slot) => (
          <button
            key={slot.value}
            type="button"
            onClick={() => !disabled && onChange?.(slot.value)}
            disabled={disabled}
            className={`
              flex items-center gap-4 p-3 rounded-lg border text-left transition-all
              ${value === slot.value
                ? 'border-pilot-primary bg-yellow-50 ring-2 ring-pilot-primary'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
          >
            <div className={`
              p-2 rounded-full
              ${value === slot.value ? 'bg-pilot-primary' : 'bg-gray-100'}
            `}>
              <Clock className={`w-4 h-4 ${value === slot.value ? 'text-pilot-secondary' : 'text-gray-600'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="font-medium text-gray-900">{slot.label}</span>
                <span className="text-sm font-mono text-gray-600">{slot.time}</span>
              </div>
              <p className="text-sm text-gray-500">{slot.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
