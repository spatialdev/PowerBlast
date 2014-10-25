
-- new
CREATE TABLE india_land_use_pop AS
SELECT a.id, a.adm1_name, a.adm2_name,
	b.landuse,
	(SELECT SUM((_st_summarystats(ST_Clip(rast,ST_UNION(st_intersection(a.geom,b.geom)), true), 1, true, .99)).sum)
	FROM india_population_raster WHERE ST_Intersects(ST_UNION(st_intersection(a.geom,b.geom)),rast)) as total_pop,
	ST_UNION(st_intersection(a.geom,b.geom)) AS geom
FROM gaul_2014_adm2 a
INNER JOIN india_urbanareas b ON
	ST_Intersects(a.geom,b.geom)
	AND ( a.adm1_name = 'Bihar' OR a.adm1_name = 'Uttar Pradesh' )
GROUP BY a.id, a.adm1_name, a.adm2_name,
	b.landuse;

-- also include states in the table
INSERT INTO india_land_use_pop (
    SELECT a.id, a.adm1_name, null,
    	b.landuse,
    	(SELECT SUM((_st_summarystats(ST_Clip(rast,ST_UNION(st_intersection(a.geom,b.geom)), true), 1, true, .99)).sum)
    	FROM india_population_raster WHERE ST_Intersects(ST_UNION(st_intersection(a.geom,b.geom)),rast)) as total_pop,
    	ST_UNION(st_intersection(a.geom,b.geom)) AS geom
    FROM gaul_2014_adm1 a
    INNER JOIN india_urbanareas b ON
    	ST_Intersects(a.geom,b.geom)
    	AND ( a.adm1_name = 'Bihar' OR a.adm1_name = 'Uttar Pradesh' )
    GROUP BY a.id, b.landuse, a.adm1_name
);

CREATE INDEX india_land_use_pop_id_idx
  ON india_land_use_pop
  USING btree
  (id);

CREATE INDEX india_land_use_pop_adm1_name_idx
  ON india_land_use_pop
  USING btree
  (adm1_name);

-- the big query. this is an example we should template out of
-- new
DO $$DECLARE
BEGIN
DROP TABLE IF EXISTS _gptemp;
CREATE TEMPORARY TABLE _gptemp AS
    SELECT a.id, a.adm1_name, a.adm2_name, a.landuse, a.total_pop, ST_UNION(st_intersection(a.geom,b.geom)) AS geom
    FROM india_land_use_pop a
    INNER JOIN (SELECT ST_Union(ST_transform( ST_BUFFER( ST_transform(geom, 32643), 5000), 4326 )) AS geom
            FROM cicos_2014
            WHERE cicos_2014.country = 'India'
                AND (type = 'MFIs' OR type = 'Commerical Banks')
            ) b on
    ST_Intersects(a.geom, b.geom)
    GROUP BY a.id, a.adm1_name, a.adm2_name, a.landuse, a.total_pop;
CREATE INDEX _gptemp_gix ON _gptemp USING GIST (geom);
END$$;

SELECT SUM((_st_summarystats(ST_Clip(rast,_gptemp.geom, true), 1, true, 1)).sum) AS  pop_in_buffer,
	_gptemp.id, _gptemp.adm1_name, _gptemp.adm2_name, _gptemp.landuse, _gptemp.total_pop
FROM india_population_raster, _gptemp
WHERE ST_Intersects(_gptemp.geom,rast)
GROUP BY _gptemp.id, _gptemp.adm1_name, _gptemp.adm2_name, _gptemp.landuse, _gptemp.total_pop, _gptemp.geom;












-- old. not doing it this way anymore...
DROP TABLE IF EXISTS india_district_landuse;
CREATE TABLE india_district_landuse AS
SELECT a.adm2_name as name,
	b.landuse,
	(SELECT SUM((_st_summarystats(ST_Clip(rast,ST_UNION(st_intersection(a.geom,b.geom)), true), 1, true, .99)).sum)
	FROM india_population_raster WHERE ST_Intersects(ST_UNION(st_intersection(a.geom,b.geom)),rast)) as total,
	ST_UNION(st_intersection(a.geom,b.geom)) AS geom
FROM gaul_2014_adm2 a
INNER JOIN india_urbanareas b ON
	ST_Intersects(a.geom,b.geom)
	AND a.adm1_name = 'India'
GROUP BY a.adm2_name, b.landuse;

-- old
DO $$DECLARE
BEGIN
DROP TABLE IF EXISTS _gptemp;
CREATE TEMPORARY TABLE _gptemp AS
SELECT a.landuse, a.name, a.total,
ST_UNION(st_intersection(a.geom,b.geom)) AS geom
FROM india_district_landuse a
INNER JOIN (SELECT ST_Union(ST_transform( ST_BUFFER( ST_transform(geom, 32643), 5000), 4326 )) AS geom
		FROM cicos_2014
		WHERE lower(cicos_2014.country) = lower('india')
			AND ("type" = 'MFIs')
		) b on
ST_Intersects(a.geom, b.geom)
GROUP BY a.landuse, a.name, a.total;
CREATE INDEX _gptemp_gix ON _gptemp USING GIST (geom);
END$$;

SELECT SUM((_st_summarystats(ST_Clip(rast,_gptemp.geom, true), 1, true, 1)).sum) AS  sum,
	_gptemp.landuse, _gptemp.name, _gptemp.total
FROM india_population_raster, _gptemp
WHERE ST_Intersects(_gptemp.geom,rast)
GROUP BY _gptemp.landuse, _gptemp.geom, _gptemp.name, _gptemp.total;

