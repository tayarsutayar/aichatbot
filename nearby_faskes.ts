type GetFaskes = {
  longitude?: string;
  latitude?: string;
  type?: string;
};

const FASKES_API_URL =
  "https://faskes.bpjs-kesehatan.go.id/aplicares/Pencarian/getList";

const MAP_TYPE: Record<string, string> = {
  "RUMAH SAKIT": "R",
  PUSKESMAS: "P",
  "DOKTER PRAKTIK PERORANGAN": "U",
  "DOKTER GIGI": "G",
  "KLINIK UTAMA": "S",
  "KLINIK PRATAMA": "B",
};

export const GET_FASKES_DEF = {
  name: "get_faskes",
  description:
    "Get list of nearby health centre ('Fasilitas kesehatan' / 'Rumah Sakit') by it's longitude (lng), latitude (lat), and type.",
  parameters: {
    type: "object",
    properties: {
      longitude: {
        type: "number",
        description: "Longitude coordinate of map.",
      },
      latitude: {
        type: "number",
        description: "Latitude coordinate of map. ",
      },
      type: {
        type: "string",
        enum: ['RS', 'Puskesmas', 'Dokter Praktik Perorangan', 'Dokter Gigi', 'Klinik', 'Klinik Utama', 'Klinik Pratama'],
        description:
          "Type of health facility. eg. 'RS' / 'R' for Rumah Sakit, Puskesmas, DOKTER PRAKTIK PERORANGAN, 'drg.' for Dokter Gigi, Klinik Utama, and Klinik Pratama",
      },
    },
    required: ["longitude", "latitude","type"],
  },
};

export async function getFaskes({ type, longitude, latitude }: GetFaskes) {
  console.log('Faskes nih bos')
  const payload = {
    params: {
      sort: {},
      search: {},
      pagination: {
        start: 0,
        totalItemCount: "85",
        number: 3,
        numberOfPages: 9,
      },
    },
    jnscari: "carifaskes",
    jnscari1: "bynearest",
    dati2ppk: "",
    jnsppk: type,
    lat: latitude,
    lng: longitude,
  };

  const response = await fetch(FASKES_API_URL, {
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify(payload),
  });
  if(response.ok){ 
    const result = response.json().then((data) => {
      return data.row?.map((e : any) => ({
        'Nama' : e.nmppk,
        'Alamat' : e.nmjlnppk,
        'Jarak' : e.distance,
        'Telepon ' : e.telpppk,
        'Kamar vvip' : e.vvip,
        'Kamar vip' : e.vip,
        'Kamar utama' : e.utama,
        'Kamar I' : e.I,
        'Kamar II' : e.II,
        'Kamar III' : e.III,
        'Kamar ICU' : e.ICU,
        'Kamar ICCU' : e.ICCU,
        'Kamar NICU' : e.NICU,
        'Kamar PICU' : e.PICU,
        'Kamar IGD' : e.IGD,
        'Kamar UGD' : e.UGD,
        'Kamar BERSALIN' : e.BERSALIN,
        'Kamar HCU' : e.HCU,
        'Kamar ISOLASI' : e.ISOLASI,
      }))
    });
    return result
  }
  else return {'message' : 'Rumah Sakit atau kamar tidak ditemukan'}
}
