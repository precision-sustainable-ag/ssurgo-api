const axios = require('axios');
const { pool } = require('./pools');

const ssurgo = (req, res) => {
  const localhost = /localhost/.test(req.get('host'));
  let where;
  let data1;
  let query1;
  const server = req.query.server || 'psa';
  const psa = server !== 'usda';
  const joinType = 'LEFT';

  let minlat;
  let maxlat;
  let minlon;
  let maxlon;

  let mukey = req.query.mukey ? req.query.mukey.split(',').map((m) => `'${m}'`).join(',') : null;
  const output = req.query.output || 'json';

  let cats = [
    '+legend',
    '+mapunit',
    '+component',
    '+horizon',
    '+textureclass',
    '+parentmaterial',
    '+restrictions',
    '-sacatalog',
    '-pores',
    '-structure',
    '-canopycover',
    '-cropyield',
    '-monthlystats',
    '-muaggatt',
    '-coecoclass',
  ];

  if ((req.query.categories || '').includes('clear')) {
    req.query.categories = req.query.categories.replace(/clear/g, '');
    cats = [
      '-legend',
      '-mapunit',
      '-component',
      '-horizon',
      '-textureclass',
      '-parentmaterial',
      '-restrictions',
      '-sacatalog',
      '-pores',
      '-structure',
      '-canopycover',
      '-cropyield',
      '-monthlystats',
      '-muaggatt',
      '-coecoclass',
    ];
  }

  const test = (category) => category.split('|').some((t) => cats.includes(`+${t}`));

  const lat = req.query.lat ? (+req.query.lat).toFixed(4) : 'NULL';
  const lon = req.query.lon ? (+req.query.lon).toFixed(4) : 'NULL';

  const filter = (req.query.filter || '').split(',');
  const parms = {
    sacatalog: psa
      ? [
        'areasymbol', 'areaname', 'saversion', 'saverest', 'tabularversion', 'tabularverest', 'tabnasisexportdate', 'tabcertstatus',
        'tabcertstatusdesc', 'fgdcmetadata', 'sacatalogkey',
      ]
      : [
        'areasymbol', 'areaname', 'saverest', 'mbrminx', 'mbrminy', 'mbrmaxx', 'mbrmaxy',
      ],
    legend: ['areasymbol', 'areaacres', 'projectscale', 'lkey'],
    mapunit: ['lkey', 'musym', 'muname', 'mukind', 'muacres', 'farmlndcl', 'iacornsr', 'mukey'],
    component: [
      'mukey', 'comppct_l', 'comppct_r', 'comppct_h', 'compname', 'compkind', 'majcompflag', 'slope_l', 'slope_r', 'slope_h', 'slopelenusle_l',
      'slopelenusle_r', 'slopelenusle_h', 'runoff', 'erocl', 'hydricrating', 'hydricon', 'drainagecl', 'elev_l', 'elev_r', 'elev_h', 'geomdesc',
      'map_l', 'map_r', 'map_h', 'ffd_l', 'ffd_r', 'ffd_h', 'frostact', 'hydgrp', 'taxclname', 'taxorder', 'taxsuborder', 'taxgrtgroup', 'taxsubgrp',
      'taxpartsize', 'taxpartsizemod', 'taxceactcl', 'taxreaction', 'taxtempcl', 'taxmoistscl', 'taxtempregime', 'soiltaxedition', 'cokey',
    ],
    chorizon: [
      'cokey', 'hzname', 'desgndisc', 'desgnmaster', 'desgnmasterprime', 'desgnvert', 'hzdept_l', 'hzdept_r', 'hzdept_h', 'hzdepb_l', 'hzdepb_r',
      'hzdepb_h', 'hzthk_l', 'hzthk_r', 'hzthk_h', 'fraggt10_l', 'fraggt10_r', 'fraggt10_h', 'frag3to10_l', 'frag3to10_r', 'frag3to10_h',
      'sieveno4_l', 'sieveno4_r', 'sieveno4_h', 'sieveno10_l', 'sieveno10_r', 'sieveno10_h', 'sieveno40_l', 'sieveno40_r', 'sieveno40_h',
      'sieveno200_l', 'sieveno200_r', 'sieveno200_h', 'sandtotal_l', 'sandtotal_r', 'sandtotal_h', 'sandvc_l', 'sandvc_r', 'sandvc_h',
      'sandco_l', 'sandco_r', 'sandco_h', 'sandmed_l', 'sandmed_r', 'sandmed_h', 'sandfine_l', 'sandfine_r', 'sandfine_h', 'sandvf_l',
      'sandvf_r', 'sandvf_h', 'silttotal_l', 'silttotal_r', 'silttotal_h', 'siltco_l', 'siltco_r', 'siltco_h', 'siltfine_l', 'siltfine_r',
      'siltfine_h', 'claytotal_l', 'claytotal_r', 'claytotal_h', 'claysizedcarb_l', 'claysizedcarb_r', 'claysizedcarb_h', 'om_l', 'om_r', 'om_h',
      'dbtenthbar_l', 'dbtenthbar_r', 'dbtenthbar_h', 'dbthirdbar_l', 'dbthirdbar_r', 'dbthirdbar_h', 'dbfifteenbar_l', 'dbfifteenbar_r',
      'dbfifteenbar_h', 'dbovendry_l', 'dbovendry_r', 'dbovendry_h', 'partdensity', 'ksat_l', 'ksat_r', 'ksat_h', 'awc_l', 'awc_r', 'awc_h',
      'wtenthbar_l', 'wtenthbar_r', 'wtenthbar_h', 'wthirdbar_l', 'wthirdbar_r', 'wthirdbar_h', 'wfifteenbar_l', 'wfifteenbar_r', 'wfifteenbar_h',
      'wsatiated_l', 'wsatiated_r', 'wsatiated_h', 'll_l', 'll_r', 'll_h', 'pi_l', 'pi_r', 'pi_h', 'kwfact', 'kffact', 'caco3_l', 'caco3_r',
      'caco3_h', 'gypsum_l', 'gypsum_r', 'gypsum_h', 'sar_l', 'sar_r', 'sar_h', 'ec_l', 'ec_r', 'ec_h', 'cec7_l', 'cec7_r', 'cec7_h', 'ecec_l',
      'ecec_r', 'ecec_h', 'sumbases_l', 'sumbases_r', 'sumbases_h', 'ph1to1h2o_l', 'ph1to1h2o_r', 'ph1to1h2o_h', 'ph01mcacl2_l', 'ph01mcacl2_r',
      'ph01mcacl2_h', 'pbray1_l', 'pbray1_r', 'pbray1_h', 'poxalate_l', 'poxalate_r', 'poxalate_h', 'ph2osoluble_l', 'ph2osoluble_r',
      'ph2osoluble_h', 'ptotal_l', 'ptotal_r', 'ptotal_h', 'chkey',
    ],
    chpores: ['chkey', 'poreqty_l', 'poreqty_r', 'poreqty_h', 'poresize', 'porecont', 'poreshp', 'cp.rvindicator'],
    chstructgrp: ['chkey', 'structgrpname', 'csg.rvindicator'],
    texture: ['chkey', 'texture', 'stratextsflag', 'ctg.rvindicator', 'texdesc', 'chtgkey', 'chtgkey', 'texcl'],
    copmgrp: ['cokey', 'pmgroupname', 'pmg.rvindicator'],
    corestrictions: [
      'cokey', 'reskind', 'resdept_l', 'resdept_r', 'resdept_h', 'resdepb_l', 'resdepb_r', 'resdepb_h', 'resthk_l', 'resthk_r', 'resthk_h',
    ],
    cocanopycover: ['cokey', 'plantcov', 'plantsym', 'plantsciname', 'plantcomname'],
    cocropyld: [
      'cokey', 'cropname', 'yldunits', 'nonirryield_l', 'nonirryield_r', 'nonirryield_h', 'irryield_l', 'irryield_r', 'irryield_h', 'cropprodindex',
      'vasoiprdgrp',
    ],
    comonth: [
      'cokey', 'monthseq', 'month', 'flodfreqcl', 'floddurcl', 'pondfreqcl', 'ponddurcl', 'ponddep_l', 'ponddep_r', 'ponddep_h', 'dlyavgprecip_l',
      'dlyavgprecip_r', 'dlyavgprecip_h', 'dlyavgpotet_l', 'dlyavgpotet_r', 'dlyavgpotet_h', 'comonthkey', 'comonthkey', 'soimoistdept_l',
      'soimoistdept_r', 'soimoistdept_h', 'soimoistdepb_l', 'soimoistdepb_r', 'soimoistdepb_h', 'soimoiststat', 'comonthkey', 'soitempmm',
      'soitempdept_l', 'soitempdept_r', 'soitempdept_h', 'soitempdepb_l', 'soitempdepb_r', 'soitempdepb_h',
    ],
    muaggatt: [
      'muname', 'slopegraddcp', 'slopegradwta', 'brockdepmin', 'wtdepannmin', 'wtdepaprjunmin', 'flodfreqdcd', 'flodfreqmax', 'pondfreqprs',
      'aws025wta', 'aws050wta', 'aws0100wta', 'aws0150wta', 'drclassdcd', 'drclasswettest', 'hydgrpdcd', 'iccdcd', 'iccdcdpct', 'niccdcd',
      'niccdcdpct', 'engdwobdcd', 'engdwbdcd', 'engdwbll', 'engdwbml', 'engstafdcd', 'engstafll', 'engstafml', 'engsldcd', 'engsldcp',
      'englrsdcd', 'engcmssdcd', 'engcmssmp', 'urbrecptdcd', 'urbrecptwta', 'forpehrtdcp', 'hydclprs', 'awmmfpwwta', 'mukey',
    ],
    coecoclass: [
      'cokey', 'ecoclasstypename', 'ecoclassref', 'ecoclassid', 'ecoclassname', 'coecoclasskey',
    ],
  };

  const doFilter = (query) => {
    if (filter.length) {
      const crit = [];
      Object.keys(parms).forEach((category) => {
        if (query.includes(category)) {
          filter.forEach((c) => {
            if (parms[category].includes(c.split(/[^a-z_]/)[0])) {
              crit.push(c.replace('mukey', 'mu.mukey'));
            }
          });
        }
      });

      if (crit.length) {
        query += ` and ${crit.join(' and ')}`;
      }
    }

    return query;
  }; // doFilter

  const doOutput = (data) => {
    if (output === 'json') {
      if (req.callback) {
        req.callback(data);
      } else {
        res.status(200).send(data);
      }
    } else if (output === 'csv') {
      res.set('Content-Type', 'text/csv');
      res.setHeader('Content-disposition', `attachment; filename=SSURGO.csv`);
      const result = `
        ${Object.keys(data[0])}
        ${data.map((row) => Object.values(row).map((d) => (d ?? '').toString().replace(/^.*,.*$/g, (s) => `"${s}"`))).join('\n')}
      `.trim();

      res.status(200).send(result);
    } else if (output === 'html') {
      const s = `
        <style>
          table {
            border: 1px solid black;
            border-spacing: 0; 
            empty-cells: show;
            white-space: nowrap;
            font: 13px arial;
          }

          td, th {
            padding: 0.2em 0.5em;
            border-right: 1px solid #ddd;
            border-bottom: 1px solid #bbb;
          }
        </style>
        <table id="Data">
          <thead>
            <tr><th>${Object.keys(data[0]).join('<th>')}
          </thead>
          <tbody>
            <tr>${data.map((row) => `<td>${Object.values(row).join('<td>')}`).join('<tr>')}
          </tbody>
        </table>
      `;

      res.status(200).send(s);
    }
  }; // doOutput

  const outputData = () => {
    if (data1.length > 10000) {
      res.status(400).send({ ERROR: 'Too many rows' });
      return;
    }

    if (!data1.length) {
      if (req.callback) {
        req.callback([]);
      } else {
        res.status(400).send({ ERROR: 'No data found' });
      }
    } else {
      if (req.query.component === 'max') {
        const col = data1[0].indexOf('comppct_r');
        const mcol = data1[0].indexOf('mukey');

        let max = req.query.mukey ? {} : -Infinity;

        if (req.query.mukey) {
          req.query.mukey.split(',').forEach((key) => { max[key] = -Infinity; });
        }

        data1.slice(1).forEach((row) => {
          const key = row[mcol];
          if (req.query.mukey) {
            max[key] = Math.max(max[key], +row[col]);
          } else {
            max = Math.max(max, +row[col]);
          }
        });

        data1 = data1.slice().filter((row, i2) => {
          const key = row[mcol];
          return i2 === 0 || row[col] === max[key] || row[col] === max;
        });
      }

      doOutput(data1);
    }
  }; // outputData

  const ssurgo1 = () => {
    const attr = [];

    if (lat !== 'NULL') {
      attr.push(`${lat} as lat, ${lon} as lon`);
    }

    if (test('sacatalog')) {
      attr.push('sc.areasymbol');
    }

    if (test('legend')) {
      attr.push('lg.lkey');
    }

    if (test('mapunit')) {
      attr.push('mu.mukey');
    }

    if (test('component|restrictions|horizon|canopycover|cropyield|monthlystats')) {
      attr.push('co.cokey');
    }

    if (test('horizon|pores|structure|textureclass')) {
      attr.push('ch.chkey');
    }

    if (test('textureclass')) {
      attr.push('ctg.chtgkey');
    }

    if (test('sacatalog')) {
      if (psa) {
        attr.push(`
          sc.areasymbol, sc.areaname, saversion, saverest,
          tabularversion, tabularverest, tabnasisexportdate, tabcertstatus, tabcertstatusdesc,
          fgdcmetadata, sacatalogkey
        `);
      } else {
        attr.push('sc.areaname, saverest, mbrminx, mbrminy, mbrmaxx, mbrmaxy');
      }
    }

    if (test('legend')) {
      attr.push('areaacres, projectscale');
    }

    if (test('mapunit')) {
      attr.push('mu.musym, mu.muname, mukind, muacres, farmlndcl, iacornsr');
    }

    if (test('component')) {
      attr.push(`
        comppct_l, comppct_r, comppct_h, compname, compkind, majcompflag, slope_l, slope_r, slope_h, slopelenusle_l, slopelenusle_r, slopelenusle_h,
        runoff, erocl, hydricrating, hydricon, drainagecl, elev_l, elev_r, elev_h, geomdesc, map_l, map_r, map_h, ffd_l, ffd_r, ffd_h, frostact,
        hydgrp, taxclname, taxorder, taxsuborder, taxgrtgroup, taxsubgrp, taxpartsize, taxpartsizemod, taxceactcl, taxreaction, taxtempcl,
        taxmoistscl, taxtempregime, soiltaxedition
      `);
    }

    if (test('horizon')) {
      attr.push(`
        hzname, desgndisc, desgnmaster, desgnmasterprime, desgnvert, hzdept_l, hzdept_r, hzdept_h, hzdepb_l, hzdepb_r, hzdepb_h, hzthk_l, hzthk_r,
        hzthk_h, fraggt10_l, fraggt10_r, fraggt10_h, frag3to10_l, frag3to10_r, frag3to10_h, sieveno4_l, sieveno4_r, sieveno4_h, sieveno10_l,
        sieveno10_r, sieveno10_h, sieveno40_l, sieveno40_r, sieveno40_h, sieveno200_l, sieveno200_r, sieveno200_h, sandtotal_l, sandtotal_r,
        sandtotal_h, sandvc_l, sandvc_r, sandvc_h, sandco_l, sandco_r, sandco_h, sandmed_l, sandmed_r, sandmed_h, sandfine_l, sandfine_r,
        sandfine_h, sandvf_l, sandvf_r, sandvf_h, silttotal_l, silttotal_r, silttotal_h, siltco_l, siltco_r, siltco_h, siltfine_l, siltfine_r,
        siltfine_h, claytotal_l, claytotal_r, claytotal_h, claysizedcarb_l, claysizedcarb_r, claysizedcarb_h, om_l, om_r, om_h, dbtenthbar_r,
        dbtenthbar_h, dbthirdbar_l, dbthirdbar_r, dbthirdbar_h, dbfifteenbar_l, dbfifteenbar_r, dbfifteenbar_h, dbovendry_l, dbovendry_r,
        dbovendry_h, partdensity, ksat_l, ksat_r, ksat_h, awc_l, awc_r, awc_h, wtenthbar_l, wtenthbar_r, wtenthbar_h, wthirdbar_l, wthirdbar_r,
        wthirdbar_h, wfifteenbar_l, wfifteenbar_r, wfifteenbar_h, wsatiated_l, wsatiated_r, wsatiated_h, ll_l, ll_r, ll_h, pi_l, pi_r, pi_h, kwfact,
        kffact, caco3_l, caco3_r, caco3_h, gypsum_l, gypsum_r, gypsum_h, sar_l, sar_r, sar_h, ec_l, ec_r, ec_h, cec7_l, cec7_r, cec7_h, ecec_l,
        ecec_r, ecec_h, sumbases_l, sumbases_r, sumbases_h, ph1to1h2o_l, ph1to1h2o_r, ph1to1h2o_h, ph01mcacl2_l, ph01mcacl2_r, ph01mcacl2_h,
        pbray1_l, pbray1_r, pbray1_h, poxalate_l, poxalate_r, poxalate_h, ph2osoluble_l, ph2osoluble_r, ph2osoluble_h, ptotal_l, ptotal_r, ptotal_h
      `);
    }

    if (test('textureclass')) {
      attr.push('texture, stratextsflag, ctg.rvindicator, texdesc, texcl');
    }

    if (test('pores')) {
      attr.push('poreqty_l, poreqty_r, poreqty_h, poresize, porecont, poreshp, cp.rvindicator');
    }

    if (test('structure')) {
      attr.push('structgrpname, csg.rvindicator');
    }

    if (test('parentmaterial')) {
      attr.push('pmgroupname, pmg.rvindicator');
    }

    if (test('restrictions')) {
      attr.push('reskind, resdept_l, resdept_r, resdept_h, resdepb_l, resdepb_r, resdepb_h, resthk_l, resthk_r, resthk_h');
    }

    if (test('monthlystats')) {
      attr.push(`
        mo.comonthkey, monthseq, month, flodfreqcl, floddurcl, pondfreqcl, ponddurcl, ponddep_l, ponddep_r, ponddep_h, dlyavgprecip_l, dlyavgprecip_r,
        dlyavgprecip_h, dlyavgpotet_l, dlyavgpotet_r, dlyavgpotet_h, soimoistdept_l, soimoistdept_r, soimoistdept_h, soimoistdepb_l, soimoistdepb_r,
        soimoistdepb_h, soimoiststat, soitempmm, soitempdept_l, soitempdept_r, soitempdept_h, soitempdepb_l, soitempdepb_r, soitempdepb_h
      `);
    }

    if (test('canopycover')) {
      attr.push('plantcov, plantsym, plantsciname, plantcomname');
    }

    if (test('cropyield')) {
      attr.push(
        'cropname, yldunits, nonirryield_l, nonirryield_r, nonirryield_h, irryield_l, irryield_r, irryield_h, yld.cropprodindex, vasoiprdgrp',
      );
    }

    if (test('muaggatt')) {
      attr.push(`
        muaggatt.mukey, muaggatt.muname, slopegraddcp, slopegradwta, brockdepmin, wtdepannmin, wtdepaprjunmin, flodfreqdcd, flodfreqmax, pondfreqprs,
        aws025wta, aws050wta, aws0100wta, aws0150wta, drclassdcd, drclasswettest, hydgrpdcd, iccdcd, iccdcdpct, niccdcd,
        niccdcdpct, engdwobdcd, engdwbdcd, engdwbll, engdwbml, engstafdcd, engstafll, engstafml, engsldcd, engsldcp,
        englrsdcd, engcmssdcd, engcmssmp, urbrecptdcd, urbrecptwta, forpehrtdcp, hydclprs, awmmfpwwta
      `);
    }

    if (test('coecoclass')) {
      attr.push(`
        coecoclass.cokey, ecoclasstypename, ecoclassref, ecoclassid, ecoclassname, coecoclasskey
      `);
    }

    const joinComponent = test('component|parentmaterial|restrictions|horizon|pores|structure|textureclass|canopycover|cropyield|monthlystats')
      ? `${joinType} JOIN component co ON mu.mukey = co.mukey`
      : '';

    let seriesOnly;

    if (req.query.showseriesonly === 'false') {
      seriesOnly = '';
    } else if (test('component|parentmaterial|restrictions|horizon|pores|structure|textureclass')) {
      seriesOnly = `AND compkind='Series' `;
    } else {
      seriesOnly = '';
    }

    query1 = `
      SELECT DISTINCT ${attr}
      FROM sacatalog sc
      ${joinType} JOIN legend lg ON sc.areasymbol = lg.areasymbol
      ${joinType} JOIN (
        SELECT * FROM mapunit
        WHERE mukey in (${mukey})
      ) mu ON lg.lkey = mu.lkey
      ${joinComponent}
      ${test('horizon|pores|structure|textureclass') ? `${joinType} JOIN chorizon ch ON co.cokey = ch.cokey` : ''}
      ${test('pores') ? `${joinType} JOIN chpores cp ON ch.chkey = cp.chkey` : ''}
      ${test('structure') ? `${joinType} JOIN chstructgrp csg ON ch.chkey = csg.chkey` : ''}
      ${test('textureclass') ? `${joinType} JOIN chtexturegrp ctg ON ch.chkey = ctg.chkey` : ''}
      ${test('textureclass') ? `${joinType} JOIN chtexture ct ON ctg.chtgkey = ct.chtgkey` : ''}
      ${test('parentmaterial') ? `${joinType} JOIN copmgrp pmg ON co.cokey = pmg.cokey` : ''}
      ${test('restrictions') ? `${joinType} JOIN corestrictions rt ON co.cokey = rt.cokey` : ''}
      ${test('canopycover') ? `${joinType} JOIN cocanopycover cov ON co.cokey = cov.cokey` : ''}
      ${test('cropyield') ? `${joinType} JOIN cocropyld yld ON co.cokey = yld.cokey` : ''}
      ${test('monthlystats') ? `${joinType} JOIN comonth mo ON co.cokey = mo.cokey` : ''}
      ${test('monthlystats') ? `${joinType} JOIN cosoilmoist moist ON mo.comonthkey = moist.comonthkey` : ''}
      ${test('monthlystats') ? `${joinType} JOIN cosoiltemp temp ON mo.comonthkey = temp.comonthkey` : ''}
      ${test('muaggatt') ? `${joinType} JOIN muaggatt ON muaggatt.mukey = mu.mukey` : ''}
      ${test('coecoclass') ? `${joinType} JOIN coecoclass ON co.cokey = coecoclass.cokey` : ''}
      ${where}
      ${seriesOnly}
    `;

    if (/^\s*(major|max)\s*$/.test(req.query.component)) {
      query1 += ` and majcompflag='Yes'`;
    }

    query1 = doFilter(query1);
    // query1 = `${query1} ORDER BY 1, 2`;
    if (localhost) {
      console.log('query1');
      console.log(query1.replace(/[\n\r]\s+/g, '\n'));
    }

    if (output === 'query') {
      res.status(200).send(query1);
    } else if (psa) {
      pool.query(
        query1,
        (error, results) => {
          if (error) {
            console.log(error);
            res.status(400).send(error);
          } else {
            data1 = results.rows;
            outputData();
          }
        },
      );
    } else {
      axios
        .post(`https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest`, {
          query: query1,
          format: 'JSON+COLUMNNAME',
          encode: 'form',
        })
        .then((data) => {
          data1 = [];
          const table = data.data.Table || [];
          if (table.length) {
            table.slice(1).forEach((row) => {
              const obj = {};
              row.forEach((d, i) => { obj[table[0][i]] = d; });
              data1.push(obj);
            });
          }
          outputData();
        })
        .catch((error) => {
          console.log('ssurgo', 'ERROR:', error.stack); // .split('\n')[4]);
          console.log('ssurgo', query1);
          console.error('ssurgo', 'ERROR:', error.stack); // .split('\n')[4]);
          console.error('ssurgo', query1);
          res.status(400).send(error);
        });
    }
  }; // ssurgo1

  if (!req.query.lat && !req.query.mukey && !req.query.polygon) {
    res.sendFile(`${__dirname}/public/index.html`);
    return;
  }

  let { polygon } = req.query;
  if (polygon) {
    polygon = polygon.split(/\s*,\s*/);
    if (polygon[0] !== polygon.slice(-1)[0]) {
      polygon.push(polygon[0]);
    }
    // console.log(JSON.stringify(polygon, null, 2));
    minlon = Math.min(...polygon.map((p) => +(p.split(' ')[0].trim())));
    minlat = Math.min(...polygon.map((p) => +(p.split(' ')[1].trim())));
    maxlon = Math.max(...polygon.map((p) => +(p.split(' ')[0].trim())));
    maxlat = Math.max(...polygon.map((p) => +(p.split(' ')[1].trim())));
    console.log({
      minlon, minlat, maxlon, maxlat,
    });
  }

  if (mukey) {
    where = `WHERE mu.mukey IN (${mukey})`;
  } else {
    where = 'WHERE mu.mukey IS NOT NULL';
  }

  if ((!+lat || !+lon) && !mukey && !polygon) {
    res.status(400).send('lat/lon, mukey, or polygon required');
    return;
  }

  ((req.query.categories || '').match(/[ -][a-z]+/g) || [])
    .forEach((cat) => {
      const t = cat.slice(1);
      let idx = cats.indexOf(`+${t}`);

      if (idx > -1) cats[idx] = cat.replace(' ', '+');

      idx = cats.indexOf(`-${t}`);
      if (idx > -1) cats[idx] = cat.replace(' ', '+');
    });

  if (psa) {
    if (mukey) {
      ssurgo1();
    } else {
      const query = polygon
        ? `
          SELECT mukey FROM mupolygon
          WHERE ST_Intersects(shape, ST_Transform(ST_SetSRID(ST_MakePolygon('LINESTRING(${polygon})'), 4326), 5070))
        `
        : `
          SELECT mukey FROM mupolygon
          WHERE ST_Contains(shape, ST_Transform(ST_SetSRID(ST_MakePoint(${lon}, ${lat}), 4326), 5070))
        `;

      pool.query(
        query,
        (error, results) => {
          if (error) {
            console.log(error);
            res.status(400).send(error);
          } else {
            mukey = results.rows.map((row) => `'${row.mukey}'`);
            ssurgo1();
          }
        },
      );
    }
  } else {
    const query = polygon
      ? `SELECT mukey from SDA_Get_Mukey_from_intersection_with_WktWgs84('polygon((${polygon}))')`
      : `SELECT mukey FROM SDA_Get_Mukey_from_intersection_with_WktWgs84('point(${lon} ${lat})')`;

    // console.log(query);
    axios
      .post(`https://sdmdataaccess.sc.egov.usda.gov/tabular/post.rest`, {
        query,
        format: 'JSON',
        encode: 'form',
      })
      .then((data) => {
        // eslint-disable-next-line prefer-destructuring
        mukey = data.data.Table.map((row) => `'${row[0]}'`);
        ssurgo1();
      })
      .catch((error) => {
        console.log('ssurgo', 'ERROR:', error.stack); // .split('\n')[4]);
        console.log('ssurgo', query);
        console.error('ssurgo', 'ERROR:', error.stack); // .split('\n')[4]);
        console.error('ssurgo', query);
        res.status(400).send(error);
      });
  }
}; // ssurgo

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

const polygon = (req, res) => { // SLOW, and often causes 400 or 500 error
  const localhost = req.get('host') === 'localhost';
  const { lat, lon } = req.query;

  if (req.query.server === 'usda') {
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

        res.send(result);
      })
      .catch((error) => {
        console.log('ssurgo', 'ERROR:', error.stack); // .split('\n')[4]);
        console.log('ssurgo', query);
        console.error('ssurgo', 'ERROR:', error.stack); // .split('\n')[4]);
        console.error('ssurgo', query);
        res.status(400).send(error);
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

    pool.query(
      query,
      (error, results) => {
        if (error) {
          console.log(error);
          res.status(400).send(error);
        } else {
          if (localhost) {
            console.log(results.rows);
          }
          res.send(results.rows);
        }
      },
    );
  }
}; // polygon

const mapunits = async (req, res) => {
  try {
    const { points } = req.body; // expecting [{ lat, lon }, ...]

    if (!Array.isArray(points) || points.length === 0) {
      return res.status(400).send({ error: 'Missing or invalid "points" array' });
    }

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

    res.send(results.rows);
  } catch (err) {
    console.error('mapunits error:', err);
    res.status(500).send({ error: 'Internal server error' });
  }
  return false;
}; // mapunits

const vegspec = async (req, res) => {
  const localhost = req.get('host') === 'localhost';
  const server = req.query.server || 'psa';
  const psa = server !== 'usda';
  const { lat, lon } = req.query;

  if (!+lat || !+lon) {
    res.status(400).send({ error: 'Invalid lat/lon' });
  }

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

    // eslint-disable-next-line prefer-destructuring
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

  if (localhost) {
    console.log(sq);
  }
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

  res.send(results.rows);
}; // vegspec

module.exports = {
  ssurgo,
  mapunits,
  polygon,
  vegspec,
};
