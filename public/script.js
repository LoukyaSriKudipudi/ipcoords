window.addEventListener("load", async () => {
  const container = document.getElementById("ipInfo");

  try {
    const res = await fetch("/api");
    const result = await res.json();
    if (result.status === "success") {
      const data = result.ipInfo;

      container.innerHTML = `
            <div><span class="label">🌐 IP: </span> ${data.ip}</div>
            <div><span class="label">📍 City: </span> ${data.city}</div>
            <div><span class="label">🌍 Region: </span> ${data.region}</div>
            <div><span class="label">🇺🇳 Country: </span> ${data.country}</div>
            <div><span class="label">📡 Org: </span> ${data.org}</div>
            <div><span class="label">🕓 Timezone: </span> ${data.timezone}</div>
            <div><span class="label">📌 Coordinates: </span> ${data.loc}</div>
          `;
    } else {
      container.innerHTML = `<div>⚠️ Failed to load IP data.</div>`;
    }
  } catch (err) {
    console.error(err);
    container.innerHTML = `<div>❌ Error fetching IP details.</div>`;
  }
});

const locateButton = document.getElementById("locateMeBtn");
const iframe = document.querySelector(".iframe");

locateButton.addEventListener("click", async () => {
  if (!navigator.geolocation) {
    alert("Geolocation is not supported by your browser");
    return;
  }

  navigator.geolocation.getCurrentPosition((position) => {
    realLocation(position);
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    iframe.src = `https://maps.google.com/maps?q=${lat},${lon}&z=14&output=embed`;
  });
});

async function realLocation(position) {
  const { latitude, longitude } = position.coords;

  const response = await fetch("/realLocation", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ latitude, longitude }),
  });

  const result = await response.json();
  console.log(result.message);
}
