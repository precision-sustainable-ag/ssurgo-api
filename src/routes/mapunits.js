import { pool } from './pools.js';

export const mapunits = async (points) => {
  // const { points } = req.body; // expecting [{ lat, lon }, ...]

  // if (!Array.isArray(points) || points.length === 0) {
  //   return reply.code(400).send({ error: 'Missing or invalid "points" array' });
  // }

  const valuesSql = points
    .map((p) => `(${parseFloat(p.lon)}, ${parseFloat(p.lat)})`)
    .join(',\n');

  const query = `
    SELECT 
      pt.lon,
      pt.lat,
      c.mukey,
      c.compname,
      c.comppct_r
    FROM (
      VALUES
        ${valuesSql}
    ) AS pt(lon, lat)
    CROSS JOIN LATERAL (
      SELECT ST_Transform(ST_SetSRID(ST_MakePoint(pt.lon, pt.lat), 4326), 5070) AS geom
    ) AS g
    JOIN mupolygon p
      ON p.shape && g.geom
      AND ST_Contains(p.shape, g.geom)
    JOIN component c
      ON c.mukey = p.mukey
    WHERE c.comppct_r = (
      SELECT MAX(c2.comppct_r)
      FROM component c2
      WHERE c2.mukey = p.mukey
    )
    AND LOWER(c.compname) NOT IN ('notcom', 'miscellaneous area', 'unknown', 'undefined');
  `;

  const results = await pool.query(query);

  return results.rows;
}; // mapunits
