import MapView from "./components/MapView";

export default function App() {
  return (
    <div style={{height: "100vh", display: "flex", flexDirection: "column"}}>
      <header style={{padding: "8px 12px", background: "#0f172a", color: "white"}}>
        <h1 style={{margin:0}}>Geoportal Analisis Spasial v2</h1>
      </header>
      <div style={{flex:1, display:"flex"}}>
        <div style={{flex:1}}>
          <MapView />
        </div>
        <aside id="info-panel" style={{width:340, borderLeft:"1px solid #ddd", padding:12, boxSizing:"border-box"}}>
          <h3>Hasil Analisis</h3>
          <input type="file" id="shp-upload" accept=".zip" style={{marginBottom:8}} />
          <button id="export-pdf" style={{marginBottom:12, padding:'6px 12px'}}>Ekspor ke PDF</button>
          <div id="analysis-output">Gambar atau unggah polygon untuk melihat hasil analisis.</div>
        </aside>
      </div>
    </div>
  );
}