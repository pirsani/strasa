const TabelDariExcel = ({ data }: { data: Record<string, any>[] }) => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="min-w-full bg-white border">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b-2 border-r-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
              #
            </th>
            {Object.keys(data[0]).map((key) => (
              <th
                key={key}
                className="px-4 py-2 border-b-2 border-gray-200 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
              >
                {key}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              <td className="px-4 py-2 border-b border-r border-gray-200 text-sm">
                {index + 1}
              </td>
              {Object.values(row).map((value, idx) => (
                <td
                  key={idx}
                  className="px-4 py-2 border-b border-gray-200 text-sm"
                >
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TabelDariExcel;
