-- This is an empty migration.

CREATE OR REPLACE FUNCTION update_kegiatan_status()
RETURNS TRIGGER AS $$
DECLARE
  v_kegiatan_id VARCHAR;
BEGIN
  -- Get the kegiatan_id from NEW or OLD depending on operation
  v_kegiatan_id := COALESCE(NEW.kegiatan_id, OLD.kegiatan_id);

  -- Update the kegiatan status based on the lowest status of all related riwayat_pengajuan
  UPDATE kegiatan
  SET status = COALESCE((
    SELECT MIN(status)
    FROM riwayat_pengajuan
    WHERE kegiatan_id = v_kegiatan_id
  ), 'DRAFT')
  WHERE id = v_kegiatan_id;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_kegiatan_status ON riwayat_pengajuan;

CREATE TRIGGER trigger_update_kegiatan_status
AFTER INSERT OR UPDATE OR DELETE ON riwayat_pengajuan
FOR EACH ROW
EXECUTE FUNCTION update_kegiatan_status();

-- first time run
-- to set the status of kegiatan based on riwayat_pengajuan
-- this will set the status of kegiatan to the minimum status of riwayat_pengajuan
-- if there are no riwayat_pengajuan, the status will be set to 'DRAFT'
-- this will only run once, so it is safe to run this in production
UPDATE kegiatan k
SET status = COALESCE(sub.min_status, 'DRAFT')
FROM (
  SELECT k.id AS kegiatan_id, MIN(r.status) AS min_status
  FROM kegiatan k
  LEFT JOIN riwayat_pengajuan r ON k.id = r.kegiatan_id
  GROUP BY k.id
) sub
WHERE k.id = sub.kegiatan_id;

