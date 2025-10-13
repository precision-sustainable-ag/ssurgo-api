// TODO:
//  http://localhost/polygon?lat=35&lon=-79&output=json&server=usda

import { makeSimpleRoute } from 'simple-route';

import { pool } from './pools.js';
import { vegspec } from './vegspec.js';
import { polygon } from './polygon.js';
import { mapunits } from './mapunits.js';
import { ssurgo } from './ssurgo.js';

export default async function apiRoutes(app) {
  const simpleRoute = makeSimpleRoute(app, pool, { public: true });

  await simpleRoute('/',
    'Database',
    `
      <p>
        Returns SSURGO tabular attributes for the mapunit(s) at a given latitude/longitude,
        within a polygon, or for explicit mukey values. The set of joined SSURGO tables is
        controlled by the <code>categories</code> parameter. If <code>server=psa</code> (default) data are fetched
        from your Postgres instance; if <code>server=usda</code>, the query is run against USDA SDA.
        When <code>output=query</code>, the endpoint returns the generated SQL instead of data.
      </p>
      <p><strong>Notes</strong></p>
      <ul>
        <li>At least one of (<code>lat</code>+<code>lon</code>), <code>polygon</code>, or <code>mukey</code> is required.</li>
        <li>If none are provided, the route serves an HTML page (index.html).</li>
        <li>Responses > 10,000 rows or empty result sets return HTTP 400 with an error message.</li>
        <li><code>component=max</code> filters the result to the component(s) with the maximum <code>comppct_r</code>
            (globally or per-mukey). <code>component=major</code> (or <code>max</code>/<code>major</code>) also applies
            <code>majcompflag='Yes'</code>.</li>
        <li>Unless <code>showseriesonly=false</code>, if component-level tables are joined the query adds
            <code>compkind='Series'</code>.</li>
      </ul>
    `.trim(),
    ssurgo,
    {
      lat: { type: 'number', examples: [35] },
      lon: { type: 'number', examples: [-79] },
      server: { examples: ['psa', 'usda']},
    },
    {
      summary: 'Query SSURGO attributes by point, polygon, or mukey',
      response: {
        200: {},
      },
    },
  );

  await simpleRoute('/mapunits',
    'Database',
    `
      <p>
        For each WGS84 point in the request, finds the containing SSURGO mapunit
        and returns the component(s) with the maximum <code>comppct_r</code> for that mukey.
        Points are transformed from EPSG:4326 to EPSG:5070 for containment tests.
        Components with names in {'notcom','miscellaneous area','unknown','undefined'}
        are excluded. Ties on max <code>comppct_r</code> may yield multiple rows per point.
      </p>
    `.trim(),
    mapunits,
    {
      points: {
        type: 'array',
        items: {
          type: 'object',
          required: ['lat', 'lon'],
          additionalProperties: false,
          properties: {
            lat: { type: 'number', minimum: -90, maximum: 90, examples: [34] },
            lon: { type: 'number', minimum: -180, maximum: 180, examples: [-83] },
          },
        },
        description: 'Array of lat/lon pairs',
      },
    },
    {
      summary: 'Get dominant SSURGO component for each point',
      method: 'post',
    },
  );

  await simpleRoute('/vegspec',
    'Database',
    `
      <p>
        Given a WGS84 latitude/longitude, finds the SSURGO mapunit at that point and
        returns joined component and horizon attributes (one row per horizon per
        component), including texture aggregates and ecological class info.
      </p>
      <ul>
        <li>When <code>server=psa</code> (default), the mukey is resolved against your local <code>mupolygon</code> via <code>ST_Contains(ST_Transform(point4326, 5070))</code>.</li>
        <li>When <code>server=usda</code>, the mukey is resolved via <code>SDA_Get_Mukey_from_intersection_with_WktWgs84('point(lon lat)')</code>.</li>
        <li>Results are filtered to <code>compkind IN ('Series','Family','Taxadjunct')</code> and ordered by <code>comppct_r DESC</code>, <code>compname</code>, <code>hzdept_r</code>.</li>
        <li>Texture fields (<code>texdesc</code>, <code>texcl</code>) are aggregated (distinct when <code>server=psa</code>).</li>
        <li>If no mukey is found, the response is <code>200</code> with an empty array.</li>
      </ul>
    `.trim(),
    vegspec,
    {
      lat: { examples: [35], type: 'number' },
      lon: { examples: [-79], type: 'number' },
      server: { examples: ['psa', 'usda'] },
    },
    {
      summary: 'Horizon- and component-level SSURGO details for the mapunit at a point',
      response: {
        200: {
          type: 'array',
          additionalProperties: false,
          items: { properties: {
            mukey: { type: 'string' },
            cokey: { type: 'string' },
            hzname: { type: 'string' },
            desgnmaster: { type: 'string' },
            hzdept_r: { type: 'number' },
            hzdepb_r: { type: 'number' },
            hzthk_r: { type: 'number' },
            ph1to1h2o_l: { type: 'number' },
            ph1to1h2o_r: { type: 'number' },
            ph1to1h2o_h: { type: 'number' },
            texdesc: { type: 'string' },
            texcl: { type: 'string' },
            ecoclassname: { type: 'string' },
            ecoclassid: { type: 'string' },
            compname: { type: 'string' },
            majcompflag: { type: 'string' },
            comppct_r: { type: 'number' },
          } },
        },
      },
    },
  );

  await simpleRoute('/polygon',
    'Database',
    `
      <p>
        Given a WGS84 latitude and longitude, returns the SSURGO mapunit polygon(s)
        that contain that point. Each record includes the point coordinates, the
        mapunit key (<code>mukey</code>), the polygon in WKT, and its GeoJSON coordinate array.
      </p>
      <p><strong>Behavior</strong></p>
      <ul>
        <li>If <code>server=psa</code> (default), the query runs against your local Postgres <code>mupolygon</code> table using <code>ST_Contains(shape, ST_Transform(ST_SetSRID(ST_MakePoint(lon,lat),4326),5070))</code>.</li>
        <li>If <code>server=usda</code>, the query is sent to USDA SDM Data Access (<code>tabular/post.rest</code>) using a SQL geometry intersection test (<code>mupolygongeo.STIntersects(geometry::STGeomFromText('POINT(lon lat)',4326))=1</code>).</li>
        <li>The USDA call may be slower and occasionally returns HTTP 400/500.</li>
        <li>Coordinates are returned in WGS84 (EPSG:4326).</li>
        <li>The helper converts WKT to GeoJSON internally (<code>wktToGeoJSON</code>).</li>
      </ul>
      <p><strong>Output fields</strong></p>
      <ul>
        <li><code>lon</code>, <code>lat</code>: numeric input coordinates</li>
        <li><code>mukey</code>: SSURGO mapunit key</li>
        <li><code>polygon</code>: WKT string of the mapunit geometry</li>
        <li><code>polygonarray</code>: nested coordinate arrays (GeoJSON format)</li>
      </ul>
    `.trim(),
    polygon,
    {
      lat: { examples: [35], type: 'number' },
      lon: { examples: [-79], type: 'number' },
      server: { examples: ['psa', 'usda'] },
    },
    {
      summary: 'Retrieve SSURGO polygon (mupolygon) geometry for a given point',
      response: {
        200: {
          type: 'array',
          additionalProperties: false,
          items: { properties: {
            lat: { type: 'number' },
            lon: { type: 'number' },
            mukey: { type: 'string' },
            polygon: { type: 'string' },
            polygonarray: { type: 'array' },
          } },
        },
      },
    },
  );
};
