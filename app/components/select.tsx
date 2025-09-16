import Select from 'react-select'
import styles from "./select.module.css"

interface OptionType {
  value: string;
  label: string;
}

type Props = {
  options: Array<string>
  onChange: any
  placeholder: string
}

const SelectDropdown = ({options, onChange, placeholder}: Props) => {
  return (
    <Select
      instanceId='select-dropdown'
      className={styles.select}
      options={options.map((opt) => ({ value: opt, label: opt }))}
      onChange={(selected: OptionType) => onChange(selected.value)}
      placeholder={placeholder}
    />
  )
}

export default SelectDropdown