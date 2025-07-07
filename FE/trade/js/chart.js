const chartOptions = {
    canvasId: 'trading-chart',
    
    gap: 0,
    startPos: { x: 0, y: 0 }, // x: X축 시작, y: Y축 기준(위쪽이 0)

    labelFont: "16px sans-serif",
    labelColor: "#fff",
    labelBottom: 730, // 하단 여백 위
    lineWidth: 3,
    pointRadius: 4,
    pointLineWidth: 2,
    barWidth: 15,
    barBase: 700,

    // 데이터에서 자동 계산
    barMax: null,
    barMin: null,
    
    // 그래프 색상 정의
    highLineColor: '#E01200',
    lowLineColor: '#1376EE',
    highBarColor: '#FF4D4D',
    lowBarColor: '#66FF66',

    highBarOffset: -10,
    lowBarOffset: 10,
    chartHeight: 400, // 차트 영역 높이 (선그래프용)
    barHeight: 100,   // 막대그래프 최대 높이

    // 차트 데이터 영역 추가
    chartRows: [],
    labels: [],
    closeData: [],
    highData: [],
    lowData: [],
};

const canvas = document.getElementById(chartOptions.canvasId);
if (!canvas) {
    console.error('Canvas element not found!');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
    console.error('Canvas context not available!');
}

// y축 변환을 위한 최소/최대값 동적 계산
function getMinMax(arrays) {
    let min = Infinity, max = -Infinity;
    arrays.forEach(arr => {
        arr.forEach(v => {
            if (v < min) min = v;
            if (v > max) max = v;
        });
    });
    return { min, max };
}

// y값을 캔버스 y좌표로 변환하는 함수 (선그래프용)
function valueToY(val, yBase, yMin, yMax, chartHeight) {
    return yBase - ((val - yMin) / (yMax - yMin)) * chartHeight;
}

// 막대그래프 높이 계산 함수
function getBarHeight(val, yMin, yMax, maxHeight) {
    return ((val - yMin) / (yMax - yMin)) * maxHeight;
}

// 차트 옵션을 동적으로 업데이트하는 함수
function updateChartOptions() {
    const canvas = document.getElementById(chartOptions.canvasId);
    if (!canvas) return;
    
    const width = canvas.width;
    const height = canvas.height;

    if (width <= 0 || height <= 0) {
        console.warn('Canvas size is invalid:', width, height);
        canvas.width = 800;
        canvas.height = 600;
    }

    chartOptions.gap = Math.max(30, Math.min(80, canvas.width / 12)); // 최소 30, 최대 80

    chartOptions.startPos.x = Math.max(0, canvas.width * 0.1); // 좌측 여백
    chartOptions.startPos.y = canvas.height * 0.8; // Y축 기준점
    chartOptions.labelBottom = canvas.height * 0.95; // 하단 라벨 위치

    chartOptions.barBase = canvas.height * 0.9; // 막대그래프 기준점
    chartOptions.chartHeight = canvas.height * 0.6; // 차트 영역 높이
    chartOptions.barHeight = canvas.height * 0.15; // 막대그래프 높이
    chartOptions.barWidth = Math.max(8, Math.min(20, canvas.width / 50)); // 막대 너비

    chartOptions.pointRadius = Math.max(2, Math.min(6, canvas.width / 150)); // 점 크기
    chartOptions.lineWidth = Math.max(1, Math.min(4, canvas.width / 200)); // 선 두께
    
    // 시작, 끝 점 기준으로 gap 계산
    const startX = Math.max(30, width * 0.1);
    chartOptions.startPos = {
        x: startX,
        y: height * 0.7
    };

    const dataCount = chartOptions.labels.length;
    const drawableWidth = width - startX * 2;
    if (dataCount > 1) {
        chartOptions.gap = drawableWidth / (dataCount - 1);
    } else {
        chartOptions.gap = 0; // 데이터가 1개일 때
    }
}

function resizeCanvas() {
    const container = canvas.parentElement;
    if (!container) {
        console.error('Canvas parent container not found!');
        // canvas.width = 0;
        // canvas.height = 0;
    } else {
        canvas.width = container.clientWidth;
        canvas.height = canvas.width * 0.8;
    }
    
    updateChartOptions();
    drawChart(chartOptions);
}

function drawChart(options) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const chartGeometry = {
        top: options.startPos.y - options.chartHeight,
        left: options.startPos.x,
        right: canvas.width - options.startPos.x,
        bottom: options.startPos.y,
        height: options.chartHeight,
        padding: 10,
    };

    // X축 그리기 (날짜)
    ctx.font = options.labelFont;
    ctx.fillStyle = options.labelColor;
    ctx.textAlign = "center";
    
    chartOptions.labels.forEach((label, i) => {
        const date = new Date(label);
        const shortLabel = `${date.getMonth() + 1}/${date.getDate()}`;  // ex: 7/1
        const x = options.startPos.x + i * options.gap;
        const y = options.labelBottom;
        ctx.fillText(shortLabel, x, y);
    });

    // Y축 표시 (금액)
    const allValues = chartOptions.chartRows.flatMap(row => [row.valHigh, row.valLow]);
    const rawMax = Math.max(...allValues);
    const rawMin = Math.min(...allValues);

    const maxY = Math.ceil(rawMax);
    const minY = Math.floor(rawMin);
    const tickCount = 5; // Y축 눈금 개수
    const step = (maxY - minY) / (tickCount - 1);

    const yTicks = [];
    for (let i = 0; i < tickCount; i++) {
        const v = maxY - step * i;
        yTicks.push(Number(v.toFixed(1)));
    }

    // drawYAxisGuides 함수 (구분선)
    function drawYAxisGuides(yTicks, geo, maxY, minY, dashed = true) {
        yTicks.forEach((val, idx) => {
            const y = geo.top + ((maxY - val) / (maxY - minY)) * geo.height;
    
            if (idx === 0 || idx === yTicks.length - 1) {
                ctx.save();
                ctx.setLineDash(dashed ? [3, 6] : []);
                ctx.strokeStyle = '#fff';
                ctx.beginPath();
                ctx.moveTo(geo.left - geo.padding, y);
                ctx.lineTo(geo.right + geo.padding, y);
                ctx.stroke();
                ctx.restore();
            }
    
            ctx.fillStyle = '#fff';
            ctx.font = '12px Pretendard, sans-serif';
            ctx.textAlign = 'left';
            ctx.fillText(val.toLocaleString(), geo.right + geo.padding, y + 4);
        });
    }
    
    // line Graph
    function drawLine(data, color, geo) {
        drawYAxisGuides(yTicks, geo, maxY, minY, true);
    
        ctx.beginPath();
        data.forEach((y, i) => {
            const x = options.startPos.x + i * options.gap;
            const yPos = valueToY(y, options.startPos.y, options.barMin, options.barMax, geo.height);
    
            if (i === 0) ctx.moveTo(x, yPos);
            else ctx.lineTo(x, yPos);
        });
    
        ctx.strokeStyle = color;
        ctx.lineWidth = options.lineWidth;
        ctx.stroke();
    
        data.forEach((y, i) => {
            const x = options.startPos.x + i * options.gap;
            const yPos = valueToY(y, options.startPos.y, options.barMin, options.barMax, geo.height);
            ctx.beginPath();
            ctx.arc(x, yPos, options.pointRadius, 0, 2 * Math.PI);
            ctx.fillStyle = color;
            ctx.fill();
            ctx.lineWidth = options.pointLineWidth;
            ctx.stroke();
        });
    }

    // Bar Graph
    function drawBar(data, color, xOffset, geo) {
        const barWidth = options.barWidth;
        const yBase = options.barBase;
        const yMax = options.barMax;
        const yMin = options.barMin;
    
        data.forEach((y, i) => {
            const x = options.startPos.x + i * options.gap + xOffset - barWidth / 2;
            const barHeight = getBarHeight(y, yMin, yMax, options.barHeight);
            ctx.beginPath();
            ctx.rect(x, yBase - barHeight, barWidth, barHeight);
            ctx.fillStyle = color;
            ctx.fill();
        });
    }
    
    drawLine(chartOptions.highData, options.highLineColor, chartGeometry); // 고가 라인 그래프
    drawLine(chartOptions.lowData, options.lowLineColor, chartGeometry); // 저가 라인 그래프
    drawBar(chartOptions.highData, options.highBarColor, options.highBarOffset, chartGeometry); // 고가 막대 그래프
    drawBar(chartOptions.lowData, options.lowBarColor, options.lowBarOffset, chartGeometry); // 저가 막대 그래프
}

function groupByStartOf(type, rows) {
    const grouped = new Map();

    rows.forEach(row => {
        const date = new Date(row.chartDate);

        let key;
        if (type === 'week') {
            // 매주 월요일을 기준으로 그룹화
            const monday = new Date(date);
            const day = monday.getDay();
            const diff = day === 0 ? -6 : 1 - day; // 일요일이면 -6, 그 외는 월요일로 이동
            monday.setDate(date.getDate() + diff); // 월요일로 맞춰주기
            // monday.setHours(0, 0, 0, 0); // 이부분은 제거 필요할 수도
            key = monday.toISOString().split('T')[0];
        } else if (type === 'month') {
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else {
            key = row.chartDate;
        }

        if (!grouped.has(key)) {
            grouped.set(key, row); // 첫 번째 데이터만 저장
        }
    });

    return Array.from(grouped.values())
        .sort((a, b) => new Date(a.chartDate) - new Date(b.chartDate))
        .slice(-6); // 최신 6개만
}

function fetchAndRenderChart(allRows, type) {
    if (!allRows || !Array.isArray(allRows)) return;

    const filtered = groupByStartOf(type, allRows);

    chartOptions.chartRows = filtered;
    chartOptions.labels = filtered.map(row => row.chartDate);
    chartOptions.closeData = filtered.map(row => row.valClose);
    chartOptions.highData = filtered.map(row => row.valHigh);
    chartOptions.lowData = filtered.map(row => row.valLow);

    const { min: yMin, max: yMax } = getMinMax([
        chartOptions.highData,
        chartOptions.lowData,
        chartOptions.closeData
    ]);

    const yRange = yMax - yMin;
    const padding = yRange * 0.08;

    chartOptions.barMin = yMin - padding;
    chartOptions.barMax = yMax + padding;

    resizeCanvas();
}

document.querySelectorAll('.chart-header .tab').forEach((btn) => {
    btn.addEventListener('click', function() {
        document.querySelectorAll('.chart-header .tab').forEach((b) => b.classList.remove('active'));
        this.classList.add('active');
    });
});

document.addEventListener('DOMContentLoaded', function() {
    const coinId = window.tradeCoinId;

    (async (coinId) => {
        const result = await getChartRows(coinId);
        fetchAndRenderChart(result, 'month');

        const btn1 = document.getElementById('chart-btn-day');
        if (btn1) {
            btn1.addEventListener('click', async function() {
                fetchAndRenderChart(result, 'day');
            });
        }

        const btn2 = document.getElementById('chart-btn-week');
        if (btn2) {
            btn2.addEventListener('click', async function() {
                fetchAndRenderChart(result, 'week');
            });
        }

        const btn3 = document.getElementById('chart-btn-month');
        if (btn3) {
            btn3.addEventListener('click', async function() {
                fetchAndRenderChart(result, 'month');
            });
        }
    })(coinId);
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();