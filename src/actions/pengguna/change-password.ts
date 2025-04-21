"use server";
import { ActionResponse } from "@/actions/response";
import { dbHonorarium } from "@/lib/db-honorarium";
import { ChangePassword, changePasswordSchema } from "@/zod/schemas/pengguna";
import bcrypt from "bcryptjs"; // Import bcrypt for password hashing and comparison
import { ZodError } from "zod";
import { getSessionPenggunaForAction } from "./session";

export const changePassword = async (
  data: ChangePassword
): Promise<ActionResponse<boolean>> => {
  //console.log("data", data);

  try {
    // check if current password is correct
    const pengguna = await getSessionPenggunaForAction();
    if (!pengguna.success) {
      return pengguna;
    }

    const penggunaId = pengguna.data.penggunaId;

    const user = await dbHonorarium.user.findUnique({
      where: {
        id: penggunaId,
      },
    });

    if (!user) {
      return {
        success: false,
        message: "User tidak ditemukan",
        error: "ECP-001",
      };
    }

    // logic to salt and hash password
    const isValidPassword = await bcrypt.compare(
      data.currentPassword,
      user.password?.toString() || ""
    );

    if (!isValidPassword) {
      // Passwords don't match
      return {
        success: false,
        message: "Invalid password",
        error: "ECP-002",
      };
    }
    // check if new password is valid
    const newPwd = changePasswordSchema.parse(data);
    const salt = await bcrypt.genSalt(10);

    const updatedUser = await dbHonorarium.user.update({
      where: {
        id: penggunaId,
      },
      data: {
        password: await bcrypt.hash(newPwd.newPassword, salt),
      },
    });

    if (!updatedUser) {
      return {
        success: false,
        message: "Gagal mengubah password",
        error: "ECP-001",
      };
    }
    return {
      success: true,
      message: "Password berhasil diubah",
      data: true,
    };
  } catch (error) {
    console.log("error", error);
    if (error instanceof ZodError) {
      return {
        success: false,
        message: error.message,
        error: "ECP-003",
      };
    }

    return {
      success: false,
      message: "Gagal mengubah password",
      error: "ECP-001",
    };
  }
};
