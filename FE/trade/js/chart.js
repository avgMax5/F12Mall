const chartOptions = {
    canvasId: 'trading-chart',
    
    gap: 0,
    startPos: { x: 0, y: 0 }, // x: X축 시작, y: Y축 기준(위쪽이 0)

    labelFont: "0.889rem KIMM_B",
    labelColor: "#00ff2f",
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


function getCanvasAndContext() {
    const canvas = document.getElementById(chartOptions.canvasId);
    if (!canvas) throw new Error('Canvas element not found');
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas context not found');
    return { canvas, ctx };
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
    const { canvas } = getCanvasAndContext();

    const container = canvas.parentElement;
    if (!container) {
        console.error('Canvas parent container not found!');
        return;
    }

    canvas.width = container.clientWidth;
    canvas.height = canvas.width * 0.8;

    updateChartOptions();
    drawChart(chartOptions);
}

function drawXAxis(ctx, options, geo) {
    ctx.font = options.labelFont;
    ctx.fillStyle = options.labelColor;
    ctx.textAlign = "center";

    options.labels.forEach((label, i) => {
        const date = new Date(label);
        const shortLabel = `${date.getMonth() + 1}/${date.getDate()}`;
        const x = options.startPos.x + i * options.gap;
        const y = options.labelBottom;
        ctx.fillText(shortLabel, x, y);
    });
}

function drawYAxis(ctx, options, geo) {
    const allValues = options.chartRows.flatMap(row => [row.valHigh, row.valLow]);
    const rawMax = Math.max(...allValues);
    const rawMin = Math.min(...allValues);

    const maxY = Math.ceil(rawMax);
    const minY = Math.floor(rawMin);
    const tickCount = 5;
    const step = (maxY - minY) / (tickCount - 1);

    const yTicks = [];
    for (let i = 0; i < tickCount; i++) {
        const v = maxY - step * i;
        yTicks.push(Number(v.toFixed(1)));
    }

    yTicks.forEach((val, idx) => {
        const y = geo.top + ((maxY - val) / (maxY - minY)) * geo.height;

        if (idx === 0 || idx === yTicks.length - 1) {
            ctx.save();
            ctx.setLineDash([3, 6]);
            ctx.strokeStyle = '#00ff2f';
            ctx.beginPath();
            ctx.moveTo(geo.left - geo.padding, y);
            ctx.lineTo(geo.right + geo.padding, y);
            ctx.stroke();
            ctx.restore();
        }

        ctx.fillStyle = '#00ff2f';
        ctx.font = '0.667rem KIMM_B';
        ctx.textAlign = 'left';
        ctx.fillText(val.toLocaleString(), geo.right + geo.padding, y + 4);
    });
}


function drawLineCharts(ctx, options, geo) {
    ['highData', 'lowData'].forEach((key, idx) => {
        const data = options[key];
        const color = idx === 0 ? options.highLineColor : options.lowLineColor;

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
    });
}


function drawBarCharts(ctx, options, geo) {
    const barGroups = [
        { data: options.highData, color: options.highBarColor, offset: options.highBarOffset },
        { data: options.lowData, color: options.lowBarColor, offset: options.lowBarOffset },
    ];

    barGroups.forEach(({ data, color, offset }) => {
        data.forEach((y, i) => {
            const barWidth = options.barWidth;
            const yBase = geo.barBase;
            const x = options.startPos.x + i * options.gap + offset - barWidth / 2;
            const barHeight = getBarHeight(y, options.barMin, options.barMax, options.barHeight);
            ctx.beginPath();
            ctx.rect(x, yBase - barHeight, barWidth, barHeight);
            ctx.fillStyle = color;
            ctx.fill();
        });
    });
}

function drawChart(options) {
    const { canvas, ctx } = getCanvasAndContext();
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const geo = {
        top: canvas.height * 0.1,
        bottom: canvas.height * 0.7,
        left: canvas.width * 0.1,
        right: canvas.width * 0.9,
        width: canvas.width * 0.8,
        height: canvas.height * 0.6,
        barBase: canvas.height * 0.9,
        labelBottom: canvas.height * 0.95,
        padding: 10
    };

    drawXAxis(ctx, options, geo);
    drawYAxis(ctx, options, geo);
    drawLineCharts(ctx, options, geo);
    drawBarCharts(ctx, options, geo);
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
        window.chartDataCache = await getChartRows(coinId);
        fetchAndRenderChart(window.chartDataCache, 'day');

        ['day', 'week', 'month'].forEach(type => {
            const btn = document.getElementById(`chart-btn-${type}`);
            if (btn) {
                btn.addEventListener('click', () => {
                    fetchAndRenderChart(window.chartDataCache, type);
                });
            }
        });
    })(coinId);
});

window.addEventListener('resize', resizeCanvas);

resizeCanvas();