// TODO:
//  http://localhost/polygon?lat=35&lon=-79&output=json&server=usda

import { makeSimpleRoute } from '../utils.js';

import { pool } from './pools.js';
import { vegspec } from './vegspec.js';
import { polygon } from './polygon.js';
import { mapunits } from './mapunits.js';
import { ssurgo } from './ssurgo.js';

export default async function apiRoutes(app) {
  const simpleRoute = makeSimpleRoute(app, pool, { public: true });

  await simpleRoute('/vegspec',
    'Database',
    'VegSpec',
    vegspec,
    {
      lat: { examples: [35], type: 'number' },
      lon: { examples: [-79], type: 'number' },
      server: { examples: ['psa', 'usda'] },
    },
    {
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
    'Polygon',
    polygon,
    {
      lat: { examples: [35], type: 'number' },
      lon: { examples: [-79], type: 'number' },
      server: { examples: ['psa', 'usda'] },
    },
    {
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

  await simpleRoute('/mapunits',
    'Database',
    'Map Units',
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
    { method: 'post' },
  );

  await simpleRoute('/',
    'Database',
    'SSURGO',
    ssurgo,
    {
      lat: { type: 'number', examples: [35] },
      lon: { type: 'number', examples: [-79] },
      server: { examples: ['psa', 'usda']},
    },
    {
      response: {
        200: {},
      },
    },
  );
};
