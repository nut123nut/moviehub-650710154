// ชั้นกลางสำหรับคุยกับ Backend ของทีมเรา
// วันนี้คือ mock ที่พอร์ต 4000 สัปดาห์หน้าคือ Go
//
// ต่างจาก tmdb.js ตรงที่มี POST / PUT / DELETE
// และต้องแนบ token สำหรับ endpoint ที่ต้อง login

// '' = origin เดียวกับหน้าเว็บ
// CRA จะ proxy /api ไปที่ http://localhost:4000 ให้
// (ตั้งใน package.json)
//
// ตอนต่อ Go จริง:
// ตั้ง REACT_APP_API_URL=https://api.ทีมเรา.xyz
// ใน .env และบน Vercel

const BASE = process.env.REACT_APP_API_URL || '';


// ฟังก์ชันเดียวที่ fetch จริง
// ทุกฟังก์ชันด้านล่างเรียกผ่านตัวนี้
export async function apiFetch(
  path,
  { method = 'GET', body, token } = {}
) {
  // 1) headers
  const headers = {};

  // ใส่ Content-Type เฉพาะเมื่อมี body ถูกส่งมา
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  // ถ้ามี token ให้แนบ Authorization
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  // 2) เรียก fetch
  const res = await fetch(BASE + path, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  // 3) ถ้าไม่มี body (204 No Content)
  if (res.status === 204) {
    return null;
  }

  // 4) อ่าน JSON พร้อมดักจับ Error กรณีเซิร์ฟเวอร์ตอบมาไม่ใช่ JSON
  let data;
  try {
    data = await res.json();
  } catch (err) {
    throw new Error('server ไม่ได้ตอบเป็น JSON');
  }

  // ถ้า response ไม่สำเร็จ (ไม่ใช่ status 2xx)
  if (!res.ok) {
    const err = new Error(data && data.error ? data.error : 'เกิดข้อผิดพลาดจาก server');
    err.status = res.status;
    throw err;
  }

  return data;
}


// ---------- สมาชิก ----------

export function register(email, password, displayName) {
  return apiFetch('/api/auth/register', {
    method: 'POST',
    body: {
      email,
      password,
      displayName,
    },
  });
}

export function login(email, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: {
      email,
      password,
    },
  });
  // ได้ { token, member }
}

export function getMe(token) {
  return apiFetch('/api/me', {
    token,
  });
}


// ---------- รีวิว ----------

export function getReviews(movieId) {
  return apiFetch(`/api/movies/${movieId}/reviews`);
  // ได้ { items }
}

export function postReview(movieId, text, token) {
  return apiFetch(`/api/movies/${movieId}/reviews`, {
    method: 'POST',
    body: {
      text,
    },
    token,
  });
}


// ---------- คะแนน ----------

export function putVote(movieId, score, token) {
  return apiFetch(`/api/movies/${movieId}/vote`, {
    method: 'PUT',
    body: {
      score,
    },
    token,
  });
}


// ---------- Wishlist ----------

export function getWishlist(token) {
  return apiFetch('/api/me/wishlist', {
    token,
  });
  // ได้ { items }
}

export function addToWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${movieId}`, {
    method: 'PUT',
    token,
  });
}

export function removeFromWishlist(movieId, token) {
  return apiFetch(`/api/me/wishlist/${movieId}`, {
    method: 'DELETE',
    token,
  });
}


// ---------- หนัง ----------
// สัปดาห์หน้า: เปลี่ยนหน้า Movies
// จาก tmdb.js มาใช้ตัวนี้

export async function getMovies() {
  const data = await apiFetch('/api/movies');
  return data.items;
}

export async function getMovie(movieId) {
  return apiFetch(`/api/movies/${movieId}`);
}
// ---------- แนวหนัง (สาธารณะ ใช้ทำ dropdown ในฟอร์มหลังบ้าน) ----------
export async function getGenres() {
  const data = await apiFetch('/api/genres');
  return data.items;                                      // [{ id, nameEn, nameTh }]
}

// ---------- หลังบ้าน (ทุกตัวต้องแนบ token ของ admin ถ้าเป็น member Go ตอบ 403) ----------
export function getAdminStats(token) {
  return apiFetch('/api/admin/stats', { token });
}
export async function getAdminMembers(token) {
  const data = await apiFetch('/api/admin/members', { token });
  return data.items;
}
export function setMemberRole(memberId, role, token) {
  return apiFetch(`/api/admin/members/${memberId}/role`, { method: 'PUT', body: { role }, token });
}
export function getAdminMovie(movieId, token) {
  return apiFetch(`/api/admin/movies/${movieId}`, { token });
}
export function createMovie(fields, token) {
  return apiFetch('/api/admin/movies', { method: 'POST', body: fields, token });
}
export function updateMovie(movieId, fields, token) {
  return apiFetch(`/api/admin/movies/${movieId}`, { method: 'PUT', body: fields, token });
}
export function deleteMovie(movieId, token) {
  return apiFetch(`/api/admin/movies/${movieId}`, { method: 'DELETE', token });       // 204 ได้ null
}