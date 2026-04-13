import Globe from 'react-globe.gl';
import { useRef, useEffect, useState, useMemo } from 'react';

// Generate hex-bin data points for the "digital fabric" look
const generateHexBinData = (gtiValue) => {
  const points = [];
  const hotspots = [
    { lat: 30, lng: 45, weight: 0.9, spread: 15 },
    { lat: 25, lng: 55, weight: 0.85, spread: 10 },
    { lat: 20, lng: 78, weight: 0.7, spread: 12 },
    { lat: 35, lng: 105, weight: 0.5, spread: 15 },
    { lat: 38, lng: 127, weight: 0.6, spread: 8 },
    { lat: 50, lng: 30, weight: 0.55, spread: 20 },
    { lat: 40, lng: -74, weight: 0.4, spread: 12 },
  ];

  hotspots.forEach(spot => {
    const numPoints = Math.floor(spot.spread * 2.5);
    for (let i = 0; i < numPoints; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * spot.spread;
      points.push({
        lat: spot.lat + Math.cos(angle) * dist,
        lng: spot.lng + Math.sin(angle) * dist,
        weight: spot.weight * (1 - dist / spot.spread) * (gtiValue / 100)
      });
    }
  });

  return points;
};

// Trade/tension arc routes — using arrays for color to enable gradient arcs
const generateArcsData = (gtiValue) => {
  const baseArcs = [
    // India → USA (trade)
    { startLat: 19.08, startLng: 72.88, endLat: 40.71, endLng: -74.01, color: ['#00E5FF', '#4DD0E1'] },
    // India → Middle East (oil)
    { startLat: 19.08, startLng: 72.88, endLat: 25.28, endLng: 51.53, color: ['#FF6E40', '#FF3D00'] },
    // Middle East → Europe
    { startLat: 26.07, startLng: 50.55, endLat: 51.51, endLng: -0.13, color: ['#FFD54F', '#FFC107'] },
    // India → China
    { startLat: 28.61, startLng: 77.21, endLat: 31.23, endLng: 121.47, color: ['#FF8A65', '#FF3D00'] },
    // Middle East → India (oil)
    { startLat: 25.28, startLng: 51.53, endLat: 12.97, endLng: 77.59, color: ['#FF6E40', '#FFAB91'] },
    // USA → Europe (NATO)
    { startLat: 38.91, startLng: -77.04, endLat: 48.86, endLng: 2.35, color: ['#80DEEA', '#00E5FF'] },
    // Russia → Europe
    { startLat: 55.76, startLng: 37.62, endLat: 52.52, endLng: 13.41, color: ['#FF8A65', '#FF3D00'] },
  ];

  if (gtiValue > 70) {
    baseArcs.push(
      { startLat: 32.43, startLng: 53.69, endLat: 31.77, endLng: 35.23, color: ['#FF3D00', '#FF8A65'] },
      { startLat: 33.51, startLng: 36.29, endLat: 26.82, endLng: 30.80, color: ['#FF6E40', '#FFD54F'] }
    );
  }

  return baseArcs;
};

// Ring pulses at key cities
const generateRingsData = () => [
  { lat: 19.08, lng: 72.88, maxR: 3, propagationSpeed: 2, repeatPeriod: 1200, color: '#00E5FF' },
  { lat: 25.28, lng: 51.53, maxR: 4, propagationSpeed: 3, repeatPeriod: 800, color: '#FF3D00' },
  { lat: 40.71, lng: -74.01, maxR: 3, propagationSpeed: 2, repeatPeriod: 1500, color: '#00E5FF' },
  { lat: 28.61, lng: 77.21, maxR: 2, propagationSpeed: 1.5, repeatPeriod: 1000, color: '#FFC107' },
];

const MainGlobe = ({ gtiValue = 50, onCountryClick }) => {
  const globeEl = useRef();
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  const hexData = useMemo(() => generateHexBinData(gtiValue), [gtiValue]);
  const arcsData = useMemo(() => generateArcsData(gtiValue), [gtiValue]);
  const ringsData = useMemo(() => generateRingsData(), []);
  
  const [countries, setCountries] = useState({ features: []});

  useEffect(() => {
    // Fetch geojson data for the land mass polygons
    fetch('//unpkg.com/world-atlas/countries-110m.json')
      .then(res => res.json())
      .then(worldData => {
        // Since we are fetching topojson from unpkg we need to convert to geojson.
        // Actually unpkg three-globe has a pre-converted geojson:
        fetch('//unpkg.com/three-globe/example/datasets/ne_110m_admin_0_countries.geojson')
          .then(res => res.json())
          .then(setCountries);
      });
  }, []);

  useEffect(() => {
    if (globeEl.current) {
      const controls = globeEl.current.controls();
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.4;
      controls.enableZoom = false;
      globeEl.current.pointOfView({ lat: 22, lng: 60, altitude: 2.2 }, 1500);
    }

    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hexBinColor = (d) => {
    const w = d.weight || 0;
    if (w > 0.7) return 'rgba(255, 61, 0, 0.65)';
    if (w > 0.4) return 'rgba(255, 193, 7, 0.45)';
    return 'rgba(0, 229, 255, 0.3)';
  };

  return (
    <div className="absolute inset-0 z-0" style={{ opacity: 0.9 }}>
      <Globe
        ref={globeEl}
        width={dimensions.width}
        height={dimensions.height}
        globeImageUrl="//unpkg.com/three-globe/example/img/earth-dark.jpg"
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundColor="rgba(0,0,0,0)"

        // Atmosphere
        atmosphereColor={gtiValue > 70 ? '#FF6E40' : '#00E5FF'}
        atmosphereAltitude={0.2}
        showAtmosphere={true}

        // Colored Polygons for World Land Map
        polygonsData={countries.features}
        polygonAltitude={0.005}
        polygonCapColor={() => 'rgba(25, 30, 45, 0.4)'} // A dark slate-blue to stand out slightly from the ocean, representing land
        polygonSideColor={() => 'rgba(0, 0, 0, 0.1)'}
        polygonStrokeColor={() => '#111'}
        onPolygonClick={polygon => {
          if (onCountryClick && polygon.properties.ADMIN) {
            onCountryClick(polygon.properties.ADMIN);
          } else if (onCountryClick && polygon.properties.name) {
            onCountryClick(polygon.properties.name);
          }
        }}
        
        // Hex-bin
        hexBinPointsData={hexData}
        hexBinPointLat="lat"
        hexBinPointLng="lng"
        hexBinPointWeight="weight"
        hexBinResolution={4}
        hexTopColor={hexBinColor}
        hexSideColor={hexBinColor}
        hexAltitude={d => d.sumWeight * 0.04}
        hexBinMerge={true}
        hexTransitionDuration={800}

        // Animated orbital arcs — KEY: these props enable moving dashes
        arcsData={arcsData}
        arcColor="color"
        arcStroke={0.6}
        arcDashLength={0.5}
        arcDashGap={0.3}
        arcDashInitialGap={() => Math.random()}
        arcDashAnimateTime={2500}
        arcAltitudeAutoScale={0.35}

        // Ring pulses at key cities
        ringsData={ringsData}
        ringColor="color"
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"
        ringResolution={64}

        // Labels
        labelsData={[
          { lat: 19.08, lng: 72.88, text: 'MUMBAI', size: 0.6, color: '#4DD0E1' },
          { lat: 25.28, lng: 51.53, text: 'DOHA', size: 0.5, color: '#FF8A65' },
          { lat: 40.71, lng: -74.01, text: 'NYC', size: 0.5, color: '#80DEEA' },
          { lat: 28.61, lng: 77.21, text: 'DELHI', size: 0.5, color: '#4DD0E1' },
        ]}
        labelText="text"
        labelSize="size"
        labelColor="color"
        labelDotRadius={0.4}
        labelAltitude={0.015}
        labelResolution={2}
      />
    </div>
  );
};

export default MainGlobe;
