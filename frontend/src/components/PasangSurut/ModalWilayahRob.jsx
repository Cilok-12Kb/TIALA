// src/components/PasangSurut/ModalWilayahRob.jsx
import { useEffect, useState } from "react";
import {
  Modal, Button, Table, Form, Alert, Spinner, Badge,
} from "react-bootstrap";
import api from "../../services/api";

const EMPTY_FORM = { nama_wilayah: "", tinggi_tanah: "" };

export default function ModalWilayahRob({ show, onHide, onDataChanged }) {
  const [list,    setList]    = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [error,   setError]   = useState("");
  const [success, setSuccess] = useState("");
  const [form,    setForm]    = useState(EMPTY_FORM);
  const [editId,  setEditId]  = useState(null);

  async function fetchList() {
    setLoading(true);
    try {
      const res = await api.get("/admin/wilayah-rob");
      setList(res.data.data || []);
    } catch {
      setError("Gagal memuat data wilayah.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (show) { fetchList(); setError(""); setSuccess(""); setForm(EMPTY_FORM); setEditId(null); }
  }, [show]);

  function handleEdit(item) {
    setEditId(item.id);
    setForm({ nama_wilayah: item.nama_wilayah, tinggi_tanah: item.tinggi_tanah });
    setError(""); setSuccess("");
  }

  function handleCancelEdit() {
    setEditId(null);
    setForm(EMPTY_FORM);
    setError("");
  }

  async function handleSave() {
    if (!form.nama_wilayah.trim() || form.tinggi_tanah === "") {
      setError("Nama wilayah dan tinggi tanah wajib diisi."); return;
    }
    setSaving(true); setError(""); setSuccess("");
    try {
      if (editId) {
        await api.put(`/admin/wilayah-rob/${editId}`, form);
        setSuccess("Wilayah berhasil diperbarui.");
      } else {
        await api.post("/admin/wilayah-rob", form);
        setSuccess("Wilayah berhasil ditambahkan.");
      }
      setForm(EMPTY_FORM); setEditId(null);
      await fetchList();
      onDataChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menyimpan data.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Hapus wilayah "${item.nama_wilayah}"? Geometri petanya juga akan hilang.`)) return;
    setDeleting(item.id); setError(""); setSuccess("");
    try {
      await api.delete(`/admin/wilayah-rob/${item.id}`);
      setSuccess("Wilayah berhasil dihapus.");
      await fetchList();
      onDataChanged?.();
    } catch (err) {
      setError(err.response?.data?.message || "Gagal menghapus wilayah.");
    } finally {
      setDeleting(null);
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>Kelola Wilayah Rob</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {error   && <Alert variant="danger"  className="small py-2">{error}</Alert>}
        {success && <Alert variant="success" className="small py-2">{success}</Alert>}

        {/* ── Form tambah / edit ── */}
        <div className="border rounded-3 p-3 mb-3 bg-light">
          <h6 className="mb-3 fw-semibold">
            {editId ? "Edit Wilayah" : "Tambah Wilayah Baru"}
          </h6>
          <div className="row g-2">
            <div className="col-md-6">
              <Form.Label className="small fw-semibold">Nama Wilayah</Form.Label>
              <Form.Control
                size="sm"
                placeholder="cth: Tambakharjo"
                value={form.nama_wilayah}
                onChange={e => setForm(f => ({ ...f, nama_wilayah: e.target.value }))}
              />
            </div>
            <div className="col-md-4">
              <Form.Label className="small fw-semibold">Tinggi Tanah (m)</Form.Label>
              <Form.Control
                size="sm"
                type="number"
                step="0.01"
                min="0"
                max="10"
                placeholder="cth: 0.45"
                value={form.tinggi_tanah}
                onChange={e => setForm(f => ({ ...f, tinggi_tanah: e.target.value }))}
              />
              <Form.Text className="text-muted">Dalam meter dari MSL (MDPL)</Form.Text>
            </div>
            <div className="col-md-2 d-flex align-items-end gap-1">
              <Button size="sm" variant="primary" onClick={handleSave} disabled={saving} className="w-100">
                {saving ? <Spinner size="sm" animation="border" /> : editId ? "Simpan" : "Tambah"}
              </Button>
              {editId && (
                <Button size="sm" variant="outline-secondary" onClick={handleCancelEdit}>✕</Button>
              )}
            </div>
          </div>
        </div>

        {/* ── Tabel daftar wilayah ── */}
        {loading ? (
          <div className="text-center py-4">
            <Spinner animation="border" size="sm" className="me-2" />
            <span className="text-muted small">Memuat...</span>
          </div>
        ) : (
          <div className="table-responsive">
            <Table size="sm" hover className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Nama Wilayah</th>
                  <th>Tinggi Tanah</th>
                  <th>Geometri</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr><td colSpan={5} className="text-center text-muted py-3">Belum ada wilayah.</td></tr>
                ) : list.map((item, idx) => (
                  <tr key={item.id} className={editId === item.id ? "table-primary" : ""}>
                    <td>{idx + 1}</td>
                    <td className="fw-semibold">{item.nama_wilayah}</td>
                    <td>{item.tinggi_tanah} m</td>
                    <td>
                      <Badge bg={item.has_geojson ? "success" : "secondary"} className="small">
                        {item.has_geojson ? "Ada" : "Belum"}
                      </Badge>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        <Button size="sm" variant="outline-primary" onClick={() => handleEdit(item)}>
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline-danger"
                          disabled={deleting === item.id}
                          onClick={() => handleDelete(item)}
                        >
                          {deleting === item.id ? <Spinner size="sm" animation="border" /> : "Hapus"}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </Modal.Body>

      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Tutup</Button>
      </Modal.Footer>
    </Modal>
  );
}