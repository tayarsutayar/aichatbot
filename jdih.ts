type GetDaftarPeraturanParams = {
    judul?: string;
    bentuk?: "uu" | "perppu" | "pp" | "perpres" | "pmk";
    nomor?: number;
    tahun?: number;
  };
  
  const JDIH_API_URL = "https://jdih.kemenkeu.go.id/api/AppPeraturans";
  
  const MAP_BENTUK: Record<string, number> = {
    uu: 45,
    pp: 44,
    perppu: 32,
    perpres: 31,
    pmk: 20,
  };
  
  export const GET_DAFTAR_PERATURAN_DEF = {
    name: "get_daftar_peraturan",
    description:
      "Get list of regulations (Peraturan) by it's title (judul), type (bentuk) , number (nomor) and year (tahun).",
    parameters: {
      type: "object",
      properties: {
        judul: {
          type: "string",
          description:
            "The title (judul) you want to look-up. e.g. 'Pajak PPh 21'",
        },
        bentuk: {
          type: "string",
          enum: ["uu", "perppu", "pp", "perpres", "pmk"],
          description:
            "Filter the result by it's type (bentuk) of the regulation (peraturan). eg. 'uu' for Undang-Undang, 'pp' for Peraturan Pemerintah, 'perpres' for Peraturan Presiden and 'pmk' for Peraturan Menteri Keuangan",
        },
        nomor: {
          type: "number",
          description: "Filter the result by it's number (nomor) of regulation.",
        },
        tahun: {
          type: "number",
          description: "Filter the result by it's year (tahun) of regulation.",
        },
      },
    },
  };
  
  export async function getDaftarPeraturan({
    judul,
    bentuk,
    nomor,
    tahun,
  }: GetDaftarPeraturanParams) {
    const params = new URLSearchParams();
    judul && params.append("search", judul);
    bentuk && params.append("bentuk", MAP_BENTUK[bentuk].toString());
    nomor && params.append("nomor", nomor.toString());
    tahun && params.append("tahun", tahun.toString());
    const response = await fetch(JDIH_API_URL + "?" + params);
    if (response.ok) return response.json();
  }