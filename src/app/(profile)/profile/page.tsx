import { getLoggedInPengguna } from "@/actions/pengguna/session";
import { getProfile } from "@/data/pengguna";
import { redirect } from "next/navigation";
import { FormChangePassword } from "./_components/form-change-password";
import UserCard from "./_components/user-card";

const ProfilePage = async () => {
  const pengguna = await getLoggedInPengguna();
  if (!pengguna) {
    redirect("/login");
  }

  const profile = await getProfile(pengguna.id!);
  if (!profile) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-gray-100">
      <UserCard pengguna={profile} />
      <div className="flex flex-col min-w-md items-center justify-center w-full h-full p-4 bg-white rounded-lg mt-4 border">
        <FormChangePassword />
      </div>
    </div>
  );
};

export default ProfilePage;
