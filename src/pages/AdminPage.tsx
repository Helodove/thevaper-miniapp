import { useState, useEffect, useCallback } from 'react';

interface ImageRow {
  id: number;
  product_name: string;
  image_url: string;
  note: string | null;
  updated_at: string;
}

const API = '/api/admin-images';

export function AdminPage() {
  const [password, setPassword] = useState(() => sessionStorage.getItem('admin_pw') ?? '');
  const [authed, setAuthed] = useState(false);
  const [rows, setRows] = useState<ImageRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ product_name: '', image_url: '', note: '' });
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [search, setSearch] = useState('');
  const [rowUploading, setRowUploading] = useState<number | null>(null);

  const load = useCallback(async (pw: string) => {
    setLoading(true);
    setError('');
    try {
      const r = await fetch(`${API}?password=${encodeURIComponent(pw)}`);
      if (r.status === 401) { setError('Неверный пароль'); setAuthed(false); return; }
      const data = await r.json();
      setRows(data);
      setAuthed(true);
      sessionStorage.setItem('admin_pw', pw);
    } catch {
      setError('Ошибка соединения');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (password) load(password);
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.product_name || !form.image_url) return;
    setSaving(true);
    const r = await fetch(`${API}?password=${encodeURIComponent(password)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    if (r.ok) {
      setForm({ product_name: '', image_url: '', note: '' });
      setPreview('');
      await load(password);
    }
    setSaving(false);
  }

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError('');
    try {
      // Читаем файл как base64 прямо в браузере
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result.split(',')[1]); // убираем "data:image/...;base64,"
        };
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });

      const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
      const r = await fetch('/api/admin-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ base64, contentType: file.type, ext }),
      });
      const data = await r.json();
      if (data.url) {
        setForm(f => ({ ...f, image_url: data.url }));
        setPreview(data.url);
      } else {
        setUploadError(data.error ?? 'Ошибка загрузки');
      }
    } catch {
      setUploadError('Не удалось прочитать файл');
    }
    setUploading(false);
    e.target.value = '';
  }

  // Загрузка фото прямо на строку
  async function handleRowUpload(e: React.ChangeEvent<HTMLInputElement>, rowId: number) {
    const file = e.target.files?.[0];
    if (!file) return;
    setRowUploading(rowId);
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const ext = (file.name.split('.').pop() ?? 'jpg').toLowerCase();
      const upRes = await fetch('/api/admin-upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-password': password },
        body: JSON.stringify({ base64, contentType: file.type, ext }),
      });
      const { url } = await upRes.json();
      if (url) {
        await fetch(`/api/admin-images?password=${encodeURIComponent(password)}&id=${rowId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image_url: url }),
        });
        setRows(prev => prev.map(r => r.id === rowId ? { ...r, image_url: url } : r));
      }
    } catch {}
    setRowUploading(null);
    e.target.value = '';
  }

  async function handleDelete(id: number) {
    if (!confirm('Удалить эту запись?')) return;
    await fetch(`${API}?password=${encodeURIComponent(password)}&id=${id}`, { method: 'DELETE' });
    setRows(rows.filter(r => r.id !== id));
  }

  // ── Экран входа ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0f0f0f' }}>
        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 32, width: 320, boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}>
          <img src="/logo-thevaper-original.png" alt="" style={{ width: 48, height: 48, borderRadius: 12, marginBottom: 16 }} />
          <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 800, marginBottom: 4 }}>TheVaper Admin</h2>
          <p style={{ color: '#888', fontSize: 13, marginBottom: 24 }}>Управление картинками товаров</p>
          {error && <p style={{ color: '#ff6b6b', fontSize: 13, marginBottom: 12 }}>{error}</p>}
          <input
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && load(password)}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1.5px solid #333', background: '#111', color: '#fff', fontSize: 15, boxSizing: 'border-box', marginBottom: 12 }}
            autoFocus
          />
          <button
            onClick={() => load(password)}
            disabled={loading}
            style={{ width: '100%', padding: '11px 0', borderRadius: 10, background: '#1fbfad', color: '#fff', fontWeight: 700, fontSize: 15, border: 'none', cursor: 'pointer' }}
          >
            {loading ? 'Вход...' : 'Войти'}
          </button>
        </div>
      </div>
    );
  }

  // ── Основной интерфейс ───────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#0f0f0f', color: '#fff', fontFamily: 'system-ui, sans-serif' }}>
      {/* Шапка */}
      <div style={{ background: '#1a1a1a', padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: '1px solid #2a2a2a' }}>
        <img src="/logo-thevaper-original.png" alt="" style={{ width: 32, height: 32, borderRadius: 8 }} />
        <span style={{ fontWeight: 800, fontSize: 17 }}>Картинки товаров</span>
        <span style={{ marginLeft: 'auto', background: '#1fbfad22', color: '#1fbfad', borderRadius: 8, padding: '4px 12px', fontSize: 13, fontWeight: 600 }}>
          {rows.length} записей
        </span>
        <button
          onClick={() => { sessionStorage.removeItem('admin_pw'); setAuthed(false); }}
          style={{ background: '#2a2a2a', color: '#888', border: 'none', borderRadius: 8, padding: '6px 14px', cursor: 'pointer', fontSize: 13 }}
        >
          Выйти
        </button>
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>

        {/* Форма добавления */}
        <div style={{ background: '#1a1a1a', borderRadius: 16, padding: 20, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 15, fontWeight: 700, color: '#1fbfad' }}>Добавить картинку</h3>
          <p style={{ margin: '0 0 14px', fontSize: 12, color: '#666', lineHeight: 1.5 }}>
            💡 Короткое название покрывает всю линейку — напр. <b style={{color:'#888'}}>«OGGO MAX»</b> подойдёт для всех вкусов сразу
          </p>
          <form onSubmit={handleAdd}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <input
                placeholder="Линейка или товар (напр: OGGO MAX, Smoant Pasito 2)"
                value={form.product_name}
                onChange={e => setForm(f => ({ ...f, product_name: e.target.value }))}
                required
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  placeholder="URL картинки (https://...jpg)"
                  value={form.image_url}
                  onChange={e => { setForm(f => ({ ...f, image_url: e.target.value })); setPreview(e.target.value); }}
                  required
                  style={{ ...inputStyle, flex: 1 }}
                />
                <label style={{
                  padding: '10px 14px', borderRadius: 10, background: '#2a2a2a', color: uploading ? '#666' : '#1fbfad',
                  fontWeight: 700, fontSize: 13, cursor: uploading ? 'default' : 'pointer', whiteSpace: 'nowrap', border: '1.5px solid #333',
                }}>
                  {uploading ? '⏳' : '📁 Загрузить'}
                  <input type="file" accept="image/*" onChange={handleUpload} disabled={uploading} style={{ display: 'none' }} />
                </label>
              </div>
              <input
                placeholder="Заметка (необязательно)"
                value={form.note}
                onChange={e => setForm(f => ({ ...f, note: e.target.value }))}
                style={inputStyle}
              />

              {uploadError && (
                <p style={{ color: '#ff6b6b', fontSize: 13, margin: 0 }}>❌ {uploadError}</p>
              )}
              {/* Предпросмотр картинки */}
              {preview && (
                <div style={{ borderRadius: 10, overflow: 'hidden', background: '#111', height: 120, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img
                    src={preview}
                    alt="preview"
                    style={{ maxHeight: 120, maxWidth: '100%', objectFit: 'contain' }}
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                  />
                </div>
              )}

              <button type="submit" disabled={saving} style={btnStyle}>
                {saving ? 'Сохраняю...' : '+ Добавить'}
              </button>
            </div>
          </form>
        </div>

        {/* Список записей */}
        {loading ? (
          <p style={{ color: '#666', textAlign: 'center' }}>Загрузка...</p>
        ) : rows.length === 0 ? (
          <p style={{ color: '#666', textAlign: 'center', padding: 40 }}>Записей нет. Добавь первую выше.</p>
        ) : (
          <>
            {/* Поиск */}
          <input
            placeholder="🔍 Поиск по названию..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ ...inputStyle, marginBottom: 12 }}
          />

          {/* Счётчики */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 6 }}>
              <span style={{ fontSize: 13, color: '#ff9f43', fontWeight: 600 }}>
                ⏳ Без фото: {rows.filter(r => !r.image_url).length}
              </span>
              <span style={{ fontSize: 13, color: '#1fbfad', fontWeight: 600 }}>
                ✅ С фото: {rows.filter(r => r.image_url).length}
              </span>
            </div>
            <p style={{ fontSize: 12, color: '#555', marginBottom: 12 }}>
              Записи без фото не влияют на приложение. Для линейки добавь одну запись выше — она покроет все вкусы.
            </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[...rows]
              .filter(r => !search || r.product_name.toLowerCase().includes(search.toLowerCase()))
              .sort((a, b) => (!a.image_url ? -1 : 1))
              .map(row => (
              <div key={row.id} style={{ background: '#1a1a1a', borderRadius: 12, padding: 14, display: 'flex', gap: 14, alignItems: 'center' }}>
                {/* Миниатюра */}
                <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: '#111', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', border: row.image_url ? 'none' : '1.5px dashed #444' }}>
                  {row.image_url ? (
                    <img
                      src={row.image_url}
                      alt=""
                      style={{ width: 56, height: 56, objectFit: 'cover' }}
                      onError={e => { (e.target as HTMLImageElement).src = '/logo-thevaper-original.png'; }}
                    />
                  ) : (
                    <span style={{ fontSize: 22 }}>📷</span>
                  )}
                </div>
                {/* Текст */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ margin: 0, fontWeight: 700, fontSize: 14, color: '#fff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.product_name}
                  </p>
                  {row.note && <p style={{ margin: '2px 0 0', fontSize: 12, color: '#888' }}>{row.note}</p>}
                  <p style={{ margin: '2px 0 0', fontSize: 11, color: '#444', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {row.image_url}
                  </p>
                </div>
                {/* Кнопка загрузки/перезаливки фото на строку */}
                <label
                  style={{ background: '#2a2a2a', color: '#1fbfad', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: rowUploading !== null ? 'default' : 'pointer', fontSize: 15, flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title={row.image_url ? 'Заменить фото' : 'Загрузить фото'}
                >
                  {rowUploading === row.id ? '⏳' : '📷'}
                  <input type="file" accept="image/*" onChange={e => handleRowUpload(e, row.id)} disabled={rowUploading !== null} style={{ display: 'none' }} />
                </label>
                {/* Кнопка удалить */}
                <button
                  onClick={() => handleDelete(row.id)}
                  style={{ background: '#2a2a2a', color: '#ff6b6b', border: 'none', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, flexShrink: 0 }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          </>
        )}

        <p style={{ color: '#444', fontSize: 12, textAlign: 'center', marginTop: 32 }}>
          Картинка появится в приложении через 5 минут после добавления
        </p>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  padding: '10px 14px',
  borderRadius: 10,
  border: '1.5px solid #2a2a2a',
  background: '#111',
  color: '#fff',
  fontSize: 14,
  width: '100%',
  boxSizing: 'border-box',
};

const btnStyle: React.CSSProperties = {
  padding: '11px 0',
  borderRadius: 10,
  background: '#1fbfad',
  color: '#fff',
  fontWeight: 700,
  fontSize: 15,
  border: 'none',
  cursor: 'pointer',
  width: '100%',
};
