import React, { useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw";
import * as turf from "@turf/turf";
import shp from "shpjs";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

function DrawAndUploadControl() {
  const map = useMap();
  const drawnItemsRef = useRef(new L.FeatureGroup());

  useEffect(() => {
    const drawnItems = drawnItemsRef.current;
    map.addLayer(drawnItems);

    const drawControl = new L.Control.Draw({
      edit: { featureGroup: drawnItems },
      draw: { polygon: true, rectangle: true, polyline: false, circle: false, marker: false }
    });
    map.addControl(drawControl);

    function updateAnalysis() {
      const output = document.getElementById("analysis-output");
      const features = [];
      drawnItems.eachLayer((layer) => {
        const gj = layer.toGeoJSON();
        try {
          const area = turf.area(gj);
          const centroid = turf.centroid(gj);
          features.push({
            area_m2: area,
            area_ha: area / 10000,
            centroid: centroid.geometry.coordinates,
          });
        } catch {}
      });
      if (features.length === 0) {
        output.innerHTML = "Belum ada polygon.";
        return;
      }
      let html = "";
      features.forEach((f, i) => {
        html += `<b>Fitur ${i + 1}</b><br/>`;
        html += `Luas: ${f.area_m2.toFixed(2)} m² (${f.area_ha.toFixed(4)} ha)<br/>`;
        html += `Centroid: ${f.centroid[1].toFixed(6)}, ${f.centroid[0].toFixed(6)}<br/><br/>`;
      });
      output.innerHTML = html;
    }

    map.on(L.Draw.Event.CREATED, (e) => {
      drawnItems.addLayer(e.layer);
      updateAnalysis();
    });
    map.on(L.Draw.Event.EDITED, updateAnalysis);
    map.on(L.Draw.Event.DELETED, updateAnalysis);

    // Upload shapefile
    const uploadInput = document.getElementById("shp-upload");
    uploadInput.addEventListener("change", async (evt) => {
      const file = evt.target.files[0];
      if (!file) return;
      const arrayBuffer = await file.arrayBuffer();
      const geojson = await shp(arrayBuffer);
      L.geoJSON(geojson, { onEachFeature: (_, layer) => drawnItems.addLayer(layer) });
      updateAnalysis();
    });

    // Export PDF
    const pdfBtn = document.getElementById("export-pdf");
    pdfBtn.addEventListener("click", async () => {
      const mapContainer = map.getContainer();
      const canvas = await html2canvas(mapContainer);
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.text("Laporan Analisis Spasial", 10, 10);
      pdf.addImage(imgData, "PNG", 10, 20, imgWidth, imgHeight);
      pdf.addPage();
      const content = document.getElementById("analysis-output").innerText;
      const lines = pdf.splitTextToSize(content, pageWidth - 20);
      pdf.text(lines, 10, 20);
      pdf.save(`analisis_spasial_${Date.now()}.pdf`);
    });

    return () => {
      map.removeControl(drawControl);
      map.removeLayer(drawnItems);
    };
  }, [map]);

  return null;
}

export default function MapView() {
  const center = [-7.87, 112.52];
  return (
    <MapContainer center={center} zoom={13} style={{height: "100%", width: "100%"}}>
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <DrawAndUploadControl />
    </MapContainer>
  );
}