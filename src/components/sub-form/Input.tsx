import { useValue, Value } from "sub-form";
import { Input as InputBase } from "../ui/input";
import { Label } from "../ui/label";

interface InputProps {
  label: string;
  placeholder: string;
  value: Value<string>;
  onChange: (value: string) => void;
}

const InputVal = ({
  onChange,
  placeholder,
  value,
}: Omit<InputProps, "label">) => {
  const { value: inputVal } = useValue({ ...value });

  return (
    <InputBase
      placeholder={placeholder}
      value={inputVal.value}
      onChange={(e) => onChange(e.target.value)}
    />
  );
};

export const Input = ({ label, onChange, placeholder, value }: InputProps) => {
  return (
    <div>
      <Label>{label}</Label>
      <InputVal onChange={onChange} placeholder={placeholder} value={value} />
    </div>
  );
};
