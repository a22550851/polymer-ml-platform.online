function renderSmiles(smiles, canvasId) {
    var smilesDrawer = new SmilesDrawer.Drawer({
        width: 300,
        height: 300
    });

    SmilesDrawer.parse(smiles, function(tree) {
        smilesDrawer.draw(tree, document.getElementById(canvasId), 'light', false);
    }, function(err) {
        console.log('Error parsing SMILES: ', err);
    });
}


