/* ══════════════════════════════════════════════════════════════
   공유압 마스터 — 회로 실습 (조립하면 실린더가 실제로 움직인다)

   sequence-plc-master 의 「회로를 짜서 돌려 본다」 방식을 공압으로 옮긴 것이다.
   부품을 골라 슬롯에 넣고 [운전] 을 누르면, 고른 부품 그대로 동작한다.
   틀린 부품을 넣어도 그 부품대로 움직여 준다 — 왜 안 되는지를 눈으로 보게 하려는 것이다.

   근거 : NCS 1503010116_16v4 공기압장치조립
          2.1 작업표준서에 따라 공기압장치 부품의 지정된 위치를 파악하고 정확히 조립할 수 있다.
          3.2 조립된 공기압장치를 구동하기 위하여 동작 상태를 확인하고 이상 발생 시 수정하여 조립할 수 있다.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── 실습에 쓰는 부품 (도감의 일부 + 실습용 조합) ──────── */
  var PARTS = {
    'v22':      { n: '2/2 way 밸브',        sym: 'v22' },
    'v32nc':    { n: '3/2 way 밸브 (NC)',   sym: 'v32nc' },
    'v32no':    { n: '3/2 way 밸브 (NO)',   sym: 'v32no' },
    'v42':      { n: '4/2 way 밸브',        sym: 'v42' },
    'v52':      { n: '5/2 way 밸브',        sym: 'v52' },
    'cylS':     { n: '단동 실린더',          sym: 'cyl-s-pull' },
    'cylD':     { n: '복동 실린더',          sym: 'cyl-d' },
    'none':     { n: '아무것도 넣지 않음',    sym: null },
    'throttle': { n: '교축 밸브',            sym: 'throttle' },
    'meterIn':  { n: '일방향 유량 조절 밸브 — 들어가는 쪽에 붙임', sym: 'flowctl-one' },
    'meterOut': { n: '일방향 유량 조절 밸브 — 나오는 쪽에 붙임',   sym: 'flowctl-one' },
    'quickExh': { n: '급속 배기 밸브',       sym: 'quick-exh' },
    'silencer': { n: '소음기',              sym: 'silencer' },
    'shuttleHi':{ n: '셔틀 밸브 (고압 우선형)', sym: 'shuttle-hi' },
    'shuttleLo':{ n: '셔틀 밸브 (저압 우선형)', sym: 'shuttle-lo' },
    'chk':      { n: '체크 밸브',            sym: 'chk' }
  };

  /* ── 과제 ─────────────────────────────────────────────── */
  var MISSIONS = [
    {
      id: 1, layout: 'basic',
      title: '버튼을 누르는 동안만 로드가 나가게 하라',
      goal: '버튼을 누르면 로드가 나가고, 손을 놓으면 스프링 힘으로 저절로 되돌아와야 한다. ' +
        '실린더에 붙는 배관은 하나뿐이어야 한다.',
      slots: [
        { key: 'cyl',   label: '실린더',      pick: ['cylS', 'cylD'] },
        { key: 'valve', label: '방향제어밸브', pick: ['v22', 'v32nc', 'v32no', 'v52'] }
      ],
      need: { cyl: 'cylS', valve: 'v32nc' },
      strict: ['cyl'],
      strictSay: '이 조합도 실제로는 잘 돌아간다. 다만 과제는 <b>스프링으로</b> 되돌아오게 하라고 했다. ' +
        '복동 실린더는 되돌아올 때도 공기의 힘을 쓴다 — 스프링이 없다.',
      hint: '배관이 하나뿐인 실린더는 그 하나를 공급과 배기로 번갈아 이어 주어야 한다. ' +
        '그러려면 밸브에 작업 포트와 배기 포트가 각각 몇 개씩 있어야 하는지 세어 보라.'
    },
    {
      id: 2, layout: 'basic',
      title: '전진도 후진도 공기의 힘으로 움직이게 하라',
      goal: '버튼을 누르면 나가고, 놓으면 되돌아와야 한다. ' +
        '되돌아올 때도 스프링이 아니라 공기의 힘을 써야 한다.',
      slots: [
        { key: 'cyl',   label: '실린더',      pick: ['cylS', 'cylD'] },
        { key: 'valve', label: '방향제어밸브', pick: ['v22', 'v32nc', 'v32no', 'v52'] }
      ],
      need: { cyl: 'cylD', valve: 'v52' },
      strict: ['cyl'],
      strictSay: '단동 실린더는 스프링으로 되돌아온다. 과제는 <b>후진도 공기의 힘</b>으로 하라고 했다. ' +
        '양쪽에 번갈아 공기를 넣을 수 있는 실린더가 필요하다.',
      hint: '되돌아올 때도 공기로 밀려면 실린더 양쪽에 배관이 하나씩 붙어야 한다. ' +
        '그러려면 밸브의 작업 포트도 그만큼 있어야 한다.'
    },
    {
      id: 3, layout: 'speed',
      title: '전진 속도를 고르게 늦춰라',
      goal: '전진이 튀지 않고 처음부터 끝까지 고른 속도로 천천히 나가야 한다. 후진 속도는 그대로 둔다.',
      fixed: { cyl: 'cylD', valve: 'v52' },
      slots: [
        { key: 'speed', label: '속도 제어', pick: ['none', 'throttle', 'meterIn', 'meterOut'] }
      ],
      need: { speed: 'meterOut' },
      hint: '들어가는 공기를 조이면 실린더 앞쪽에 눌린 공기가 그대로 남는다. 그 공기가 무슨 짓을 하는지 떠올려 보라.'
    },
    {
      id: 4, layout: 'speed',
      title: '단동 실린더의 복귀를 빠르게 하라',
      goal: '전진 속도는 그대로 두고, 손을 놓았을 때 되돌아오는 것만 빨라져야 한다.',
      fixed: { cyl: 'cylS', valve: 'v32nc' },
      slots: [
        { key: 'speed', label: '실린더 바로 앞에 붙일 것', pick: ['none', 'throttle', 'meterOut', 'quickExh'] }
      ],
      need: { speed: 'quickExh' },
      hint: '돌아올 때 공기가 밸브까지 되돌아가는 길이 멀다. 그 길을 짧게 만들어 주면 된다.'
    },
    {
      id: 5, layout: 'logic',
      title: '두 자리 중 어디서 눌러도 나가게 하라',
      goal: '버튼 1 만 눌러도, 버튼 2 만 눌러도 실린더가 전진해야 한다.',
      fixed: { cyl: 'cylD', valve: 'v52' },
      slots: [
        { key: 'logic', label: '두 버튼을 묶는 밸브', pick: ['shuttleHi', 'shuttleLo', 'chk'] }
      ],
      need: { logic: 'shuttleHi' },
      hint: '두 입구 중 압력이 걸린 쪽이 출구로 통해야 한다. 어느 쪽 압력이 이겨야 하는지 생각해 보라.'
    },
    {
      id: 6, layout: 'logic',
      title: '두 버튼을 동시에 눌러야만 나가게 하라',
      goal: '양손 조작 안전회로다. 한쪽만 눌러서는 절대 움직이면 안 된다.',
      fixed: { cyl: 'cylD', valve: 'v52' },
      slots: [
        { key: 'logic', label: '두 버튼을 묶는 밸브', pick: ['shuttleHi', 'shuttleLo', 'chk'] }
      ],
      need: { logic: 'shuttleLo' },
      hint: '두 입구에 모두 압력이 걸려야 통하는 밸브가 있다. 그때 나가는 것은 높은 쪽 압력이 아니다.'
    }
  ];

  /* ══ 동작 계산 ═════════════════════════════════════════
     고른 부품 그대로 어떻게 움직이는지 정한다.
     ok      : 과제를 만족했는가
     fwd/rev : 전·후진 속도 배수 (0 이면 못 움직임)
     jerk    : 전진이 튀는가
     say     : 운전 뒤에 보여 줄 설명
     ═════════════════════════════════════════════════════ */
  function simulate(m, parts) {
    var p = Object.assign({}, m.fixed || {}, parts);
    var r = { fwd: 1, rev: 1, jerk: false, ok: false, say: '', needBoth: false, springReturn: false };

    var valve = p.valve, cyl = p.cyl;

    /* ── 밸브와 실린더의 짝 ── */
    if (!valve || !cyl) { r.fwd = 0; r.rev = 0; r.say = '부품이 아직 다 놓이지 않았다.'; return r; }

    if (valve === 'v22') {
      r.fwd = 1; r.rev = 0;
      r.say = '2/2 way 밸브는 통로를 열고 닫기만 한다. 배기 포트가 없어서 ' +
              '한 번 들어간 공기가 빠져나갈 길이 없다. 로드가 나간 채로 멈춰 버린다.';
      return r;
    }

    if (cyl === 'cylS') {
      r.springReturn = true;
      if (valve === 'v32nc') { r.ok = true; r.say = '단동 실린더 + 3/2 way 밸브(NC). 공압의 가장 기본 회로다. ' +
        '누르면 1번(공급)이 2번으로 통해 전진하고, 놓으면 2번이 3번(배기)으로 열려 스프링이 되돌린다.'; }
      else if (valve === 'v32no') { r.ok = false; r.say = '3/2 way 밸브(NO)는 평소에 이미 공급이 통해 있다. ' +
        '전원을 켜자마자 실린더가 나가 있고, 눌러야 들어간다. 사람이 다칠 수 있어 안전상 쓰지 않는다.'; r.inverted = true; }
      else { r.ok = false; r.say = valve + ' 는 작업 포트가 둘이다. 단동 실린더는 배관이 하나뿐이라 ' +
        '남는 작업 포트가 그대로 열려 공기가 새어 나간다. 실린더가 힘없이 움직인다.'; r.fwd = 0.5; }
      return r;
    }

    /* 복동 실린더 */
    if (valve === 'v32nc' || valve === 'v32no') {
      r.fwd = 1; r.rev = 0;
      r.say = '3/2 way 밸브는 작업 포트가 하나뿐이다. 복동 실린더는 양쪽에 번갈아 공기를 넣어야 하는데 ' +
              '한쪽밖에 잡아 주지 못한다. 나가기만 하고 되돌아오지 못한다.';
      return r;
    }
    r.ok = true;
    r.say = '복동 실린더 + ' + PARTS[valve].n + '. 양쪽 작업 포트를 번갈아 바꿔 주므로 ' +
            '전진도 후진도 공기의 힘으로 한다.';
    if (valve === 'v42') r.say += ' 다만 4/2 는 배기구가 하나로 모여 있어 전진·후진 속도를 따로 잡기 어렵다.';
    return r;
  }

  function simulateSpeed(m, parts, base) {
    var s = parts.speed;
    var r = base;
    if (m.id === 3) {
      if (s === 'meterOut') { r.fwd = 0.35; r.ok = true;
        r.say = '미터아웃. 실린더에서 나오는 공기를 조였다. 나가는 공기가 뒤에서 버텨 주므로 ' +
                '전진이 처음부터 끝까지 고르다. 공압의 표준 속도 제어다.'; }
      else if (s === 'meterIn') { r.fwd = 0.4; r.jerk = true; r.ok = false;
        r.say = '미터인. 들어가는 공기를 조였다. 느려지기는 하지만 실린더 앞쪽의 눌린 공기가 버텨 주지 못해 ' +
                '움직이기 시작할 때 튀어 나간다(급진 현상). 공압에서는 쓰지 않는다.'; }
      else if (s === 'throttle') { r.fwd = 0.4; r.rev = 0.4; r.ok = false;
        r.say = '교축 밸브는 양방향이다. 전진뿐 아니라 후진까지 같이 느려졌다. 과제는 후진 속도를 그대로 두라고 했다.'; }
      else { r.ok = false;
        r.say = '속도 제어를 넣지 않았다. 실린더가 그대로 빠르게 움직인다.'; }
    }
    if (m.id === 4) {
      if (s === 'quickExh') { r.rev = 2.2; r.ok = true;
        r.say = '급속 배기 밸브. 되돌아올 때 공기를 밸브까지 보내지 않고 실린더 바로 옆에서 내보낸다. ' +
                '지나갈 길이 짧아져 복귀가 빨라졌다.'; }
      else if (s === 'meterOut') { r.rev = 0.4; r.ok = false;
        r.say = '나오는 공기를 조였으니 복귀가 오히려 느려졌다. 과제는 빠르게 하라는 것이었다.'; }
      else if (s === 'throttle') { r.fwd = 0.4; r.rev = 0.4; r.ok = false;
        r.say = '교축 밸브는 양방향이라 전진까지 느려졌다. 게다가 복귀도 빨라지지 않았다.'; }
      else { r.ok = false; r.say = '아무것도 넣지 않았으니 복귀 속도가 그대로다.'; }
    }
    return r;
  }

  function simulateLogic(m, parts, base) {
    var l = parts.logic, r = base;
    if (l === 'shuttleHi') {
      r.logicMode = 'or';
      r.ok = (m.id === 5);
      r.say = m.id === 5
        ? '고압 우선형 셔틀 밸브. 두 입구 중 압력이 걸린 쪽이 출구로 통한다. ' +
          '어느 버튼을 눌러도 실린더가 나간다 — OR 회로다.'
        : '고압 우선형은 OR 이다. 한쪽만 눌러도 실린더가 나가 버린다. ' +
          '양손 조작 안전회로로는 쓸 수 없다. 한 손으로 눌러 놓고 다른 손을 넣을 수 있기 때문이다.';
    } else if (l === 'shuttleLo') {
      r.logicMode = 'and';
      r.ok = (m.id === 6);
      r.say = m.id === 6
        ? '저압 우선형 셔틀 밸브(2압 밸브). 두 입구에 모두 압력이 걸려야 출구가 통하고 낮은 쪽 압력이 나간다. ' +
          '두 버튼을 동시에 눌러야만 움직인다 — AND 회로다.'
        : '저압 우선형은 AND 다. 두 버튼을 동시에 눌러야만 나간다. 과제는 어느 쪽 하나만 눌러도 나가라는 것이었다.';
    } else {
      r.logicMode = 'chk';
      r.ok = false;
      r.say = '체크 밸브는 논리 밸브가 아니라 역류를 막는 밸브다. 두 버튼을 묶어 주지 못한다. ' +
              '버튼 1 쪽만 통하고 버튼 2 는 막혀 아무 일도 하지 않는다.';
    }
    return r;
  }

  function run(m, parts) {
    var base = simulate(m, parts);
    if (m.layout === 'speed') base = simulateSpeed(m, parts, base);
    if (m.layout === 'logic') base = simulateLogic(m, parts, base);
    /* 회로는 돌아가지만 과제가 요구한 부품이 아닌 경우 */
    if (base.ok && m.strict) {
      var off = m.strict.filter(function (k) { return parts[k] !== m.need[k]; });
      if (off.length) { base.ok = false; base.say = m.strictSay; }
    }
    return base;
  }

  /* ══ 그리기 ════════════════════════════════════════════ */
  var VB = '0 0 520 430';
  function embed(symId, x, y, w, h) {
    var s = window.SYM_BY_ID[symId];
    if (!s) return '';
    return s.svg.replace('<svg class="sym"',
      '<svg x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" preserveAspectRatio="xMidYMid meet"');
  }
  function slotBox(x, y, w, h, label, filledSym, key, active) {
    var g = '<g class="slot' + (active ? ' on' : '') + '" data-slot="' + key + '">' +
      '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="7" class="slotbox"/>';
    if (filledSym) g += embed(filledSym, x + 4, y + 4, w - 8, h - 8);
    else g += '<text x="' + (x + w / 2) + '" y="' + (y + h / 2 + 5) + '" text-anchor="middle" ' +
      'font-size="13" class="slothint">' + label + ' ?</text>';
    return g + '</g>';
  }
  function pipe(id, d, state) {
    return '<path id="' + id + '" class="pipe ' + (state || 'off') + '" d="' + d + '"/>';
  }

  function posLabel(pos) {
    return pos > 0.97 ? '전진 끝' : pos < 0.03 ? '후진 끝' : '이동 중';
  }

  /* 실린더는 움직여야 하므로 기호를 붙이지 않고 직접 그린다 */
  function cylinder(type, pos) {
    var x = 150, y = 34, w = 210, h = 58;
    var trav = w - 26, px = x + 8 + pos * trav;
    var g = '<rect x="' + x + '" y="' + y + '" width="' + w + '" height="' + h + '" rx="3" class="body"/>';
    g += '<rect id="cPiston" x="' + px + '" y="' + y + '" width="10" height="' + h + '" class="piston"/>';
    g += '<line id="cRod" x1="' + (px + 10) + '" y1="' + (y + h / 2) + '" x2="' + (x + w + 46) + '" y2="' +
      (y + h / 2) + '" class="rod"/>';
    g += '<rect x="' + (x + w + 46) + '" y="' + (y + h / 2 - 13) + '" width="16" height="26" rx="3" class="body"/>';
    if (type === 'cylS') {                       // 단동 — 로드 쪽 스프링
      var sp = 'M' + (px + 10) + ' ' + (y + h / 2), i, n = 10;
      for (i = 1; i <= n; i++) sp += 'L' + (px + 10 + (x + w - px - 12) * i / n) + ' ' + (y + h / 2 + (i % 2 ? -12 : 12));
      g += '<path d="' + sp + '" class="spring"/>';
    }
    return g;
  }

  function scene(m, parts, st) {
    var p = Object.assign({}, m.fixed || {}, parts);
    var g = '';
    var hiA = st.pA, hiB = st.pB;                // 'hi' 압력 · 'lo' 배기 · 'off'

    g += cylinder(p.cyl === 'cylS' ? 'cylS' : 'cylD', st.pos);

    /* 실린더 슬롯이 비어 있으면 자리를 표시 */
    if (m.slots.some(function (s) { return s.key === 'cyl'; }) && !parts.cyl) {
      g = slotBox(150, 34, 210, 58, '실린더', null, 'cyl', st.armed === 'cyl');
    } else if (m.slots.some(function (s) { return s.key === 'cyl'; })) {
      g += '<rect x="146" y="30" width="218" height="66" rx="8" class="slotbox picked" data-slot="cyl"/>';
    }

    /* 배관 — 실린더 → 아래 */
    g += pipe('pA', 'M172 92 V150', hiA);
    if (p.cyl !== 'cylS') g += pipe('pB', 'M338 92 V150', hiB);

    /* 속도 제어 슬롯 */
    if (m.layout === 'speed') {
      var sSym = parts.speed && PARTS[parts.speed] ? PARTS[parts.speed].sym : null;
      var sx = (m.id === 4) ? 132 : 296;
      g += slotBox(sx, 150, 92, 48, '속도', sSym, 'speed', st.armed === 'speed');
      if (m.id === 4) { g += pipe('pA2', 'M172 198 V236', hiA); if (p.cyl !== 'cylS') g += pipe('pB2', 'M338 150 V236', hiB); }
      else { g += pipe('pA2', 'M172 150 V236', hiA); g += pipe('pB2', 'M338 198 V236', hiB); }
    } else {
      g += pipe('pA2', 'M172 150 V236', hiA);
      if (p.cyl !== 'cylS') g += pipe('pB2', 'M338 150 V236', hiB);
    }

    /* 방향제어밸브 */
    var vSym = p.valve && PARTS[p.valve] ? PARTS[p.valve].sym : null;
    if (m.slots.some(function (s) { return s.key === 'valve'; })) {
      g += slotBox(146, 236, 218, 74, '방향제어밸브', vSym, 'valve', st.armed === 'valve');
    } else {
      g += '<rect x="146" y="236" width="218" height="74" rx="8" class="slotbox picked"/>' +
        embed(vSym, 150, 240, 210, 66);
    }

    /* 공급 */
    g += pipe('pP', 'M255 310 V352', st.supply);
    g += embed('frl', 196, 352, 76, 62);
    g += embed('src-pne', 282, 352, 62, 62);
    g += '<line x1="272" y1="383" x2="282" y2="383" class="pipe hi"/>';

    /* 논리 밸브 */
    if (m.layout === 'logic') {
      var lSym = parts.logic && PARTS[parts.logic] ? PARTS[parts.logic].sym : null;
      g += slotBox(14, 236, 112, 74, '논리 밸브', lSym, 'logic', st.armed === 'logic');
      g += pipe('pL', 'M126 273 H146', st.pilot);
      g += pipe('pB1', 'M44 310 V356', st.b1 ? 'hi' : 'off');
      g += pipe('pB2', 'M96 310 V356', st.b2 ? 'hi' : 'off');
      g += '<text x="44" y="374" text-anchor="middle" font-size="12" class="lbl">버튼 1</text>';
      g += '<text x="96" y="374" text-anchor="middle" font-size="12" class="lbl">버튼 2</text>';
      g += '<text x="70" y="396" text-anchor="middle" font-size="11" class="lbl">(3/2 버튼 밸브)</text>';
    }

    g += '<text id="cLabel" x="432" y="116" text-anchor="middle" font-size="13" class="lbl">' +
      posLabel(st.pos) + '</text>';

    return '<svg viewBox="' + VB + '" class="circuit" xmlns="http://www.w3.org/2000/svg">' + g + '</svg>';
  }

  window.CIRCUIT = { PARTS: PARTS, MISSIONS: MISSIONS, run: run, scene: scene, posLabel: posLabel };
}());
