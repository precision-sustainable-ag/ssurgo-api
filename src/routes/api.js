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
    'Query SSURGO attributes by point, polygon, or mukey',
    ssurgo,
    {
      lat: { type: 'number', examples: [35] },
      lon: { type: 'number', examples: [-79] },
      server: { examples: ['psa', 'usda']},
    },
    {
      200: {}, // allow any output
    },
  );

  await simpleRoute('/mapunits',
    'Database',
    'Get dominant SSURGO component for each point',
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
      method: 'post',
      200: {
        lon: { type: 'number' },
        lat: { type: 'number' },
        mukey: { type: 'string' },
        compname: { type: 'string' },
        comppct_r: { type: 'number' },
      },
    },
  );

  await simpleRoute('/vegspec',
    'Database',
    'Horizon- and component-level SSURGO details for the mapunit at a point',
    vegspec,
    {
      lat: { examples: [35], type: 'number' },
      lon: { examples: [-79], type: 'number' },
      server: { examples: ['psa', 'usda'] },
    },
    {
      200: {
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
      },
    },
  );

  await simpleRoute('/polygon',
    'Database',
    'Retrieve SSURGO polygon (mupolygon) geometry for a given point',
    polygon,
    {
      lat: { examples: [35], type: 'number' },
      lon: { examples: [-79], type: 'number' },
      server: { examples: ['psa', 'usda'] },
    },
    {
      200: {
        lat: { type: 'number' },
        lon: { type: 'number' },
        mukey: { type: 'string' },
        polygon: { type: 'string' },
        polygonarray: {
          type: 'array',
          items: {
            type: 'array',
          },
        },
      },
    },
  );
};
