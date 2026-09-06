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
    'chk':      { n: '체크 밸브',            sym: 'chk' },

    /* 자동 왕복 · 자기유지 (훈련교재 「공유압제어실기」 제3~4장) */
    'limitV':   { n: '리밋 밸브 (롤러 조작 3/2)', sym: 'v32roll' },
    'seqV':     { n: '시퀀스 밸브 (압력으로 검출)', sym: 'sequence' },
    'v52mem':   { n: '5/2 way 메모리 밸브 (양쪽 파일럿)', sym: 'v52mem' },

    /* 유압 속도 제어 (훈련교재 「공유압제어실기」 Ⅱ부 제2장) */
    'metIn':    { n: '일방향 유량 조절 밸브 — 실린더로 들어가는 쪽', sym: 'flowctl-one' },
    'metOut2':  { n: '일방향 유량 조절 밸브 — 실린더에서 나오는 쪽', sym: 'flowctl-one' },
    'bleed':    { n: '유량 조절 밸브 — 펌프 토출부에 병렬로',        sym: 'flowctl' }
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
    },

    /* ── 공압 심화 ── 근거 : 훈련교재 「공유압제어실기」 Ⅰ부 제3·4장 ── */
    {
      id: 7, layout: 'auto',
      title: '전진 끝에 닿으면 스스로 되돌아오게 하라',
      goal: '버튼을 눌렀다 놓아도 실린더가 전진을 계속하고, 「전진 끝단에 실제로 도달한 것을 확인한 뒤」 ' +
        '스스로 되돌아와야 한다. 도중에 무언가에 걸렸다면 되돌아오면 안 된다.',
      fixed: { cyl: 'cylD', valve: 'v52mem' },
      slots: [
        { key: 'sensor', label: '복귀 신호를 만들 것', pick: ['none', 'limitV', 'seqV'] }
      ],
      need: { sensor: 'limitV' },
      hint: '「끝까지 갔다」를 무엇으로 알아낼 것인가. 압력이 올라간 것과 로드가 그 자리에 온 것은 같은 말이 아니다.'
    },
    {
      id: 8, layout: 'hold',
      title: '손을 놓아도 나간 채로 있게 하라',
      goal: '기동 버튼을 눌렀다 「놓아도」 로드가 나간 자리에 그대로 있어야 하고, ' +
        '정지 버튼을 눌러야 비로소 되돌아와야 한다.',
      slots: [
        { key: 'master', label: '마스터 밸브', pick: ['v52', 'v52mem'] }
      ],
      fixed: { cyl: 'cylD' },
      need: { master: 'v52mem' },
      hint: '신호가 사라진 뒤에도 밸브가 그 자리에 남아 있어야 한다. 밸브를 원위치로 되돌리는 것이 무엇인지 보라.'
    },

    /* ── 유압 ── 근거 : 훈련교재 「공유압제어실기」 Ⅱ부 제2장 속도 제어 회로 ── */
    {
      id: 9, layout: 'hyd',
      title: '유압 — 드릴 이송 속도를 일정하게 하라',
      goal: '드릴로 눌러 내리는 작업이다. 부하가 실린더를 「밀어 누르는 방향(압축 하중)」이고 ' +
        '깎이는 정도에 따라 하중이 변한다. 그래도 이송 속도가 일정해야 한다.',
      fixed: { cyl: 'cylD', valve: 'v42' },
      slots: [
        { key: 'fc', label: '유량 조절 밸브를 어디에', pick: ['none', 'metIn', 'metOut2', 'bleed'] }
      ],
      need: { fc: 'metIn' },
      hint: '기름은 공기와 달리 눌러도 거의 줄지 않는다. 공압에서 들어가는 쪽을 조이면 튀었던 이유가 무엇이었는지 떠올려 보라.'
    },
    {
      id: 10, layout: 'hyd',
      title: '유압 — 끌어당기는 부하에서 폭주를 막아라',
      goal: '로드를 「잡아당기는 방향(인장 하중)」으로 무거운 것이 매달려 있다. ' +
        '실린더가 부하에 끌려 제멋대로 튀어 나가지 않고 일정한 속도로 움직여야 한다.',
      fixed: { cyl: 'cylD', valve: 'v42' },
      slots: [
        { key: 'fc', label: '유량 조절 밸브를 어디에', pick: ['none', 'metIn', 'metOut2', 'bleed'] }
      ],
      need: { fc: 'metOut2' },
      hint: '부하가 끌어당기면 실린더는 스스로 달아나려 한다. 달아나려는 쪽에서 「버텨 주는 압력」을 만들어야 한다.'
    },
    {
      id: 11, layout: 'hyd',
      title: '유압 — 동력 손실과 발열을 줄여라',
      goal: '연삭기 테이블 이송처럼 「하중이 안정된」 작업이다. 속도 제어의 정밀도보다 ' +
        '기름이 뜨거워지지 않고 동력이 덜 버려지는 것이 중요하다.',
      fixed: { cyl: 'cylD', valve: 'v42' },
      slots: [
        { key: 'fc', label: '유량 조절 밸브를 어디에', pick: ['none', 'metIn', 'metOut2', 'bleed'] }
      ],
      need: { fc: 'bleed' },
      hint: '미터 인과 미터 아웃은 남는 기름을 릴리프 밸브로 흘려보낸다. 그 기름이 어디서 열이 되는지 생각해 보라.'
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

  /* ── 자동 왕복 (제3장) ─────────────────────────────────
     복귀 신호를 무엇으로 만드느냐에 따라 「언제」 되돌아오는지가 달라진다. */
  function simulateAuto(m, parts, base) {
    var sn = parts.sensor, r = base;
    r.latched = true;                       // 메모리 밸브라 버튼을 놓아도 전진을 유지한다
    if (sn === 'limitV') {
      r.autoReturn = 'pos'; r.ok = true;
      r.say = '리밋 밸브. 전진 끝단에 세워 둔 롤러를 로드가 눌러야 복귀 신호가 나간다. ' +
              '「실린더가 정말 거기까지 갔다」를 확인한 뒤에 되돌아오므로, 도중에 걸리면 되돌아오지 않고 그 자리에 선다. ' +
              '자동 왕복 회로의 가장 일반적인 방법이다.';
    } else if (sn === 'seqV') {
      r.autoReturn = 'press'; r.ok = false;
      r.say = '시퀀스 밸브. 압력이 정해 둔 값에 이르면 복귀 신호를 낸다. 전진 끝에 닿아도 압력이 오르니 ' +
              '되돌아오기는 한다. 그러나 <b>도중에 무언가에 걸려도</b> 압력이 올라 되돌아와 버린다 — ' +
              '끝까지 갔는지 아닌지를 구별하지 못한다. 과제는 도달을 확인하라는 것이었다.';
    } else {
      r.autoReturn = null; r.ok = false;
      r.say = '복귀 신호를 만들 것을 넣지 않았다. 메모리 밸브는 마지막 신호를 기억하므로, ' +
              '반대쪽에 신호를 주지 않는 한 로드가 나간 채로 그대로 서 있다.';
    }
    return r;
  }

  /* ── 자기유지 (제4장) ─────────────────────────────────── */
  function simulateHold(m, parts, base) {
    var v = parts.master, r = base;
    if (v === 'v52mem') {
      r.latched = true; r.ok = true;
      r.say = '메모리 밸브(양쪽 파일럿 · 스프링 없음). 기동 신호로 밀려간 자리에 그대로 머물러 ' +
              '손을 놓아도 전진 상태를 기억한다. 정지 버튼으로 반대쪽에 신호를 주어야 되돌아온다. ' +
              '이렇게 신호를 기억하게 만든 회로를 자기유지 회로라 한다.';
    } else {
      r.latched = false; r.ok = false;
      r.say = '스프링 복귀형 5/2 밸브다. 기동 신호가 사라지는 순간 내장된 스프링이 밸브를 원위치로 되돌려 ' +
              '로드도 곧바로 따라 돌아온다. 눌러야만 나가 있으므로 기억하지 못한다.';
    }
    return r;
  }

  /* ── 유압 속도 제어 (Ⅱ부 제2장) ─────────────────────────
     같은 미터 인이라도 공압(과제 3)과 유압에서 결과가 다르다. 그 대비가 이 과제의 핵심이다. */
  function simulateHyd(m, parts, base) {
    var f = parts.fc, r = base;
    r.hyd = true; r.ok = false;
    if (f === 'metIn') {
      r.fwd = 0.4;
      r.ok = (m.id === 9);
      r.say = m.id === 9
        ? '미터 인. 실린더로 <b>들어가는</b> 기름을 조였다. 기름은 공기와 달리 눌러도 거의 줄지 않아서 ' +
          '공압처럼 튀지 않는다. 그래서 유압에서는 미터 인이 정상적인 방법이고, 드릴 이송처럼 ' +
          '부하가 밀어 누르는(압축 하중) 작업에서 일정한 속도를 얻는 데 쓴다.'
        : (m.id === 10
          ? '미터 인은 들어가는 쪽만 조인다. 나오는 쪽이 열려 있어 부하가 로드를 끌어당기면 ' +
            '실린더가 부하에 끌려 <b>달아나 버린다</b>(폭주). 인장 하중에는 쓸 수 없다.'
          : '미터 인도 속도는 잡힌다. 다만 남는 기름이 릴리프 밸브를 통해 탱크로 돌아가므로 ' +
            '그만큼 동력이 버려지고 기름이 뜨거워진다. 과제는 그 손실을 줄이라는 것이었다.');
      if (m.id === 10) { r.runaway = true; r.fwd = 2.6; }
    } else if (f === 'metOut2') {
      r.fwd = 0.4;
      r.ok = (m.id === 10);
      r.say = m.id === 10
        ? '미터 아웃. 실린더에서 <b>나오는</b> 기름을 조였다. 빠져나가지 못한 기름이 로드 쪽에서 ' +
          '버텨 주는 압력(배압)이 되어, 부하가 끌어당겨도 피스톤이 폭주하지 않고 일정한 속도를 지킨다. ' +
          '인장 하중을 받는 실린더의 표준 방법이다.'
        : (m.id === 9
          ? '미터 아웃으로도 속도는 잡힌다. 다만 이 과제의 부하는 밀어 누르는 압축 하중이라 ' +
            '폭주할 일이 없다. 교재는 이런 조건에서는 들어가는 쪽을 조이는 방법을 든다.'
          : '미터 아웃도 남는 기름을 릴리프 밸브로 흘려보낸다. 동력 손실과 발열은 그대로다.');
    } else if (f === 'bleed') {
      r.fwd = 0.55;
      r.ok = (m.id === 11);
      r.say = m.id === 11
        ? '블리드 오프. 유량 조절 밸브를 실린더와 <b>병렬</b>로 달아, 남는 기름을 릴리프 밸브를 거치지 않고 ' +
          '곧바로 탱크로 돌려보낸다. 그래서 동력 손실과 발열이 적다. 다만 펌프 토출량이 부하 압력에 ' +
          '휘둘려 속도 제어의 정확도는 미터 인·미터 아웃보다 떨어진다. 하중이 안정된 연삭기 테이블 이송 ' +
          '같은 곳에 알맞다.'
        : '블리드 오프는 남는 기름만 빼돌리는 방식이라 열은 덜 나지만, 부하가 변하면 실린더 속도가 함께 흔들린다. ' +
          '이 과제는 하중이 변하는 조건에서 <b>일정한 속도</b>를 요구했다.';
      if (m.id !== 11) r.wobble = true;
    } else {
      r.say = '유량 조절 밸브를 넣지 않았다. 펌프가 내보내는 기름이 그대로 들어가 실린더가 빠르게 움직인다.';
      if (m.id === 10) { r.runaway = true; r.fwd = 3.0; r.say += ' 게다가 부하가 끌어당겨 폭주한다.'; }
    }
    return r;
  }

  function run(m, parts) {
    /* 자기유지 과제는 고른 마스터 밸브가 곧 방향제어밸브다 */
    if (m.layout === 'hold' && parts.master) {
      parts = Object.assign({}, parts, { valve: parts.master });
    }
    var base = simulate(m, parts);
    if (m.layout === 'speed') base = simulateSpeed(m, parts, base);
    if (m.layout === 'logic') base = simulateLogic(m, parts, base);
    if (m.layout === 'auto')  base = simulateAuto(m, parts, base);
    if (m.layout === 'hold')  base = simulateHold(m, parts, base);
    if (m.layout === 'hyd')   base = simulateHyd(m, parts, base);
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

    /* 유압 유량 조절 — 미터 인은 A 관로, 미터 아웃은 B 관로에 붙는다 */
    if (m.layout === 'hyd') {
      var fc = parts.fc;
      if (fc === 'metIn' || fc === 'metOut2') {
        var fx = (fc === 'metIn') ? 126 : 292;
        g += slotBox(fx, 150, 92, 48, '유량 조절', PARTS[fc].sym, 'fc', st.armed === 'fc');
        if (fc === 'metIn') { g += pipe('pA2', 'M172 198 V236', hiA); g += pipe('pB2', 'M338 150 V236', hiB); }
        else                { g += pipe('pA2', 'M172 150 V236', hiA); g += pipe('pB2', 'M338 198 V236', hiB); }
      } else {
        if (!fc || fc === 'none') g += slotBox(126, 150, 92, 48, '유량 조절', null, 'fc', st.armed === 'fc');
        g += pipe('pA2', 'M172 150 V236', hiA);
        g += pipe('pB2', 'M338 150 V236', hiB);
      }
    } else if (m.layout === 'speed') {
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
    var vKey = m.layout === 'hold' ? 'master' : 'valve';
    var vPick = m.layout === 'hold' ? parts.master : p.valve;
    var vSym = vPick && PARTS[vPick] ? PARTS[vPick].sym : (p.valve && PARTS[p.valve] ? PARTS[p.valve].sym : null);
    if (m.slots.some(function (s) { return s.key === vKey; })) {
      g += slotBox(146, 236, 218, 74, m.layout === 'hold' ? '마스터 밸브' : '방향제어밸브',
                   vPick && PARTS[vPick] ? PARTS[vPick].sym : null,
                   vKey, st.armed === vKey);
    } else {
      g += '<rect x="146" y="236" width="218" height="74" rx="8" class="slotbox picked"/>' +
        embed(vSym, 150, 240, 210, 66);
    }

    /* 공급 */
    g += pipe('pP', 'M255 310 V352', st.supply);
    if (m.layout === 'hyd') {
      /* 유압 파워 유닛 — 펌프 + 압력 설정(릴리프) + 탱크
         근거 : 훈련교재 「공유압」 제5장 제1절 압력 설정 회로 */
      g += embed('pump-h', 196, 352, 62, 62);
      g += embed('relief', 268, 352, 62, 62);
      g += '<line x1="258" y1="383" x2="268" y2="383" class="pipe hi"/>';
      g += '<text x="227" y="424" text-anchor="middle" font-size="11" class="lbl">유압 펌프</text>';
      g += '<text x="299" y="424" text-anchor="middle" font-size="11" class="lbl">릴리프 밸브</text>';
      /* 블리드 오프 — 펌프 토출부에서 병렬로 갈라져 탱크로.
         고른 경우에만 그린다(빈 자리를 둘씩 보여 주지 않는다). */
      if (parts.fc === 'bleed') {
        g += slotBox(384, 236, 116, 74, '유량 조절', PARTS.bleed.sym, 'fc', st.armed === 'fc');
        g += pipe('pBleed', 'M364 273 H384', 'hi');
        g += '<text x="442" y="326" text-anchor="middle" font-size="11" class="lbl">남는 기름 → 탱크</text>';
      }
    } else {
      g += embed('frl', 196, 352, 76, 62);
      g += embed('src-pne', 282, 352, 62, 62);
      g += '<line x1="272" y1="383" x2="282" y2="383" class="pipe hi"/>';
    }

    /* 자동 왕복 — 복귀 신호를 만드는 것을 전진 끝단 쪽에 놓는다 */
    if (m.layout === 'auto') {
      var snSym = parts.sensor && PARTS[parts.sensor] ? PARTS[parts.sensor].sym : null;
      g += slotBox(384, 150, 116, 74, '복귀 신호', snSym, 'sensor', st.armed === 'sensor');
      var trip = (parts.sensor === 'limitV') ? (st.pos > 0.96) : (parts.sensor === 'seqV' ? !!st.pressUp : false);
      g += pipe('pS', 'M442 132 V150', trip ? 'hi' : 'off');
      g += '<line x1="442" y1="112" x2="442" y2="132" class="pipe ' + (trip ? 'hi' : 'off') + '"/>';
      g += '<text x="442" y="240" text-anchor="middle" font-size="11" class="lbl">' +
        (parts.sensor === 'limitV' ? '전진 끝단' : (parts.sensor === 'seqV' ? '압력 검출' : '')) + '</text>';
      g += pipe('pSm', 'M384 187 H364', trip ? 'hi' : 'off');
      g += '<text x="44" y="374" text-anchor="middle" font-size="12" class="lbl">기동</text>';
      g += pipe('pB1', 'M44 310 V356', st.b1 ? 'hi' : 'off');
    }

    /* 자기유지 — 기동과 정지 두 버튼 */
    if (m.layout === 'hold') {
      g += pipe('pB1', 'M44 310 V356', st.b1 ? 'hi' : 'off');
      g += pipe('pB2', 'M452 310 V356', st.b2 ? 'hi' : 'off');
      g += pipe('pL1', 'M44 273 H146', st.b1 ? 'hi' : 'off');
      g += pipe('pL2', 'M364 273 H452 V310', st.b2 ? 'hi' : 'off');
      g += '<text x="44" y="374" text-anchor="middle" font-size="12" class="lbl">기동</text>';
      g += '<text x="452" y="374" text-anchor="middle" font-size="12" class="lbl">정지</text>';
    }

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
