import { ProfilePengguna } from "@/data/pengguna";
import {
  extractPermissionsFromProfilePengguna,
  extractRoleNamesFromProfilePengguna,
} from "@/data/pengguna/helper/extractor";

interface UserCardProps {
  pengguna: ProfilePengguna;
}

const UserCard = ({ pengguna }: UserCardProps) => {
  // first letter of name
  const firstLetter = pengguna.name.charAt(0).toUpperCase();
  const permissions = extractPermissionsFromProfilePengguna(pengguna);
  const roles = extractRoleNamesFromProfilePengguna(pengguna);
  return (
    <>
      <div className="flex flex-col items-center justify-center w-full h-full p-4 bg-white rounded-lg ">
        <div className="rounded-full overflow-hidden w-24 h-24 mb-4 bg-gray-300 flex items-center justify-center">
          <span className="text-3xl">{firstLetter}</span>
        </div>
        <div className="flex flex-col w-full items-center justify-center  mb-4  ">
          <h2 className="text-xl font-semibold">{pengguna.name}</h2>
          <p className="text-gray-600">{pengguna.organisasi?.nama}</p>
          <p className="text-gray-600">{pengguna.email}</p>
          <p className="text-gray-600">
            {roles.length > 0 ? roles.join(", ") : "No roles"}
          </p>
        </div>
      </div>
    </>
  );
};

export default UserCard;
