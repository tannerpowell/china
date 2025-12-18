export default function LocationPage() {
  const address = process.env.NEXT_PUBLIC_RESTAURANT_ADDRESS ?? "";
  const phone = process.env.NEXT_PUBLIC_RESTAURANT_PHONE ?? "";
  return (
    <main style={{ maxWidth: 720, margin: "0 auto", padding: 24 }}>
      <h1 style={{ marginTop: 0 }}>Location & Hours</h1>
      {address ? <p><strong>Address:</strong> {address}</p> : null}
      {phone ? <p><strong>Phone:</strong> <a href={`tel:${phone}`}>{phone}</a></p> : null}
      {address ? <p><a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noopener noreferrer">Open in Google Maps</a></p> : null}
    </main>
  );
}
