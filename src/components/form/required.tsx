interface RequiredLabelProps {
  label?: string;
  className?: string;
  catatan?: string;
}
export const RequiredLabelWithCatatan = ({
  label,
  catatan = `(-)  jika tidak ada`,
  className,
}: RequiredLabelProps) => {
  return (
    <>
      <span className={className}>{label}</span>
      <span className="text-red-500 align-super px-1">*</span>
      {catatan && <span className="text-gray-400">{catatan}</span>}
    </>
  );
};

export const RequiredLabel = () => {
  return <span className="text-red-500 align-super px-1">*</span>;
};

export default RequiredLabel;
