// 동적으로 차트 생성 함수
export function renderPieChart(myQuantity) {
  const chartDom = document.getElementById('graph');
  const myChart = echarts.init(chartDom);

  const sellQuantity = 1000 - myQuantity;

  const option = {
    tooltip: {
      trigger: 'item',
    },
    legend: {
      bottom: '5%',
      left: 'center',
      itemGap: 20,
      textStyle: {
        color: '#ffffff',
        fontSize: 12,
      },
    },
    series: [
      {
        name: '보유 현황',
        type: 'pie',
        radius: ['30%', '80%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: 'transparent',
          borderWidth: 2,
        },
        label: {
          show: false,
          position: 'center',
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 30,
            fontWeight: 'bold',
            color: '#ffffff',
          },
        },
        labelLine: {
          show: false,
        },
        data: [
          {
            value: sellQuantity,
            name: '매도량',
            itemStyle: {
              color: '#FF3700',

              shadowBlur: 10,
              shadowColor: 'rgba(243, 0, 0, 0.4)',
              shadowOffsetX: 4,
              shadowOffsetY: 4,
            },
          },
          {
            value: myQuantity,
            name: '보유량',
            itemStyle: {
              color: '#00FF2F',
              shadowBlur: 10,
              shadowColor: 'rgba(0, 255, 47, 0.4)',
              shadowOffsetX: 4,
              shadowOffsetY: 4,
            },
          },
        ],
      },
    ],
  };

  myChart.setOption(option);
}
