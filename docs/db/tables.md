## `acgs_assessments`
- **Tujuan**: tabel flat berisi struktur master + jawaban assessment per tahun.
- **PK**: `uid`
- **Dimensi utama**: `year`, `type`, `sort_order`, `item_id`
- **Field jawaban**: `implementation`, `evidence`, `status`, `recommendation`
- **Catatan**: saat ini assessment bersifat **global per tahun** (tidak ada `division_id` di tabel ini).

## `acgs_year_summaries`
- **Tujuan**: cache ringkasan skor ACGS per tahun (untuk tren/overview).
- **PK**: `year`
- **Metrik utama**: `question_count`, `points_sum`, `score_pct`
- **Ekstra**: `payload` (jsonb) untuk metrik tambahan seperti answered_count/yes_with_evidence_count/na_count.

## `application_audit_logs`
- **Tujuan**: audit terpadu untuk setiap perubahan pengguna pada Assessment ACGS, Area of Improvement, dan Monitoring AOI.
- **PK**: `id` (identity bigint).
- **Pelaku**: `actor_user_id`, `actor_email`, `actor_role`, dan `division_id` disimpan sebagai snapshot saat perubahan terjadi.
- **Konteks**: `page_path`, `action`, `entity_type`, `entity_id`, `entity_label`, dan `year` menunjukkan lokasi serta objek perubahan.
- **Perubahan**: `field`, `old_value`, dan `new_value` menyimpan atribut beserta nilai sebelum dan sesudah.
- **Metadata**: `metadata.change_origin` membedakan perubahan pengguna dari efek aturan bisnis otomatis.
- **Keamanan**: RLS memberikan akses global kepada admin; BPO/viewer hanya dapat membaca log divisinya.
- **Realtime**: tabel menjadi anggota publication `supabase_realtime` agar dashboard menerima aktivitas baru.

## `assessment_change_logs`
- **Tujuan**: audit log “siapa mengubah apa, kapan” untuk dashboard.
- **PK**: `id`
- **Relasi**:
  - `assessment_uid` → `acgs_assessments.uid`
  - `user_id` → `users.id`
  - `division_id` → `divisions.id` (scope untuk bpo/viewer)
- **Kunci bisnis**: `year`, `item_id`, `field`, `old_value`, `new_value`, `created_at`.

## `users`
- **Tujuan**: profil aplikasi dan role.
- **PK/FK**: `id` (FK → `auth.users.id`)
- **Relasi**: `division_id` → `divisions.id`
- **Role**: `admin` | `bpo` | `viewer`

## `divisions`
- **Tujuan**: master divisi organisasi.
- **PK**: `id`

## `auth_login_audits`
- **Tujuan**: log login (IP/UA binding dan audit session).
- **PK/FK**: `user_id` → `users.id`

