// The map's look, in the colours of D-SIM'YA (light and dark), on OpenFreeMap's vector tiles (OpenMapTiles schema,
// © OpenMapTiles, data © OpenStreetMap contributors). Quiet on purpose: land, water, green, buildings, roads, rails and
// names; what we draw on top (stops, the walk, a bus's road) stands out. German names first, as on the street signs.
export const TILES = 'https://tiles.openfreemap.org/planet';
export const GLYPHS = 'https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf';

export const LIGHT = {
  land: '#ECEFF0', resid: '#E6EAEC', green: '#DCE8D6', wood: '#D2E1CB', water: '#BBD6E6', waterLine: '#A9CADD',
  building: '#DDE2E5', buildingLine: '#CDD4D8', road: '#FFFFFF', casing: '#C9D1D6', major: '#FFFFFF', majorCasing: '#BAC4CA',
  motorway: '#F7E3BF', motorwayCasing: '#D9B67A', path: '#AEB9BF', rail: '#A3AEB4', railDash: '#ECEFF0',
  label: '#12181C', label2: '#53616A', label3: '#7A878F', halo: '#FFFFFF', waterLabel: '#3E6F8C',
  // what we draw: stops, the selected one, the walk, a course
  accent: '#9A5800', accentSoft: '#F7E3BF', ink: '#12181C', surface: '#FFFFFF', walk: '#1F6FD1', muted: '#8C989F', back: '#6F4BD8',
};
export const DARK = {
  land: '#12181B', resid: '#151C20', green: '#16241B', wood: '#18281D', water: '#1B3341', waterLine: '#234357',
  building: '#1E272D', buildingLine: '#283239', road: '#27323A', casing: '#0C1114', major: '#34424C', majorCasing: '#0C1114',
  motorway: '#5A4518', motorwayCasing: '#0C1114', path: '#45525B', rail: '#4E5B64', railDash: '#12181B',
  label: '#E5EBEE', label2: '#A7B4BB', label3: '#7D8A92', halo: '#0F1417', waterLabel: '#8FC1DE',
  accent: '#FFB424', accentSoft: '#3A2909', ink: '#E5EBEE', surface: '#182026', walk: '#8AB4F8', muted: '#6B7980', back: '#B9A6FF',
};

const NAME = ['coalesce', ['get', 'name:de'], ['get', 'name']];
const z = (...stops) => ['interpolate', ['exponential', 1.5], ['zoom'], ...stops];
const lines = ['match', ['geometry-type'], ['LineString', 'MultiLineString'], true, false];
const polys = ['match', ['geometry-type'], ['Polygon', 'MultiPolygon'], true, false];
const cls = (...c) => ['match', ['get', 'class'], c, true, false];
const notTunnel = ['!=', ['get', 'brunnel'], 'tunnel'];

// the base map for one theme
export function baseLayers(c) {
  const road = (id, filter, min, color, width, extra = {}) => ({ id, type: 'line', source: 'omt', 'source-layer': 'transportation', minzoom: min,
    filter: ['all', lines, filter], layout: { 'line-cap': 'round', 'line-join': 'round' }, paint: { 'line-color': color, 'line-width': width, ...extra } });
  const MINOR = cls('minor', 'service'), MAJOR = cls('primary', 'secondary', 'tertiary', 'trunk'), MOTOR = cls('motorway');
  return [
    { id: 'background', type: 'background', paint: { 'background-color': c.land } },
    { id: 'residential', type: 'fill', source: 'omt', 'source-layer': 'landuse', minzoom: 9, filter: ['all', polys, cls('residential', 'suburb', 'neighbourhood')], paint: { 'fill-color': c.resid } },
    { id: 'wood', type: 'fill', source: 'omt', 'source-layer': 'landcover', minzoom: 8, filter: ['all', polys, cls('wood', 'forest')], paint: { 'fill-color': c.wood } },
    { id: 'grass', type: 'fill', source: 'omt', 'source-layer': 'landcover', minzoom: 10, filter: ['all', polys, cls('grass', 'park', 'meadow')], paint: { 'fill-color': c.green, 'fill-opacity': 0.8 } },
    { id: 'park', type: 'fill', source: 'omt', 'source-layer': 'park', filter: polys, paint: { 'fill-color': c.green } },
    { id: 'cemetery', type: 'fill', source: 'omt', 'source-layer': 'landuse', minzoom: 12, filter: ['all', polys, cls('cemetery', 'pitch', 'playground')], paint: { 'fill-color': c.green } },
    { id: 'water', type: 'fill', source: 'omt', 'source-layer': 'water', filter: ['all', polys, notTunnel], paint: { 'fill-color': c.water } },
    { id: 'waterway', type: 'line', source: 'omt', 'source-layer': 'waterway', minzoom: 8, filter: ['all', lines, notTunnel], paint: { 'line-color': c.waterLine, 'line-width': z(8, 0.5, 13, 1.2, 18, 5) } },
    { id: 'building', type: 'fill', source: 'omt', 'source-layer': 'building', minzoom: 14,
      paint: { 'fill-color': c.building, 'fill-outline-color': c.buildingLine, 'fill-opacity': ['interpolate', ['linear'], ['zoom'], 14, 0, 15, 1] } },
    road('path', cls('path', 'track'), 14, c.path, z(14, 0.6, 18, 2), { 'line-dasharray': [2, 1.6] }),
    road('minor-casing', MINOR, 12, c.casing, z(12, 0.6, 14, 2.6, 16, 7, 18, 19)),
    road('major-casing', MAJOR, 8, c.majorCasing, z(8, 0.6, 12, 3, 14, 6.5, 16, 12, 18, 26)),
    road('motorway-casing', MOTOR, 6, c.motorwayCasing, z(6, 0.8, 12, 4, 14, 8, 18, 30)),
    road('minor', MINOR, 12, c.road, z(12, 0.3, 14, 1.6, 16, 5.5, 18, 16)),
    road('major', MAJOR, 8, c.major, z(8, 0.3, 12, 2, 14, 4.6, 16, 9.5, 18, 22)),
    road('motorway', MOTOR, 6, c.motorway, z(6, 0.5, 12, 2.6, 14, 6, 18, 26)),
    road('rail', ['all', cls('rail', 'transit'), notTunnel], 10, c.rail, z(10, 0.8, 16, 2.4, 18, 4)),
    road('rail-dash', ['all', cls('rail', 'transit'), notTunnel], 14, c.railDash, z(14, 0.8, 16, 1.4, 18, 2.4), { 'line-dasharray': [3, 3] }),
    { id: 'boundary', type: 'line', source: 'omt', 'source-layer': 'boundary', filter: ['all', ['<=', ['get', 'admin_level'], 2], ['!=', ['get', 'maritime'], 1]],
      paint: { 'line-color': c.label3, 'line-dasharray': [3, 2], 'line-width': 1.2 } },
    { id: 'water-name', type: 'symbol', source: 'omt', 'source-layer': 'water_name', minzoom: 11,
      filter: ['match', ['geometry-type'], ['Point', 'MultiPoint'], true, false],
      layout: { 'text-field': NAME, 'text-font': ['Noto Sans Italic'], 'text-size': 13, 'text-max-width': 6 },
      paint: { 'text-color': c.waterLabel, 'text-halo-color': c.halo, 'text-halo-width': 1.2 } },
    ...[['road-name', 14, cls('primary', 'secondary', 'tertiary', 'trunk')], ['road-name-minor', 15.5, cls('minor', 'service', 'path', 'track')]].map(([id, min, f]) => (
      { id, type: 'symbol', source: 'omt', 'source-layer': 'transportation_name', minzoom: min, filter: ['all', lines, f],
        layout: { 'symbol-placement': 'line', 'text-field': NAME, 'text-font': ['Noto Sans Regular'], 'text-size': ['interpolate', ['linear'], ['zoom'], 14, 11, 18, 14], 'text-padding': 8 },
        paint: { 'text-color': c.label2, 'text-halo-color': c.halo, 'text-halo-width': 1.5 } })),
    { id: 'housenumber', type: 'symbol', source: 'omt', 'source-layer': 'housenumber', minzoom: 17.5,
      layout: { 'text-field': ['get', 'housenumber'], 'text-font': ['Noto Sans Regular'], 'text-size': 10.5, 'text-padding': 2 },
      paint: { 'text-color': c.label3, 'text-halo-color': c.halo, 'text-halo-width': 1 } },
    { id: 'place-small', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 12.5, filter: cls('suburb', 'quarter', 'neighbourhood', 'hamlet', 'isolated_dwelling'),
      layout: { 'text-field': NAME, 'text-font': ['Noto Sans Bold'], 'text-size': 11, 'text-transform': 'uppercase', 'text-letter-spacing': 0.08, 'text-max-width': 8 },
      paint: { 'text-color': c.label3, 'text-halo-color': c.halo, 'text-halo-width': 1.5 } },
    { id: 'place-village', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 9, maxzoom: 16, filter: cls('village'),
      layout: { 'text-field': NAME, 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 9, 11, 14, 14], 'text-max-width': 8 },
      paint: { 'text-color': c.label2, 'text-halo-color': c.halo, 'text-halo-width': 1.5 } },
    { id: 'place-town', type: 'symbol', source: 'omt', 'source-layer': 'place', minzoom: 6, maxzoom: 15, filter: cls('town', 'city'),
      layout: { 'text-field': NAME, 'text-font': ['Noto Sans Bold'], 'text-size': ['interpolate', ['linear'], ['zoom'], 6, 12, 13, 18], 'text-max-width': 8 },
      paint: { 'text-color': c.label, 'text-halo-color': c.halo, 'text-halo-width': 1.6 } },
  ];
}

// What the page draws on the map. The sources start empty; the page fills them.
const EMPTY = { type: 'FeatureCollection', features: [] };
export const OVERLAY_SOURCES = ['acc', 'walk', 'back', 'route', 'routestops', 'stops', 'sel'];
// Buses drive on the right: each direction's line is drawn a little to the right of the road's middle, so where the
// way there and the way back share a street, both show side by side, each on the side where its buses stop.
// White arrows along the lines say which way they go (the icon "arrow" is drawn by the page).
const OFFSET = ['interpolate', ['linear'], ['zoom'], 12, 0, 14, 2.5, 16, 4.5, 18, 7];
const arrows = (id, source, filter, c) => ({ id, type: 'symbol', source, minzoom: 13, filter,
  layout: { 'symbol-placement': 'line', 'symbol-spacing': ['interpolate', ['linear'], ['zoom'], 13, 90, 17, 140], 'icon-image': 'arrow',
    'icon-size': ['interpolate', ['linear'], ['zoom'], 13, 0.45, 16, 0.6, 18, 0.8], 'icon-rotation-alignment': 'map', 'icon-allow-overlap': true, 'icon-ignore-placement': true,
    // the same distance to the right as the line (the offset is in icon pixels, so divided by the icon's size)
    'icon-offset': ['interpolate', ['linear'], ['zoom'], 13, ['literal', [0, 2.8]], 14, ['literal', [0, 5]], 16, ['literal', [0, 7.5]], 18, ['literal', [0, 8.75]]] },
  paint: { 'icon-color': c.surface } });
export function overlayLayers(c) {
  const RIDE = ['all', ['!=', ['get', 'kind'], 'walk'], ['!=', ['get', 'kind'], 'done']];
  return [
    // how sure the phone is about where you are
    { id: 'acc', type: 'fill', source: 'acc', paint: { 'fill-color': c.walk, 'fill-opacity': 0.12 } },
    // the way back of a course, when it takes other streets: its own colour, under the way there
    { id: 'back-casing', type: 'line', source: 'back', layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.surface, 'line-width': z(10, 4, 14, 7, 18, 12), 'line-offset': OFFSET } },
    { id: 'back', type: 'line', source: 'back', layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.back, 'line-width': z(10, 2.4, 14, 4, 18, 7.5), 'line-offset': OFFSET } },
    arrows('back-arrows', 'back', ['has', 'dir'], c),
    // a bus or train's road (a course, or the rides of a connection) and its stops
    { id: 'route-casing', type: 'line', source: 'route', filter: ['!=', ['get', 'kind'], 'walk'], layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.surface, 'line-width': z(10, 5, 14, 8, 18, 14), 'line-offset': OFFSET } },
    { id: 'route', type: 'line', source: 'route', filter: ['!=', ['get', 'kind'], 'walk'], layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': ['match', ['get', 'kind'], 'train', c.ink, 'done', c.muted, c.accent], 'line-width': z(10, 3, 14, 5, 18, 9), 'line-offset': OFFSET } },
    arrows('route-arrows', 'route', RIDE, c),
    { id: 'route-walk', type: 'line', source: 'route', filter: ['==', ['get', 'kind'], 'walk'], layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.walk, 'line-width': z(12, 3, 18, 7), 'line-dasharray': [0.1, 2] } },
    { id: 'routestops', type: 'circle', source: 'routestops', minzoom: 11,
      paint: { 'circle-radius': z(11, 2.5, 15, 4.5, 18, 7), 'circle-color': c.surface, 'circle-stroke-width': z(11, 1.5, 16, 2.5),
        'circle-stroke-color': ['case', ['get', 'past'], c.muted, ['==', ['get', 'kind'], 'train'], c.ink, c.accent] } },
    { id: 'routestops-label', type: 'symbol', source: 'routestops', minzoom: 14,
      layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Regular'], 'text-size': 11.5, 'text-offset': [0, 1.1], 'text-anchor': 'top', 'text-optional': true, 'text-max-width': 9 },
      paint: { 'text-color': c.label2, 'text-halo-color': c.halo, 'text-halo-width': 1.5 } },
    // the walk to a stop or a place: blue dots, like the route apps people know
    { id: 'walk', type: 'line', source: 'walk', layout: { 'line-cap': 'round', 'line-join': 'round' },
      paint: { 'line-color': c.walk, 'line-width': z(12, 3.5, 18, 8), 'line-dasharray': [0.1, 1.8] } },
    // every stop around: a ring in the accent colour, a station (trains) filled; names from zoom 16
    { id: 'stops', type: 'circle', source: 'stops', minzoom: 12.5,
      paint: { 'circle-radius': z(12.5, 3, 15, 6, 18, 10), 'circle-color': ['case', ['get', 'rail'], c.ink, c.surface],
        'circle-stroke-color': ['case', ['get', 'rail'], c.surface, c.accent], 'circle-stroke-width': z(12.5, 1.5, 16, 2.6, 18, 3.5) } },
    { id: 'stops-label', type: 'symbol', source: 'stops', minzoom: 15.6,
      layout: { 'text-field': ['get', 'name'], 'text-font': ['Noto Sans Bold'], 'text-size': 12, 'text-offset': [0, 1.15], 'text-anchor': 'top', 'text-optional': true, 'text-max-width': 8, 'text-padding': 4 },
      paint: { 'text-color': c.label, 'text-halo-color': c.halo, 'text-halo-width': 1.6 } },
    // the stop that is open in the sheet
    { id: 'sel', type: 'circle', source: 'sel', paint: { 'circle-radius': z(12, 8, 16, 12, 18, 15), 'circle-color': c.accent, 'circle-stroke-color': c.surface, 'circle-stroke-width': 3.5 } },
  ];
}

// the whole style for a theme; `keep` hands over the data already drawn (when the theme changes)
export function mapStyle(dark, keep = {}) {
  const c = dark ? DARK : LIGHT;
  const sources = { omt: { type: 'vector', url: TILES } };
  for (const id of OVERLAY_SOURCES) sources[id] = keep[id] || { type: 'geojson', data: EMPTY };
  return { version: 8, name: dark ? 'd-simya-dark' : 'd-simya', glyphs: GLYPHS, sources, layers: [...baseLayers(c), ...overlayLayers(c)] };
}
