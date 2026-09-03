import { type ChangeEvent, type FormEvent } from 'react'

interface UseFilePickerArgs {
  onSelect: (file: File | null) => void
  onSubmit: () => void
}

/**
 * Wiring for the import file input. A cancelled file dialog fires `change` with
 * an empty list — keep the current selection then, rather than wiping it. After
 * reading a pick, reset the native input so choosing the same file again still
 * fires `change`.
 */
export const useFilePicker = ({ onSelect, onSubmit }: UseFilePickerArgs) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { files } = event.target
    if (!files || files.length === 0) {
      return
    }
    const picked = files[0]
    event.target.value = ''
    onSelect(picked)
  }

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit()
  }

  return { handleChange, handleSubmit }
}
