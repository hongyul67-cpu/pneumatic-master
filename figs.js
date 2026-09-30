/* ══════════════════════════════════════════════════════════════
   공유압 마스터 — 그림 모음 (그림09 · 2026-09-30)
   공용 그리기 도우미 links/fig.js 를 쓴다. 이 파일은 index.html(배우기) · lesson.js(수업 슬라이드)가 함께 부른다.

   한 칸의 모양
     키: { cap:'캡션 한 줄', cards:['learn.js 카드 제목'…], draw:function(){ … } }
       cards — 이 그림이 실제로 보여 주는 배우기 카드. learn.js 카드 본문의 P('키') 자리에 들어간다
     순서 = 배우기 화면에 나오는 순서.

   그림 내용의 근거
     · learn.js 카드 본문 · lesson.js 슬라이드 본문 — 수치는 카드에 있는 보기 수치만 썼다
     · symbols.js (KS B 0054 / ISO 1219-1) — 밸브 칸·포트 번호·조작 기호의 도시 규칙
     · 훈련교재 「공유압」 OCR (_작업/훈련교재-OCR) — 탠덤 센터(4장) · 미터 인/아웃 · 블리드 오프 · 무부하 회로(5장)
   교과서·교재의 그림을 따라 그리지 않았다. 같은 개념을 이 규격으로 새로 짰다.
   ══════════════════════════════════════════════════════════════ */
var FIGS = (function () {
  var F = window.FIG;
  if (!F) return {};
  var C = F.C;
  var t = F.t, box = F.box, line = F.line, arrow = F.arrow, callout = F.callout;

  /* ── 공유압 기호 도우미 (기호 선은 1.8) ───────────────── */
  var SW = 1.8;
  function sq(x, y, s, o) { o = o || {}; return box(x, y, s, s, { fill: o.fill || C.paper, r: 0, w: SW, c: o.c }); }
  function ia(x1, y1, x2, y2, c) { return arrow(x1, y1, x2, y2, { w: 1.6, head: 8, c: c || C.ink }); }
  /* 막힌 포트 — (x,y) 에서 dir(+1 아래 · -1 위) 쪽으로 짧게 긋고 가로 막대 */
  function tee(x, y, dir, c) {
    var y1 = y + 9 * dir;
    return line(x, y, x, y1, { w: SW, c: c }) + line(x - 6, y1, x + 6, y1, { w: SW, c: c });
  }
  /* 스프링 — (x,y) 에서 dir 쪽으로 len 만큼 지그재그 */
  function spr(x, y, len, dir, c, amp) {
    var n = 6, p = [[x, y]], a = amp || 7;
    for (var i = 1; i < n; i++) p.push([x + dir * len * i / n, y + (i % 2 ? -a : a)]);
    p.push([x + dir * len, y]);
    return F.poly(p, { w: 1.5, c: c || C.ink });
  }
  /* 세로 스프링 — (x,y) 에서 아래(dir=1)로 */
  function sprV(x, y, len, dir, c) {
    var n = 6, p = [[x, y]];
    for (var i = 1; i < n; i++) p.push([x + (i % 2 ? -7 : 7), y + dir * len * i / n]);
    p.push([x, y + dir * len]);
    return F.poly(p, { w: 1.5, c: c || C.ink });
  }
  function push(x, y, dir) {                     /* 누름버튼 — 칸의 옆변 (x,y) 에서 바깥(dir) 쪽 */
    return line(x, y, x + dir * 10, y, { w: SW }) + box(dir > 0 ? x + 10 : x - 18, y - 7, 8, 14, { fill: C.paper, r: 1, w: SW });
  }
  function sol(x, y, dir, c) {                   /* 솔레노이드 */
    var bx = dir > 0 ? x + 6 : x - 24;
    return line(x, y, x + dir * 6, y, { w: SW, c: c }) + box(bx, y - 9, 18, 18, { fill: C.paper, r: 1, w: SW, c: c }) +
      line(bx + 2, y + 7, bx + 16, y - 7, { w: 1.4, c: c });
  }
  function pilotOp(x, y, dir, c) {               /* 공기압 파일럿 조작 */
    var x2 = x + dir * 12;
    return line(x, y, x2, y, { w: 1.4, dash: '4 3', c: c }) +
      F.poly([[x2 + dir * 12, y - 7], [x2 + dir * 12, y + 7], [x2, y]], { close: 1, fill: C.paper, w: 1.4, c: c });
  }
  function pumpSym(cx, cy, r, filled, o) {       /* 펌프 · 압력원 — 삼각형이 위(내보내는 쪽) */
    o = o || {};
    var tr = r * 0.5;
    return F.circle(cx, cy, r, { fill: C.paper, w: SW }) +
      F.poly([[cx, cy - r + 2], [cx + tr, cy - r + 2 + tr * 1.5], [cx - tr, cy - r + 2 + tr * 1.5]],
        { close: 1, fill: filled ? C.ink : C.paper, w: 1.4 });
  }
  function motorM(cx, cy) { return F.circle(cx, cy, 13, { fill: C.paper, w: SW }) + t(cx, cy + 1, 'M', { a: 'm', size: 14, b: 1, halo: false }); }
  function tank(x, y, w) {                       /* 기름 탱크 — 위가 열린 네모 */
    return F.path('M' + x + ',' + y + ' V' + (y + 14) + ' H' + (x + w) + ' V' + y, { w: SW });
  }
  function gauge(cx, cy, r) {
    return F.circle(cx, cy, r, { fill: C.paper, w: SW }) + ia(cx - r * 0.6, cy + r * 0.6, cx + r * 0.62, cy - r * 0.62);
  }
  function exh(x, y, c) {                        /* 배기구 — 아래를 향한 빈 삼각형 */
    return F.poly([[x - 8, y], [x + 8, y], [x, y + 11]], { close: 1, fill: C.paper, w: 1.4, c: c });
  }
  /* 교축 — 세로 관로 (x) 의 y 자리에 마주 보는 두 곡선 */
  function thrV(x, y, c) {
    return F.path('M' + (x - 13) + ',' + (y - 13) + ' Q' + (x - 2) + ',' + y + ' ' + (x - 13) + ',' + (y + 13), { w: 1.6, c: c }) +
      F.path('M' + (x + 13) + ',' + (y - 13) + ' Q' + (x + 2) + ',' + y + ' ' + (x + 13) + ',' + (y + 13), { w: 1.6, c: c });
  }
  function thrH(x, y, c) {
    return F.path('M' + (x - 13) + ',' + (y - 13) + ' Q' + x + ',' + (y - 2) + ' ' + (x + 13) + ',' + (y - 13), { w: 1.6, c: c }) +
      F.path('M' + (x - 13) + ',' + (y + 13) + ' Q' + x + ',' + (y + 2) + ' ' + (x + 13) + ',' + (y + 13), { w: 1.6, c: c });
  }
  /* 체크 밸브 — 볼 + V 시트. seat: 시트가 볼의 어느 쪽에 있는지('r' 이면 오른쪽 → 왼쪽에서 오른쪽 흐름을 막는다) */
  function checkH(cx, cy, seat, c) {
    var s = seat === 'r' ? 1 : -1;
    return F.circle(cx, cy, 6, { fill: C.paper, w: 1.5, c: c }) +
      F.poly([[cx + s * 1, cy - 11], [cx + s * 9, cy], [cx + s * 1, cy + 11]], { w: 1.5, c: c });
  }
  function checkV(cx, cy, seat, c) {             /* seat 'u' = 시트가 위 → 아래에서 위 흐름을 막는다 */
    var s = seat === 'u' ? -1 : 1;
    return F.circle(cx, cy, 6, { fill: C.paper, w: 1.5, c: c }) +
      F.poly([[cx - 11, cy + s * 1], [cx, cy + s * 9], [cx + 11, cy + s * 1]], { w: 1.5, c: c });
  }
  /* 일방향 유량 조절 밸브(세로 관로용) — 점선 네모 안에 교축과 체크를 나란히.
     freeUp: 체크가 아래→위 흐름을 그대로 통과시키면 true */
  function fcV(x, y, freeUp, c) {
    var s = line(x, y - 30, x, y + 30, { w: SW }) + thrV(x, y, c) +
      F.path('M' + x + ',' + (y - 22) + ' H' + (x + 24) + ' V' + (y + 22) + ' H' + x, { w: 1.4 }) +
      checkV(x + 24, y, freeUp ? 'd' : 'u') +
      box(x - 20, y - 26, 58, 52, { fill: 'none', r: 3, w: 1.2, c: C.sub, dash: '5 4' });
    return s;
  }
  /* 가로 실린더(단면이 아닌 기호형) — 몸통 · 피스톤 · 로드 */
  function cylSym(x, y, w, h, px, rodEnd, o) {
    o = o || {};
    return box(x, y, w, h, { fill: o.fill || C.paper, r: 2, w: 2 }) +
      box(px, y, 8, h, { fill: C.ink, r: 0, w: 1 }) +
      line(px + 8, y + h / 2, rodEnd, y + h / 2, { w: 4 });
  }
  /* 단면 실린더 — 벽 두께를 보인다 */
  function cylCut(x, y, w, h, px, rodEnd, o) {
    o = o || {};
    var s = box(x, y, w, h, { fill: C.grayM, r: 3, w: 2 }) +
      box(x + 6, y + 6, w - 12, h - 12, { fill: C.paper, r: 1, w: 1 });
    if (o.leftFill) s += box(x + 6, y + 6, px - x - 6, h - 12, { fill: o.leftFill, r: 0, w: 0, c: 'none' });
    if (o.rightFill) s += box(px + 12, y + 6, x + w - 6 - px - 12, h - 12, { fill: o.rightFill, r: 0, w: 0, c: 'none' });
    s += box(px, y + 6, 12, h - 12, { fill: C.sub, r: 1, w: 1.2 }) +
      box(px + 12, y + h / 2 - 6, rodEnd - px - 12, 12, { fill: C.grayM, r: 1, w: 1.4 });
    return s;
  }
  function note(x, y, s, o) { o = o || {}; return t(x, y, s, { a: o.a || 'm', size: o.size || 13, c: o.c || C.sub, b: o.b }); }
  function head(x, y, s, o) { o = o || {}; return t(x, y, s, { a: o.a || 'm', size: 17, b: 1, c: o.c || C.ink }); }
  function divider(x, y1, y2) { return line(x, y1, x, y2, { c: C.grayM, w: 1.4, dash: '6 5' }); }
  function hdiv(y, x1, x2) { return line(x1 || 16, y, x2 || 464, y, { c: C.grayM, w: 1.4, dash: '6 5' }); }

  /* 3/2 밸브 한 벌 — 칸 크기 s, 왼칸 x..x+s(눌렀을 때) · 오른칸 x+s..x+2s(평소, 스프링 쪽).
     nc=true : 평소 1 막힘 · 2→3 / 눌렀을 때 1→2 · 3 막힘 (symbols.js v32nc 와 같다)
     nc=false: 평소 1→2 · 3 막힘 / 눌렀을 때 1 막힘 · 2→3 (v32no) */
  function v32(x, y, s, nc, o) {
    o = o || {};
    var L = x, R = x + s, bl = s * 0.25, tm = s * 0.5, br = s * 0.75, bot = y + s, g = '';
    g += sq(L, y, s) + sq(R, y, s, { c: o.hiC, fill: o.hiFill });
    if (nc) {
      g += ia(L + bl, bot - 3, L + tm, y + 3) + tee(L + br, bot, -1);
      g += ia(R + tm, y + 3, R + br, bot - 3) + tee(R + bl, bot, -1);
    } else {
      g += tee(L + bl, bot, -1) + ia(L + tm, y + 3, L + br, bot - 3);
      g += ia(R + bl, bot - 3, R + tm, y + 3, o.flowC) + tee(R + br, bot, -1);
    }
    g += push(L, y + s / 2, -1) + spr(R + s, y + s / 2, 22, 1);
    return g;
  }

  return {

  /* ─────────── 1. 공압 장치의 구성 ─────────── */
  airpath: { cards: ['공기가 지나가는 길'],
    cap: '압축공기가 지나가는 여덟 자리 — 만들고 · 다듬은 뒤 · 보내고 · 조여서 · 일을 시킨다',
    draw: function () {
      var s = '', X = [12, 128, 244, 360], W = 104, H = 58;
      var r1 = [['공기압축기', '만든다'], ['애프터쿨러', '식힌다'], ['공기탱크', '모은다'], ['에어드라이어', '말린다']];
      var r2 = [['조정 유닛', '다듬는다'], ['방향제어밸브', '보낸다'], ['속도제어밸브', '조인다'], ['실린더', '일한다']];
      for (var i = 0; i < 4; i++) {
        s += box(X[i], 36, W, H, { fill: C.blueL, c: C.blue }) + F.num(X[i] + 4, 36, i + 1, { c: C.blue, r: 11, size: 13 }) +
          t(X[i] + W / 2, 58, r1[i][0], { a: 'm', b: 1, size: 15, halo: false }) +
          t(X[i] + W / 2, 80, r1[i][1], { a: 'm', size: 13, c: C.sub, halo: false });
        if (i < 3) s += arrow(X[i] + W + 1, 65, X[i + 1] - 2, 65, { w: 1.8, head: 9 });
      }
      s += arrow(412, 95, 412, 134, { w: 1.8, head: 9 });
      for (var j = 0; j < 4; j++) {
        var x = X[3 - j];
        var fill = j === 0 ? C.blueL : C.greenL, c = j === 0 ? C.blue : C.green;
        s += box(x, 136, W, H, { fill: fill, c: c }) + F.num(x + 4, 136, j + 5, { c: c, r: 11, size: 13 }) +
          t(x + W / 2, 158, r2[j][0], { a: 'm', b: 1, size: 15, halo: false }) +
          t(x + W / 2, 180, r2[j][1], { a: 'm', size: 13, c: C.sub, halo: false });
        if (j < 3) s += arrow(x - 1, 165, X[3 - j - 1] + W + 2, 165, { w: 1.8, head: 9 });
      }
      s += note(240, 218, '조정 유닛 = 공기압 조정 유닛 (필터 + 감압 밸브 + 윤활기)');
      return F.svg(480, 236, s);
    } },

  frl: { cards: ['공기압 조정 유닛 — 세 가지가 한 덩어리'],
    cap: '공기압 조정 유닛 — 필터 → 감압 밸브 → 윤활기, 이 순서라야 뒤 기기가 상하지 않는다',
    draw: function () {
      var s = '', X = [62, 190, 318], W = 104;
      var nm = ['필터', '감압 밸브', '윤활기'], sub = ['먼지·물을\n거른다', '압력을 낮춰\n일정하게', '기름 안개를\n섞는다'];
      s += arrow(8, 112, 60, 112, { c: C.blue, w: 2.4 }) + t(6, 140, '압축공기', { b: 1, c: C.blue, size: 13 });
      s += arrow(424, 112, 472, 112, { c: C.blue, w: 2.4 }) + t(474, 140, '장치로', { a: 'e', b: 1, c: C.blue, size: 13 });
      for (var i = 0; i < 3; i++) {
        s += box(X[i], 88, W, 48, { fill: C.grayL }) + F.num(X[i] + 4, 88, i + 1, { c: C.blue, r: 11, size: 13 }) +
          t(X[i] + W / 2, 112, nm[i], { a: 'm', b: 1, halo: false }) + t(X[i] + W / 2, 170, sub[i], { a: 'm', size: 14, c: C.sub });
        if (i < 2) s += arrow(X[i] + W + 1, 112, X[i + 1] - 2, 112, { w: 1.8, head: 9 });
      }
      /* 감압 밸브 위 압력계 */
      s += line(240, 88, 240, 66, { w: 1.6 }) + gauge(240, 48, 17);
      s += callout(258, 44, 296, 34, '압력계', { b: 1 });
      s += t(240, 214, '순서를 바꾸지 않는다', { a: 'm', b: 1, c: C.orange, size: 15 });
      return F.svg(480, 234, s);
    } },

  /* ─────────── 2. 공압과 유압의 차이 ─────────── */
  tri: { cards: ['기호에서 먼저 갈린다 — 삼각형 속'],
    cap: '동그라미는 같고 삼각형 속만 다르다 — 채워진 ▲ = 액체(유압), 빈 △ = 기체(공기압)',
    draw: function () {
      var s = divider(240, 20, 212);
      function src(cx, filled, c) {
        return line(cx, 44, cx, 70, { w: 2.2 }) + F.circle(cx, 112, 42, { fill: C.paper, w: 2.2 }) +
          F.poly([[cx, 74], [cx + 22, 108], [cx - 22, 108]], { close: 1, fill: filled ? C.ink : C.paper, w: 2, c: c });
      }
      s += src(120, true) + src(360, false);
      s += callout(136, 96, 196, 66, '속이 찼다', { c: C.orange, tc: C.orange, b: 1 });
      s += callout(376, 96, 420, 60, '속이 비었다', { c: C.orange, tc: C.orange, b: 1, a: 'm' });
      s += t(120, 180, '유압원', { a: 'm', b: 1, size: 17 }) + note(120, 204, '액체(기름)');
      s += t(360, 180, '공기압원', { a: 'm', b: 1, size: 17 }) + note(360, 204, '기체(공기)');
      return F.svg(480, 226, s);
    } },

  'return': { cards: ['무엇이 다른가'],
    cap: '돌아오는 배관 — 공압은 쓴 공기를 대기로 버리고, 유압은 기름을 반드시 탱크로 되돌린다',
    draw: function () {
      var s = divider(240, 16, 262);
      function panel(ox, hyd) {
        var g = head(ox + 112, 26, hyd ? '유압' : '공압', { c: hyd ? C.orange : C.blue });
        var sup = C.blue, ret = hyd ? C.orange : C.sub;
        /* 실린더 */
        g += cylSym(ox + 36, 48, 150, 34, ox + 92, ox + 214);
        /* 밸브 (두 칸) */
        g += sq(ox + 70, 124, 42) + sq(ox + 112, 124, 42);
        g += ia(ox + 80, 163, ox + 80, 128) + ia(ox + 102, 128, ox + 102, 163);
        g += ia(ox + 123, 163, ox + 144, 128) + ia(ox + 144 - 1, 163, ox + 123, 128);
        /* 실린더 ↔ 밸브 */
        g += F.poly([[ox + 80, 124], [ox + 80, 100], [ox + 50, 100], [ox + 50, 82]], { w: 2, c: sup });
        g += F.poly([[ox + 102, 124], [ox + 102, 108], [ox + 172, 108], [ox + 172, 82]], { w: 2, c: ret });
        /* 공급 */
        g += line(ox + 80, 166, ox + 80, 196, { w: 2, c: sup }) + pumpSym(ox + 80, 214, 16, hyd);
        g += note(ox + 42, 214, hyd ? '펌프' : '압축기', { a: 'e' });
        if (hyd) {
          g += line(ox + 80, 230, ox + 80, 238, { w: 2 }) + tank(ox + 60, 236, 100);
          g += F.poly([[ox + 102, 166], [ox + 102, 180], [ox + 140, 180], [ox + 140, 236]], { w: 2.4, c: ret });
          g += arrow(ox + 140, 196, ox + 140, 226, { c: ret, w: 2.4 });
          g += t(ox + 150, 206, '탱크로', { b: 1, c: ret, size: 15 });
          g += note(ox + 110, 262, '되돌리는 배관이 꼭 있다', { c: ret, b: 1 });
        } else {
          g += line(ox + 102, 166, ox + 102, 184, { w: 2, c: ret }) + exh(ox + 102, 184);
          g += F.path('M' + (ox + 118) + ',' + 200 + ' q8,-6 16,0 t16,0', { c: ret, w: 1.6 }) +
            F.path('M' + (ox + 118) + ',' + 212 + ' q8,-6 16,0 t16,0', { c: ret, w: 1.6 });
          g += t(ox + 156, 206, '대기로', { b: 1, c: ret, size: 15 });
          g += note(ox + 110, 262, '되돌리는 배관이 없다', { c: ret, b: 1 });
        }
        return g;
      }
      s += panel(8, false) + panel(248, true);
      return F.svg(480, 280, s);
    } },

  pascal: { cards: ['파스칼의 원리 — 유압이 힘을 키우는 이유'],
    cap: '파스칼의 원리 — 압력 p 는 어디서나 같으니, 면적이 4배인 쪽에서 힘도 4배가 된다',
    draw: function () {
      var s = '', lq = C.blueL;
      /* 그릇: 좁은 기둥(폭 50) · 넓은 기둥(폭 100 → 면적 4배) · 아래 통로 */
      s += F.path('M70,96 V200 H390 V96', { fill: 'none', w: 0 });
      s += box(70, 110, 50, 100, { fill: lq, r: 0, w: 0, c: 'none' }) + box(120, 176, 170, 34, { fill: lq, r: 0, w: 0, c: 'none' }) +
        box(290, 110, 100, 100, { fill: lq, r: 0, w: 0, c: 'none' });
      s += F.path('M70,60 V210 H390 V60 M120,60 V176 H290 V60', { w: 2.4 });
      /* 피스톤 */
      s += box(72, 98, 46, 12, { fill: C.sub, r: 1, w: 1.2 }) + box(292, 98, 96, 12, { fill: C.sub, r: 1, w: 1.2 });
      s += arrow(95, 40, 95, 94, { c: C.red, w: 2.4 }) + t(110, 42, 'F₁ 작은 힘', { b: 1, c: C.red });
      s += arrow(340, 96, 340, 24, { c: C.red, w: 5, head: 16 }) + t(356, 36, 'F₂ 큰 힘', { b: 1, c: C.red });
      s += t(95, 132, 'A₁', { a: 'm', b: 1 }) + t(340, 134, 'A₂ = 4 × A₁', { a: 'm', b: 1 });
      /* 압력은 사방으로 같게 */
      var P = [[205, 193, 205, 181], [180, 193, 168, 193], [230, 193, 242, 193]];
      for (var i = 0; i < P.length; i++) s += ia(P[i][0], P[i][1], P[i][2], P[i][3], C.blue);
      s += t(205, 232, '압력 p 가 어디서나 같다', { a: 'm', b: 1, c: C.blue, size: 15 });
      s += note(240, 256, 'p = F ÷ A → 힘 4배 · 대신 움직이는 거리는 1/4');
      return F.svg(480, 274, s);
    } },

  boyle: { cards: ['보일의 법칙 — 공기는 눌린다'],
    cap: '보일의 법칙 — 1기압 10 L 의 공기를 5기압으로 누르면 2 L 가 된다 (p₁V₁ = p₂V₂)',
    draw: function () {
      var s = '';
      function jar(x, top, pLbl, vLbl) {
        var g = box(x, 40, 90, 170, { fill: C.grayL, r: 3, w: 2 });
        g += box(x + 3, top + 12, 84, 207 - top - 12, { fill: C.blueL, r: 0, w: 0, c: 'none' });
        g += box(x + 3, top, 84, 12, { fill: C.sub, r: 1, w: 1.2 }) + line(x + 45, top, x + 45, 22, { w: 5, c: C.sub });
        /* 공기 알갱이 — 부피가 줄면 촘촘해진다 */
        var n = 14, h = 207 - top - 12;
        for (var i = 0; i < n; i++) {
          var px = x + 12 + (i * 29) % 66, py = top + 18 + ((i * 37) % Math.max(8, h - 12));
          g += '<circle cx="' + px + '" cy="' + py + '" r="3" fill="' + C.blue + '"/>';
        }
        g += t(x + 45, 232, vLbl, { a: 'm', b: 1, size: 17 }) + t(x + 45, 256, pLbl, { a: 'm', c: C.sub, size: 15 });
        return g;
      }
      s += jar(60, 60, '1기압', '10 L');
      s += jar(300, 162, '5기압', '2 L');
      s += arrow(345, 110, 345, 150, { c: C.red, w: 3, head: 13 }) + t(360, 124, '누른다', { b: 1, c: C.red });
      s += arrow(176, 128, 280, 128, { w: 2 }) + note(228, 110, '온도는 그대로');
      s += t(240, 286, '1 × 10 = 5 × 2', { a: 'm', b: 1, size: 17, c: C.blue });
      return F.svg(480, 304, s);
    } },

  conti: { cards: ['연속의 법칙 — 좁아지면 빨라진다'],
    cap: '연속의 법칙 — 단면적이 4배로 넓어지면 속도는 1/4 (A₁v₁ = A₂v₂)',
    draw: function () {
      var s = '';
      /* 좁은 관(지름 40) → 넓은 관(지름 80 = 단면적 4배) */
      s += F.path('M20,80 H170 L220,60 H460 V140 H220 L170,120 H20 Z', { fill: C.blueL, c: C.ink, w: 2.4 });
      s += arrow(40, 100, 150, 100, { c: C.blue, w: 3, head: 13 });
      s += arrow(300, 100, 330, 100, { c: C.blue, w: 3, head: 13 });
      s += t(95, 56, 'A₁ 좁다', { a: 'm', b: 1 }) + t(340, 40, 'A₂ = 4 × A₁ 넓다', { a: 'm', b: 1 });
      s += t(95, 158, 'v₁ = 20 m/s 빠르다', { a: 'm', b: 1, c: C.red, size: 15 });
      s += t(340, 162, 'v₂ = 5 m/s 느리다', { a: 'm', b: 1, c: C.green, size: 15 });
      s += t(240, 200, 'A₁ × 20 = 4A₁ × 5', { a: 'm', b: 1, size: 17, c: C.blue });
      return F.svg(480, 222, s);
    } },

  bern: { cards: ['베르누이의 정리 — 빨라지면 압력이 내려간다'],
    cap: '베르누이의 정리 — 좁아져 빨라진 곳은 압력이 낮다 (세운 관의 물 높이로 보인다)',
    draw: function () {
      var s = '';
      var pipe = 'M20,150 H150 L200,170 H280 L330,150 H460 V230 H330 L280,210 H200 L150,230 H20 Z';
      /* 세운 관(액주) — 넓은 곳은 높이, 좁은 곳은 낮게 */
      function col(x, yTop, yBot, lvl) {
        return box(x - 9, yTop, 18, yBot - yTop, { fill: C.paper, r: 0, w: 1.8 }) +
          box(x - 7.5, lvl, 15, yBot - lvl + 2, { fill: C.blueL, r: 0, w: 0, c: 'none' }) +
          line(x - 9, lvl, x + 9, lvl, { c: C.blue, w: 2.4 });
      }
      s += col(85, 30, 150, 54) + col(240, 30, 170, 116) + col(395, 30, 150, 54);
      s += F.path(pipe, { fill: C.blueL, c: C.ink, w: 2.4 });
      s += arrow(40, 190, 110, 190, { c: C.blue, w: 2.6 }) + arrow(212, 190, 268, 190, { c: C.blue, w: 3.4, head: 14 });
      s += line(85, 54, 240, 54, { c: C.red, w: 1, dash: '4 3' }) + arrow(240, 56, 240, 112, { c: C.red, w: 1.4, head: 8, both: true });
      s += t(252, 84, '압력이 내려간 만큼', { c: C.red, size: 13 });
      s += t(85, 252, '넓다 · 느리다', { a: 'm', b: 1, size: 15 }) + note(85, 272, '압력 높다');
      s += t(240, 252, '좁다 · 빠르다', { a: 'm', b: 1, size: 15, c: C.red }) + note(240, 272, '압력 낮다', { c: C.red });
      s += t(395, 252, '넓다 · 느리다', { a: 'm', b: 1, size: 15 });
      s += t(240, 298, 'p + ½ρv² + ρgh = 일정', { a: 'm', b: 1, size: 17, c: C.blue });
      return F.svg(480, 318, s);
    } },

  pitot: { cards: ['베르누이의 정리 — 빨라지면 압력이 내려간다'],
    cap: '속도 재기 — 흐름을 정면으로 받는 관과 옆면 관의 차이 Δp 가 ½ρv² 이다',
    draw: function () {
      var s = '';
      s += box(20, 150, 440, 70, { fill: C.blueL, r: 0, w: 2.4 });
      s += arrow(40, 186, 120, 186, { c: C.blue, w: 2.6 });
      /* 옆면 관 */
      s += box(171, 40, 18, 110, { fill: C.paper, r: 0, w: 1.8 }) + box(172.5, 104, 15, 48, { fill: C.blueL, r: 0, w: 0, c: 'none' }) +
        line(171, 104, 189, 104, { c: C.blue, w: 2.4 });
      /* 정면 관 — ㄴ자로 꺾여 입구가 흐름을 마주 본다 */
      s += F.path('M311,40 V178 H262 V194 H329 V40', { fill: C.paper, w: 1.8 });
      s += box(312.5, 64, 15, 128, { fill: C.blueL, r: 0, w: 0, c: 'none' }) + box(264, 179.5, 50, 13, { fill: C.blueL, r: 0, w: 0, c: 'none' });
      s += line(311, 64, 329, 64, { c: C.blue, w: 2.4 });
      s += line(189, 104, 356, 104, { c: C.red, w: 1, dash: '4 3' }) + line(329, 64, 356, 64, { c: C.red, w: 1, dash: '4 3' });
      s += arrow(350, 66, 350, 102, { c: C.red, w: 1.4, head: 8, both: true }) + t(362, 84, 'Δp = ½ρv²', { b: 1, c: C.red });
      s += t(180, 26, '옆면', { a: 'm', b: 1 }) + t(320, 26, '정면', { a: 'm', b: 1 });
      s += note(240, 244, 'v = √(2Δp ÷ ρ)', { size: 16, c: C.ink, b: 1 });
      s += note(240, 270, '보기: 물, Δp = 4.5 kPa → v = √(2 × 4500 ÷ 1000) = 3 m/s');
      return F.svg(480, 290, s);
    } },

  /* ─────────── 3. 실린더 ─────────── */
  'cyl-single': { cards: ['단동 실린더 — 한쪽으로만 힘을 낸다'],
    cap: '단동 실린더 — 한쪽 포트로 공기를 넣어 밀어내고, 돌아올 때는 스프링에 맡긴다',
    draw: function () {
      var s = cylCut(60, 70, 290, 86, 150, 448, { leftFill: C.blueL });
      /* 스프링 (로드 쪽 방) */
      s += spr(162, 90, 180, 1, C.ink, 9) + spr(162, 136, 180, 1, C.ink, 9);
      /* 포트 1개 */
      s += box(84, 44, 18, 26, { fill: C.grayM, r: 1, w: 1.4 });
      s += arrow(93, 10, 93, 60, { c: C.blue, w: 2.6 });
      s += t(104, 22, '공기 (포트 1개)', { b: 1, c: C.blue });
      s += arrow(210, 188, 290, 188, { c: C.blue, w: 2.6 }) + t(250, 208, '공기의 힘으로 전진', { a: 'm', b: 1, c: C.blue, size: 15 });
      s += arrow(290, 234, 210, 234, { c: C.green, w: 2.6 }) + t(250, 254, '스프링이 되돌린다', { a: 'm', b: 1, c: C.green, size: 15 });
      s += callout(156, 150, 110, 190, '피스톤', { a: 'e' }) + callout(250, 96, 330, 30, '스프링') + callout(420, 113, 430, 170, '로드', { a: 'm' });
      return F.svg(480, 272, s);
    } },

  'cyl-double': { cards: ['복동 실린더 — 양쪽으로 힘을 낸다'],
    cap: '복동 실린더 — 포트가 둘, 한쪽에 공기를 넣으면 반대쪽은 배기되어 전진도 후진도 공기로 한다',
    draw: function () {
      var s = '';
      function one(y, fwd) {
        var px = fwd ? 250 : 110;
        var g = cylCut(70, y, 300, 70, px, fwd ? 460 : 320, fwd ? { leftFill: C.blueL } : { rightFill: C.blueL });
        g += box(92, y - 20, 16, 20, { fill: C.grayM, r: 1, w: 1.2 }) + box(332, y - 20, 16, 20, { fill: C.grayM, r: 1, w: 1.2 });
        if (fwd) {
          g += arrow(100, y - 52, 100, y - 24, { c: C.blue, w: 2.4 }) + t(112, y - 44, '공급', { b: 1, c: C.blue, size: 15 });
          g += arrow(340, y - 24, 340, y - 52, { c: C.sub, w: 2.4 }) + t(352, y - 44, '배기', { b: 1, c: C.sub, size: 15 });
        } else {
          g += arrow(100, y - 24, 100, y - 52, { c: C.sub, w: 2.4 }) + t(112, y - 44, '배기', { b: 1, c: C.sub, size: 15 });
          g += arrow(340, y - 52, 340, y - 24, { c: C.blue, w: 2.4 }) + t(352, y - 44, '공급', { b: 1, c: C.blue, size: 15 });
        }
        g += t(24, y + 35, fwd ? '전진' : '후진', { b: 1, size: 17, c: C.blue });
        return g;
      }
      s += one(72, true) + one(222, false);
      s += hdiv(162);
      s += note(240, 308, '로드가 한쪽에만 있는 편로드형 — 후진 쪽 면적이 로드만큼 작다');
      return F.svg(480, 326, s);
    } },

  force: { cards: ['실린더가 내는 힘'],
    cap: 'F = p × A — 후진할 때는 로드가 차지한 만큼 면적이 줄어 힘이 작다',
    draw: function () {
      var s = divider(240, 20, 226);
      s += head(120, 30, '전진할 때') + head(360, 30, '후진할 때');
      s += F.circle(120, 118, 66, { fill: C.blueL, c: C.blue, w: 2.2 });
      s += F.circle(360, 118, 66, { fill: C.blueL, c: C.blue, w: 2.2 }) + F.circle(360, 118, 22, { fill: C.grayM, w: 1.8 });
      s += t(120, 118, '피스톤 전체', { a: 'm', b: 1, halo: false });
      s += callout(360, 118, 430, 200, '로드', { a: 'm' });
      s += t(360, 72, '고리 모양만', { a: 'm', b: 1, size: 15, halo: false, c: C.blue });
      s += t(120, 210, 'A = 피스톤 면적', { a: 'm', size: 15 });
      s += t(340, 214, 'A = 피스톤 − 로드', { a: 'm', size: 15 });
      s += t(240, 252, 'F = p × A', { a: 'm', b: 1, size: 18, c: C.blue });
      s += note(240, 276, '실제로는 마찰 때문에 계산값의 85~90 % 정도');
      return F.svg(480, 294, s);
    } },

  /* ─────────── 4. 방향제어밸브 ─────────── */
  ports: { cards: ['네모 칸 = 위치, 밖으로 나온 선 = 포트'],
    cap: '3/2 way 밸브 — 칸 2개 = 위치 2개, 한 칸에서 밖으로 나온 선 3개 = 포트 3개',
    draw: function () {
      var s = '', x = 150, y = 76, S = 84;
      s += v32(x, y, S, true, { hiC: C.orange });
      s += line(x + S + S * 0.5, y, x + S + S * 0.5, y - 26, { w: 2 });
      s += line(x + S + S * 0.25, y + S, x + S + S * 0.25, y + S + 26, { w: 2 });
      s += line(x + S + S * 0.75, y + S, x + S + S * 0.75, y + S + 22, { w: 2 }) + exh(x + S + S * 0.75, y + S + 22);
      s += t(x + S / 2, 56, '위치 1', { a: 'm', b: 1 }) + note(x + S / 2, 36, '눌렀을 때');
      s += t(x + S + S * 0.5 + 12, 54, '2', { b: 1, c: C.orange, size: 17 });
      s += t(x + S + S * 0.25 - 6, y + S + 26, '1', { a: 'e', b: 1, c: C.orange, size: 17 });
      s += t(x + S + S * 0.75 + 14, y + S + 18, '3', { b: 1, c: C.orange, size: 17 });
      s += callout(x + S * 2 - 6, y + 10, 420, 58, '위치 2 (평소)', { a: 'm', b: 1 });
      s += callout(x + S + S * 0.5 + 6, y + S + 40, 330, 232, '포트 1 · 2 · 3', { c: C.orange, tc: C.orange, b: 1 });
      s += t(240, 272, '칸 2개 · 포트 3개 → 3/2 way 밸브', { a: 'm', b: 1, size: 17, c: C.blue });
      s += note(240, 296, '포트는 평소 칸(스프링 쪽) 한 칸에서만 센다');
      return F.svg(480, 314, s);
    } },

  portnum: { cards: ['포트 번호와 이름'],
    cap: '5/2 way 밸브의 포트 번호 — 1 공급 · 2·4 작업(짝수) · 3·5 배기(홀수) · 12·14 파일럿',
    draw: function () {
      var s = '', L = 140, R = 240, y = 90, S = 100, bot = y + S;
      var P = C.blue, Wk = C.green, E = C.sub, Pi = C.orange;
      s += sq(L, y, S) + sq(R, y, S);
      /* 왼칸(14 쪽) : 1→4, 2→3 · 오른칸(12 쪽) : 1→2, 4→5 (symbols.js v52 와 같은 짜임) */
      s += ia(L + 50, bot - 3, L + 20, y + 3) + ia(L + 80, y + 3, L + 80, bot - 3);
      s += tee(L + 20, bot, -1);
      s += ia(R + 50, bot - 3, R + 80, y + 3) + ia(R + 20, y + 3, R + 20, bot - 3);
      s += tee(R + 80, bot, -1);
      s += pilotOp(L, y + S / 2, -1, Pi) + pilotOp(R + S, y + S / 2, 1, Pi);
      /* 포트 선과 번호 (평소 칸 = 오른칸) */
      s += line(R + 20, y, R + 20, y - 30, { w: 2.2, c: Wk }) + line(R + 80, y, R + 80, y - 30, { w: 2.2, c: Wk });
      s += line(R + 20, bot, R + 20, bot + 28, { w: 2.2, c: E }) + line(R + 50, bot, R + 50, bot + 32, { w: 2.2, c: P }) +
        line(R + 80, bot, R + 80, bot + 28, { w: 2.2, c: E });
      s += t(R + 20, y - 44, '4', { a: 'm', b: 1, c: Wk, size: 18 }) + t(R + 80, y - 44, '2', { a: 'm', b: 1, c: Wk, size: 18 });
      s += t(R + 20, bot + 42, '5', { a: 'm', b: 1, c: E, size: 18 }) + t(R + 50, bot + 46, '1', { a: 'm', b: 1, c: P, size: 18 }) +
        t(R + 80, bot + 42, '3', { a: 'm', b: 1, c: E, size: 18 });
      s += t(L - 30, y + 20, '14', { a: 'm', b: 1, c: Pi, size: 18 }) + t(R + S + 30, y + 20, '12', { a: 'm', b: 1, c: Pi, size: 18 });
      s += t(R + 118, y - 44, '작업 (실린더로)', { b: 1, c: Wk, size: 15 });
      s += t(R + 104, bot + 44, '배기', { b: 1, c: E, size: 15 }) + t(R - 4, bot + 44, '배기', { a: 'e', b: 1, c: E, size: 15 }) + t(R + 50, bot + 70, '공급', { a: 'm', b: 1, c: P, size: 15 });
      s += t(60, y + S / 2 + 30, '파일럿', { a: 'm', b: 1, c: Pi, size: 15 });
      s += t(240, 300, '홀수 = 공급·배기 · 짝수 = 작업', { a: 'm', b: 1, size: 16 });
      return F.svg(480, 318, s);
    } },

  ncno: { cards: ['상시닫힘(NC)과 상시열림(NO)'],
    cap: '평소 상태는 스프링이 붙은 칸 — NC 는 공급이 막혀 있고, NO 는 이미 통해 있다',
    draw: function () {
      var s = divider(240, 16, 250), S = 58;
      function one(x, nc) {
        var y = 92, R = x + S;
        var g = v32(x, y, S, nc, { hiC: C.orange, flowC: nc ? null : C.green });
        g += line(R + S * 0.5, y, R + S * 0.5, y - 30, { w: 2, c: nc ? C.ink : C.green });
        g += line(R + S * 0.25, y + S, R + S * 0.25, y + S + 30, { w: 2, c: C.blue });
        g += line(R + S * 0.75, y + S, R + S * 0.75, y + S + 18, { w: 2 }) + exh(R + S * 0.75, y + S + 18);
        g += arrow(R + S * 0.25, y + S + 58, R + S * 0.25, y + S + 34, { c: C.blue, w: 2 });
        if (!nc) g += arrow(R + S * 0.5, y - 30, R + S * 0.5, y - 56, { c: C.green, w: 2.4 });
        return g;
      }
      s += head(120, 26, '상시닫힘 NC') + head(360, 26, '상시열림 NO');
      s += one(40, true) + one(280, false);
      s += t(136, 72, '막힘', { b: 1, c: C.red, size: 15 });
      s += t(416, 44, '나간다', { b: 1, c: C.green, size: 15 });
      s += note(120, 240, '눌러야 공기가 나간다') + note(360, 240, '눌러야 끊긴다');
      s += note(240, 272, '주황 칸 = 평소 칸 (스프링이 붙은 쪽)', { c: C.orange, b: 1 });
      return F.svg(480, 290, s);
    } },

  solenoid: { cards: ['조작 방식 읽기'],
    cap: '칸 옆 그림이 조작 방식 — 편솔레노이드는 전기가 끊기면 스프링 쪽으로, 양솔레노이드는 그 자리에 머문다',
    draw: function () {
      var s = '', S = 56;
      function valve(y, dbl) {
        var L = 116, R = L + S, bot = y + S;
        var g = sq(L, y, S) + sq(R, y, S);
        g += ia(L + 28, bot - 3, L + 12, y + 3) + ia(L + 44, y + 3, L + 44, bot - 3) + tee(L + 12, bot, -1);
        g += ia(R + 28, bot - 3, R + 44, y + 3) + ia(R + 12, y + 3, R + 12, bot - 3) + tee(R + 44, bot, -1);
        g += sol(L, y + S / 2, -1, C.blue);
        g += dbl ? sol(R + S, y + S / 2, 1, C.blue) : spr(R + S, y + S / 2, 26, 1, C.green);
        return g;
      }
      s += head(20, 30, '편솔레노이드', { a: 's' }) + valve(48, false);
      s += callout(94, 60, 70, 118, '솔레노이드', { c: C.blue, tc: C.blue, a: 'm', size: 14 });
      s += callout(270, 62, 290, 44, '스프링', { c: C.green, tc: C.green, size: 14 });
      s += t(318, 76, '전기가 끊기면', { size: 14, c: C.sub }) + t(318, 98, '스프링 쪽 칸으로', { b: 1, c: C.green, size: 15 });
      s += hdiv(140);
      s += head(20, 170, '양솔레노이드', { a: 's' }) + valve(188, true);
      s += t(318, 216, '전기가 끊기면', { size: 14, c: C.sub }) + t(318, 238, '그 자리에 머문다', { b: 1, c: C.blue, size: 15 });
      s += note(240, 272, '왼쪽 그림이 움직이면 왼쪽 칸, 오른쪽 그림이면 오른쪽 칸이 된다');
      return F.svg(480, 290, s);
    } },

  center3: { cards: ['5/3 way 밸브 — 가운데 위치가 하는 일'],
    cap: '5/3 way 밸브의 가운데 칸 세 가지 — 모두 막힘 · 작업 포트가 배기로 · 양쪽에 압력',
    draw: function () {
      var s = '', S = 72, Y = 70;
      var nm = ['클로즈드 센터', '엑조스트 센터', '프레셔 센터'], res = ['그 자리에 선다', '힘이 빠져 손으로 밀린다', '양쪽에 압력이 걸린다'];
      for (var k = 0; k < 3; k++) {
        var cx = 80 + k * 160, x = cx - S / 2, bot = Y + S, g = '';
        var p4 = x + 18, p2 = x + 54, p5 = x + 12, p1 = x + 36, p3 = x + 60;
        g += box(x - 26, Y, 26, S, { fill: C.grayL, r: 0, w: 1, c: C.grayM }) + box(x + S, Y, 26, S, { fill: C.grayL, r: 0, w: 1, c: C.grayM });
        g += sq(x, Y, S, { c: C.blue });
        if (k === 0) {
          g += tee(p4, Y, 1) + tee(p2, Y, 1) + tee(p5, bot, -1) + tee(p1, bot, -1) + tee(p3, bot, -1);
        } else if (k === 1) {
          g += tee(p1, bot, -1) + ia(p4, Y + 3, p5, bot - 3, C.sub) + ia(p2, Y + 3, p3, bot - 3, C.sub);
        } else {
          g += ia(p1, bot - 3, p4, Y + 3, C.red) + ia(p1, bot - 3, p2, Y + 3, C.red) + tee(p5, bot, -1) + tee(p3, bot, -1);
        }
        g += line(p4, Y, p4, Y - 14, { w: 1.8 }) + line(p2, Y, p2, Y - 14, { w: 1.8 }) +
          line(p5, bot, p5, bot + 14, { w: 1.8 }) + line(p1, bot, p1, bot + 14, { w: 1.8 }) + line(p3, bot, p3, bot + 14, { w: 1.8 });
        if (k === 0) {
          g += note(p4, Y - 24, '4') + note(p2, Y - 24, '2') + note(p5, bot + 26, '5') + note(p1, bot + 26, '1') + note(p3, bot + 26, '3');
        }
        g += t(cx, 196, nm[k], { a: 'm', b: 1, size: 15 }) + note(cx, 220, res[k], { c: k === 2 ? C.red : C.sub });
        s += g;
      }
      s += note(240, 30, '손을 놓으면 가운데 칸(파란 칸)이 된다', { c: C.blue, b: 1, size: 14 });
      return F.svg(480, 240, s);
    } },

  /* ─────────── 5. 속도 제어 ─────────── */
  oneway: { cards: ['속도는 공기의 양으로 정한다'],
    cap: '일방향 유량 조절 밸브 — 한 방향은 교축을 지나 천천히, 반대 방향은 체크 밸브로 그대로',
    draw: function () {
      var s = '';
      function one(y, fwd) {
        var g = line(40, y, 440, y, { w: 2 });
        g += thrH(200, y, fwd ? C.orange : C.ink);
        g += F.path('M160,' + y + ' V' + (y + 40) + ' H240 V' + y, { w: 1.8 });
        g += checkH(200, y + 40, 'r', fwd ? C.red : C.green);
        g += box(146, y - 24, 108, 80, { fill: 'none', r: 4, w: 1.2, c: C.sub, dash: '5 4' });
        if (fwd) {
          g += arrow(60, y - 14, 128, y - 14, { c: C.blue, w: 3, head: 12 }) + arrow(274, y - 14, 300, y - 14, { c: C.blue, w: 1.6, head: 8 });
          g += t(322, y - 14, '가늘게 → 느리다', { b: 1, c: C.orange, size: 15 });
          g += callout(209, y + 40, 280, y + 46, '체크 — 막힘', { c: C.red, tc: C.red, size: 14 });
        } else {
          g += arrow(420, y - 14, 352, y - 14, { c: C.blue, w: 3, head: 12 }) + arrow(130, y - 14, 60, y - 14, { c: C.blue, w: 3, head: 12 });
          g += arrow(236, y + 28, 172, y + 28, { c: C.green, w: 1.6, head: 8 });
          g += callout(209, y + 40, 280, y + 50, '체크 — 열림', { c: C.green, tc: C.green, size: 14 });
          g += t(26, y - 34, '반대 방향 → 그대로 빠르다', { b: 1, c: C.green, size: 15 });
        }
        return g;
      }
      s += t(26, 30, '이쪽 방향', { b: 1, size: 15 });
      s += one(76, true);
      s += hdiv(148);
      s += one(214, false);
      s += note(240, 290, '교축 밸브만 넣으면 양쪽 다 느려진다 — 체크를 붙여 한쪽만 조인다');
      return F.svg(480, 308, s);
    } },

  meter: { cards: ['미터인 · 미터아웃 — 어느 쪽을 조이는가'],
    cap: '공압의 미터 인과 미터 아웃 — 전진할 때 들어가는 공기를 조이느냐, 나오는 공기를 조이느냐',
    draw: function () {
      var s = '';
      function panel(y, out) {
        var g = head(20, y, out ? '미터 아웃 — 나오는 쪽을 조인다' : '미터 인 — 들어가는 쪽을 조인다', { a: 's', c: out ? C.green : C.red });
        var cy = y + 22;
        g += cylSym(90, cy, 230, 40, 150, 380, { fill: out ? C.paper : C.paper });
        if (!out) g += box(92, cy + 2, 56, 36, { fill: C.redL, r: 0, w: 0, c: 'none' }) + box(150, cy, 8, 40, { fill: C.ink, r: 0, w: 1 });
        else g += box(160, cy + 2, 158, 36, { fill: C.greenL, r: 0, w: 0, c: 'none' }) + box(150, cy, 8, 40, { fill: C.ink, r: 0, w: 1 }) +
          line(158, cy + 20, 380, cy + 20, { w: 4 });
        var ay = cy + 40, fy = cy + 86;
        g += line(110, ay, 110, fy - 30, { w: 2, c: C.blue }) + line(300, ay, 300, fy - 30, { w: 2, c: C.sub });
        if (!out) g += fcV(110, fy, false, C.orange) + line(300, fy - 30, 300, fy + 30, { w: 2, c: C.sub });
        else g += line(110, fy - 30, 110, fy + 30, { w: 2, c: C.blue }) + fcV(300, fy, true, C.orange);
        g += arrow(80, fy + 26, 80, fy - 20, { c: C.blue, w: 2.2 }) + t(70, fy + 2, '공급', { a: 'e', b: 1, c: C.blue, size: 14 });
        g += arrow(360, fy - 20, 360, fy + 26, { c: C.sub, w: 2.2 }) + t(370, fy + 2, '배기', { b: 1, c: C.sub, size: 14 });
        g += arrow(330, cy - 10, 400, cy - 10, { c: C.ink, w: 1.8, head: 9 });
        g += t(out ? 90 : 90, fy + 52, out ? '나가는 공기가 뒤에서 버텨 준다 → 속도가 고르다' : '앞쪽 공기가 눌린 채 → 부하가 사라지면 튀어 나간다',
          { b: 1, size: 14, c: out ? C.green : C.red });
        return g;
      }
      s += panel(24, false) + hdiv(196) + panel(222, true);
      return F.svg(480, 400, s);
    } },

  quickexh: { cards: ['더 빠르게 — 급속 배기 밸브'],
    cap: '급속 배기 밸브 — 실린더의 공기를 방향제어밸브까지 되돌리지 않고 그 자리에서 바로 내보낸다',
    draw: function () {
      var s = divider(240, 16, 272);
      function panel(ox, q) {
        var g = head(ox + 112, 28, q ? '급속 배기 밸브' : '없을 때', { c: q ? C.green : C.ink });
        g += cylSym(ox + 26, 52, 170, 36, ox + 120, ox + 222);
        g += arrow(ox + 196, 104, ox + 150, 104, { c: C.sub, w: 1.6, head: 9 }) + note(ox + 144, 104, '후진', { a: 'e' });
        g += sq(ox + 34, 180, 40) + sq(ox + 74, 180, 40);
        g += note(ox + 120, 200, '방향제어밸브', { a: 's' });
        if (!q) {
          g += F.poly([[ox + 50, 88], [ox + 50, 180]], { w: 3.4, c: C.orange });
          g += line(ox + 50, 220, ox + 50, 230, { w: 2 }) + exh(ox + 50, 230, C.orange);
          g += arrow(ox + 36, 124, ox + 36, 164, { c: C.orange, w: 1.6, head: 9 });
          g += t(ox + 62, 134, '밸브까지 먼 길', { b: 1, c: C.orange, size: 14 });
          g += t(ox + 50, 262, '밸브 배기구로 나간다', { b: 1, c: C.orange, size: 14 });
        } else {
          g += line(ox + 50, 88, ox + 50, 104, { w: 3.4, c: C.orange });
          g += box(ox + 30, 104, 40, 28, { fill: C.greenL, c: C.green, r: 3 }) + F.circle(ox + 50, 118, 6, { fill: C.paper, w: 1.4 });
          g += line(ox + 50, 132, ox + 50, 180, { w: 2, c: C.sub, dash: '5 4' });
          g += arrow(ox + 72, 118, ox + 132, 118, { c: C.orange, w: 2.6 });
          g += t(ox + 106, 142, '그 자리에서 바로', { b: 1, c: C.orange, size: 14 });
          g += t(ox + 110, 262, '길이 짧아 빨라진다', { a: 'm', b: 1, c: C.green, size: 14 });
        }
        return g;
      }
      s += panel(8, false) + panel(248, true);
      return F.svg(480, 282, s);
    } },

  /* ─────────── 6. 압력 제어와 논리 밸브 ─────────── */
  seqv: { cards: ['압력제어밸브 네 가지'],
    cap: '시퀀스 밸브 — A 가 끝까지 가서 압력이 설정값에 이르면 그제야 B 쪽 길이 열린다',
    draw: function () {
      var s = '';
      /* 실린더 A · B (세로, 로드가 위) */
      function vcyl(x, ext) {
        var py = ext ? 76 : 146;
        return box(x, 70, 44, 90, { fill: C.paper, r: 2, w: 2 }) +
          box(x, py, 44, 8, { fill: C.ink, r: 0, w: 1 }) + line(x + 22, py, x + 22, ext ? 30 : 58, { w: 4 });
      }
      s += vcyl(60, true) + vcyl(356, false);
      s += t(114, 124, 'A 고정', { b: 1 }) + t(346, 124, 'B 가공', { a: 'e', b: 1 });
      /* 공급관 — A 로 곧장, B 로는 시퀀스 밸브를 지나서 */
      s += arrow(14, 250, 40, 250, { c: C.blue, w: 2.4 }) + note(24, 272, '공급');
      s += line(40, 250, 299, 250, { w: 2.2, c: C.blue }) + line(82, 250, 82, 160, { w: 2.2, c: C.blue });
      s += '<circle cx="82" cy="250" r="3.5" fill="' + C.ink + '"/>';
      var vx = 280, vy = 190, S = 38, mx = vx + S / 2;
      s += line(mx, 250, mx, vy + S, { w: 2.2, c: C.blue });
      s += sq(vx, vy, S) + ia(vx + 10, vy + S - 3, vx + 10, vy + 3) + spr(vx + S, vy + S / 2, 18, 1);
      s += F.poly([[mx, vy + S + 10], [vx - 12, vy + S + 10], [vx - 12, vy + S / 2], [vx, vy + S / 2]], { w: 1.4, dash: '4 3', c: C.orange });
      s += F.poly([[mx, vy], [mx, 176], [378, 176], [378, 160]], { w: 2.2, c: C.green });
      s += t(262, 200, '시퀀스\n밸브', { a: 'e', b: 1, size: 14 });
      s += F.num(130, 58, '1', { c: C.blue }) + note(146, 58, 'A 가 먼저 나간다', { a: 's' });
      s += F.num(150, 230, '2', { c: C.orange }) + t(166, 230, '압력이 오른다', { b: 1, size: 14, c: C.orange });
      s += F.num(352, 206, '3', { c: C.green }) + t(368, 206, '열린다', { b: 1, size: 14, c: C.green });
      s += F.num(300, 40, '4', { c: C.green }) + note(316, 40, 'B 가 나간다', { a: 's' });
      s += note(240, 290, '순서를 압력으로 만든다 (리밋 밸브는 위치로 만든다)');
      return F.svg(480, 308, s);
    } },

  pilot: { cards: ['릴리프와 감압을 헷갈리지 않는 법 — 점선을 보라'],
    cap: '릴리프는 들어오는 쪽 압력을, 감압은 나가는 쪽 압력을 점선(파일럿)으로 보고 있다',
    draw: function () {
      var s = divider(240, 16, 262), S = 70;
      function pv(ox, relief) {
        var x = ox + 70, y = 90, bot = y + S, mx = x + S / 2;
        var g = head(ox + 110, 28, relief ? '릴리프 밸브' : '감압 밸브');
        g += sq(x, y, S);
        g += relief ? ia(x + 18, bot - 4, x + 18, y + 4) : ia(mx, bot - 4, mx, y + 4, C.green);
        g += line(mx, bot, mx, bot + 34, { w: 2 }) + line(mx, y, mx, y - 30, { w: 2 });
        g += spr(x + S, y + S / 2, 24, 1);
        var py = relief ? bot + 18 : y - 16;
        g += F.poly([[mx, py], [x - 22, py], [x - 22, y + S / 2], [x, y + S / 2]], { w: 2, dash: '5 4', c: C.orange });
        g += '<circle cx="' + mx + '" cy="' + py + '" r="3.5" fill="' + C.orange + '"/>';
        g += arrow(mx + 22, bot + 32, mx + 22, bot + 6, { c: C.blue, w: 1.8, head: 9 }) + note(mx + 30, bot + 22, '입구', { a: 's' });
        g += note(mx + 12, y - 22, '출구', { a: 's' });
        g += t(ox + 110, 228, relief ? '입구 압력을 본다' : '출구 압력을 본다', { a: 'm', b: 1, c: C.orange, size: 15 });
        g += note(ox + 110, 252, relief ? '평소 닫힘 — 넘치면 연다' : '평소 열림 — 높으면 조인다', { c: relief ? C.ink : C.green, b: 1 });
        return g;
      }
      s += pv(10, true) + pv(250, false);
      return F.svg(480, 272, s);
    } },

  shuttle: { cards: ['셔틀 밸브 — 공기로 만드는 OR 과 AND'],
    cap: '셔틀 밸브의 속 — 고압 우선형은 한쪽만 와도 나가고(OR), 2압 밸브는 한쪽만 오면 스스로 막는다(AND)',
    draw: function () {
      var s = divider(240, 16, 262);
      /* 몸통 — 가로 관 + 가운데 위 출구 A */
      function body(ox) {
        return box(ox + 20, 110, 180, 44, { fill: C.grayL, r: 4, w: 2 }) +
          F.path('M' + (ox + 100) + ',110 V70 M' + (ox + 120) + ',110 V70', { w: 2 }) +
          line(ox - 4, 124, ox + 20, 124, { w: 2 }) + line(ox - 4, 140, ox + 20, 140, { w: 2 }) +
          line(ox + 200, 124, ox + 224, 124, { w: 2 }) + line(ox + 200, 140, ox + 224, 140, { w: 2 });
      }
      /* OR */
      s += head(120, 28, '고압 우선형 = OR');
      s += body(10);
      s += F.path('M200,114 L208,124 M200,150 L208,140', { w: 2 });
      s += F.circle(198, 132, 14, { fill: C.sub, w: 1.4 });
      s += arrow(0, 132, 60, 132, { c: C.blue, w: 3, head: 12 }) + t(10, 104, 'X 신호', { b: 1, c: C.blue, size: 14 });
      s += F.route([[80, 132], [120, 132], [120, 52]], { c: C.blue, w: 2.4 }) + t(134, 58, 'A 나감', { b: 1, c: C.green, size: 14 });
      s += t(214, 104, 'Y', { b: 1, size: 14, c: C.sub, a: 'm' });
      s += callout(190, 146, 150, 190, '볼이 Y 를 막는다', { a: 'm', size: 13 });
      s += note(120, 232, 'X 만 와도 · Y 만 와도 나간다', { b: 1, c: C.green });
      /* AND — 2압 밸브: 안쪽 시트 둘, 양 끝에 원판이 달린 스풀 */
      var ox = 250;
      s += head(360, 28, '2압 밸브 = AND');
      s += body(ox);
      s += box(ox + 78, 110, 6, 14, { fill: C.ink, r: 0, w: 0 }) + box(ox + 78, 140, 6, 14, { fill: C.ink, r: 0, w: 0 }) +
        box(ox + 136, 110, 6, 14, { fill: C.ink, r: 0, w: 0 }) + box(ox + 136, 140, 6, 14, { fill: C.ink, r: 0, w: 0 });
      s += line(ox + 72, 132, ox + 162, 132, { w: 3, c: C.sub });
      s += box(ox + 66, 116, 10, 32, { fill: C.sub, r: 1, w: 1 }) + box(ox + 158, 116, 10, 32, { fill: C.sub, r: 1, w: 1 });
      s += arrow(ox - 10, 132, ox + 50, 132, { c: C.blue, w: 3, head: 12 }) + t(ox, 104, 'X 신호', { b: 1, c: C.blue, size: 14 });
      s += t(ox + 214, 104, 'Y', { b: 1, size: 14, c: C.sub, a: 'm' });
      s += t(ox + 110, 58, 'A 안 나감', { a: 'm', b: 1, c: C.red, size: 14 });
      s += callout(ox + 71, 148, ox + 110, 190, 'X 쪽 길을 스스로 막는다', { a: 'm', size: 13 });
      s += note(360, 232, 'X 와 Y 가 둘 다 와야 나간다', { b: 1, c: C.green });
      return F.svg(480, 272, s);
    } },

  /* ─────────── 7. 공기압 회로 ─────────── */
  logic: { cards: ['공기로 만드는 판단 — 논리 회로 다섯'],
    cap: '직렬이냐 병렬이냐가 전부다 — 밸브 둘을 직렬로 이으면 AND, 병렬로 이으면 OR',
    draw: function () {
      var s = '';
      function vb(x, y, l) {
        return box(x, y, 50, 36, { fill: C.paper, r: 2, w: 1.8, label: l, size: 16 }) + line(x, y + 18, x - 8, y + 18, { w: 1.6 }) +
          box(x - 16, y + 11, 8, 14, { fill: C.paper, r: 1, w: 1.6 });
      }
      s += head(20, 30, 'AND — 직렬', { a: 's' }) + note(470, 30, '둘 다 눌러야 나간다', { a: 'e', b: 1, c: C.blue });
      s += pumpSym(44, 90, 16, false);
      s += line(60, 90, 140, 90, { w: 2.2, c: C.blue }) + vb(140, 72, 'A') + line(190, 90, 270, 90, { w: 2.2, c: C.blue }) + vb(270, 72, 'B');
      s += arrow(320, 90, 450, 90, { w: 2.2, c: C.blue }) + note(390, 72, '출력', { b: 1 });
      s += hdiv(134);
      s += head(20, 164, 'OR — 병렬', { a: 's' }) + note(470, 164, '하나만 눌러도 나간다', { a: 'e', b: 1, c: C.blue });
      s += pumpSym(44, 244, 16, false);
      s += F.poly([[60, 244], [100, 244]], { w: 2.2, c: C.blue }) + F.poly([[100, 206], [100, 282]], { w: 2.2, c: C.blue });
      s += line(100, 206, 170, 206, { w: 2.2, c: C.blue }) + vb(170, 188, 'A') + line(100, 282, 170, 282, { w: 2.2, c: C.blue }) + vb(170, 264, 'B');
      s += F.poly([[220, 206], [300, 206], [300, 230]], { w: 2.2, c: C.blue }) + F.poly([[220, 282], [300, 282], [300, 258]], { w: 2.2, c: C.blue });
      s += box(286, 230, 28, 28, { fill: C.paper, r: 3, w: 1.8 }) + F.circle(300, 244, 6, { fill: C.sub, w: 1 });
      s += callout(314, 236, 348, 212, '셔틀 밸브', { size: 14 });
      s += arrow(314, 244, 450, 244, { w: 2.2, c: C.blue }) + note(390, 262, '출력', { b: 1 });
      return F.svg(480, 306, s);
    } },

  ff: { cards: ['기억하는 회로 — 플립플롭'],
    cap: '플립플롭 — 신호 A 를 잠깐 주면 켜지고, 신호 B 를 줄 때까지 출력이 그대로 남는다',
    draw: function () {
      var s = '', x0 = 110, x1 = 460;
      function lane(y, name, c) {
        return t(20, y - 12, name, { b: 1, c: c, size: 15 }) + line(x0, y, x1, y, { c: C.grayM, w: 1.2 });
      }
      s += lane(70, '신호 A', C.blue) + lane(140, '신호 B', C.red) + lane(222, '출력', C.green);
      s += F.poly([[x0, 70], [150, 70], [150, 40], [190, 40], [190, 70], [x1, 70]], { c: C.blue, w: 2.6 });
      s += F.poly([[x0, 140], [330, 140], [330, 110], [370, 110], [370, 140], [x1, 140]], { c: C.red, w: 2.6 });
      s += F.poly([[x0, 222], [150, 222], [150, 180], [330, 180], [330, 222], [x1, 222]], { c: C.green, w: 3 });
      s += box(190, 176, 140, 8, { fill: C.greenL, r: 2, w: 0, c: 'none' });
      s += line(150, 30, 150, 236, { c: C.sub, w: 1, dash: '4 3' }) + line(330, 30, 330, 236, { c: C.sub, w: 1, dash: '4 3' });
      s += t(260, 164, '손을 떼도 유지', { a: 'm', b: 1, c: C.green, size: 15 });
      s += note(170, 26, '잠깐', { a: 'm' }) + note(350, 96, '잠깐', { a: 'm' });
      s += arrow(x0, 258, x1, 258, { c: C.sub, w: 1.4, head: 9 }) + note(x1 - 10, 276, '시간', { a: 'e' });
      return F.svg(480, 290, s);
    } },

  hold: { cards: ['전기로 기억하기 — 자기 유지 회로'],
    cap: '자기 유지 회로(OFF 우선) — ON 버튼과 나란히 붙은 K 접점이 손을 뗀 뒤에도 전류 길을 잡아 준다',
    draw: function () {
      var s = '', L = 34, R = 446, y1 = 80, y2 = 156, J = 200;
      /* a접점: | |  ·  b접점: |/| */
      function aC(x, y, c) { return line(x - 8, y - 13, x - 8, y + 13, { w: 2.2, c: c }) + line(x + 8, y - 13, x + 8, y + 13, { w: 2.2, c: c }); }
      function bC(x, y, c) { return aC(x, y, c) + line(x - 14, y + 13, x + 14, y - 13, { w: 1.8, c: c }); }
      var G = C.green;
      s += line(L, 40, L, 196, { w: 3 }) + line(R, 40, R, 196, { w: 3 });
      /* 1단 : 모선 ─ ON ─ J ─ OFF ─ K 코일 ─ 모선 */
      s += line(L, y1, 102, y1, { w: 2 }) + aC(110, y1) + line(118, y1, J, y1, { w: 2 });
      s += line(J, y1, 272, y1, { w: 2, c: G }) + bC(280, y1, G) + line(288, y1, 364, y1, { w: 2, c: G });
      s += F.circle(384, y1, 20, { fill: C.greenL, c: G, w: 2.2 }) + t(384, y1 + 1, 'K', { a: 'm', b: 1, size: 17, halo: false });
      s += line(404, y1, R, y1, { w: 2, c: G });
      /* 2단 : K 접점 — ON 과 병렬 */
      s += line(L, y2, 102, y2, { w: 2, c: G }) + aC(110, y2, G) + F.poly([[118, y2], [J, y2], [J, y1]], { w: 2, c: G });
      s += '<circle cx="' + J + '" cy="' + y1 + '" r="4" fill="' + C.ink + '"/>';
      s += t(110, 44, 'ON (기동)', { a: 'm', b: 1, size: 15 }) + t(280, 44, 'OFF (정지)', { a: 'm', b: 1, size: 15 });
      s += t(384, 44, '릴레이', { a: 'm', size: 13, c: C.sub });
      s += t(110, 190, 'K 접점', { a: 'm', b: 1, size: 15, c: G });
      s += F.route([[150, 146], [184, 146], [184, 102]], { c: G, w: 2, head: 9, flow: true });
      s += t(236, 150, '손을 뗀 뒤 전류 길', { b: 1, c: G, size: 14, a: 's' });
      s += note(240, 226, 'OFF 가 두 길 모두와 직렬 → 두 버튼을 함께 누르면 정지가 이긴다');
      return F.svg(480, 244, s);
    } },

  delay: { cards: ['늦게 보내기 — 시간 지연 회로'],
    cap: '시간 지연 밸브 — 교축으로 가늘게 채운 탱크의 압력이 차오르면 그제야 3/2 밸브가 넘어간다',
    draw: function () {
      var s = '';
      s += arrow(14, 70, 44, 70, { c: C.blue, w: 2.2 }) + t(28, 46, '신호', { a: 'm', b: 1, size: 14, c: C.blue });
      s += line(44, 70, 140, 70, { w: 2 }) + thrH(92, 70, C.orange);
      s += t(92, 104, '교축', { a: 'm', b: 1, size: 15, c: C.orange });
      s += box(140, 46, 88, 48, { fill: C.blueL, c: C.blue, r: 16 }) + t(184, 70, '탱크', { a: 'm', b: 1, halo: false });
      s += F.poly([[228, 70], [262, 70]], { w: 1.6, dash: '5 4' });
      s += F.poly([[262, 62], [262, 78], [276, 70]], { close: 1, fill: C.paper, w: 1.4 });
      s += sq(276, 42, 56) + sq(332, 42, 56) + spr(388, 70, 20, 1);
      s += ia(290, 95, 304, 45) + tee(318, 98, -1) + ia(360, 45, 374, 95) + tee(346, 98, -1);
      s += line(360, 42, 360, 20, { w: 2 }) + arrow(360, 42, 360, 14, { c: C.green, w: 2.2 }) + t(372, 20, '출력', { b: 1, c: C.green, size: 14 });
      s += line(346, 98, 346, 118, { w: 2 }) + note(346, 130, '공급');
      /* 그래프 */
      var gx = 70, gy = 272, gw = 380;
      s += arrow(gx, gy, gx + gw, gy, { c: C.sub, w: 1.4, head: 9 }) + arrow(gx, gy, gx, 150, { c: C.sub, w: 1.4, head: 9 });
      s += note(gx + gw - 4, gy + 18, '시간', { a: 'e' }) + t(gx - 8, 160, '탱크\n압력', { a: 'e', size: 13, c: C.sub });
      s += line(gx, 190, gx + gw - 10, 190, { c: C.red, w: 1.4, dash: '6 4' }) + t(gx + 8, 180, '전환 압력', { size: 13, c: C.red, b: 1 });
      s += F.path('M' + gx + ',' + gy + ' C' + (gx + 90) + ',' + (gy - 40) + ' ' + (gx + 190) + ',' + 186 + ' ' + (gx + 360) + ',' + 168, { c: C.blue, w: 2.6 });
      s += line(gx + 212, 190, gx + 212, gy, { c: C.green, w: 1.4, dash: '4 3' });
      s += arrow(gx + 4, gy - 16, gx + 208, gy - 16, { c: C.green, w: 1.4, head: 8, both: true }) + t(gx + 106, gy - 30, '지연 시간', { a: 'm', b: 1, c: C.green, size: 14 });
      return F.svg(480, 298, s);
    } },

  recip: { cards: ['혼자 왔다 갔다 하게 — 자동 왕복 회로'],
    cap: '자동 왕복 — 전진 끝의 리밋 2 가 후진 신호, 후진 끝의 리밋 1 이 전진 신호가 되어 서로를 부른다',
    draw: function () {
      var s = '';
      s += cylSym(24, 100, 200, 46, 120, 350);
      s += box(346, 100, 16, 22, { fill: C.orangeL, c: C.orange, r: 2, w: 1.4 });
      s += arrow(372, 150, 420, 150, { c: C.ink, w: 1.6, head: 9 }) + note(396, 168, '전진 중');
      function ls(x, lbl, c) {
        return box(x - 20, 42, 40, 26, { fill: C.paper, r: 2, w: 1.8 }) + line(x, 68, x, 80, { w: 1.8 }) +
          F.circle(x, 88, 8, { fill: C.paper, w: 1.8 }) + t(x, 26, lbl, { a: 'm', b: 1, size: 15, c: c });
      }
      s += ls(262, '리밋 1', C.blue) + ls(440, '리밋 2', C.red);
      s += callout(354, 100, 316, 78, '도그', { size: 13, a: 'e' });
      s += F.num(28, 214, '1', { c: C.red }) + t(46, 214, '전진 끝 — 도그가 리밋 2 를 누른다 → 후진 신호', { b: 1, size: 14, c: C.red });
      s += F.num(28, 248, '2', { c: C.blue }) + t(46, 248, '후진 끝 — 도그가 리밋 1 을 누른다 → 전진 신호', { b: 1, size: 14, c: C.blue });
      s += note(240, 284, '서로가 서로를 부르며, 시동 신호가 있는 동안 계속 왕복한다');
      return F.svg(480, 302, s);
    } },

  /* ─────────── 9. 유압 회로 ─────────── */
  setp: { cards: ['유압 회로의 출발점 — 압력 설정 회로'],
    cap: '압력 설정 회로 — 압력이 설정값을 넘으면 릴리프 밸브가 열려 남는 기름을 탱크로 보낸다',
    draw: function () {
      var s = '';
      s += tank(70, 244, 70) + line(105, 244, 105, 214, { w: 2 });
      s += pumpSym(105, 196, 18, true) + line(87, 196, 70, 196, { w: 2, dash: '2 3' }) + motorM(56, 196);
      s += line(105, 178, 105, 70, { w: 2.4, c: C.blue });
      s += line(105, 70, 440, 70, { w: 2.4, c: C.blue }) + arrow(400, 70, 450, 70, { c: C.blue, w: 2.4 });
      s += t(420, 50, '회로로', { a: 'm', b: 1, c: C.blue });
      s += '<circle cx="105" cy="120" r="4" fill="' + C.ink + '"/>' + line(105, 120, 170, 120, { w: 2 }) + gauge(188, 120, 18);
      s += '<circle cx="105" cy="70" r="4" fill="' + C.ink + '"/>';
      /* 릴리프 밸브 */
      var vx = 280, vy = 110, S = 56, mx = vx + S / 2;
      s += F.poly([[250, 70], [250, 80], [mx, 80], [mx, vy]], { w: 2.2, c: C.blue });
      s += '<circle cx="250" cy="70" r="4" fill="' + C.ink + '"/>';
      s += sq(vx, vy, S) + ia(vx + 14, vy + 3, vx + 14, vy + S - 3) + spr(vx + S, vy + S / 2, 22, 1);
      s += F.poly([[mx, vy - 10], [vx - 16, vy - 10], [vx - 16, vy + S / 2], [vx, vy + S / 2]], { w: 1.6, dash: '4 3', c: C.orange });
      s += line(mx, vy + S, mx, 244, { w: 2.4, c: C.orange }) + tank(mx - 30, 244, 60);
      s += arrow(mx + 22, 190, mx + 22, 232, { c: C.orange, w: 2.2 }) + t(mx + 32, 206, '넘치면\n탱크로', { b: 1, c: C.orange, size: 14 });
      s += t(105, 280, '펌프', { a: 'm', b: 1 }) + t(214, 120, '압력계', { b: 1, size: 14 });
      s += t(mx + 50, 132, '릴리프\n밸브', { b: 1, size: 15 });
      s += t(56, 226, '전동기', { a: 'm', size: 13, c: C.sub });
      return F.svg(480, 298, s);
    } },

  unload: { cards: ['일을 쉴 때 — 펌프 무부하 회로'],
    cap: '일을 쉴 때 — 높은 압력으로 릴리프에 버리면 열이 되고, 탠덤 센터 중립이면 낮은 압력으로 탱크에 돌아간다',
    draw: function () {
      var s = divider(240, 16, 282);
      /* 왼쪽 — 릴리프로 버림 */
      s += head(120, 28, '릴리프로 버린다', { c: C.red });
      s += tank(60, 250, 50) + line(85, 250, 85, 226, { w: 2 }) + pumpSym(85, 210, 16, true);
      s += line(85, 194, 85, 90, { w: 3, c: C.red });
      s += tee(85, 90, -1) + note(98, 72, '실린더는 멈춰 있다', { a: 's' });
      var vx = 150, vy = 120, S = 46, mx = vx + S / 2;
      s += '<circle cx="85" cy="100" r="4" fill="' + C.ink + '"/>' + F.poly([[85, 100], [mx, 100], [mx, vy]], { w: 3, c: C.red });
      s += sq(vx, vy, S) + ia(vx + 12, vy + 3, vx + 12, vy + S - 3, C.red) + spr(vx + S, vy + S / 2, 16, 1);
      s += line(mx, vy + S, mx, 250, { w: 3, c: C.red }) + tank(mx - 25, 250, 50);
      s += t(120, 296 - 8, '높은 압력 그대로 → 열', { a: 'm', b: 1, c: C.red, size: 15 });
      /* 오른쪽 — 탠덤 센터 */
      var ox = 250;
      s += head(360, 28, '탠덤 센터 중립', { c: C.green });
      var x = ox + 74, y = 96, W = 64;
      s += box(x - 40, y, 40, W, { fill: C.grayL, r: 0, w: 1, c: C.grayM }) + box(x + W, y, 40, W, { fill: C.grayL, r: 0, w: 1, c: C.grayM });
      s += sq(x, y, W, { c: C.green });
      var pA = x + 16, pB = x + 48;
      s += tee(pA, y, 1) + tee(pB, y, 1);
      s += F.poly([[pA, y + W], [pA, y + 40], [pB, y + 40], [pB, y + W]], { w: 2.4, c: C.green });
      s += line(pA, y, pA, y - 20, { w: 1.8 }) + line(pB, y, pB, y - 20, { w: 1.8 });
      s += note(pA, y - 30, 'A') + note(pB, y - 30, 'B');
      s += line(pA, y + W, pA, 196, { w: 2.4, c: C.green }) + pumpSym(pA, 212, 16, true) + line(pA, 228, pA, 250, { w: 2 }) + tank(pA - 24, 250, 48);
      s += line(pB, y + W, pB, 250, { w: 2.4, c: C.green });
      s += tank(pB - 4, 250, 40);
      s += note(pA - 12, y + W + 16, 'P', { a: 'e' }) + note(pB + 12, y + W + 16, 'T', { a: 's' });
      s += t(360, 288, 'P → T 낮은 압력으로 돌아간다', { a: 'm', b: 1, c: C.green, size: 15 });
      return F.svg(480, 306, s);
    } },

  speed3: { cards: ['유압의 속도 제어 세 가지'],
    cap: '유량 조절 밸브를 어디에 두는가 — 들어가는 쪽(미터 인) · 나오는 쪽(미터 아웃) · 옆으로 빼는 쪽(블리드 오프). 릴리프·방향제어밸브는 생략',
    draw: function () {
      var s = divider(160, 20, 300) + divider(320, 20, 300);
      var nm = ['미터 인', '미터 아웃', '블리드 오프'], use = ['밀어 누르는 부하', '끌어당기는 부하', '하중이 안정된 곳'];
      var cc = [C.blue, C.green, C.purple];
      for (var k = 0; k < 3; k++) {
        var ox = k * 160, g = '';
        g += head(ox + 80, 26, nm[k], { c: cc[k] });
        g += cylSym(ox + 22, 48, 110, 30, ox + 60, ox + 150);
        var inX = ox + 34, outX = ox + 120;
        /* 펌프 · 탱크 */
        g += pumpSym(inX, 250, 14, true) + tank(inX - 16, 270, 32) + line(inX, 264, inX, 270, { w: 1.6 });
        g += tank(outX - 12, 270, 24);
        if (k === 0) {
          g += line(inX, 78, inX, 110, { w: 2, c: C.blue }) + fcV(inX, 140, false, C.orange) + line(inX, 170, inX, 236, { w: 2, c: C.blue });
          g += line(outX, 78, outX, 270, { w: 2 });
        } else if (k === 1) {
          g += line(inX, 78, inX, 236, { w: 2, c: C.blue });
          g += line(outX, 78, outX, 110, { w: 2 }) + fcV(outX, 140, true, C.orange) + line(outX, 170, outX, 270, { w: 2 });
        } else {
          g += line(inX, 78, inX, 236, { w: 2, c: C.blue });
          g += '<circle cx="' + inX + '" cy="196" r="3.5" fill="' + C.ink + '"/>';
          g += F.poly([[inX, 196], [ox + 80, 196], [ox + 80, 270]], { w: 2, c: C.orange }) + thrV(ox + 80, 232, C.orange);
          g += line(outX, 78, outX, 270, { w: 2 });
          g += tank(ox + 66, 270, 28);
        }
        g += note(ox + 80, 306, use[k], { b: 1, c: cc[k] });
        s += g;
      }
      s += note(240, 336, '남는 기름 — 미터 인·아웃은 릴리프로, 블리드 오프는 곧장 탱크로');
      return F.svg(480, 354, s);
    } },

  backp: { cards: ['왜 미터 아웃이 폭주를 막는가'],
    cap: '인장 하중에는 미터 아웃 — 나오는 쪽을 조이면 로드 쪽에 배압이 생겨 부하를 뒤에서 붙잡는다',
    draw: function () {
      var s = '';
      /* 세운 실린더 — 로드가 아래, 매달린 부하 */
      var x = 150, y = 40, w = 90, h = 150, py = 90;
      s += box(x, y, w, h, { fill: C.paper, r: 2, w: 2.2 });
      s += box(x + 2, y + 2, w - 4, py - y - 2, { fill: C.blueL, r: 0, w: 0, c: 'none' });
      s += box(x + 2, py + 10, w - 4, y + h - py - 12, { fill: C.orangeL, r: 0, w: 0, c: 'none' });
      s += box(x, py, w, 10, { fill: C.ink, r: 0, w: 1 }) + line(x + w / 2, py + 10, x + w / 2, 240, { w: 6 });
      s += box(x + 10, 240, 70, 44, { fill: C.grayM, r: 3, w: 1.6, label: '부하', size: 15 });
      s += arrow(x + w / 2, 290, x + w / 2, 318, { c: C.red, w: 3, head: 13 }) + t(x + w / 2 + 14, 306, '부하가 당긴다', { b: 1, c: C.red, size: 14 });
      /* 들어가는 쪽 (위) */
      s += F.poly([[x + 20, y], [x + 20, 20], [60, 20]], { w: 2, c: C.blue }) + arrow(40, 20, 60, 20, { c: C.blue, w: 1.8, head: 9 });
      s += t(40, 42, '들어간다', { a: 'm', size: 13, c: C.blue, b: 1 });
      /* 나오는 쪽 (아래) — 조임 */
      s += F.poly([[x + w, 176], [340, 176], [340, 196]], { w: 2 }) + fcV(340, 226, true, C.orange) + line(340, 256, 340, 284, { w: 2 }) + tank(324, 284, 32);
      s += t(386, 226, '조임', { b: 1, c: C.orange });
      s += callout(x + 60, 150, 290, 120, '배압', { b: 1, c: C.orange, tc: C.orange });
      s += t(290, 96, '뒤에서 붙잡는다', { size: 14, c: C.orange });
      return F.svg(480, 330, s);
    } },

  compress: { cards: ['같은 미터 인인데 공압에서는 왜 튈까'],
    cap: '공기는 눌렸다가 스프링처럼 튀고(압축성), 기름은 거의 눌리지 않아 그대로 잡힌다(비압축성)',
    draw: function () {
      var s = '';
      function row(y, air) {
        var g = head(20, y - 8, air ? '공기 — 눌린다' : '기름 — 안 눌린다', { a: 's', c: air ? C.red : C.blue });
        g += box(40, y + 10, 250, 60, { fill: C.paper, r: 3, w: 2.2 });
        if (air) {
          g += spr(44, y + 40, 150, 1, C.red, 16);
          for (var i = 0; i < 9; i++) g += '<circle cx="' + (58 + i * 16) + '" cy="' + (y + 22 + (i % 3) * 18) + '" r="2.6" fill="' + C.blue + '"/>';
        } else {
          g += box(42, y + 12, 152, 56, { fill: C.blueL, r: 0, w: 0, c: 'none' });
        }
        g += box(194, y + 10, 10, 60, { fill: C.ink, r: 0, w: 1 }) + line(204, y + 40, 360, y + 40, { w: 5 });
        g += arrow(420, y + 40, 364, y + 40, { c: C.sub, w: 2.4 }) + t(430, y + 28, '부하', { size: 14, c: C.sub, b: 1 });
        g += t(250, y + 94, air ? '부하가 사라지면 → 튀어 나간다 (급진)' : '부하가 변해도 → 속도가 그대로', { a: 'm', b: 1, size: 14, c: air ? C.red : C.blue });
        return g;
      }
      s += row(34, true) + hdiv(150) + row(184, false);
      return F.svg(480, 308, s);
    } }

  };
}());
