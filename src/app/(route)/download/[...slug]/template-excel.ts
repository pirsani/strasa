import fs from "fs/promises";
import { NextResponse } from "next/server";
import path from "path";

export const downloadTemplateExcel = async (req: Request, slug: string[]) => {
  const jenisDokumen = slug[1];
  console.log(jenisDokumen);
  let template = "template-excel.xlsx";

  switch (jenisDokumen) {
    case "narasumber":
      template = "narasumber.xlsx";
      break;
    case "peserta":
      template = "peserta.xlsx";
      break;
    case "sbm-uh-dalam-negeri":
      template = "sbm_uh_dalam_negeri.xlsx";
      break;
    case "sbm-uh-luar-negeri":
      template = "sbm_uh_luar_negeri.xlsx";
      break;
    case "sbm-honorarium":
      template = "sbm_honorarium.xlsx";
      break;
    case "sbm-uang-representasi":
      template = "sbm_uang_representasi.xlsx";
      break;
    case "sbm-tiket-pesawat":
      template = "sbm_tiket_pesawat.xlsx";
      break;
    case "sbm-taksi":
      template = "sbm_taksi.xlsx";
      break;
    default:
      break;
  }

  const templatePath = path.join(
    process.cwd(),
    "docs",
    "template-excel",
    template
  );

  try {
    await fs.access(templatePath, fs.constants.R_OK);

    const template = await fs.readFile(templatePath);

    return new NextResponse(template, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    });
  } catch {
    return new NextResponse("Excel template not found, contact administrator", {
      status: 400,
    });
  }
};
