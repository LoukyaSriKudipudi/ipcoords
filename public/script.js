// ========== Fetch IP-Based Location ==========
async function fetchIPLocation() {
  const container = document.getElementById("ipInfo");

  try {
    const res = await fetch("/api");
    const result = await res.json();

    if (result.status === "success") {
      const data = result.ipInfo;

      container.innerHTML = `
        <div><span class="label">🌐 IP:</span> ${data.ip}</div>
        <div><span class="label">📍 City:</span> ${data.city}</div>
        <div><span class="label">🌍 Region:</span> ${data.region}</div>
        <div><span class="label">🇺🇳 Country:</span> ${data.country}</div>
        <div><span class="label">📡 Org:</span> ${data.org}</div>
        <div><span class="label">🕓 Timezone:</span> ${data.timezone}</div>
        <div><span class="label">📌 Coordinates:</span> ${data.loc}</div>
      `;
    } else {
      container.innerHTML = `<div>⚠️ Failed to load IP data.</div>`;
    }
  } catch (err) {
    console.error("❌ Error fetching IP data:", err);
    container.innerHTML = `<div>❌ Error fetching IP details.</div>`;
  }
}

// ========== Send Real Coordinates to Backend ==========
async function sendCoordinatesToBackend(lat, lon) {
  try {
    const response = await fetch("/realLocation", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ latitude: lat, longitude: lon }),
    });

    const result = await response.json();
    console.log("✅ Sent real location:", result.message);
  } catch (err) {
    console.error("❌ Failed to send real location:", err.message);
  }
}

// ========== Fetch Address from Backend ==========
async function fetchReadableAddress(lat, lon) {
  const addressDiv = document.getElementById("realAddress");

  try {
    const res = await fetch(`/coordstoloc?lat=${lat}&lon=${lon}`);
    const data = await res.json();

    if (data.status === "success") {
      addressDiv.innerHTML = `
        <h2>🧭 Human-Readable Address</h2>
        <div>${data.location}</div>
      `;
    } else {
      addressDiv.innerHTML = `<div>⚠️ Failed to fetch address.</div>`;
    }
  } catch (err) {
    console.error("❌ Error fetching Nominatim address:", err);
    addressDiv.innerHTML = `<div>❌ Error fetching address.</div>`;
  }
}

// ========== On Page Load ==========
window.addEventListener("load", fetchIPLocation);

// ========== Real-Time Geolocation ==========
const locateButton = document.getElementById("locateMeBtn");
const iframe = document.querySelector(".iframe");

locateButton.addEventListener("click", () => {
  if (!navigator.geolocation) {
    alert("❌ Geolocation is not supported by your browser.");
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    // Send to backend
    await sendCoordinatesToBackend(lat, lon);

    // Update map
    iframe.src = `https://maps.google.com/maps?q=${lat},${lon}&z=14&output=embed`;

    // Show coordinates
    const realCoordsDiv = document.getElementById("realCoords");
    realCoordsDiv.innerHTML = `
      <h2>📍 Real-Time GPS Coordinates</h2>
      <div><span class="label">Latitude:</span> ${lat}</div>
      <div><span class="label">Longitude:</span> ${lon}</div>
    `;

    // Fetch readable address
    await fetchReadableAddress(lat, lon);
  });
});
