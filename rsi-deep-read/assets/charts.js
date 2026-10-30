(function () {
  var s = getComputedStyle(document.documentElement);
  var ink = s.getPropertyValue('--ink').trim();
  var muted = s.getPropertyValue('--muted').trim();
  var rule = s.getPropertyValue('--rule').trim();
  var accent = s.getPropertyValue('--accent').trim();
  var accent2 = s.getPropertyValue('--accent2').trim();
  var bg2 = s.getPropertyValue('--bg2').trim();

  // ---------- L0→L3 staircase ----------
  var lvl = document.getElementById('chart-levels');
  if (lvl) {
    echarts.init(lvl, null, { renderer: 'svg' }).setOption({
      animation: false,
      grid: { left: 60, right: 20, top: 20, bottom: 40, containLabel: true },
      tooltip: { trigger: 'axis', appendToBody: true },
      xAxis: {
        type: 'category',
        data: ['L0 答案级', 'L1 代码级', 'L2 权重级', 'L3 策略/系统级'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontSize: 11 }
      },
      yAxis: { type: 'value', show: false },
      series: [{
        type: 'bar',
        barWidth: 48,
        itemStyle: { borderColor: ink, borderWidth: 1 },
        data: [
          { value: 0.08, itemStyle: { color: muted + '80' } },
          { value: 1, itemStyle: { color: accent2 } },
          { value: 2, itemStyle: { color: accent } },
          { value: 3.3, itemStyle: { color: ink } }
        ],
        label: { show: true, position: 'inside', color: '#fff', fontSize: 11, fontWeight: 600,
          formatter: function(p){ return ['Reflexion\nBest-of-N','DGM\n(20→50%)','SEAL\n(自编辑→权重)','Terminal-RSI\nRSR+RPR'][p.dataIndex]; } }
      }]
    });
  }

  // ---------- DGM self-improvement gains ----------
  var dgm = document.getElementById('chart-dgm');
  if (dgm) {
    echarts.init(dgm, null, { renderer: 'svg' }).setOption({
      animation: false,
      legend: { top: 0, right: 0, textStyle: { color: muted, fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
      grid: { left: 10, right: 20, top: 36, bottom: 26, containLabel: true },
      tooltip: { trigger: 'axis', appendToBody: true },
      xAxis: { type: 'category', data: ['SWE-bench', 'Polyglot'], axisLine: { lineStyle: { color: rule } },
        axisLabel: { color: ink, fontSize: 11 }, axisTick: { show: false } },
      yAxis: { type: 'value', max: 55, axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }, splitLine: { lineStyle: { color: rule } } },
      series: [
        { name: '起点', type: 'bar', barWidth: 26, itemStyle: { color: muted + '80' },
          label: { show: true, position: 'top', color: muted, fontSize: 10, formatter: '{c}%' },
          data: [20.0, 14.2] },
        { name: '终点 (DGM)', type: 'bar', barWidth: 26, itemStyle: { color: accent },
          label: { show: true, position: 'top', color: accent, fontSize: 10, formatter: '{c}%' },
          data: [50.0, 30.7] }
      ]
    });
  }

  // ---------- Terminal-RSI pipeline ----------
  var pipe = document.getElementById('chart-terminal');
  if (pipe) {
    echarts.init(pipe, null, { renderer: 'svg' }).setOption({
      animation: false,
      grid: { left: 30, right: 20, top: 36, bottom: 30, containLabel: true },
      tooltip: { trigger: 'axis', appendToBody: true },
      xAxis: {
        type: 'category',
        data: ['base\n(27B)', 'RSR-1', 'RPR-1', 'RSR-2', 'RPR-2'],
        axisLine: { lineStyle: { color: rule } },
        axisTick: { show: false },
        axisLabel: { color: ink, fontSize: 10, lineHeight: 14 }
      },
      yAxis: { type: 'value', max: 22, name: 'Terminal-Bench 4.0 (%)', nameTextStyle: { color: muted, fontSize: 10 },
        axisLabel: { color: muted, fontSize: 11, formatter: '{value}%' }, splitLine: { lineStyle: { color: rule } } },
      series: [{
        type: 'line', smooth: true, symbolSize: 10, lineStyle: { width: 2, color: accent }, itemStyle: { color: accent, borderColor: ink, borderWidth: 1 },
        label: { show: true, position: 'top', color: accent, fontSize: 11, fontWeight: 600, formatter: '{c}%' },
        data: [4.5, 11.2, 14.8, 17.5, 19.84]
      }]
    });
  }

  // ---------- RSI constraint radar ----------
  var rdr = document.getElementById('chart-constraints');
  if (rdr) {
    echarts.init(rdr, null, { renderer: 'svg' }).setOption({
      animation: false,
      tooltip: { appendToBody: true, trigger: 'item' },
      legend: { top: 0, right: 0, textStyle: { color: muted, fontSize: 11 }, itemWidth: 10, itemHeight: 10 },
      radar: {
        center: ['50%', '54%'],
        radius: '68%',
        indicator: [
          { name: 'Grounding 依赖', max: 4 },
          { name: 'Collapse 风险', max: 4 },
          { name: 'Compute 开销', max: 4 },
          { name: '能力上限', max: 4 },
          { name: '已工业化', max: 4 }
        ],
        axisName: { color: ink, fontSize: 10 },
        splitLine: { lineStyle: { color: rule } },
        splitArea: { areaStyle: { color: ['rgba(0,0,0,0)', bg2] } },
        axisLine: { lineStyle: { color: rule } }
      },
      series: [{
        type: 'radar', symbolSize: 4,
        data: [
          { name: 'DGM', value: [3, 2, 2.5, 3, 2], areaStyle: { color: accent2 + '3a' }, lineStyle: { color: accent2 }, itemStyle: { color: accent2 } },
          { name: 'SEAL', value: [2, 3.5, 3, 3.5, 2.5], areaStyle: { color: accent + '3a' }, lineStyle: { color: accent }, itemStyle: { color: accent } },
          { name: 'Terminal-RSI', value: [3.5, 2.5, 4, 4, 1], areaStyle: { color: ink + '2a' }, lineStyle: { color: ink, width: 1.5 }, itemStyle: { color: ink } },
          { name: '有界自我精炼', value: [1, 1, 1, 2, 4], areaStyle: { color: muted + '2a' }, lineStyle: { color: muted, type: 'dashed' }, itemStyle: { color: muted } }
        ]
      }]
    });
  }

  // ---------- Taxonomy scatter ----------
  var tax = document.getElementById('chart-tax');
  if (tax) {
    echarts.init(tax, null, { renderer: 'svg' }).setOption({
      animation: false,
      grid: { left: 80, right: 30, top: 30, bottom: 50, containLabel: true },
      tooltip: { trigger: 'item', appendToBody: true, formatter: function(p){ return p.data[2]; } },
      xAxis: {
        type: 'category', name: '闭环程度', nameLocation: 'middle', nameGap: 26,
        nameTextStyle: { color: muted, fontSize: 10 },
        data: ['human-in-the-loop', 'semi-closed', 'closed loop'],
        axisLine: { lineStyle: { color: rule } }, axisTick: { show: false }, axisLabel: { color: ink, fontSize: 10 }
      },
      yAxis: {
        type: 'category', name: '改进对象', nameLocation: 'middle', nameGap: 50,
        nameTextStyle: { color: muted, fontSize: 10 },
        data: ['研究过程', '评估器', '策略/权重', '行为'],
        axisLine: { lineStyle: { color: rule } }, axisTick: { show: false }, axisLabel: { color: ink, fontSize: 10 }
      },
      series: [{
        type: 'scatter', symbolSize: function(v){ return 30; },
        itemStyle: { borderColor: ink, borderWidth: 0.8 },
        data: [
          [1, 2, '<b>DGM</b><br/>代码自我改写'],
          [2, 1, '<b>SEAL</b><br/>权重自编辑'],
          [2, 1, '<b>Terminal-RSI</b><br/>策略 RSR+RPR'],
          [1, 3, '<b>Reflexion</b><br/>答案级'],
          [2, 0, '<b>RSI-Master</b><br/>研究过程'],
          [0, 0, '<b>人类写 RSI taxonomy</b>'],
          [0, 2, '<b>人工训练 DGM 的 LLM 底座</b>']
        ]
      }]
    });
  }

  window.addEventListener('resize', function(){ ['chart-levels','chart-dgm','chart-terminal','chart-constraints','chart-tax'].forEach(function(id){
    var el=document.getElementById(id); if(el){ try { echarts.getInstanceByDom(el).resize(); } catch(e){} }
  }); });
})();
