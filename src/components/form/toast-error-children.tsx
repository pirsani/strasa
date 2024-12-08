import { AlertCircle } from "lucide-react";

interface ToastErrorContainerProps {
  children?: React.ReactNode;
}
const ToastErrorContainer = ({ children }: ToastErrorContainerProps) => {
  return (
    <div className="flex flex-row bg-red-700 text-white -m-2 p-2 rounded-sm border border-red-100">
      <AlertCircle className="w-12 h-12 mr-2" />
      <div>
        <div>{children}</div>
      </div>
    </div>
  );
};

export default ToastErrorContainer;
