const SidebarGroupHeader = ({ title }: { title: string }) => {
  return (
    <div className="pl-4 mt-2">
      <h3 className="text-slate-500">{title}</h3>
    </div>
  );
};

export default SidebarGroupHeader;
