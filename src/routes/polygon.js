import axios from 'axios';

import { pool } from './pools.js';

const wktToGeoJSON = (wkt) => {
  const geojson = {
    type: 'Polygon',
    coordinates: [],
  };
  const matches = wkt.match(/POLYGON\s*\(\((.*)\)\)/);

  if (matches) {
    const coordinates = matches[1].split(', ').map((point) => {
      const [lon, lat] = point.split(' ').map(Number);
      return [lon, lat];
    });
    geojson.coordinates.push(coordinates);
  }
  return geojson;
}; // wktToGeoJSON

export const polygon = async (lat, lon, server) => { // SLOW, and often causes 400 or 500 error
  if (server === 'usda') {
    const query = `
      SELECT ${lon} as lon, ${lat} as lat, mukey, mupolygongeo
      FROM mupolygon
      WHERE mupolygongeo.STIntersects(geometry::STGeomFromText('POINT(${lon} ${lat})', 4326)) = 1;
    `;

    axios
      .post(`https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest`, {
        query,
        format: 'JSON',
        encode: 'form',
      })
      .then((data) => {
        const result = (data.data.Table || []).map((d) => {
          const [lon2, lat2, mukey, polygon2] = d;
          return {
            lon: lon2,
            lat: lat2,
            mukey,
            polygon: polygon2,
            polygonarray: [wktToGeoJSON(polygon2).coordinates],
          };
        });

        return result;
      });
  } else {
    const query = `
      SELECT
        ${lon} as lon,
        ${lat} as lat,
        mukey,
        ST_AsText(ST_Transform(shape, 4326)) as polygon,
        (ST_AsGeoJSON(ST_Multi(ST_Transform(shape, 4326)))::jsonb->'coordinates') as polygonarray
      FROM
        mupolygon
      WHERE
        ST_Contains(shape, ST_Transform(ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), 5070))
    `;

    const { rows } = await pool.query(query);
    return rows;
  }
}; // polygon
