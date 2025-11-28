// src/lib/repositories/paymentRepository.ts

export interface MidtransCustomerDetails {
  first_name: string;
  last_name?: string;
  phone?: string;
  address?: string;
  email?: string;
}

export interface MidtransCreateTransactionPayload {
  orderId: string;
  grossAmount: number;
  customerDetails: MidtransCustomerDetails;
}

export interface MidtransTransactionResponse {
  token: string;
  redirect_url?: string;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

if (!SUPABASE_URL) {
  console.warn("VITE_SUPABASE_URL belum diset di .env");
}

export const createMidtransTransaction = async (
  payload: MidtransCreateTransactionPayload
): Promise<MidtransTransactionResponse> => {
  const url = `${SUPABASE_URL}/functions/v1/create-midtrans-token`;

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      order_id: payload.orderId,
      gross_amount: payload.grossAmount,
      customer_details: {
        first_name: payload.customerDetails.first_name,
        last_name: payload.customerDetails.last_name,
        phone: payload.customerDetails.phone,
        email: payload.customerDetails.email, // WAJIB VALID
        address: payload.customerDetails.address
}
,
    }),
  });

  if (!res.ok) {
    console.error("createMidtransTransaction HTTP error", res.status, await res.text());
    throw new Error("Gagal membuat transaksi Midtrans");
  }

  const data = (await res.json()) as MidtransTransactionResponse;

  if (!data.token) {
    throw new Error("Token Midtrans tidak ditemukan dalam response");
  }

  return data;
};
