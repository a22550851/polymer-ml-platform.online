function createPredictionOnlyTable(data, materialName = '') {
    return `
        <div class="table-container">
            <h3>${materialName}</h3>
            <table>
                <tr>
                    <th>Performance</th>
                    <th>Prediction</th>
                </tr>
                <tr>
                    <td>PCE (%)</td>
                    <td>${data['PCE (%).1']}</td>
                </tr>
                <tr>
                    <td>Voc (V)</td>
                    <td>${data['Voc (V).1']}</td>
                </tr>
                <tr>
                    <td>Jsc (mAcm-2)</td>
                    <td>${data['Jsc (mAcm-2).1']}</td>
                </tr>
                <tr>
                    <td>FF</td>
                    <td>${data['FF.1']}</td>
                </tr>
            </table>
        </div>
    `;
}
function getValuesForDonorAndAcceptor(donorName, acceptorName, metric, data) {
    const matchedItems = data.filter(item => item.Donor === donorName && item.Acceptor === acceptorName);
    const values = matchedItems.map(item => item[metric]);
    return values;
}
function calculateMeanAndStdDevForDonorAndAcceptor(donorName, acceptorName, data) {
    // 定義要計算的性能指標
    const metrics = ['PCE (%)', 'Jsc (mAcm-2)', 'Voc (V)', 'FF'];
    let results = {};

    // 對每個性能指標進行計算
    metrics.forEach(metric => {
        // 使用 getValuesForDonorAndAcceptor 函數提取數據
        const values = getValuesForDonorAndAcceptor(donorName, acceptorName, metric, data);

        if (values.length === 0) {
            results[metric] = { mean: 'N/A', stdDev: 'N/A' };
        } else {
            // 計算平均值
            const mean = (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 計算標準差
            const stdDev = Math.sqrt(values.map(value => Math.pow(value - mean, 2)).reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 存儲結果
            results[metric] = { mean, stdDev };
        }
    });

    return results;
}
// 定義 calculateError 函數
function calculateError(mean, predicted) {
    if (!mean || !predicted) {
        return 'N/A';
    }
    const error = ((predicted - mean) / mean) * 100;
    return error.toFixed(2);
}

// 其他代碼...

function createDonorandAcceptorPerformanceTable(donorName, acceptorName, data) {
    const results = calculateMeanAndStdDevForDonorAndAcceptor(donorName, acceptorName, data);

    let tableHtml = '';
    const tableStyle = 'border: 1px solid black; border-collapse: collapse; width: 100%;';
    const thStyle = 'border: 1px solid black; padding: 8px; background-color: #f2f2f2; text-align: center;';
    const tdStyle = 'border: 1px solid black; padding: 8px; text-align: center;';

    tableHtml += `<h3>${donorName} / ${acceptorName} 的性能數據</h3>`;
    tableHtml += `<table style="${tableStyle}">`;
    tableHtml += `<tr><th style="${thStyle}">參數</th><th style="${thStyle}">實驗平均值 ± 標準差</th><th style="${thStyle}">預測值</th><th style="${thStyle}">誤差</th></tr>`;

    Object.entries(results).forEach(([metric, stats]) => {
        const predictedValue = data.find(item => item.Donor === donorName && item.Acceptor === acceptorName)[`${metric}.1`];
        const error = calculateError(stats.mean, predictedValue);

        tableHtml += `<tr><td style="${tdStyle}">${metric}</td><td style="${tdStyle}">${stats.mean} ± ${stats.stdDev}</td><td style="${tdStyle}">${predictedValue}</td><td style="${tdStyle}">${error}%</td></tr>`;
    });

    tableHtml += '</table>';
    return tableHtml;
}







function generatePredictionTable(data, type, materialName = '') {
    let propertiesTable = `
        <div class="table-container">
            <table>
                <tr>
                    <th>Property</th>
                    <th>Prediction</th>
                </tr>
    `;
    if (type === 'donor' || type === 'both') {
        propertiesTable += `
            <tr>
                <td>HOMO of Donor (eV)</td>
                <td>${Number(data['HOMO of Donor (eV).1']).toPrecision(3)}</td>
            </tr>
            <tr>
                <td>LUMO of Donor (eV)</td>
                <td>${Number(data['LUMO of Donor (eV).1']).toPrecision(3)}</td>
            </tr>
            <tr>
                <td>Bandgap of Donor (eV)</td>
                <td>${Number(data['Bandgap of Donor (eV).1']).toPrecision(3)}</td>
            </tr>
        `;
    }
    if (type === 'acceptor' || type === 'both') {
        propertiesTable += `
            <tr>
                <td>HOMO of Acceptor (eV)</td>
                <td>${Number(data['HOMO of Acceptor (eV).1']).toPrecision(3)}</td>
            </tr>
            <tr>
                <td>LUMO of Acceptor (eV)</td>
                <td>${Number(data['LUMO of Acceptor (eV).1']).toPrecision(3)}</td>
            </tr>
            <tr>
                <td>Bandgap of Acceptor (eV)</td>
                <td>${Number(data['Bandgap of Acceptor (eV).1']).toPrecision(3)}</td>
            </tr>
        `;
    }

    propertiesTable += '</table></div>';
    return materialName ? `<h3>${materialName}</h3>${propertiesTable}` : propertiesTable;
}


function getValuesForDonor(donorName, metric, data) {
    // 使用 filter 過濾出所有 Donor 名字與 donorName 匹配的項目
    const matchedItems = data.filter(item => item.Donor === donorName);

    // 使用 map 提取出所有匹配項目的指定性能指標的值
    const values = matchedItems.map(item => item[metric]);

    return values;
}
function calculateMeanAndStdDevForDonor(donorName, data) {
    // 定義要計算的性質指標
    const metrics = ['HOMO of Donor (eV)', 'LUMO of Donor (eV)', 'Bandgap of Donor (eV)'];
    let results = {};

    // 對每個性質指標進行計算
    metrics.forEach(metric => {
        // 使用 getValuesForDonor 函數提取數據
        const values = getValuesForDonor(donorName, metric, data);

        if (values.length === 0) {
            results[metric] = { mean: 'N/A', stdDev: 'N/A' };
        } else {
            // 計算平均值
            const mean = (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 計算標準差
            const stdDev = Math.sqrt(values.map(value => Math.pow(value - mean, 2)).reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 存儲結果
            results[metric] = { mean, stdDev };
        }
    });

    return results;
}

function getValuesForAcceptor(acceptorName, metric, data) {
    // 使用 filter 過濾出所有 Acceptor 名字與 acceptorName 匹配的項目
    const matchedItems = data.filter(item => item.Acceptor === acceptorName);

    // 使用 map 提取出所有匹配項目的指定性能指標的值
    const values = matchedItems.map(item => item[metric]);

    return values;
}
function calculateMeanAndStdDevForAcceptor(acceptorName, data) {
    // 定義要計算的性質指標
    const metrics = ['HOMO of Acceptor (eV)', 'LUMO of Acceptor (eV)', 'Bandgap of Acceptor (eV)'];
    let results = {};

    // 對每個性質指標進行計算
    metrics.forEach(metric => {
        // 使用 getValuesForAcceptor 函數提取數據
        const values = getValuesForAcceptor(acceptorName, metric, data);

        if (values.length === 0) {
            results[metric] = { mean: 'N/A', stdDev: 'N/A' };
        } else {
            // 計算平均值
            const mean = (values.reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 計算標準差
            const stdDev = Math.sqrt(values.map(value => Math.pow(value - mean, 2)).reduce((sum, value) => sum + value, 0) / values.length).toFixed(2);

            // 存儲結果
            results[metric] = { mean, stdDev };
        }
    });

    return results;
}
function createDonorPropertiesTable(donorName, data) {
    const results = calculateMeanAndStdDevForDonor(donorName, data);

    let tableHtml = '';
    const tableStyle = 'border: 1px solid black; border-collapse: collapse; width: 100%;';
    const thStyle = 'border: 1px solid black; padding: 8px; background-color: #f2f2f2; text-align: center;';
    const tdStyle = 'border: 1px solid black; padding: 8px; text-align: center;';

    tableHtml += `<h3>${donorName} 的 Donor 性質</h3>`;
    tableHtml += `<table style="${tableStyle}">`;
    tableHtml += `<tr><th style="${thStyle}">參數</th><th style="${thStyle}">實驗平均值 ± 標準差</th><th style="${thStyle}">預測值</th><th style="${thStyle}">誤差</th></tr>`;

    Object.entries(results).forEach(([metric, stats]) => {
        const predictedValue = data.find(item => item.Donor === donorName)[`${metric}.1`];
        const formattedPredictedValue = predictedValue.toPrecision(3);  // 格式化為三位有效數字
        const error = calculateError(stats.mean, predictedValue);

        tableHtml += `<tr><td style="${tdStyle}">${metric}</td><td style="${tdStyle}">${stats.mean} ± ${stats.stdDev}</td><td style="${tdStyle}">${formattedPredictedValue}</td><td style="${tdStyle}">${error}%</td></tr>`;
    });

    tableHtml += '</table>';
    return tableHtml;
}


function createAcceptorPropertiesTable(acceptorName, data) {
    const results = calculateMeanAndStdDevForAcceptor(acceptorName, data);

    let tableHtml = '';
    const tableStyle = 'border: 1px solid black; border-collapse: collapse; width: 100%;';
    const thStyle = 'border: 1px solid black; padding: 8px; background-color: #f2f2f2; text-align: center;';
    const tdStyle = 'border: 1px solid black; padding: 8px; text-align: center;';

    tableHtml += `<h3>${acceptorName} 的 Acceptor 性質</h3>`;
    tableHtml += `<table style="${tableStyle}">`;
    tableHtml += `<tr><th style="${thStyle}">參數</th><th style="${thStyle}">實驗平均值 ± 標準差</th><th style="${thStyle}">預測值</th><th style="${thStyle}">誤差</th></tr>`;

    Object.entries(results).forEach(([metric, stats]) => {
        const predictedValue = data.find(item => item.Acceptor === acceptorName)[`${metric}.1`];
        const formattedPredictedValue = predictedValue.toPrecision(3);  // 格式化為三位有效數字
        const error = calculateError(stats.mean, predictedValue);

        tableHtml += `<tr><td style="${tdStyle}">${metric}</td><td style="${tdStyle}">${stats.mean} ± ${stats.stdDev}</td><td style="${tdStyle}">${formattedPredictedValue}</td><td style="${tdStyle}">${error}%</td></tr>`;
    });

    tableHtml += '</table>';
    return tableHtml;
}



