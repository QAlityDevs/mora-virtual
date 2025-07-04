import { MercadoPagoConfig, Preference } from "mercadopago";

const mercadopago = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN!,
});

export async function POST(request: Request) {
  try {
    const { seats, eventId, userId } = await request.json();

    const items = seats.map((seat: any) => ({
      title: `Evento ${eventId} - Fila ${seat.row}, Asiento ${seat.number}`,
      quantity: 1,
      currency_id: "CLP",
      unit_price: seat.price,
    }));

    const preference = await new Preference(mercadopago).create({
      body: {
        items,
        back_urls: {
          success: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
          failure: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/failure`,
          pending: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/pending`,
        },
        external_reference: userId,
      },
    });

    return Response.json({ init_point: preference.init_point });
  } catch {
    return Response.json(
      { error: "Error creando preferencia" },
      { status: 500 }
    );
  }
}
