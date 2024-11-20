// 挖矿操作函数
async function mining() {
    const user = getUserFromCookies();  // 获取当前用户
    const userId = user ? user.userId : null;
    
    if (!userId) return;
    // 老师不能生成
    if (getUserRole(userId)=='teacher') {
        alert("You are not student!")
        return;
    }

    const studentID = userId

    try {
        // 调用后端 API 开始挖矿
        const response = await fetch('http://localhost:3001/miner/mine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                rewardId: studentID,  // 传入studentID进行挖矿
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();  // 获取挖矿结果
        console.log('挖矿成功:', result);
        alert('挖矿成功！');

        // 更新钱包表格
        updateWalletTable(result);
    } catch (error) {
        console.error('挖矿失败:', error);
        alert('挖矿失败，请稍后再试。');
    }
}

// 更新钱包表格的函数（根据返回的数据更新挖矿记录）
function updateWalletTable(data) {
    const tableBody = document.getElementById('walletBody');

    // 创建新的表格行
    const newRow = document.createElement('tr');

    // 将返回的数据填充到表格行中
    newRow.innerHTML = `
        <td>${data.index}</td>  <!-- 索引 (Index) -->
        <td>${data.previousHash}</td>  <!-- 上一个哈希值 (Previous Hash) -->
        <td>${new Date(data.timestamp * 1000).toLocaleString()}</td> <!-- 时间戳 (Timestamp) -->
        <td>${data.hash}</td>  <!-- 哈希值 (Hash) -->
        <td>${data.nonce}</td>  <!-- 随机数 (Nonce) -->
    `;
    
    // 将新行添加到表格主体
    tableBody.appendChild(newRow);
}