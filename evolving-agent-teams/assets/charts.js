(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ---------- Chart 1: MLA decode relative performance ----------
  var mlaEl = document.getElementById('chart-mla');
  if (mlaEl) {
    var mlaChart = echarts.init(mlaEl, null, { renderer: 'svg' });
    var names = [
      'Codex (GPT-5.5)',
      '固定四角色团队',
      'CUDAForge',
      'Claude Code',
      'K-Search',
      'EAT（匹配预算）',
      'EAT（扩展预算）'
    ];
    var vals = [0.28, 0.31, 0.45, 0.51, 0.60, 0.72, 1.21];
    mlaChart.setOption({
      animation: false,
      grid: { left: 10, right: 70, top: 30, bottom: 30, containLabel: true },
      tooltip: {
        trigger: 'axis',
        appendToBody: true,
        axisPointer: { type: 'shadow' },
        formatter: function (p) {
          var d = p[0];
          return d.name + '<br/>相对生产 FlashInfer：<b>' + d.value.toFixed(2) + '×</b>';
        }
      },
      xAxis: {
        type: 'value',
        min: 0,
        max: 1.4,
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}×' },
        splitLine: { lineStyle: { color: rule } }
      },
      yAxis: {
        type: 'category',
        data: names,
        inverse: true,
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontSize: 12 }
      },
      series: [{
        type: 'bar',
        data: vals.map(function (v, i) {
          return {
            value: v,
            itemStyle: {
              color: i >= 5 ? accent : (i === 4 ? accent2 : accent2 + '99'),
              borderRadius: i === 6 ? [0, 0, 0, 0] : [0, 2, 2, 0]
            }
          };
        }),
        barWidth: '52%',
        label: {
          show: true,
          position: 'right',
          color: muted,
          fontSize: 11,
          formatter: function (p) { return p.value.toFixed(2) + '×'; }
        },
        markLine: {
          silent: true,
          symbol: 'none',
          lineStyle: { color: ink, type: 'dashed', width: 1.2 },
          label: { show: false },
          data: [{ xAxis: 1 }]
        }
      }]
    });
    window.addEventListener('resize', function () { mlaChart.resize(); });
  }

  // ---------- Chart 2: evaluation radar ----------
  var evalEl = document.getElementById('chart-eval');
  if (evalEl) {
    var evalChart = echarts.init(evalEl, null, { renderer: 'svg' });
    evalChart.setOption({
      animation: false,
      tooltip: { appendToBody: true, trigger: 'item' },
      radar: {
        center: ['50%', '54%'],
        radius: '64%',
        splitNumber: 5,
        indicator: [
          { name: '创新性', max: 5 },
          { name: '严谨性', max: 5 },
          { name: '证据充分度', max: 5 },
          { name: '写作与呈现', max: 5 },
          { name: '潜在影响力', max: 5 }
        ],
        axisName: { color: ink, fontSize: 12 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['rgba(0,0,0,0)', bg2] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        symbolSize: 6,
        data: [{
          value: [4.5, 3.2, 4.0, 4.5, 4.5],
          name: '本文（主观评分）',
          areaStyle: { color: accent + '1f' },
          lineStyle: { color: accent, width: 2 },
          itemStyle: { color: accent }
        }]
      }]
    });
    window.addEventListener('resize', function () { evalChart.resize(); });
  }
})();
