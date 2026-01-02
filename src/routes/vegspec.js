import axios from 'axios';

import { pool } from './pools.js';

export const vegspec = async (lat, lon, server) => {
  const psa = server !== 'usda';

  let mukey;
  if (psa) {
    const query = `
      SELECT mukey FROM mupolygon
      WHERE ST_Contains(shape, ST_Transform(ST_SetSRID(ST_MakePoint($1, $2), 4326), 5070))
    `;

    // console.log(query);
    mukey = (await pool.query(query, [lon, lat]))?.rows[0]?.mukey;
  } else {
    const query = `SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('point(${lon} ${lat})')`;

    mukey = (await axios
      .post(`https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest`, {
        query,
        format: 'JSON',
        encode: 'form',
      })).data.Table[0][0];
  }

  const sq = `
    SELECT
      mu.mukey,
      co.cokey,
      hzname,
      desgnmaster,
      hzdept_r,
      hzdepb_r,
      hzthk_r,
      ph1to1h2o_l,
      ph1to1h2o_r,
      ph1to1h2o_h,
      STRING_AGG(${psa ? 'DISTINCT' : ''} texdesc, ', ') AS texdesc,
      STRING_AGG(${psa ? 'DISTINCT' : ''} texcl, ', ') AS texcl,
      ecoclassname,
      ecoclassid,
      compname,
      majcompflag,
      co.comppct_r
    FROM
      sacatalog sc
    LEFT JOIN
      legend lg ON sc.areasymbol = lg.areasymbol
    LEFT JOIN (
      SELECT * FROM mapunit
      WHERE mukey = '${mukey}'
    ) mu ON lg.lkey = mu.lkey
    LEFT JOIN
      component co ON mu.mukey = co.mukey
    LEFT JOIN
      chorizon ch ON co.cokey = ch.cokey
    LEFT JOIN
      chtexturegrp ctg ON ch.chkey = ctg.chkey
    LEFT JOIN
      chtexture ct ON ctg.chtgkey = ct.chtgkey
    LEFT JOIN
      coecoclass ON co.cokey = coecoclass.cokey
    WHERE
      mu.mukey IS NOT NULL
      AND compkind in ('Series', 'Family', 'Taxadjunct')
    GROUP BY
      mu.mukey, co.cokey, hzname, desgnmaster, hzdept_r, hzdepb_r, hzthk_r,
      ph1to1h2o_l, ph1to1h2o_r, ph1to1h2o_h,
      ecoclassname, ecoclassid, compname,
      majcompflag, co.comppct_r
    ORDER BY
      comppct_r DESC,
      compname,
      hzdept_r
  `;

  // AND hzname IS NOT NULL
  // AND (
  //   desgnmaster LIKE '%A%'
  //   OR desgnmaster LIKE '%B%'
  //   OR desgnmaster LIKE '%E%'
  //   OR desgnmaster LIKE '%H%'
  // )
  // AND desgnmaster NOT LIKE '%C%'

  let results;
  if (psa) {
    results = await pool.query(sq);
  } else {
    const data = await axios
      .post(`https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest`, {
        query: sq,
        format: 'JSON+COLUMNNAME',
        encode: 'form',
      });

    const data1 = [];
    const table = data.data.Table || [];
    if (table.length) {
      table.slice(1).forEach((row) => {
        const obj = {};
        row.forEach((d, i) => {
          const col = table[0][i];

          if (d !== null && !/key/.test(col)) {
            obj[col] = Number.isFinite(+d) ? +d : d;
          } else {
            obj[col] = d;
          }
        });
        data1.push(obj);
      });
    }

    results = {
      rows: data1,
    };
  }

  return results.rows;
}; // vegspec
