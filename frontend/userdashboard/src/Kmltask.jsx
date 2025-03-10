import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import * as toGeoJSON from "@tmcw/togeojson";
import "leaflet/dist/leaflet.css";

const Kmltask = () => {
  const [Geodata, setGeoData] = useState(null);
  const [Summery, setSummery] = useState(null);
  const [Details, setDetails] = useState(null);

  // ✅ Corrected File Upload Handler
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const parser = new DOMParser();
        const kml = parser.parseFromString(e.target.result, "text/xml");
        const converted = toGeoJSON.kml(kml);
        setGeoData(converted);
        processSummary(converted);
      };
      reader.readAsText(file); // ✅ Read the file
    }
  };

  // ✅ Move this function outside of `handleFileUpload`
  const processSummary = (data) => {
    const typeCount = {};
    const detailsData = {};

    data.features.forEach((feature) => {
      const type = feature.geometry.type;
      typeCount[type] = (typeCount[type] || 0) + 1;

      if (type === "LineString" || type === "MultiLineString") {
        const length = calculateLength(feature.geometry);
        detailsData[type] = (detailsData[type] || 0) + length;
      }
    });

    setSummery(typeCount);
    setDetails(detailsData);
  };

  // ✅ Calculate Length of Lines
  const calculateLength = (geometry) => {
    let length = 0;
    if (geometry.type === "LineString") {
      for (let i = 0; i < geometry.coordinates.length - 1; i++) {
        length += getDistance(geometry.coordinates[i], geometry.coordinates[i + 1]);
      }
    } else if (geometry.type === "MultiLineString") {
      geometry.coordinates.forEach((line) => {
        for (let i = 0; i < line.length - 1; i++) {
          length += getDistance(line[i], line[i + 1]);
        }
      });
    }
    return length;
  };

  // ✅ Distance Calculation Function
  const getDistance = ([lon1, lat1], [lon2, lat2]) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  return (
    <div>
      <h2>KML File Upload</h2>
      <input type="file" accept=".kml" onChange={handleFileUpload} />
      <div>
        <button onClick={() => alert(JSON.stringify(Summery, null, 2))}>
          Summary
        </button>
        <button onClick={() => alert(JSON.stringify(Details, null, 2))}>
          Detailed
        </button>
      </div>

      {/* ✅ Ensure the map is rendered correctly */}
      <MapContainer center={[20, 0]} zoom={2} style={{ height: "500px", width: "100%" }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {Geodata && <GeoJSON data={Geodata} />}
      </MapContainer>
    </div>
  );
};

export default Kmltask;
