// Aplikasi Kasir Kwitansi - Yayasan HAS Darul Ilmi

// ===== Helper, data awal & daftar kelas =====
var $ = function (i) {
    return document.getElementById(i);
};

var KELAS = [];
for (var n = 1; n <= 6; n++)
    ['A', 'B'].forEach(function (l) {
        KELAS.push('Kelas ' + n + l);
    });

function norm(a) {
    a.forEach(function (p) {
        if (KELAS.indexOf(p.c) < 0)
            p.c = '';
        if (p.n == 'Uang pangkal' && !p.h)
            p.h = 14000000;
        if (p.n == 'Spp bulan juli' && !p.h)
            p.h = 500000;
        if (p.n == 'Uang kegiatan' && !p.h)
            p.h = 2000000;
    });
    return a;
}

var P0 = [
    { n: "Pendaftaran siswa baru SD HAS DARUL ILMI tahun pelajaran 2026-2027", c: '', h: 700000, s: 0, i: '📜' },
    { n: "Uang pangkal", c: '', h: 14000000, s: 0, i: '🏫' },
    { n: "Uang buku", c: '', h: 0, s: 0, i: '📚' },
    { n: "Spp bulan juli", c: '', h: 500000, s: 0, i: '💳' },
    { n: "Uang kegiatan", c: '', h: 2000000, s: 0, i: '🎉' },
    { n: "Uang seragam 3 stel", c: '', h: 0, s: 0, i: '👕' },
    { n: "Uang seragam batik", c: '', h: 0, s: 0, i: '👕' },
    { n: "Uang seragam hijau kotak", c: '', h: 0, s: 0, i: '👕' },
    { n: "Uang seragam olahraga", c: '', h: 0, s: 0, i: '👟' },
    { n: "Uang spp", c: '', h: 0, s: 0, i: '💳' },
    { n: "Uang eskul tari", c: '', h: 0, s: 0, i: '💃' },
    { n: "Uang eskul silat", c: '', h: 0, s: 0, i: '🥋' },
    { n: "Uang eskul karate", c: '', h: 0, s: 0, i: '🥋' },
    { n: "Uang eskul futsal", c: '', h: 0, s: 0, i: '⚽' },
    { n: "Uang eskul bulutangkis", c: '', h: 0, s: 0, i: '🏸' },
    { n: "Uang eskul tahfidz", c: '', h: 0, s: 0, i: '📖' },
    { n: "Uang eskul renang", c: '', h: 0, s: 0, i: '🏊' },
    { n: "Uang eskul animasi coding", c: '', h: 0, s: 0, i: '💻' },
    { n: "Uang eskul desain grafis", c: '', h: 0, s: 0, i: '🎨' },
    { n: "Uang eskul inggris club", c: '', h: 0, s: 0, i: '🗣️' },
    { n: "Uang eskul robotik", c: '', h: 0, s: 0, i: '🤖' },
    { n: "Uang eskul komik", c: '', h: 0, s: 0, i: '🖍️' }
];

var P = norm(JSON.parse(JSON.stringify(P0))), q = P.map(function () {
    return 0;
}), cat = 'Semua';

var GT = 0, MET = 'Tunai', PO = {}, NO = {};

// ===== Manajemen nama penerima =====
function normNames(v) {
    if (!Array.isArray(v))
        return [];
    return v.map(function (x) {
        x = typeof x == 'string' ? { n: x, c: '' } : x;
        x.n = String(x.n).toUpperCase();
        return x;
    });
}

var NM = [], kcat = 'Semua';

function saveNames() {
    remoteSet('names', NM);
}

function fillKls(cur) {
    var L = NM.filter(function (x) {
        return kcat == 'Semua' || x.c == kcat;
    });
    $('kls').innerHTML = '<option value="">Ketik nama manual</option>' + L.map(function (x) {
        return '<option>' + esc(x.n) + '</option>';
    }).join('');
    $('kls').value = cur || '';
    if ($('kls').value !== (cur || ''))
        $('kls').value = '';
}

function up(el) {
    var a = el.selectionStart, b = el.selectionEnd;
    el.value = el.value.toUpperCase();
    try {
        el.setSelectionRange(a, b);
    } catch (e) {
    }
}

var ned = -1, ncat = 'Semua';

function openName(i) {
    ned = i;
    $('nt').textContent = i < 0 ? 'Tambah Nama Baru' : 'Edit Nama';
    $('nk').innerHTML = '<option value="">Tanpa kelas</option>' + KELAS.map(function (k) {
        return '<option>' + k + '</option>';
    }).join('');
    $('nn').value = i < 0 ? '' : NM[i].n;
    $('nk').value = i < 0 ? (ncat == 'Semua' ? '' : ncat) : NM[i].c;
    $('ne').textContent = '';
    $('nmod').classList.add('on');
    $('nn').focus();
}

function closeName() {
    $('nmod').classList.remove('on');
}

function saveName() {
    var n = $('nn').value.trim().toUpperCase(), c = $('nk').value;
    if (!n) {
        $('ne').textContent = 'Nama wajib diisi.';
        return;
    }
    if (NM.some(function (x, k) {
        return k != ned && x.n.toLowerCase() == n.toLowerCase();
    })) {
        $('ne').textContent = 'Nama sudah ada di daftar.';
        return;
    }
    var cur = $('kls').value;
    if (ned < 0) {
        NM.push({ n: n, c: c });
        cur = n;
    } else {
        if (cur == NM[ned].n)
            cur = n;
        NM[ned] = { n: n, c: c };
    }
    saveNames();
    fillKls(cur);
    closeName();
    drawNama();
    render();
}

function drawNama() {
    $('nchips').innerHTML = ['Semua'].concat(KELAS).map(function (c) {
        return '<button class="chip' + (c == ncat ? ' on' : '') + '" data-n="' + c + '">' + c + '</button>';
    }).join('');
    $('ntb').innerHTML = NM.map(function (x, i) {
        if (ncat != 'Semua' && x.c != ncat)
            return '';
        return '<tr><td><div class="pn"><span class="ic">👤</span>' + esc(x.n) + '</div></td><td>' + (x.c ? '<span class="tag">' + x.c + '</span>' : '') + '</td><td><button class="al" onclick="openName(' + i + ')">Edit</button><button class="al d" onclick="delNameAt(' + i + ')">Hapus</button></td></tr>';
    }).join('') || '<tr><td colspan="3">' + (NM.length ? 'Belum ada nama untuk kelas ini.' : 'Belum ada nama. Klik Tambah Nama Baru.') + '</td></tr>';
}

document.addEventListener('click', function (e) {
    var c = e.target.getAttribute && e.target.getAttribute('data-n');
    if (c) {
        ncat = c;
        drawNama();
    }
});

document.addEventListener('click', function (e) {
    var c = e.target.getAttribute && e.target.getAttribute('data-k');
    if (c) {
        kcat = c;
        fillKls($('kls').value);
        draw();
        render();
    }
});

function delNameAt(i) {
    dk = 'n';
    di = i;
    $('dtt').textContent = 'Hapus Nama?';
    $('dn').textContent = NM[i].n;
    $('dmod').classList.add('on');
}

function nameOf(i) {
    var v = NO[P[i].n];
    return v == null ? P[i].n : v;
}

// ===== Item keranjang: nama & harga yang bisa diedit =====
function fit(el) {
    el.style.height = 'auto';
    var h = el.scrollHeight;
    if (h)
        el.style.height = h + 'px';
}

function setName(i, el) {
    NO[P[i].n] = el.value;
    fit(el);
    render();
}

function price(i) {
    var v = PO[P[i].n];
    return v == null ? P[i].h : v;
}

function setPrice(i, v) {
    PO[P[i].n] = Math.max(parseInt(v, 10) || 0, 0);
    render();
}

function onPrice(i, el) {
    var pos = el.selectionStart, before = el.value.slice(0, pos).replace(/\D/g, '').length;
    var d = el.value.replace(/\D/g, '');
    el.value = d ? parseInt(d, 10).toLocaleString('id-ID') : '';
    var c = 0, np = 0;
    for (; np < el.value.length && c < before; np++) {
        if (/\d/.test(el.value[np]))
            c++;
    }
    try {
        el.setSelectionRange(np, np);
    } catch (e) {
    }
    setPrice(i, d);
}

// ===== Pembayaran =====
function qb(v) {
    $('bayar').value = v || GT;
    render();
}

function setMet(m) {
    MET = m;
    var nt = m != 'Tunai';
    document.querySelectorAll('.mm').forEach(function (b) {
        b.classList.toggle('on', b.getAttribute('data-m') == m);
    });
    $('bayar').disabled = nt;
    if (nt)
        $('bayar').value = GT || '';
    render();
}

function openPay() {
    $('pe').textContent = '';
    setMet(MET);
    $('pmod').classList.add('on');
    if (MET == 'Tunai')
        $('bayar').focus();
}

function closePay() {
    $('pmod').classList.remove('on');
}

function finishPay() {
    render();
    var by = parseInt($('bayar').value, 10) || 0;
    if (!GT) {
        $('pe').textContent = 'Keranjang masih kosong.';
        return;
    }
    if (by < GT) {
        $('pe').textContent = 'Uang diterima kurang Rp ' + fmt(GT - by) + '.';
        return;
    }
    closePay();
    showReceipt(true);
}

// ===== Keranjang & tampilan kartu produk =====
function add(i, d) {
    var v = q[i] + d;
    if (v < 0 || v > 1)
        return;
    q[i] = v;
    if (!v) {
        delete PO[P[i].n];
        delete NO[P[i].n];
    }
    draw();
    render();
}

function clearCart() {
    q = P.map(function () {
        return 0;
    });
    PO = {};
    NO = {};
    draw();
    render();
}

function draw() {
    if (cat != 'Semua' && cats().indexOf(cat) < 0)
        cat = 'Semua';
    var k = ($('cari').value || '').toLowerCase();
    setChips();
    $('cards').innerHTML = P.map(function (p, i) {
        if ((kcat != 'Semua' && p.c != kcat) || p.n.toLowerCase().indexOf(k) < 0)
            return '';
        return '<button class="card" onclick="add(' + i + ',1)"><div class="ic">' + p.i + '</div><div class="nm">' + p.n + '</div><div class="ft"><span class="pr">Rp ' + fmt(p.h) + '</span></div></button>';
    }).join('') || '<p class="empty">Belum ada produk untuk kelas ini. Atur kelas produk lewat Manajemen Produk.</p>';
    var h = '';
    P.forEach(function (p, i) {
        if (q[i])
            h += '<div class="ci"><div class="cn"><textarea class="ni" rows="1" oninput="setName(' + i + ',this)" aria-label="Keterangan">' + esc(nameOf(i)) + '</textarea><label class="pi">Rp <input type="text" inputmode="numeric" value="' + fmt(price(i)) + '" oninput="onPrice(' + i + ',this)" aria-label="Harga"></label></div><div class="qc"><button onclick="add(' + i + ',-1)" aria-label="Hapus">🗑</button></div></div>';
    });
    $('items').innerHTML = h || '<p class="empty">Keranjang kosong. Klik produk untuk menambahkan.</p>';
    document.querySelectorAll('.ni').forEach(fit);
}

// ===== Penyimpanan produk, navigasi & manajemen produk =====
var ed = -1, armed = -1;

function save() {
    remoteSet('products', P);
}

function fixProducts(v) {
    if (!v || !v.length)
        return null;
    v.forEach(function (p) {
        if (p.i == '🍽️' || p.i == '🍽')
            p.i = '📜';
    });
    return v;
}

function cats() {
    return KELAS.slice();
}

function go(v) {
    var b = document.body.classList;
    b.toggle('v-prod', v == 'prod');
    b.toggle('v-nama', v == 'nama');
    ['pos', 'prod', 'nama'].forEach(function (k, j) {
        $('n' + (j + 1)).classList.toggle('on', v == k);
    });
    $('ttl').textContent = v == 'prod' ? 'Manajemen Produk' : v == 'nama' ? 'Manajemen Nama' : 'Halaman Kasir';
    if (v == 'prod')
        drawProd();
    else if (v == 'nama')
        drawNama();
    else
        document.querySelectorAll('.ni').forEach(fit);
}

function setChips() {
    function mk(sel, at) {
        return ['Semua'].concat(cats()).map(function (c) {
            return '<button class="chip' + (c == sel ? ' on' : '') + '" ' + at + '="' + esc(c) + '">' + esc(c) + '</button>';
        }).join('');
    }
    $('chips').innerHTML = mk(kcat, 'data-k');
    $('pchips').innerHTML = mk(cat, 'data-c');
}

function drawProd() {
    if (cat != 'Semua' && cats().indexOf(cat) < 0)
        cat = 'Semua';
    setChips();
    $('ptb').innerHTML = P.map(function (p, i) {
        if (cat != 'Semua' && p.c != cat)
            return '';
        return '<tr><td><div class="pn"><span class="ic">' + p.i + '</span>' + esc(p.n) + '</div></td><td>' + (p.c ? '<span class="tag">' + esc(p.c) + '</span>' : '') + '</td><td>Rp ' + fmt(p.h) + '</td><td><button class="al" onclick="openMod(' + i + ')">Edit</button><button class="al d" onclick="del(' + i + ')">Hapus</button></td></tr>';
    }).join('') || '<tr><td colspan="4">Belum ada produk. Klik Tambah Produk Baru.</td></tr>';
}

var di = -1, dk = 'p';

function del(i) {
    dk = 'p';
    $('dtt').textContent = 'Hapus Produk?';
    di = i;
    $('dn').textContent = P[i].n;
    $('dmod').classList.add('on');
}

function closeDel() {
    $('dmod').classList.remove('on');
    di = -1;
}

function confirmDel() {
    if (di < 0)
        return;
    if (dk == 'n') {
        var cu = $('kls').value;
        if (cu == NM[di].n)
            cu = '';
        NM.splice(di, 1);
        saveNames();
        fillKls(cu);
        closeDel();
        drawNama();
        render();
        return;
    }
    P.splice(di, 1);
    q.splice(di, 1);
    save();
    closeDel();
    drawProd();
    draw();
    render();
}

function openMod(i) {
    ed = i;
    var p = i < 0 ? { n: '', c: '', h: '', s: '', i: '📜' } : P[i];
    $('mt').textContent = i < 0 ? 'Tambah Produk Baru' : 'Edit Produk';
    $('mn').value = p.n;
    $('mc').value = p.c;
    $('mh').value = p.h;
    $('mi').value = p.i;
    $('me').textContent = '';
    $('mod').classList.add('on');
    $('mn').focus();
}

function closeMod() {
    $('mod').classList.remove('on');
}

function saveMod() {
    var n = $('mn').value.trim(), c = $('mc').value.trim(), h = parseInt($('mh').value, 10);
    if (!n || isNaN(h) || h < 0) {
        $('me').textContent = 'Nama dan harga wajib diisi dengan benar.';
        return;
    }
    var o = { n: n, c: c, h: h, s: 0, i: $('mi').value.trim() || '📜' };
    if (ed < 0) {
        P.push(o);
        q.push(0);
    } else {
        P[ed] = o;
    }
    save();
    closeMod();
    drawProd();
    draw();
    render();
}

// ===== Jam, terbilang & format angka =====
function tick() {
    $('clock').textContent = new Date().toLocaleString('id-ID', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) + ' WIB';
}

var satuan = ['', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];

function tb(n) {
    if (n < 12)
        return satuan[n];
    if (n < 20)
        return tb(n - 10) + ' belas';
    if (n < 100)
        return tb(Math.floor(n / 10)) + ' puluh' + (n % 10 ? ' ' + tb(n % 10) : '');
    if (n < 200)
        return 'seratus' + (n % 100 ? ' ' + tb(n % 100) : '');
    if (n < 1000)
        return tb(Math.floor(n / 100)) + ' ratus' + (n % 100 ? ' ' + tb(n % 100) : '');
    if (n < 2000)
        return 'seribu' + (n % 1000 ? ' ' + tb(n % 1000) : '');
    if (n < 1e6)
        return tb(Math.floor(n / 1000)) + ' ribu' + (n % 1000 ? ' ' + tb(n % 1000) : '');
    if (n < 1e9)
        return tb(Math.floor(n / 1e6)) + ' juta' + (n % 1e6 ? ' ' + tb(n % 1e6) : '');
    if (n < 1e12)
        return tb(Math.floor(n / 1e9)) + ' miliar' + (n % 1e9 ? ' ' + tb(n % 1e9) : '');
    return tb(Math.floor(n / 1e12)) + ' triliun' + (n % 1e12 ? ' ' + tb(n % 1e12) : '');
}

function cap(s) {
    return s.replace(/\b\w/g, function (c) {
        return c.toUpperCase();
    });
}

function fmt(n) {
    return n.toLocaleString('id-ID');
}

// ===== Render & cetak kwitansi =====
function render() {
    $('dw').style.display = $('kls').value ? 'none' : '';
    $('pDari').textContent = $('kls').value || $('dari').value;
    $('pKota').textContent = $('kota').value ? $('kota').value + ',' : '';
    var d = $('tgl').value;
    $('pTgl').textContent = d ? d.split('-').reverse().join('/') : '';
    $('pTtd').textContent = $('ttd').value;
    $('pCat').textContent = $('cat').value;
    var sub = 0, h = '', n = 0, rc = 0;
    function row(no, nm, amt) {
        rc++;
        return '<tr><td class="n">' + no + '</td><td>' + (nm || '&nbsp;') + '</td><td class="j">' + (amt !== '' ? '<div class="m"><span>Rp.</span><span>' + amt + '</span></div>' : '') + '</td></tr>';
    }
    P.forEach(function (p, i) {
        if (!q[i])
            return;
        n++;
        var a = price(i) * q[i];
        sub += a;
        h += row(n, esc(nameOf(i)) + (q[i] > 1 ? ' x ' + q[i] : ''), fmt(a));
    });
    var dv = Math.min(parseInt($('disc').value, 10) || 0, sub);
    var t = sub - dv;
    if (dv)
        h += row('', 'Diskon', '-' + fmt(dv));
    while (rc < 6)
        h += row('', '', '');
    $('pRows').innerHTML = h;
    $('pTot').textContent = t ? fmt(t) : '-';
    $('pTerb').textContent = t ? cap(tb(t)) + ' Rupiah' : 'Nol Rupiah';
    $('sub').textContent = 'Rp ' + fmt(sub);
    $('dv').textContent = '- Rp ' + fmt(dv);
    $('gt').textContent = 'Rp ' + fmt(t);
    GT = t;
    if (MET != 'Tunai')
        $('bayar').value = t || '';
    $('gt2').textContent = 'Rp ' + fmt(t);
    $('q1').textContent = 'Rp ' + fmt(t);
    var by = parseInt($('bayar').value, 10) || 0, kr = by && by < t;
    $('kbl').textContent = kr ? 'Kurang:' : 'Kembalian:';
    $('kb').textContent = 'Rp ' + fmt(kr ? t - by : Math.max(by - t, 0));
    $('kb').className = kr ? 'neg' : '';
    $('pPay').style.display = by ? 'flex' : 'none';
    $('pMet').textContent = MET;
    $('pBy').textContent = fmt(by);
    $('pKbl').textContent = kr ? 'Kurang :' : 'Kembalian :';
    $('pKb').textContent = fmt(kr ? t - by : Math.max(by - t, 0));
}

function showReceipt(on) {
    var o = $('out');
    o.classList.toggle('off', !on);
    if (on) {
        render();
        o.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

function printNow() {
    render();
    try {
        window.print();
    } catch (e) {
    }
}

function esc(s) {
    return s.replace(/[&<>"]/g, function (c) {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
}

var today = new Date();
$('tgl').value = today.getFullYear() + '-' + String(today.getMonth() + 1).padStart(2, '0') + '-' + String(today.getDate()).padStart(2, '0');

document.addEventListener('input', function (e) {
    if (e.target.id == 'cari')
        draw();
    render();
});

document.addEventListener('change', render);

document.addEventListener('click', function (e) {
    var c = e.target.getAttribute && e.target.getAttribute('data-c');
    if (c) {
        cat = c;
        draw();
        drawProd();
    }
});
tick();
setInterval(tick, 30000);
$('mc').innerHTML = '<option value="">Tanpa kelas</option>' + KELAS.map(function (k) {
    return '<option>' + k + '</option>';
}).join('');
fillKls('');
draw();
render();

// ===== Supabase: koneksi, data bersama & login =====
var sb = null;

function sbReady() {
    return window.supabase && typeof SUPABASE_URL == 'string' && SUPABASE_URL.indexOf('GANTI') < 0;
}

// Baca satu data (mis. 'products' / 'names') dari tabel app_data
function remoteGet(key) {
    return sb.from('app_data').select('value').eq('key', key).maybeSingle().then(function (r) {
        if (r.error)
            throw r.error;
        return r.data ? r.data.value : null;
    });
}

// Simpan satu data ke tabel app_data (insert atau update)
function remoteSet(key, val) {
    if (!sb)
        return Promise.resolve();
    return sb.from('app_data').upsert({ key: key, value: val, updated_at: new Date().toISOString() }).then(function (r) {
        if (r.error)
            alert('Gagal menyimpan ke server: ' + r.error.message);
    });
}

// Ambil produk & nama dari server lalu tampilkan ulang semuanya
function loadRemote() {
    return Promise.all([remoteGet('products'), remoteGet('names')]).then(function (r) {
        var prods = fixProducts(r[0]);
        if (prods) {
            P = norm(prods);
        } else {
            P = norm(JSON.parse(JSON.stringify(P0)));
            remoteSet('products', P);
        }
        q = P.map(function () {
            return 0;
        });
        NM = normNames(r[1]);
        fillKls('');
        draw();
        drawProd();
        drawNama();
        render();
    });
}

function enterApp() {
    return loadRemote().then(function () {
        document.body.classList.remove('locked');
    }).catch(function (e) {
        $('le').textContent = 'Gagal memuat data: ' + (e.message || e);
    });
}

function togglePw() {
    var i = $('lp'), h = i.type == 'password';
    i.type = h ? 'text' : 'password';
    $('eye').setAttribute('aria-label', h ? 'Sembunyikan password' : 'Tampilkan password');
}

function initLogin() {
    $('lp').type = 'password';
    $('lt').textContent = 'Masuk';
    $('lh').textContent = 'Masukkan email dan password akun petugas.';
    $('lb').textContent = 'Masuk';
    $('lp2w').style.display = 'none';
    $('le').textContent = '';
    $('lu').value = '';
    $('lp').value = '';
    $('lp2').value = '';
}

function doLogin() {
    var u = $('lu').value.trim(), p = $('lp').value;
    if (!sb) {
        $('le').textContent = 'Isi SUPABASE_URL dan SUPABASE_ANON_KEY di config.js terlebih dahulu.';
        return;
    }
    if (!u || !p) {
        $('le').textContent = 'Email dan password wajib diisi.';
        return;
    }
    $('lb').disabled = true;
    sb.auth.signInWithPassword({ email: u, password: p }).then(function (r) {
        $('lb').disabled = false;
        if (r.error) {
            $('le').textContent = 'Email atau password salah.';
            return;
        }
        initLogin();
        return enterApp();
    });
}

function logout() {
    sb.auth.signOut().then(function () {
        document.body.classList.add('locked');
        initLogin();
    });
}

document.addEventListener('keydown', function (e) {
    if (e.key == 'Enter' && document.body.classList.contains('locked'))
        doLogin();
    if (e.key == 'Escape') {
        closePay();
        closeDel();
        closeMod();
        closeName();
    }
});

initLogin();

if (sbReady()) {
    sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    // Sesi login tersimpan oleh Supabase, jadi refresh halaman tidak perlu login ulang
    sb.auth.getSession().then(function (r) {
        if (r.data && r.data.session)
            enterApp();
    });
    sb.auth.onAuthStateChange(function (ev) {
        if (ev == 'SIGNED_OUT')
            document.body.classList.add('locked');
    });
} else {
    $('le').textContent = 'Isi SUPABASE_URL dan SUPABASE_ANON_KEY di config.js terlebih dahulu.';
}
