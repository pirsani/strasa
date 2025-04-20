import { Input } from "@/components/ui/input";

interface CheckboxPermissionProps {
  permission: string;
  checked: boolean;
  onChange: () => void;
}
export const CheckboxPermission = ({
  permission,
  checked,
  onChange, // Add the onChange handler
}: CheckboxPermissionProps) => {
  return (
    <div className="flex items-center w-full">
      {/* <Tooltip>
        <TooltipTrigger> */}
      <Input
        data-slot="input"
        type="checkbox"
        id={permission}
        name={permission}
        checked={checked}
        onChange={onChange}
        className="mr-2 h-5 w-5 cursor-pointer rounded border-gray-300 text-blue-600 focus:ring-blue-500"
      />
      {/* </TooltipTrigger>
        <TooltipContent>
          <p>{`Permission: ${permission}`}</p>
        </TooltipContent>
      </Tooltip> */}
    </div>
  );
};
