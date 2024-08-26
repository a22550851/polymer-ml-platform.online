let defaultData = data;  // 預設數據
let currentData = defaultData;  // 當前使用的數據
const parameters = ['HOMO of Donor (eV)', 'LUMO of Donor (eV)', 'Bandgap of Donor (eV)', 'HOMO of Acceptor (eV)', 'LUMO of Acceptor (eV)', 'Bandgap of Acceptor (eV)', 'PCE (%)', 'Voc (V)', 'Jsc (mAcm-2)', 'FF'];

function processData(json) {
    populateSelect('x-axis', parameters);
}

function populateSelect(selectId, options) {
    const select = document.getElementById(selectId);
    select.innerHTML = '';
    options.forEach(option => {
        const opt = document.createElement('option');
        opt.value = option;
        opt.innerHTML = option;
        select.appendChild(opt);
    });
}

function updateYSelect() {
    const xAxis = document.getElementById('x-axis').value;
    const yOptions = parameters.filter(param => param !== xAxis);
    populateSelect('y-axis', yOptions);
    document.getElementById('y-axis').disabled = false;  // 啟用Y軸選擇
}



function updateChart(data) {
    const xAxis = document.getElementById('x-axis').value;
    const yAxis = document.getElementById('y-axis').value;

    const xData = data.map(d => d[xAxis]);
    const yData = data.map(d => d[yAxis]);
    const hoverText = data.map(d => 
        `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`);

    const trace1 = {
        x: xData,
        y: yData,
        text: hoverText,
        mode: 'markers',
        type: 'scatter',
        hoverinfo: 'text',
        name: 'Default Data',
        marker: {
            color: 'black',  // 設置點的顏色為黑色
            size: 6,  // 調整點的大小（可以根據需求調整）
            opacity: 0.8,  // 調整點的透明度（0 到 1 之間，1 為完全不透明）
            line: {
                color: 'white',  // 設置點的邊框顏色
                width: 0.1  // 設置點邊框的寬度
            }
        }
    };



    const layout = {
        title: `${xAxis} vs ${yAxis}`,
        xaxis: { 
            title: `${xAxis}<br><span style="font-size:12px; color:black;">按下數據點，數據點將變為黃色，並可以觀看材料結構及數據</span>` 
        },
        yaxis: { title: yAxis },
        hovermode: 'closest',
        width: 1000,
        height: 800
    };
    
    

    // 渲染圖表
    Plotly.newPlot('chart', [trace1], layout);


    // 顯示輸入框
    document.querySelector('.input-container').style.display = 'flex';

    // 添加點擊事件處理邏輯
    addPlotlyClickEvent('chart', data, 'tableId');
}
function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布內容
    }
}
document.getElementById('actionButton').addEventListener('click', function() {
    clearCanvas('clickedDonorCanvas1');
    clearCanvas('clickedAcceptorCanvas1');
    // 获取输入框中的 Donor 和 Acceptor 值
    const donor = document.getElementById('input1').value.trim();
    const acceptor = document.getElementById('input2').value.trim();
    
    // 呼叫查找並標示材料的函數，传递 donor 和 acceptor
    highlightMaterial(donor, acceptor);
});

function highlightMaterial(donor, acceptor) {
    let donorItem = [];
    let acceptorItem = [];
    let matchingItem = [];
    let donorTableHtml = ''; // 初始化表格 HTML
    let acceptorTableHtml = '';
    let performanceTableHtml = '';

    // 如果只輸入 Donor
    if (donor && !acceptor) {
        donorItem = currentData.filter(item => 
            typeof item.Donor === 'string' &&
            item.Donor.trim().toLowerCase() === donor.toLowerCase()
        );

        // 如果找到匹配的 Donor
        if (donorItem.length > 0) {
            updateMatchedChart(donorItem, [], []);
            
            // 渲染 Donor 的化學結構
            renderSmiles(donorItem[0]['Donor SMILES'], 'clickedDonorCanvas1', 'Clicked Donor Structure', donorItem[0]['Donor']);
            
            // 生成 Donor 的性質表格（藍色）
            donorTableHtml = createDonorPropertiesTable(donor, currentData);
            donorTableHtml = `${donorTableHtml}`; // 将表格内容设为蓝色

            // 更新表格的 DOM 元素
            document.getElementById('tableId').innerHTML = donorTableHtml;
            document.getElementById('tableId').style.display = 'block'; // 确保表格可见

            console.log(`Highlighted entries for Donor: ${donor}`);
        } else {
            console.warn(`No matching entries found for Donor: ${donor}`);
        }
    } 
    // 如果只輸入 Acceptor
    else if (!donor && acceptor) {
        acceptorItem = currentData.filter(item => 
            typeof item.Acceptor === 'string' &&
            item.Acceptor.trim().toLowerCase() === acceptor.toLowerCase()
        );

        // 如果找到匹配的 Acceptor
        if (acceptorItem.length > 0) {
            updateMatchedChart([], acceptorItem, []);
            
            // 渲染 Acceptor 的化學結構
            renderSmiles(acceptorItem[0]['Acceptor SMILES'], 'clickedAcceptorCanvas1', 'Clicked Acceptor Structure', acceptorItem[0]['Acceptor']);
            
            // 生成 Acceptor 的性質表格（紅色）
            acceptorTableHtml = createAcceptorPropertiesTable(acceptor, currentData);
            acceptorTableHtml = `${acceptorTableHtml}`; // 将表格内容设为红色

            // 更新表格的 DOM 元素
            document.getElementById('tableId').innerHTML = acceptorTableHtml;
            document.getElementById('tableId').style.display = 'block'; // 确保表格可见

            console.log(`Highlighted entries for Acceptor: ${acceptor}`);
        } else {
            console.warn(`No matching entries found for Acceptor: ${acceptor}`);
        }
    } 
    // 如果同時輸入 Donor 和 Acceptor
    else if (donor && acceptor) {
        donorItem = currentData.filter(item => 
            typeof item.Donor === 'string' &&
            item.Donor.trim().toLowerCase() === donor.toLowerCase()
        );

        acceptorItem = currentData.filter(item => 
            typeof item.Acceptor === 'string' &&
            item.Acceptor.trim().toLowerCase() === acceptor.toLowerCase()
        );

        matchingItem = currentData.filter(item => 
            typeof item.Donor === 'string' &&
            typeof item.Acceptor === 'string' &&
            item.Donor.trim().toLowerCase() === donor.toLowerCase() && 
            item.Acceptor.trim().toLowerCase() === acceptor.toLowerCase()
        );

        // 如果找到匹配的 Donor 和 Acceptor 組合
        if (matchingItem.length > 0) {
            updateMatchedChart(donorItem, acceptorItem, matchingItem);
            
            // 渲染 Donor 和 Acceptor 的化學結構
            renderSmiles(matchingItem[0]['Donor SMILES'], 'clickedDonorCanvas1', 'Clicked Donor Structure', matchingItem[0]['Donor']);
            renderSmiles(matchingItem[0]['Acceptor SMILES'], 'clickedAcceptorCanvas1', 'Clicked Acceptor Structure', matchingItem[0]['Acceptor']);
            
            // 生成 Donor 和 Acceptor 的性質及性能表格
            donorTableHtml = createDonorPropertiesTable(donor, currentData);
            donorTableHtml = `${donorTableHtml}`; // Donor 表格内容设为蓝色

            acceptorTableHtml = createAcceptorPropertiesTable(acceptor, currentData);
            acceptorTableHtml = `${acceptorTableHtml}`; // Acceptor 表格内容设为红色

            performanceTableHtml = createDonorandAcceptorPerformanceTable(donor, acceptor, currentData);
            performanceTableHtml = `${performanceTableHtml}`; // Donor + Acceptor 表格内容设为绿色

            // 合併所有表格並更新 DOM 元素
            const combinedTableHtml = donorTableHtml + acceptorTableHtml + performanceTableHtml;
            document.getElementById('tableId').innerHTML = combinedTableHtml;
            document.getElementById('tableId').style.display = 'block'; // 确保表格可见

            console.log(`Highlighted entries for Donor: ${donor}, Acceptor: ${acceptor}, and their combination.`);
        } else {
            console.warn(`No matching entries found for Donor: ${donor} and Acceptor: ${acceptor}`);
        }
    } 
    // 如果兩者都未輸入
    else {
        console.warn(`Please input at least one material name.`);
    }
}












function updateMatchedChart(donorMatchedData, acceptorMatchedData, combinationMatchedData) {
    const xAxis = document.getElementById('x-axis').value;
    const yAxis = document.getElementById('y-axis').value;

    const traces = [];

    // 顯示所有數據點的 trace1
    const trace1 = {
        x: currentData.map(d => d[xAxis]),
        y: currentData.map(d => d[yAxis]),
        text: currentData.map(d => 
            `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`),
        mode: 'markers',
        type: 'scatter',
        hoverinfo: 'text',
        name: 'All Data',  // 所有數據
        marker: {
            color: 'black',  // 使用黑色標示所有數據
            size: 6,
            opacity: 0.7,
            line: {
                color: 'white',
                width: 0.1
            }
        }
    };
    traces.push(trace1);

    // Donor 匹配的數據（紅色）
    if (donorMatchedData.length > 0) {
        const donorTrace = {
            x: donorMatchedData.map(d => d[xAxis]),
            y: donorMatchedData.map(d => d[yAxis]),
            text: donorMatchedData.map(d => 
                `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`),
            mode: 'markers',
            type: 'scatter',
            hoverinfo: 'text',
            name: 'Donor Matched Data',  // Donor匹配數據
            marker: {
                color: 'red',  // 使用紅色標示Donor
                size: 10,
                opacity: 0.8,
                line: {
                    color: 'white',
                    width: 1
                }
            }
        };
        traces.push(donorTrace);
    }

    // Acceptor 匹配的數據（藍色）
    if (acceptorMatchedData.length > 0) {
        const acceptorTrace = {
            x: acceptorMatchedData.map(d => d[xAxis]),
            y: acceptorMatchedData.map(d => d[yAxis]),
            text: acceptorMatchedData.map(d => 
                `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`),
            mode: 'markers',
            type: 'scatter',
            hoverinfo: 'text',
            name: 'Acceptor Matched Data',  // Acceptor匹配數據
            marker: {
                color: 'blue',  // 使用藍色標示Acceptor
                size: 10,
                opacity: 0.8,
                line: {
                    color: 'white',
                    width: 1
                }
            }
        };
        traces.push(acceptorTrace);
    }

    // 同時匹配 Donor 和 Acceptor 的數據（綠色）
    if (combinationMatchedData.length > 0) {
        const combinationTrace = {
            x: combinationMatchedData.map(d => d[xAxis]),
            y: combinationMatchedData.map(d => d[yAxis]),
            text: combinationMatchedData.map(d => 
                `Materials: ${d["Donor"]} – ${d["Acceptor"]}<br>${xAxis}: ${d[xAxis]}<br>${yAxis}: ${d[yAxis]}`),
            mode: 'markers',
            type: 'scatter',
            hoverinfo: 'text',
            name: 'Combination Matched Data',  // 組合匹配數據
            marker: {
                color: 'green',  // 使用綠色標示Donor和Acceptor組合
                size: 10,
                opacity: 0.8,
                line: {
                    color: 'white',
                    width: 1
                }
            }
        };
        traces.push(combinationTrace);
    }


    

    const layout = {
        title: `${xAxis} vs ${yAxis}`,
        xaxis: { title: xAxis },
        yaxis: { title: yAxis },
        hovermode: 'closest',
        width: 1000,
        height: 800
    };

    // 渲染圖表，顯示所有數據點和匹配數據點，並添加對角線
    Plotly.newPlot('chart', traces, layout);

    addPlotlyClickEvent('chart', data, 'tableId');
}





















document.getElementById('x-axis').addEventListener('change', () => {
    updateYSelect();
    updateChart(currentData);
});

document.getElementById('y-axis').addEventListener('change', () => updateChart(currentData));

// 初次加載圖表
processData(defaultData);