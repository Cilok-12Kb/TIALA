<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Reset Password Admin – TIALA</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="520" cellpadding="0" cellspacing="0"
               style="background:#ffffff;border-radius:16px;overflow:hidden;
                      box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          {{-- Header --}}
          <tr>
            <td style="background:linear-gradient(135deg,#0c4a6e 0%,#0f172a 100%);
                        padding:32px 40px;text-align:center;">
              <div style="display:inline-flex;align-items:center;gap:12px;">
                <div style="width:44px;height:44px;border-radius:12px;
                             background:rgba(255,255,255,0.15);
                             display:inline-block;text-align:center;line-height:44px;">
                  🌊
                </div>
                <div style="text-align:left;">
                  <div style="color:#ffffff;font-size:18px;font-weight:700;
                               letter-spacing:1px;">TIALA</div>
                  <div style="color:#7dd3fc;font-size:11px;">Admin Panel</div>
                </div>
              </div>
            </td>
          </tr>

          {{-- Body --}}
          <tr>
            <td style="padding:36px 40px;">
              <p style="color:#64748b;font-size:13px;margin:0 0 6px;">
                Halo, <strong style="color:#0f172a;">{{ $user->name }}</strong>
              </p>
              <h2 style="color:#0c4a6e;font-size:22px;font-weight:700;margin:0 0 16px;">
                Reset Password Admin
              </h2>
              <p style="color:#475569;font-size:14px;line-height:1.7;margin:0 0 24px;">
                Kami menerima permintaan untuk mereset password akun
                <strong>Super Admin</strong> Anda. Klik tombol di bawah ini untuk
                membuat password baru.
              </p>

              <div style="text-align:center;margin:0 0 24px;">
                <a href="{{ $resetUrl }}"
                   style="display:inline-block;padding:14px 32px;
                          background:linear-gradient(135deg,#0284c7,#0369a1);
                          color:#ffffff;font-size:14px;font-weight:600;
                          text-decoration:none;border-radius:10px;
                          letter-spacing:0.3px;">
                  🔑 &nbsp; Reset Password Saya
                </a>
              </div>

              <div style="background:#f8fafc;border:1px solid #e2e8f0;
                           border-radius:10px;padding:14px 16px;margin:0 0 24px;">
                <p style="margin:0;font-size:12px;color:#64748b;">
                  ⏱ &nbsp;Link ini akan kedaluwarsa dalam
                  <strong style="color:#0c4a6e;">{{ $expiry }} menit</strong>
                  sejak email ini dikirim.
                </p>
              </div>

              <p style="color:#475569;font-size:13px;line-height:1.7;margin:0 0 8px;">
                Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.
                Password Anda tidak akan berubah.
              </p>
              <p style="color:#94a3b8;font-size:12px;line-height:1.7;margin:0;">
                Jika tombol di atas tidak berfungsi, salin dan tempel URL berikut
                ke browser Anda:
              </p>
              <p style="word-break:break-all;font-size:11px;color:#0284c7;margin:6px 0 0;">
                {{ $resetUrl }}
              </p>
            </td>
          </tr>

          {{-- Footer --}}
          <tr>
            <td style="background:#f8fafc;border-top:1px solid #e2e8f0;
                        padding:20px 40px;text-align:center;">
              <p style="color:#94a3b8;font-size:11px;margin:0;">
                Email ini dikirim secara otomatis oleh sistem TIALA Admin Panel.
                Mohon tidak membalas email ini.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>