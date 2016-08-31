DO $$DECLARE
BEGIN
DROP TABLE IF EXISTS _gptemp{{counter}};
CREATE TEMPORARY TABLE _gptemp{{counter}} AS

    -- calculate buffer 
    SELECT a.gid AS id, a.adm1_name, a.total_pop, ST_UNION(st_intersection(a.geom,b.geom)) AS geom
    FROM kenya_admin1 a
    INNER JOIN (SELECT ST_Union(ST_transform( ST_BUFFER( ST_transform(geom, {{projection}}), {{bufferSize}}000), 4326 )) AS geom
    FROM {{table}}
    WHERE ( {{types}} )) b 
    ON ST_Intersects(a.geom, b.geom)
    GROUP BY a.gid, a.adm1_name, a.total_pop;

-- create index on temp table (for faster runtime)
CREATE INDEX _gptemp{{counter}}_gix ON _gptemp{{counter}} USING GIST (geom);
END$$;

-- calculate total population within buffer (summary stats)
SELECT SUM((_st_summarystats(ST_Clip(rast,1,_gptemp{{counter}}.geom, -3.40282e+38,true), 1, true)).sum) AS  pop_in_buffer, _gptemp{{counter}}.id, _gptemp{{counter}}.adm1_name, _gptemp{{counter}}.total_pop
FROM {{country}}_population_raster, _gptemp{{counter}}
WHERE ST_Intersects(_gptemp{{counter}}.geom,rast)
GROUP BY _gptemp{{counter}}.id, _gptemp{{counter}}.adm1_name, _gptemp{{counter}}.total_pop, _gptemp{{counter}}.geom;