import * as Icons from 'lucide-react'
import { useDebounceValue } from 'usehooks-ts'
import { icons } from 'lucide-react'
import { useMemo } from 'react'

export const useIcons = (value: string) => {
  const [debounceValue] = useDebounceValue(value, 300)

  const tempIcons = useMemo(
    () =>
      Object.entries(Icons)
        .map(([key]) => ({
          value: key,
          label: key,
          icon: key,
        }))
        .filter((icon) => isValidIcon(icon.label)),
    [],
  )

  if (debounceValue) {
    return tempIcons.filter((icon) =>
      icon.label.toLowerCase().includes(debounceValue.toLowerCase()),
    )
  }

  return tempIcons
}

const isValidIcon = (name: string) => {
  type IconComponentName = keyof typeof icons

  // 👮‍♀️ guard
  function isValidIconComponent(
    componentName: string,
  ): componentName is IconComponentName {
    return componentName in icons
  }
  const kebabToPascal = (str: string) =>
    str
      .split('-')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')

  const componentName = kebabToPascal(name)

  if (!isValidIconComponent(componentName)) {
    return false
  }

  return true
}
