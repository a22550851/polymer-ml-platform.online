document.querySelectorAll('.drawBtn').forEach(button => {
    button.addEventListener('click', function() {
        var target = this.getAttribute('data-target');
        document.getElementById('editorWindow').setAttribute('data-target', target);
        document.getElementById('editorWindow').style.display = 'block';
    });
});

document.getElementById('confirmButton').addEventListener('click', async function() {
    var target = document.getElementById('editorWindow').getAttribute('data-target');
    var chemObj = Kekule.Widget.getWidgetById('editor').getChemObj();
    var smiles = Kekule.IO.saveFormatData(chemObj, 'smi');
    if (smiles) {
        const iupacName = await convertSmilesToIupac(smiles);
        if (target === 'donor') {
            renderSmiles(smiles, 'donorCanvas');
            document.getElementById('donorCanvas').setAttribute('data-smiles', smiles);
            document.getElementById('donorInput').value = iupacName; // 設置IUPAC名稱到donor輸入框
            addLabelToCanvas('donorCanvas', 'Donor'); // 在畫布上添加標籤
        } else if (target === 'acceptor') {
            renderSmiles(smiles, 'acceptorCanvas');
            document.getElementById('acceptorCanvas').setAttribute('data-smiles', smiles);
            document.getElementById('acceptorInput').value = iupacName; // 設置IUPAC名稱到acceptor輸入框
            addLabelToCanvas('acceptorCanvas', 'Acceptor'); // 在畫布上添加標籤
        }
        document.getElementById('editorWindow').style.display = 'none';
        document.getElementById('smilesDrawerContainer').style.display = 'flex';
        
        // Display the SMILES in the result area
        document.getElementById('smilesDisplay').innerHTML = '';
    } else {
        alert('請先繪製化學結構再確認。');
    }
});



function addLabelToCanvas(canvasId, label) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.font = '24px Arial';
        ctx.fillStyle = 'black';
        ctx.fillText(label, canvas.width / 2, 30); // 在畫布上方中間位置添加標籤
    }
}
function resetResults() {
    document.getElementById('result').innerHTML = ''; // 清空結果容器
    document.getElementById('chartContainerPerformance').style.display = 'none';
    document.getElementById('chartContainerProperties').style.display = 'none';
    // 如果有其他需要重置的元素，也可以在此清空
}
function clearCanvas(canvasId) {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height); // 清除畫布內容
    }
}





async function convertSmilesToIupac(smiles) {
    try {
        const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/smiles/${encodeURIComponent(smiles)}/property/IUPACName/JSON`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data && data.PropertyTable && data.PropertyTable.Properties.length > 0) {
            return data.PropertyTable.Properties[0].IUPACName;
        } else {
            throw new Error('No IUPAC name found for the given SMILES.');
        }
    } catch (error) {
        console.error('Error converting SMILES to IUPAC:', error);
        return null;
    }
}



document.getElementById('closeEditorBtn').addEventListener('click', function() {
    document.getElementById('editorWindow').style.display = 'none';
});


document.getElementById('nameToStructureBtn').addEventListener('click', async function() {
        resetResults(); // 重置結果
    clearCanvas('donorCanvas');
    clearCanvas('acceptorCanvas');
    
    const donor = document.getElementById('donorInput').value.trim();
    const acceptor = document.getElementById('acceptorInput').value.trim();
    const resultElement = document.getElementById('result'); // 確保這個元素存在

    if (!donor && !acceptor) {
        resultElement.innerHTML = '<p class="error">Please enter at least donor or acceptor</p>';
        return;
    }

    await handleChemicalStructure(donor, acceptor);
});


async function handleChemicalStructure(donorName, acceptorName) {
    var donorSmiles = data.find(item => item.Donor === donorName)?.['Donor SMILES'];
    var acceptorSmiles = data.find(item => item.Acceptor === acceptorName)?.['Acceptor SMILES'];

    document.getElementById('result').innerHTML = '';
    document.getElementById('chartContainerPerformance').style.display = 'none';
    document.getElementById('chartContainerProperties').style.display = 'none';

    if (donorSmiles) {
        renderSmiles(donorSmiles.trim(), 'donorCanvas');
        changeCanvasLabelColor('donorCanvas', 'black');
    } else {
        donorSmiles = await convertNameToSmiles(donorName);
        if (donorSmiles) {
            renderSmiles(donorSmiles.trim(), 'donorCanvas');
            changeCanvasLabelColor('donorCanvas', 'black');
        } 
    }

    if (acceptorSmiles) {
        renderSmiles(acceptorSmiles.trim(), 'acceptorCanvas');
        changeCanvasLabelColor('acceptorCanvas', 'black');
    } else {
        acceptorSmiles = await convertNameToSmiles(acceptorName);
        if (acceptorSmiles) {
            renderSmiles(acceptorSmiles.trim(), 'acceptorCanvas');
            changeCanvasLabelColor('acceptorCanvas', 'black');
        } 
    }

    document.getElementById('smilesDisplay').innerHTML = '';
    document.getElementById('smilesDrawerContainer').style.display = 'flex';
}

// 使用PubChem API將名稱轉換為SMILES的函數
async function convertNameToSmiles(name) {
    try {
        const response = await fetch(`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/name/${name}/property/CanonicalSMILES/JSON`);
        const data = await response.json();
        if (data.PropertyTable && data.PropertyTable.Properties && data.PropertyTable.Properties.length > 0) {
            return data.PropertyTable.Properties[0].CanonicalSMILES;
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error converting name to SMILES:', error);
        return null;
    }
}

// 定義過濾函數
function filterMatchingItems(data, donorName, acceptorName) {
    return data.filter(item => 
        item.Donor === donorName && item.Acceptor === acceptorName
    );
}

async function findPerformance() {
    resetResults(); // 重置結果
    clearCanvas('donorCanvas');
    clearCanvas('acceptorCanvas');
    const donor = document.getElementById('donorInput').value.trim();
    const acceptor = document.getElementById('acceptorInput').value.trim();
    const resultElement = document.getElementById('result');

    // 處理化學結構並顯示 SMILES 繪圖區域
    await handleChemicalStructure(donor, acceptor);
    document.getElementById('smilesDrawerContainer').style.display = 'flex';
    document.getElementById('chartContainerProperties').style.display = 'none';

    if (!donor && !acceptor) {
        resultElement.innerHTML = '<p class="error">Please enter at least donor or acceptor</p>';
        return;
    }

    // 使用 filterMatchingItems 過濾出匹配項目
    const matchingItems = filterMatchingItems(data, donor, acceptor);

    // 判斷 donor 和 acceptor 是否存在於數據庫中
    const donorItem = donor ? data.find(item => item.Donor === donor) : null;
    const acceptorItem = acceptor ? data.find(item => item.Acceptor === acceptor) : null;

    // 將名稱轉換為 SMILES 並獲取預測數據
    const donorSmiles = donor ? await convertNameToSmiles(donor) : '';
    const acceptorSmiles = acceptor ? await convertNameToSmiles(acceptor) : '';
    const predictionData = await fetchPerformancePredictionData(donorSmiles, acceptorSmiles);

    // 情況 1: Donor 和 Acceptor 都在數據庫中
    if (matchingItems.length > 0) {
        document.getElementById('tablePCE').innerHTML = createDonorandAcceptorPerformanceTable(donor, acceptor, data);
        plotGraphs(data, donor, acceptor);
        document.getElementById('chartContainerPerformance').style.display = 'block';

    // 情況 2: Donor 和 Acceptor 都不在數據庫中
    } else if (matchingItems.length === 0 && donor && acceptor) {
        renderSmiles(donorSmiles, 'donorCanvas');
        renderSmiles(acceptorSmiles, 'acceptorCanvas');
        changeCanvasLabelColor('donorCanvas', 'black');
        changeCanvasLabelColor('acceptorCanvas', 'black');

        if (predictionData) {
            document.getElementById('tablePCE').innerHTML = createPredictionOnlyTable(predictionData, true, `${donor}–${acceptor}`);
            plotGraphs(data, donor, acceptor);
            plotHorizontalArrows(predictionData);
            document.getElementById('chartContainerPerformance').style.display = 'block';
        } else {
            resultElement.innerHTML = '沒有找到匹配的數據，也無法計算。';
        }

    // 情況 3: Donor 存在於數據庫中，且 Acceptor 未輸入
    } else if (donor && donorItem && !acceptor) {
        resultElement.innerHTML = 'Donor 存在於數據庫中，顯示相關分布圖。';
        plotGraphs(data, donor, null);
        document.getElementById('chartContainerPerformance').style.display = 'block';

    // 情況 4: Acceptor 存在於數據庫中，且 Donor 未輸入
    } else if (acceptor && acceptorItem && !donor) {
        resultElement.innerHTML = 'Acceptor 存在於數據庫中，顯示相關分布圖。';
        plotGraphs(data, null, acceptor);
        document.getElementById('chartContainerPerformance').style.display = 'block';

    // 情況 5: Donor 在數據庫中，且 Acceptor 不存在於數據庫中
    } else if (donor && donorItem && acceptor && !acceptorItem) {
        renderSmiles(donorSmiles, 'donorCanvas');
        renderSmiles(acceptorSmiles, 'acceptorCanvas');
        changeCanvasLabelColor('donorCanvas', 'black');
        changeCanvasLabelColor('acceptorCanvas', 'black');

        if (predictionData) {
            document.getElementById('tablePCE').innerHTML = createPredictionOnlyTable(predictionData, true, `${donor}–${acceptor}`);
            plotGraphs(data, donor, acceptor);
            plotHorizontalArrows(predictionData);
            document.getElementById('chartContainerPerformance').style.display = 'block';
        } else {
            resultElement.innerHTML = '沒有找到匹配的數據，也無法計算。';
        }

    // 情況 6: Acceptor 在數據庫中，且 Donor 不存在於數據庫中
    } else if (acceptor && acceptorItem && donor && !donorItem) {
        renderSmiles(donorSmiles, 'donorCanvas');
        changeCanvasLabelColor('donorCanvas', 'black');

        if (predictionData) {
            document.getElementById('tablePCE').innerHTML = createPredictionOnlyTable(predictionData, true, `${donor}–${acceptor}`);
            plotGraphs(data, donor, acceptor);
            plotHorizontalArrows(predictionData);
            document.getElementById('chartContainerPerformance').style.display = 'block';
        } else {
            resultElement.innerHTML = '沒有找到匹配的數據，也無法計算。';
        }

    // 情況 7: Donor 不存在於數據庫中，且 Acceptor 未輸入
    } else if (donor && !donorItem && !acceptor) {
        resultElement.innerHTML = 'Donor 不存在於數據庫中，顯示相關分布圖。';
        plotGraphs(data, donor, null);
        document.getElementById('chartContainerPerformance').style.display = 'block';

    // 情況 8: Acceptor 不存在於數據庫中，且 Donor 未輸入
    } else if (acceptor && !acceptorItem && !donor) {
        resultElement.innerHTML = 'Acceptor 不存在於數據庫中，顯示相關分布圖。';
        plotGraphs(data, null, acceptor);
        document.getElementById('chartContainerPerformance').style.display = 'block';
    }
}










function plotHorizontalArrows(predictionData) {
    plotHorizontalArrow('chartPCE', predictionData['PCE (%).1'], 'PCE Prediction');
    plotHorizontalArrow('chartVoc', predictionData['Voc (V).1'], 'Voc Prediction');
    plotHorizontalArrow('chartJsc', predictionData['Jsc (mAcm-2).1'], 'Jsc Prediction');
    plotHorizontalArrow('chartFF', predictionData['FF.1'], 'FF Prediction');
}




function plotPredictionTable(predictionData, label) {
    // Here implement logic to display prediction values in a table.
    // Example logic to render a prediction table
    const table = `<table>
        <tr><th>${label} Prediction</th></tr>
        <tr><td>${predictionData['PCE (%).1'] || 'N/A'}</td></tr>
        <tr><td>${predictionData['Voc (V).1'] || 'N/A'}</td></tr>
        <tr><td>${predictionData['Jsc (mAcm-2).1'] || 'N/A'}</td></tr>
        <tr><td>${predictionData['FF.1'] || 'N/A'}</td></tr>
    </table>`;
    document.getElementById('tablePrediction').innerHTML = table;
}


function plotGraphsWithError(data, donor, acceptor) {
    // 這個函數用於在顯示圖表時添加誤差
    plotGraphs(data, donor, acceptor);
    plotErrorBars('chartPCE', data, 'PCE');
    plotErrorBars('chartVoc', data, 'Voc');
    plotErrorBars('chartJsc', data, 'Jsc');
    plotErrorBars('chartFF', data, 'FF');
}




async function findProperties() {
    resetResults(); // 重置結果
    clearCanvas('donorCanvas');
    clearCanvas('acceptorCanvas');
    
    
    const donor = document.getElementById('donorInput').value.trim();
    const acceptor = document.getElementById('acceptorInput').value.trim();
    const resultElement = document.getElementById('result');

    // 處理化學結構
    await handleChemicalStructure(donor, acceptor);

    // 顯示化學結構繪製容器
    document.getElementById('smilesDrawerContainer').style.display = 'flex';
    document.getElementById('chartContainerPerformance').style.display = 'none';

    // 如果捐贈者和受贈者名稱都為空，顯示錯誤信息
    if (!donor && !acceptor) {
        resultElement.innerHTML = '<p class="error">Please enter at least donor or acceptor</p>';
        return;
    }

    // 查找數據庫中的項目
    let donorItem = donor ? data.find(item => item.Donor === donor) : null;
    let acceptorItem = acceptor ? data.find(item => item.Acceptor === acceptor) : null;

    if (donorItem && acceptorItem) {
        // 情況1: 捐贈者和受贈者都在數據庫中
        document.getElementById('tableHOMODonor').innerHTML = createDonorPropertiesTable(donor, data);
        document.getElementById('tableHOMOAcceptor').innerHTML = createAcceptorPropertiesTable(acceptor, data);
        plotPropertyGraphs(data, donor, acceptor, 'both');
        document.getElementById('chartContainerProperties').style.display = 'block';

    } else if (donorItem && acceptor && !acceptorItem) {
        // 情況3: 捐贈者在數據庫中但受贈者不在
        const acceptorSmiles = await convertNameToSmiles(acceptor);
        if (!acceptorSmiles) {
            resultElement.innerHTML = '<p class="error">Unable to convert acceptor name to SMILES.</p>';
            return;
        }
        const predictionData = await fetchPropertiesPredictionData(donorItem['Donor SMILES'], acceptorSmiles);
        document.getElementById('tableHOMODonor').innerHTML = createDonorPropertiesTable(donor, data);
        document.getElementById('tableHOMOAcceptor').innerHTML = generatePredictionTable(predictionData, 'acceptor', acceptor);
        plotPropertyGraphs(data, donor, acceptor, 'both');
        
        plotHorizontalArrow('chartHOMOAcceptor', predictionData['HOMO of Acceptor (eV).1'], 'Acceptor HOMO Prediction');
        plotHorizontalArrow('chartLUMOAcceptor', predictionData['LUMO of Acceptor (eV).1'], 'Acceptor LUMO Prediction');
        plotHorizontalArrow('chartBandgapAcceptor', predictionData['Bandgap of Acceptor (eV).1'], 'Acceptor Bandgap Prediction');
            
        document.getElementById('chartContainerProperties').style.display = 'block';

    } else if (!donorItem && donor && acceptorItem) {
        // 情況4: 受贈者在數據庫中但捐贈者不在
        const donorSmiles = await convertNameToSmiles(donor);
        if (!donorSmiles) {
            resultElement.innerHTML = '<p class="error">Unable to convert donor name to SMILES.</p>';
            return;
        }
        const predictionData = await fetchPropertiesPredictionData(donorSmiles, acceptorItem['Acceptor SMILES']);
        document.getElementById('tableHOMOAcceptor').innerHTML = createAcceptorPropertiesTable(acceptor, data);
        document.getElementById('tableHOMODonor').innerHTML = generatePredictionTable(predictionData, 'donor', donor);
        plotPropertyGraphs(data, donor, acceptor, 'both');
        
        plotHorizontalArrow('chartHOMODonor', predictionData['HOMO of Donor (eV).1'], 'Donor HOMO Prediction');
        plotHorizontalArrow('chartLUMODonor', predictionData['LUMO of Donor (eV).1'], 'Donor LUMO Prediction');
        plotHorizontalArrow('chartBandgapDonor', predictionData['Bandgap of Donor (eV).1'], 'Donor Bandgap Prediction');

        document.getElementById('chartContainerProperties').style.display = 'block';

    } else if (!donorItem && !acceptorItem && donor && acceptor) {
        // 情況2: 捐贈者和受贈者都不在數據庫中
        const donorSmiles = donor ? await convertNameToSmiles(donor) : null;
        const acceptorSmiles = acceptor ? await convertNameToSmiles(acceptor) : null;

        if (!donorSmiles && !acceptorSmiles) {
            resultElement.innerHTML = '<p class="error">Unable to convert donor or acceptor name to SMILES.</p>';
            return;
        }

        if (donorSmiles) {
            renderSmiles(donorSmiles, 'donorCanvas');
            changeCanvasLabelColor('donorCanvas', 'black');
        }
        if (acceptorSmiles) {
            renderSmiles(acceptorSmiles, 'acceptorCanvas');
            changeCanvasLabelColor('acceptorCanvas', 'black');
        }

        const predictionData = await fetchPropertiesPredictionData(donorSmiles, acceptorSmiles);

        if (predictionData) {
            document.getElementById('tableHOMODonor').innerHTML = generatePredictionTable(predictionData, 'donor', donor);
            document.getElementById('tableHOMOAcceptor').innerHTML = generatePredictionTable(predictionData, 'acceptor', acceptor);
            plotPropertyGraphs(data, donorSmiles, acceptorSmiles, 'both');
            plotHorizontalArrow('chartHOMODonor', predictionData['HOMO of Donor (eV).1'], 'Donor HOMO Prediction');
            plotHorizontalArrow('chartLUMODonor', predictionData['LUMO of Donor (eV).1'], 'Donor LUMO Prediction');
            plotHorizontalArrow('chartBandgapDonor', predictionData['Bandgap of Donor (eV).1'], 'Donor Bandgap Prediction');
            plotHorizontalArrow('chartHOMOAcceptor', predictionData['HOMO of Acceptor (eV).1'], 'Acceptor HOMO Prediction');
            plotHorizontalArrow('chartLUMOAcceptor', predictionData['LUMO of Acceptor (eV).1'], 'Acceptor LUMO Prediction');
            plotHorizontalArrow('chartBandgapAcceptor', predictionData['Bandgap of Acceptor (eV).1'], 'Acceptor Bandgap Prediction');
            document.getElementById('chartContainerProperties').style.display = 'block';
        } else {
            resultElement.innerHTML = '沒有找到匹配的數據，也無法計算。';
        }

    } else if (donorItem && donor) {
        // 情況5: 只有輸入捐贈者，且捐贈者在數據庫中
        document.getElementById('tableHOMODonor').innerHTML = createDonorPropertiesTable(donor, data);
        plotPropertyGraphs(data, donor, null, 'donor');
        
        document.getElementById('tableHOMOAcceptor').style.display = 'none';
        document.getElementById('chartHOMOAcceptor').style.display = 'none';
        document.getElementById('chartLUMOAcceptor').style.display = 'none';
        document.getElementById('chartBandgapAcceptor').style.display = 'none';
        document.getElementById('chartContainerProperties').style.display = 'block';
    } else if (acceptorItem && acceptor) {
        // 情況6: 只有輸入受贈者，且受贈者在數據庫中
        document.getElementById('tableHOMOAcceptor').innerHTML = createAcceptorPropertiesTable(acceptor, data);
        plotPropertyGraphs(data, null, acceptor, 'acceptor');
        
        document.getElementById('tableHOMODonor').style.display = 'none';
        document.getElementById('chartHOMODonor').style.display = 'none';
        document.getElementById('chartLUMODonor').style.display = 'none';
        document.getElementById('chartBandgapDonor').style.display = 'none';    
        document.getElementById('chartContainerProperties').style.display = 'block';

    } else if (!donorItem && donor) {
        // 情況7: 只有輸入捐贈者，且捐贈者不在數據庫中
        const donorSmiles = await convertNameToSmiles(donor);
        if (!donorSmiles) {
            resultElement.innerHTML = '<p class="error">Unable to convert donor name to SMILES.</p>';
            return;
        }
        const predictionData = await fetchPropertiesPredictionData(donorSmiles);
        document.getElementById('tableHOMODonor').innerHTML = generatePredictionTable(predictionData, 'donor', donor);
        plotPropertyGraphs(data, donor, null, 'donor');
        
        document.getElementById('tableHOMOAcceptor').style.display = 'none';
        plotHorizontalArrow('chartHOMODonor', predictionData['HOMO of Donor (eV).1'], 'Donor HOMO Prediction');
        plotHorizontalArrow('chartLUMODonor', predictionData['LUMO of Donor (eV).1'], 'Donor LUMO Prediction');
        plotHorizontalArrow('chartBandgapDonor', predictionData['Bandgap of Donor (eV).1'], 'Donor Bandgap Prediction');
        document.getElementById('chartHOMOAcceptor').style.display = 'none';
        document.getElementById('chartLUMOAcceptor').style.display = 'none';
        document.getElementById('chartBandgapAcceptor').style.display = 'none';
        document.getElementById('chartContainerProperties').style.display = 'block';

    } else if (!acceptorItem && acceptor) {
        // 情況8: 只有輸入受贈者，且受贈者不在數據庫中
        const acceptorSmiles = await convertNameToSmiles(acceptor);
        if (!acceptorSmiles) {
            resultElement.innerHTML = '<p class="error">Unable to convert acceptor name to SMILES.</p>';
            return;
        }
        const predictionData = await fetchPropertiesPredictionData(null, acceptorSmiles);
        document.getElementById('tableHOMOAcceptor').innerHTML = generatePredictionTable(predictionData, 'acceptor', acceptor);
        plotPropertyGraphs(data, null, acceptor, 'acceptor');
        
        document.getElementById('tableHOMODonor').style.display = 'none';
        plotHorizontalArrow('chartHOMOAcceptor', predictionData['HOMO of Acceptor (eV).1'], 'Acceptor HOMO Prediction');
        plotHorizontalArrow('chartLUMOAcceptor', predictionData['LUMO of Acceptor (eV).1'], 'Acceptor LUMO Prediction');
        plotHorizontalArrow('chartBandgapAcceptor', predictionData['Bandgap of Acceptor (eV).1'], 'Acceptor Bandgap Prediction');
        document.getElementById('chartHOMODonor').style.display = 'none';
        document.getElementById('chartLUMODonor').style.display = 'none';
        document.getElementById('chartBandgapDonor').style.display = 'none';
        document.getElementById('chartContainerProperties').style.display = 'block';

    } else {
        resultElement.innerHTML = '<p class="error">Unexpected error occurred.</p>';
    }
}









async function fetchPerformancePredictionData(donorSmiles = null, acceptorSmiles = null) {
    try {
        const bodyData = {};
        if (donorSmiles) bodyData.donorsmiles = donorSmiles;
        if (acceptorSmiles) bodyData.acceptorsmiles = acceptorSmiles;
        const response = await fetch('https://polymer-ml-platform-server.online/performance_predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            const data = await response.json();
            const result = {};
            if (data.pce !== undefined) result['PCE (%).1'] = data.pce;
            if (data.voc !== undefined) result['Voc (V).1'] = data.voc;
            if (data.jsc !== undefined) result['Jsc (mAcm-2).1'] = data.jsc;
            if (data.ff !== undefined) result['FF.1'] = data.ff;
            return result;


        } else {
            console.error('Failed to fetch performance prediction data');
            return null;
        }
    } catch (error) {
        console.error('Error fetching performance prediction data:', error);
        return null;
    }
}

async function fetchPropertiesPredictionData(donorSmiles = null, acceptorSmiles = null) {
    try {
        const bodyData = {};
        if (donorSmiles) bodyData.donorsmiles = donorSmiles;
        if (acceptorSmiles) bodyData.acceptorsmiles = acceptorSmiles;

        const response = await fetch('https://polymer-ml-platform-server.online/properties_predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(bodyData)
        });

        if (response.ok) {
            const data = await response.json();
            const result = {};

            if (data.donor_homo !== undefined) result['HOMO of Donor (eV).1'] = data.donor_homo;
            if (data.donor_lumo !== undefined) result['LUMO of Donor (eV).1'] = data.donor_lumo;
            if (data.donor_bandgap !== undefined) result['Bandgap of Donor (eV).1'] = data.donor_bandgap;
            if (data.acceptor_homo !== undefined) result['HOMO of Acceptor (eV).1'] = data.acceptor_homo;
            if (data.acceptor_lumo !== undefined) result['LUMO of Acceptor (eV).1'] = data.acceptor_lumo;
            if (data.acceptor_bandgap !== undefined) result['Bandgap of Acceptor (eV).1'] = data.acceptor_bandgap;

            return result;
        } else {
            console.error('Failed to fetch properties prediction data');
            return null;
        }
    } catch (error) {
        console.error('Error fetching properties prediction data:', error);
        return null;
    }
}



function plotHorizontalArrow(chartId, value, name) {
    const chart = document.getElementById(chartId);
    if (chart) {
        Plotly.addTraces(chart, {
            x: [value],
            y: [value],
            mode: 'markers+text',
            marker: {
                size: 10,
                symbol: 'triangle-up', // 使用向上的三角形作為標記
                color: 'blue'
            },
            text: name,
            textposition: 'top center',
            showlegend: false
        });
    }
}


function addPlotlyClickEventForProperties(chartId, data, tableId) {
    const chartElement = document.getElementById(chartId);
    
    if (chartElement) {
        chartElement.on('plotly_click', function(eventData) {
            const point = eventData.points[0];
            const label = point.text;

            // 拆分 donor 和 acceptor 名稱
            const [donor, acceptor] = label.split('–');
            const item = data.find(d => d.Donor === donor && d.Acceptor === acceptor);

            if (item) {
                const donorSmiles = item['Donor SMILES'];
                const acceptorSmiles = item['Acceptor SMILES'];
                const donorCanvasId = `clickedDonorCanvas${chartId.split('chart')[1]}`;
                const acceptorCanvasId = `clickedAcceptorCanvas${chartId.split('chart')[1]}`;

                // 渲染 Donor 和 Acceptor 的化學結構
                if (donorSmiles) {
                    renderSmiles(donorSmiles, donorCanvasId);
                    changeCanvasLabelColor(donorCanvasId, 'black');
                }
                if (acceptorSmiles) {
                    renderSmiles(acceptorSmiles, acceptorCanvasId);
                    changeCanvasLabelColor(acceptorCanvasId, 'black');
                }

                // 分別生成捐贈者和受贈者的屬性表格
                const donorTableHtml = createDonorPropertiesTable(donor, data);
                const acceptorTableHtml = createAcceptorPropertiesTable(acceptor, data);

                // 合併表格內容
                const tableHtml = `<div>${donorTableHtml}</div><div>${acceptorTableHtml}</div>`;
                document.getElementById(tableId).innerHTML = tableHtml;

                // 顯示表格
                document.getElementById(tableId).style.display = 'block';
            }

            // 在执行完其他逻辑后，再调用 highlightClickedPoint
            highlightClickedPoint(chartId, point.pointIndex);
        });
    } else {
        console.error(`未能找到圖表元素，chartId: ${chartId}`);
    }
}

function addPlotlyClickEventForPerformance(chartId, data, tableId) {
    const chartElement = document.getElementById(chartId);

    if (chartElement) {
        chartElement.on('plotly_click', function(eventData) {
            const point = eventData.points[0];
            const pointIndex = point.pointIndex; // 获取点击点的索引
            const label = point.text;

            // 檢查是否成功獲取 label
            if (!label) {
                console.error(`未能從點擊事件中獲取標籤 (label)，chartId: ${chartId}`);
                return;
            }

            // 拆分 donor 和 acceptor 名稱
            const [donor, acceptor] = label.split('–');
            const item = data.find(d => d.Donor === donor && d.Acceptor === acceptor);

            // 檢查是否成功找到匹配的項目
            if (!item) {
                console.error(`未能在數據中找到匹配項目，Donor: ${donor}, Acceptor: ${acceptor}`);
                return;
            }

            const donorSmiles = item['Donor SMILES'];
            const acceptorSmiles = item['Acceptor SMILES'];
            const donorCanvasId = `clickedDonorCanvas${chartId.split('chart')[1]}`;
            const acceptorCanvasId = `clickedAcceptorCanvas${chartId.split('chart')[1]}`;

            // 渲染 Donor SMILES
            if (donorSmiles) {
                console.log('渲染 Donor SMILES:', donorSmiles);
                renderSmiles(donorSmiles, donorCanvasId);
                changeCanvasLabelColor(donorCanvasId, 'black');
            } else {
                console.warn(`Donor SMILES 不存在，Donor: ${donor}`);
            }

            // 渲染 Acceptor SMILES
            if (acceptorSmiles) {
                console.log('渲染 Acceptor SMILES:', acceptorSmiles);
                renderSmiles(acceptorSmiles, acceptorCanvasId);
                changeCanvasLabelColor(acceptorCanvasId, 'black');
            } else {
                console.warn(`Acceptor SMILES 不存在，Acceptor: ${acceptor}`);
            }

            // 生成性能表格
            const tableHtml = createDonorandAcceptorPerformanceTable(donor, acceptor, data);
            const tableElement = document.getElementById(tableId);

            // 檢查是否成功找到表格元素
            if (tableElement) {
                tableElement.innerHTML = tableHtml;
                tableElement.style.display = 'block';
            } else {
                console.error(`未能找到表格元素，tableId: ${tableId}`);
            }

            // 在执行完其他逻辑后，再调用 highlightClickedPoint
            highlightClickedPoint(chartId, pointIndex);
        });
    } else {
        console.error(`未能找到圖表元素，chartId: ${chartId}`);
    }
}














const editor = new Kekule.Editor.Composer(document.getElementById('editor'));
editor.setChemObj(Kekule.ChemStructureUtils.generateNewStructFragment());

function changeCanvasLabelColor(canvasId, color) {
    const canvasLabel = document.querySelector(`#${canvasId} + .canvas-label`);
    if (canvasLabel) {
        canvasLabel.style.color = color;
    }
}
