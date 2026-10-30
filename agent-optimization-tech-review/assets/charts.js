(function () {
  var style = getComputedStyle(document.documentElement);
  var accent = style.getPropertyValue('--accent').trim();
  var accent2 = style.getPropertyValue('--accent2').trim();
  var ink = style.getPropertyValue('--ink').trim();
  var muted = style.getPropertyValue('--muted').trim();
  var rule = style.getPropertyValue('--rule').trim();
  var bg2 = style.getPropertyValue('--bg2').trim();

  // ---------- Timeline chart ----------
  var tl = document.getElementById('chart-timeline');
  if (tl) {
    var tlChart = echarts.init(tl, null, { renderer: 'svg' });
    tlChart.setOption({
      animation: false,
      tooltip: { trigger: 'axis', appendToBody: true },
      xAxis: {
        type: 'category',
        data: ['2022', '2023', '2024', 'Early 2025', 'Late 2025', '2026'],
        axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: muted, fontSize: 11 },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        data: ['算子优化', '推理引擎', '调度与服务', '基础方法'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontSize: 11 }
      },
      grid: { left: 90, right: 20, top: 10, bottom: 30 },
      series: [
        {
          type: 'scatter',
          symbolSize: function (val) { return 18; },
          itemStyle: { color: accent, borderColor: ink, borderWidth: 0.8 },
          data: [
            [0, 0], [0, 3], [1, 0], [1, 3],
            [2, 0], [2, 1], [2, 3],
            [3, 0], [3, 1], [3, 2], [3, 3],
            [4, 0], [4, 1], [4, 2], [4, 3],
            [5, 0], [5, 1], [5, 2]
          ],
          label: { show: false }
        }
      ]
    });
    window.addEventListener('resize', function () { tlChart.resize(); });
  }

  // ---------- Category split (pie) ----------
  var pie = document.getElementById('chart-cat');
  if (pie) {
    var pieChart = echarts.init(pie, null, { renderer: 'svg' });
    pieChart.setOption({
      animation: false,
      tooltip: { trigger: 'item', appendToBody: true },
      legend: { show: false },
      color: [accent, accent2, accent + 'aa', muted],
      series: [{
        type: 'pie',
        radius: ['45%', '72%'],
        center: ['50%', '52%'],
        itemStyle: { borderColor: style.getPropertyValue('--bg').trim(), borderWidth: 2 },
        label: {
          color: ink,
          fontSize: 11,
          formatter: '{b}\n{d}%'
        },
        data: [
          { name: '算子优化', value: 16 },
          { name: '推理引擎', value: 6 },
          { name: '调度/服务', value: 6 },
          { name: '基础方法', value: 10 }
        ]
      }]
    });
    window.addEventListener('resize', function () { pieChart.resize(); });
  }

  // ---------- Method taxonomy (radar) ----------
  var radar = document.getElementById('chart-radar');
  if (radar) {
    var rChart = echarts.init(radar, null, { renderer: 'svg' });
    rChart.setOption({
      animation: false,
      tooltip: { appendToBody: true, trigger: 'item' },
      radar: {
        center: ['50%', '52%'],
        radius: '66%',
        splitNumber: 4,
        indicator: [
          { name: '反馈驱动程度', max: 4 },
          { name: '搜索广度', max: 4 },
          { name: '持续演化能力', max: 4 },
          { name: '系统级优化', max: 4 },
          { name: '可解释性', max: 4 }
        ],
        axisName: { color: ink, fontSize: 11 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['rgba(0,0,0,0)', bg2] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar',
        symbolSize: 5,
        data: [
          {
            value: [3.5, 2.5, 2, 2, 3],
            name: 'CUDAForge (Coder+Judge)',
            areaStyle: { color: accent2 + '2a' },
            lineStyle: { color: accent2, width: 1.5 },
            itemStyle: { color: accent2 }
          },
          {
            value: [3, 3.5, 3.5, 3, 4],
            name: 'EAT (演化型团队)',
            areaStyle: { color: accent + '1f' },
            lineStyle: { color: accent, width: 2 },
            itemStyle: { color: accent }
          },
          {
            value: [3.5, 3, 3, 4, 3],
            name: 'SEIS (自演化引擎)',
            areaStyle: { color: accent + '3a' },
            lineStyle: { color: accent, width: 2, type: 'dashed' },
            itemStyle: { color: accent }
          }
        ]
      }]
    });
    window.addEventListener('resize', function () { rChart.resize(); });
  }

  // ---------- Speedup comparison bar ----------
  var bar = document.getElementById('chart-speedup');
  if (bar) {
    var bChart = echarts.init(bar, null, { renderer: 'svg' });
    bChart.setOption({
      animation: false,
      grid: { left: 140, right: 30, top: 10, bottom: 30, containLabel: true },
      tooltip: { appendToBody: true, trigger: 'axis', formatter: function(p){
        var d = p[0]; return d.name + '<br/><b>' + d.value.toFixed(2) + '×</b> 相对基线';
      }},
      xAxis: { type: 'value', min: 0, max: 3.5, axisLabel: { color: muted, fontSize: 11, formatter: '{value}×' }, splitLine: { lineStyle: { color: rule } } },
      yAxis: { type: 'category', inverse: true, axisLine: { lineStyle: { color: rule } }, axisTick: { show: false }, axisLabel: { color: ink, fontSize: 11 } },
      series: [{
        type: 'bar',
        barWidth: 14,
        data: [
          { name: 'SEIS (mini-sglang)', value: 3.27, itemStyle: { color: accent } },
          { name: 'EAT (FlashInfer MLA)', value: 1.21, itemStyle: { color: accent } },
          { name: 'KernelOPT (Inductor)', value: 1.70, itemStyle: { color: accent2 } },
          { name: 'CUDAForge (PyTorch)', value: 1.68, itemStyle: { color: accent2 } },
          { name: 'AutoKernel (Inductor)', value: 1.45, itemStyle: { color: accent2 } },
          { name: 'OptiML-X (blas)', value: 1.64, itemStyle: { color: muted } }
        ],
        label: { show: true, position: 'right', color: muted, fontSize: 11, formatter: function(p){ return p.value.toFixed(2) + '×'; } }
      }]
    });
    window.addEventListener('resize', function () { bChart.resize(); });
  }
})();
