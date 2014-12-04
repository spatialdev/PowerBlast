DO $$DECLARE
BEGIN
DROP TABLE IF EXISTS _gptemp{{counter}};
CREATE TEMPORARY TABLE _gptemp{{counter}} AS
    SELECT a.id, a.adm1_name, a.adm2_name, a.landuse, a.total_pop, ST_UNION(st_intersection(a.geom,b.geom)) AS geom
    FROM india_land_use_pop a
    INNER JOIN (SELECT ST_Union(ST_transform( ST_BUFFER( ST_transform(geom, 32643), {{bufferSize}}000), 4326 )) AS geom
            FROM {{table}}
            WHERE {{table}}.country = 'India'
                AND ( {{types}} )
            ) b on
    ST_Intersects(a.geom, b.geom)
    WHERE a.adm2_name IS NOT NULL
    GROUP BY a.id, a.adm1_name, a.adm2_name, a.landuse, a.total_pop;
INSERT INTO _gptemp{{counter}} (
    SELECT a.id, a.adm1_name, NULL, a.landuse, a.total_pop, ST_UNION(st_intersection(a.geom,b.geom)) AS geom
    FROM india_land_use_pop a
    INNER JOIN (SELECT ST_Union(ST_transform( ST_BUFFER( ST_transform(geom, 32643), {{bufferSize}}000), 4326 )) AS geom
            FROM {{table}}
            WHERE {{table}}.country = 'India'
                AND ( {{types}} )
            ) b on
    ST_Intersects(a.geom, b.geom)
    WHERE a.adm2_name IS NULL
    GROUP BY a.id, a.adm1_name, a.landuse, a.total_pop
);
CREATE INDEX _gptemp{{counter}}_gix ON _gptemp{{counter}} USING GIST (geom);
END$$;

SELECT SUM((_st_summarystats(ST_Clip(rast,_gptemp{{counter}}.geom, true), 1, true, 1)).sum) AS  pop_in_buffer,
	_gptemp{{counter}}.id, _gptemp{{counter}}.adm1_name, _gptemp{{counter}}.adm2_name, _gptemp{{counter}}.landuse, _gptemp{{counter}}.total_pop
FROM india_population_raster, _gptemp{{counter}}
WHERE ST_Intersects(_gptemp{{counter}}.geom,rast)
GROUP BY _gptemp{{counter}}.id, _gptemp{{counter}}.adm1_name, _gptemp{{counter}}.adm2_name, _gptemp{{counter}}.landuse, _gptemp{{counter}}.total_pop, _gptemp{{counter}}.geom;
