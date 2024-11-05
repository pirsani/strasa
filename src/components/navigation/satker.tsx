import { auth } from "@/auth";

const NamaSatker = async () => {
  const session = await auth();
  const user = session?.user;

  if (!user) {
    return null;
  }

  return (
    <div className="w-full">
      <span className="font-semibold">
        {user.satkerNamaSingkat || user.satkerNama}
      </span>
    </div>
  );
};

export default NamaSatker;
