// public/scripts/common/analytics.js
// Renders analytics charts on the Analytics page using Chart.js and the backend /analytics-data endpoint

(function(){
  const els = {
    loc: document.getElementById('anLocation'),
    maxHigh: document.getElementById('anMaxHigh'),
    avgHumidity: document.getElementById('anAvgHumidity'),
    aqi: document.getElementById('anAQI'),
    aqiCat: document.getElementById('anAQICat'),
    alerts: document.getElementById('anAlerts'),
  };

  const canvases = {
    temp: document.getElementById('tempChart'),
    humidity: document.getElementById('humidityChart'),
    uv: document.getElementById('uvChart'),
    wind: document.getElementById('windChart'),
    windDir: document.getElementById('windDirChart'),
    cloudPrecip: document.getElementById('cloudPrecipChart'),
  };

  if (!window.Chart) {
    console.warn('Chart.js not found. Skipping analytics chart rendering.');
    return;
  }

  const fallbackCoords = { latitude: 29.4241, longitude: -98.4936 }; // San Antonio, TX as fallback

  function getCoords(){
    return new Promise(resolve => {
      if (!navigator.geolocation) return resolve(fallbackCoords);
      navigator.geolocation.getCurrentPosition(
        pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(fallbackCoords),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    });
  }

  function colorForAQICategory(cat){
    switch ((cat||'').toLowerCase()){
      case 'good': return '#2ecc71';
      case 'moderate': return '#f1c40f';
      case 'usg': return '#e67e22';
      case 'unhealthy': return '#e74c3c';
      case 'very unhealthy': return '#8e44ad';
      case 'hazardous': return '#7f1d1d';
      default: return '#6c757d';
    }
  }

  function buildTempChart(ctx, labels, highs, lows){
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'High', data: highs, borderColor: '#e74c3c', backgroundColor: 'rgba(231,76,60,0.15)', fill: true, tension: 0.3 },
          { label: 'Low', data: lows, borderColor: '#3498db', backgroundColor: 'rgba(52,152,219,0.15)', fill: true, tension: 0.3 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  function buildHumidityChart(ctx, labels, values){
    return new Chart(ctx, {
      type: 'line',
      data: { labels, datasets: [{ label: 'Humidity %', data: values, borderColor: '#7a59ea', backgroundColor: 'rgba(122,89,234,0.15)', fill: true, tension: 0.3 }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { suggestedMin: 0, suggestedMax: 100 } } }
    });
  }

  function buildUVChart(ctx, labels, uvValues){
    const bg = uvValues.map(u => {
      if (u == null) return '#bdc3c7';
      if (u <= 2) return '#2ecc71';
      if (u <= 5) return '#f1c40f';
      if (u <= 7) return '#e67e22';
      if (u <= 10) return '#e74c3c';
      return '#8e44ad';
    });
    return new Chart(ctx, {
      type: 'bar',
      data: { labels, datasets: [{ label: 'UV Index', data: uvValues, backgroundColor: bg }] },
      options: { responsive: true, maintainAspectRatio: false, scales: { y: { suggestedMin: 0 } }, plugins: { legend: { display: false } } }
    });
  }

  function buildWindChart(ctx, labels, speed, gust){
    return new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Wind Speed', data: speed, borderColor: '#16a085', backgroundColor: 'rgba(22,160,133,0.15)', fill: true, tension: 0.3 },
          { label: 'Wind Gust', data: gust, borderColor: '#c0392b', backgroundColor: 'rgba(192,57,43,0.15)', fill: true, tension: 0.3 }
        ]
      },
      options: { responsive: true, maintainAspectRatio: false }
    });
  }

  function buildWindDirChart(ctx, sectors){
    const labels = Object.keys(sectors);
    const values = Object.values(sectors);
    return new Chart(ctx, {
      type: 'doughnut',
      data: { labels, datasets: [{ label: 'Days by Direction', data: values, backgroundColor: labels.map((_,i)=>`hsl(${i*22.5},60%,60%)`) }] },
      options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }
    });
  }

  function buildCloudPrecipChart(ctx, points){
    const data = points.map(p => ({ x: p.cloud, y: p.precip, label: p.label }));
    return new Chart(ctx, {
      type: 'scatter',
      data: { datasets: [{ label: 'Cloud vs Precip %', data, backgroundColor: '#5074e8' }] },
      options: {
        parsing: false,
        responsive: true,
        maintainAspectRatio: false,
        scales: { x: { title: { display: true, text: 'Cloud Cover (%)' }, suggestedMin: 0, suggestedMax: 100 }, y: { title: { display: true, text: 'Precip Probability (%)' }, suggestedMin: 0, suggestedMax: 100 } },
        plugins: { legend: { position: 'bottom' }, tooltip: { callbacks: { label: (ctx) => `${ctx.raw.label}: ${ctx.raw.x}% cloud, ${ctx.raw.y}% precip` } } }
      }
    });
  }

  async function fetchAnalytics(latitude, longitude){
    const resp = await fetch('/analytics-data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ latitude, longitude, units: 'us', days: 7 })
    });
    if (!resp.ok) throw new Error('Failed to load analytics');
    return resp.json();
  }

  function setText(el, text){ if (el) el.textContent = text; }
  function setBadge(el, text, color){ if (!el) return; el.textContent = text; el.className = `ms-1 badge`; if (color) el.style.backgroundColor = color; }

  function updateSummaries(data){
    setText(els.loc, `${data.meta.timezone || 'Unknown'}`);
    setText(els.maxHigh, data.temperature.summary.maxHigh != null ? `${data.temperature.summary.maxHigh}` : '—');
    setText(els.avgHumidity, data.humidity.summary.avg != null ? `${data.humidity.summary.avg}%` : '—');
    if (data.airQuality){
      setText(els.aqi, data.airQuality.aqiUS != null ? `${data.airQuality.aqiUS}` : '—');
      const color = colorForAQICategory(data.airQuality.category);
      setBadge(els.aqiCat, data.airQuality.category || 'Unknown', color);
    }
    setText(els.alerts, data.alerts?.count ?? 0);
  }

  function renderAll(data){
    try {
      if (canvases.temp) buildTempChart(canvases.temp.getContext('2d'), data.temperature.labels, data.temperature.highs, data.temperature.lows);
      if (canvases.humidity) buildHumidityChart(canvases.humidity.getContext('2d'), data.humidity.labels, data.humidity.values);
      if (canvases.uv) buildUVChart(canvases.uv.getContext('2d'), data.uv.labels, data.uv.max);
      if (canvases.wind) buildWindChart(canvases.wind.getContext('2d'), data.wind.labels, data.wind.speed, data.wind.gust);
      if (canvases.windDir) buildWindDirChart(canvases.windDir.getContext('2d'), data.wind.dirSectors);
      if (canvases.cloudPrecip) buildCloudPrecipChart(canvases.cloudPrecip.getContext('2d'), data.cloudVsPrecip.points);
    } catch (e){ console.error('Chart render error:', e); }
  }

  async function init(){
    try {
      const { latitude, longitude } = await getCoords();
      const data = await fetchAnalytics(latitude, longitude);
      updateSummaries(data);
      renderAll(data);
    } catch (e){
      console.error(e);
      // Provide a minimal inline error display
      const container = document.querySelector('.dashboard-container');
      if (container){
        const alert = document.createElement('div');
        alert.className = 'alert alert-warning mt-2';
        alert.textContent = 'Unable to load analytics at the moment. Please try again later.';
        container.prepend(alert);
      }
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
