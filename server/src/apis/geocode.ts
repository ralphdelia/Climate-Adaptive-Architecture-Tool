export async function getCoordinates(address: string) {
  const apiKey = process.env.GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  const res = await fetch(url);
  const data = await res.json();
  const location = data.results[0]?.geometry.location;
  return location;
}
