function calculateCorrelation(x, y) {
    const n = x.length;
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = y.reduce((a, b) => a + b, 0);
    const sumXsq = x.reduce((a, b) => a + b * b, 0);
    const sumYsq = y.reduce((a, b) => a + b * b, 0);
    const sumXY = x.reduce((sum, val, i) => sum + val * y[i], 0);

    const numerator = (n * sumXY) - (sumX * sumY);
    const denominator = Math.sqrt((n * sumXsq - sumX * sumX) * (n * sumYsq - sumY * sumY));

    return numerator / denominator;
}
let lastClickedPoint = null;
let originalColors = [];
let originalSizes = [];

function highlightClickedPoint(chartId, pointIndex) {
    const chart = document.getElementById(chartId);

    if (chart) {
        const data = chart.data[0]; // 假設只有一組數據

        if (data && data.marker && data.marker.color && data.marker.size) {
            
            // 檢查數據結構是否正確
            console.log(`檢查${chartId}的數據結構:`, data.marker.color, data.marker.size);

            // 如果是第一次點擊，保存所有點的原始顏色和大小
            if (originalColors.length === 0 && originalSizes.length === 0) {
                originalColors = data.marker.color.slice();
                originalSizes = data.marker.size.slice();
            }

            // 如果有之前點擊的點，將其恢復成原始顏色和大小
            if (lastClickedPoint !== null) {
                data.marker.color[lastClickedPoint] = originalColors[lastClickedPoint];
                data.marker.size[lastClickedPoint] = originalSizes[lastClickedPoint];
            }

            // 將當前點設為黃色並放大
            data.marker.color[pointIndex] = 'yellow';
            data.marker.size[pointIndex] = 12;

            // 更新圖表以反映顏色變更
            Plotly.restyle(chartId, {
                'marker.color': [data.marker.color],
                'marker.size': [data.marker.size]
            }, [0]); // [0] 表示更新第一個 trace

            console.log(`更新${chartId}成功，點擊位置: ${pointIndex}`);

            // 更新 lastClickedPoint 為當前點
            lastClickedPoint = pointIndex;
        } else {
            console.error(`在${chartId}中未找到有效的marker數據`);
        }
    } else {
        console.error(`未能找到圖表元素，chartId: ${chartId}`);
    }
}





function plotGraphs(data, inputDonor, inputAcceptor) {
    const labels = [];
    const pceData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };
    const vocData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };
    const jscData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };
    const ffData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };

    // 處理數據的代碼
    data.forEach(item => {
        const label = `${item.Donor}–${item.Acceptor}`;
        labels.push(label);
        const defaultColor = 'black';
        const defaultSize = 6;

        pceData.x.push(item['PCE (%)']);
        pceData.y.push(item['PCE (%).1']);
        pceData.text.push(label);
        pceData.marker.color.push(defaultColor);
        pceData.marker.size.push(defaultSize);

        vocData.x.push(item['Voc (V)']);
        vocData.y.push(item['Voc (V).1']);
        vocData.text.push(label);
        vocData.marker.color.push(defaultColor);
        vocData.marker.size.push(defaultSize);

        jscData.x.push(item['Jsc (mAcm-2)']);
        jscData.y.push(item['Jsc (mAcm-2).1']);
        jscData.text.push(label);
        jscData.marker.color.push(defaultColor);
        jscData.marker.size.push(defaultSize);

        ffData.x.push(item.FF);
        ffData.y.push(item['FF.1']);
        ffData.text.push(label);
        ffData.marker.color.push(defaultColor);
        ffData.marker.size.push(defaultSize);
    });

    // 標示出與 inputDonor 和 inputAcceptor 相關的項目
    data.forEach((item, index) => {
        if (item.Donor === inputDonor && item.Acceptor !== inputAcceptor) {
            const highlightColor = 'red';
            const highlightSize = 10;
            pceData.marker.color[index] = highlightColor;
            vocData.marker.color[index] = highlightColor;
            jscData.marker.color[index] = highlightColor;
            ffData.marker.color[index] = highlightColor;
        } else if (item.Acceptor === inputAcceptor && item.Donor !== inputDonor) {
            const highlightColor = 'blue';
            const highlightSize = 10;
            pceData.marker.color[index] = highlightColor;
            vocData.marker.color[index] = highlightColor;
            jscData.marker.color[index] = highlightColor;
            ffData.marker.color[index] = highlightColor;
        } else if (item.Donor === inputDonor && item.Acceptor === inputAcceptor) {
            const highlightColor = 'green';
            const highlightSize = 10;
            pceData.marker.color[index] = highlightColor;
            pceData.marker.size[index] = highlightSize;
            vocData.marker.color[index] = highlightColor;
            vocData.marker.size[index] = highlightSize;
            jscData.marker.color[index] = highlightColor;
            jscData.marker.size[index] = highlightSize;
            ffData.marker.color[index] = highlightColor;
            ffData.marker.size[index] = highlightSize;
        }
    });

    // 計算相關性
    const pceCorrelation = calculateCorrelation(pceData.x, pceData.y);
    const vocCorrelation = calculateCorrelation(vocData.x, vocData.y);
    const jscCorrelation = calculateCorrelation(jscData.x, jscData.y);
    const ffCorrelation = calculateCorrelation(ffData.x, ffData.y);

    // 設定佈局
    const layoutTemplate = (title, xTitle, yTitle, xRange, yRange, correlation) => ({
        title: title,
        width: 1000,
        height: 800,
        xaxis: { title: xTitle, range: xRange },
        yaxis: { title: yTitle, range: yRange },
        hovermode: 'closest',
        showlegend: false,
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1,
            y: 0,
            xanchor: 'right',
            yanchor: 'bottom',
            text: `r = ${correlation.toFixed(2)}<br>紅色圓點= Donor, 藍色圓點= Acceptor, 綠色圓點or三角形= Donor + Acceptor`,
            showarrow: false
        }],
        shapes: [{
            type: 'line',
            x0: xRange[0],
            y0: yRange[0],
            x1: xRange[1],
            y1: yRange[1],
            line: {
                color: 'rgba(0, 0, 0, 0.5)',
                width: 2,
                dash: 'dash'
            }
        }]
    });

    // 建立圖表
    const pceLayout = layoutTemplate('PCE (%)', 'Experiment PCE (%)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性能數據', 'Prediction PCE (%)', [0, 20], [0, 20], pceCorrelation);
    const vocLayout = layoutTemplate('Voc (V)', 'Experiment Voc (V)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性能數據', 'Prediction Voc (V)', [0, 1.2], [0, 1.2], vocCorrelation);
    const jscLayout = layoutTemplate('Jsc (mAcm-2)', 'Experiment Jsc (mAcm-2)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性能數據', 'Prediction Jsc (mAcm-2)', [0, 30], [0, 30], jscCorrelation);
    const ffLayout = layoutTemplate('FF', 'Experiment FF<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性能數據', 'Prediction FF', [0, 1], [0, 1], ffCorrelation);

    Plotly.newPlot('chartPCE', [pceData], pceLayout);
    Plotly.newPlot('chartVoc', [vocData], vocLayout);
    Plotly.newPlot('chartJsc', [jscData], jscLayout);
    Plotly.newPlot('chartFF', [ffData], ffLayout);

    document.getElementById('chartPCE').style.display = 'block';
    document.getElementById('chartVoc').style.display = 'block';
    document.getElementById('chartJsc').style.display = 'block';
    document.getElementById('chartFF').style.display = 'block';

    // 使用 Plotly 的方法綁定點擊事件
    charts = ['chartPCE', 'chartVoc', 'chartJsc', 'chartFF'];
    charts.forEach(chartId => {
        const chartElement = document.getElementById(chartId);
        if (chartElement) {
            chartElement.on('plotly_click', function(eventData) {
                if (eventData.points && eventData.points.length > 0) {
                    const pointIndex = eventData.points[0].pointIndex;
                    highlightClickedPoint(chartId, pointIndex);
                }
            });
        }
    });

    // 添加其他事件處理功能
    addPlotlyClickEventForPerformance('chartPCE', data, 'tablePCE_click');
    addPlotlyClickEventForPerformance('chartVoc', data, 'tableVoc_click');
    addPlotlyClickEventForPerformance('chartJsc', data, 'tableJsc_click');
    addPlotlyClickEventForPerformance('chartFF', data, 'tableFF_click');
}






function plotPropertyGraphs(data, inputDonor, inputAcceptor, type) {
    const labels = [];
    const homoaData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };
    const lumoaData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };
    const homodData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };
    const lumodData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };
    const bandgapAcceptorData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };
    const bandgapDonorData = { x: [], y: [], text: [], mode: 'markers', type: 'scatter', marker: { size: [], color: [], opacity: 0.8, line: { width: 0.1 } } };

    data.forEach(item => {
        const label = `${item.Donor}–${item.Acceptor}`;
        labels.push(label);
        if (type === 'donor' || type === 'both') {
            homodData.x.push(item['HOMO of Donor (eV)']);
            homodData.y.push(item['HOMO of Donor (eV).1']);
            homodData.text.push(label);
            homodData.marker.size.push(6);
            homodData.marker.color.push('black');

            lumodData.x.push(item['LUMO of Donor (eV)']);
            lumodData.y.push(item['LUMO of Donor (eV).1']);
            lumodData.text.push(label);
            lumodData.marker.size.push(6);
            lumodData.marker.color.push('black');

            bandgapDonorData.x.push(item['Bandgap of Donor (eV)']);
            bandgapDonorData.y.push(item['Bandgap of Donor (eV).1']);
            bandgapDonorData.text.push(label);
            bandgapDonorData.marker.size.push(6);
            bandgapDonorData.marker.color.push('black');
        }
        if (type === 'acceptor' || type === 'both') {
            homoaData.x.push(item['HOMO of Acceptor (eV)']);
            homoaData.y.push(item['HOMO of Acceptor (eV).1']);
            homoaData.text.push(label);
            homoaData.marker.size.push(6);
            homoaData.marker.color.push('black');

            lumoaData.x.push(item['LUMO of Acceptor (eV)']);
            lumoaData.y.push(item['LUMO of Acceptor (eV).1']);
            lumoaData.text.push(label);
            lumoaData.marker.size.push(6);
            lumoaData.marker.color.push('black');

            bandgapAcceptorData.x.push(item['Bandgap of Acceptor (eV)']);
            bandgapAcceptorData.y.push(item['Bandgap of Acceptor (eV).1']);
            bandgapAcceptorData.text.push(label);
            bandgapAcceptorData.marker.size.push(6);
            bandgapAcceptorData.marker.color.push('black');
        }
    });


    
    // 查找所有與 inputDonor 相關的項目
const donorItems = data.filter(item => item.Donor === inputDonor);

// 查找所有與 inputAcceptor 相關的項目
const acceptorItems = data.filter(item => item.Acceptor === inputAcceptor);

// 標示出與 inputDonor 相關的所有項目
donorItems.forEach(donorItem => {
    const inputLabel = `${donorItem.Donor}–${donorItem.Acceptor}`;

    // 標記顏色為紅色
    homodData.marker.color[homodData.text.indexOf(inputLabel)] = 'red';
    lumodData.marker.color[lumodData.text.indexOf(inputLabel)] = 'red';
    bandgapDonorData.marker.color[bandgapDonorData.text.indexOf(inputLabel)] = 'red';
});

// 標示出與 inputAcceptor 相關的所有項目
acceptorItems.forEach(acceptorItem => {
    const inputLabel = `${acceptorItem.Donor}–${acceptorItem.Acceptor}`;

    // 標記顏色為紅色
    homoaData.marker.color[homoaData.text.indexOf(inputLabel)] = 'red';
    lumoaData.marker.color[lumoaData.text.indexOf(inputLabel)] = 'red';
    bandgapAcceptorData.marker.color[bandgapAcceptorData.text.indexOf(inputLabel)] = 'red';
});


    const homoaCorrelation = calculateCorrelation(homoaData.x, homoaData.y);
    const lumoaCorrelation = calculateCorrelation(lumoaData.x, lumoaData.y);
    const homodCorrelation = calculateCorrelation(homodData.x, homodData.y);
    const lumodCorrelation = calculateCorrelation(lumodData.x, lumodData.y);
    const bandgapAcceptorCorrelation = calculateCorrelation(bandgapAcceptorData.x, bandgapAcceptorData.y);
    const bandgapDonorCorrelation = calculateCorrelation(bandgapDonorData.x, bandgapDonorData.y);

    const homoaLayout = {
        title: 'HOMO of Acceptor (eV)',
        width: 1000,
        height: 800,
        xaxis: { title: 'Experiment HOMO of Acceptor (eV)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性質數據' },
        yaxis: { title: 'Prediction HOMO of Acceptor (eV)' },
        hovermode: 'closest',
        showlegend: false,
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1,
            y: 0,
            xanchor: 'right',
            yanchor: 'bottom',
            text: `r = ${homoaCorrelation.toFixed(2)}<br>紅色圓點or藍色三角形代表輸入材料`,
            showarrow: false
        }],
        shapes: [
            {
                type: 'line',
                x0: -4,
                y0: -4,
                x1: -7,
                y1: -7,
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dash'
                }
            }
        ]
    };

    const lumoaLayout = {
        title: 'LUMO of Acceptor (eV)',
        width: 1000,
        height: 800,
        xaxis: { title: 'Experiment LUMO of Acceptor (eV)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性質數據' },
        yaxis: { title: 'Prediction LUMO of Acceptor (eV)' },
        hovermode: 'closest',
        showlegend: false,
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1,
            y: 0,
            xanchor: 'right',
            yanchor: 'bottom',
            text: `r = ${lumoaCorrelation.toFixed(2)}<br>紅色圓點or藍色三角形代表輸入材料`,
            showarrow: false
        }],
        shapes: [
            {
                type: 'line',
                x0: -2,
                y0: -2,
                x1: -5,
                y1: -5,
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dash'
                }
            }
        ]
    };

    const homodLayout = {
        title: 'HOMO of Donor (eV)',
        width: 1000,
        height: 800,
        xaxis: { title: 'Experiment HOMO of Donor (eV)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性質數據' },
        yaxis: { title: 'Prediction HOMO of Donor (eV)' },
        hovermode: 'closest',
        showlegend: false,
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1,
            y: 0,
            xanchor: 'right',
            yanchor: 'bottom',
            text: `r = ${homodCorrelation.toFixed(2)}<br>紅色圓點or藍色三角形代表輸入材料`,
            showarrow: false
        }],
        shapes: [
            {
                type: 'line',
                x0: -4,
                y0: -4,
                x1: -6.5,
                y1: -6.5,
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dash'
                }
            }
        ]
    };

    const lumodLayout = {
        title: 'LUMO of Donor (eV)',
        width: 1000,
        height: 800,
        xaxis: { title: 'Experiment LUMO of Donor (eV)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性質數據' },
        yaxis: { title: 'Prediction LUMO of Donor (eV)' },
        hovermode: 'closest',
        showlegend: false,
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1,
            y: 0,
            xanchor: 'right',
            yanchor: 'bottom',
            text: `r = ${lumodCorrelation.toFixed(2)}<br>紅色圓點or藍色三角形代表輸入材料`,
            showarrow: false
        }],
        shapes: [
            {
                type: 'line',
                x0: -2,
                y0: -2,
                x1: -5,
                y1: -5,
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dash'
                }
            }
        ]
    };

    const bandgapAcceptorLayout = {
        title: 'Bandgap of Acceptor (eV)',
        width: 1000,
        height: 800,
        xaxis: { title: 'Experiment Bandgap of Acceptor (eV)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性質數據' },
        yaxis: { title: 'Prediction Bandgap of Acceptor (eV)' },
        hovermode: 'closest',
        showlegend: false,
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1,
            y: 0,
            xanchor: 'right',
            yanchor: 'bottom',
            text: `r = ${bandgapAcceptorCorrelation.toFixed(2)}<br>紅色圓點or藍色三角形代表輸入材料`,
            showarrow: false
        }],
        shapes: [
            {
                type: 'line',
                x0: 3,
                y0: 3,
                x1: 1,
                y1: 1,
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dash'
                }
            }
        ]
    };

    const bandgapDonorLayout = {
        title: 'Bandgap of Donor (eV)',
        width: 1000,
        height: 800,
        xaxis: { title: 'Experiment Bandgap of Donor (eV)<br>按下數據點，數據點將變為黃色，並可以觀看化學結構及性質數據' },
        yaxis: { title: 'Prediction Bandgap of Donor (eV)' },
        hovermode: 'closest',
        showlegend: false,
        annotations: [{
            xref: 'paper',
            yref: 'paper',
            x: 1,
            y: 0,
            xanchor: 'right',
            yanchor: 'bottom',
            text: `r = ${bandgapDonorCorrelation.toFixed(2)}<br>紅色圓點or藍色三角形代表輸入材料`,
            showarrow: false
        }],
        shapes: [
            {
                type: 'line',
                x0: 3.5,
                y0: 3.5,
                x1: 1,
                y1: 1,
                line: {
                    color: 'grey',
                    width: 2,
                    dash: 'dash'
                }
            }
        ]
    };

    Plotly.newPlot('chartHOMOAcceptor', [homoaData], homoaLayout);
    Plotly.newPlot('chartLUMOAcceptor', [lumoaData], lumoaLayout);
    Plotly.newPlot('chartHOMODonor', [homodData], homodLayout);
    Plotly.newPlot('chartLUMODonor', [lumodData], lumodLayout);
    Plotly.newPlot('chartBandgapAcceptor', [bandgapAcceptorData], bandgapAcceptorLayout);
    Plotly.newPlot('chartBandgapDonor', [bandgapDonorData], bandgapDonorLayout);

    document.getElementById('chartHOMOAcceptor').style.display = 'block';
    document.getElementById('chartLUMOAcceptor').style.display = 'block';
    document.getElementById('chartHOMODonor').style.display = 'block';
    document.getElementById('chartLUMODonor').style.display = 'block';
    document.getElementById('chartBandgapAcceptor').style.display = 'block';
    document.getElementById('chartBandgapDonor').style.display = 'block';

    // 添加事件處理功能
    addPlotlyClickEventForProperties('chartHOMOAcceptor', data, 'tableHOMOAcceptor_click');
    addPlotlyClickEventForProperties('chartLUMOAcceptor', data, 'tableLUMOAcceptor_click');
    addPlotlyClickEventForProperties('chartHOMODonor', data, 'tableHOMODonor_click');
    addPlotlyClickEventForProperties('chartLUMODonor', data, 'tableLUMODonor_click');
    addPlotlyClickEventForProperties('chartBandgapAcceptor', data, 'tableBandgapAcceptor_click');
    addPlotlyClickEventForProperties('chartBandgapDonor', data, 'tableBandgapDonor_click');
}


