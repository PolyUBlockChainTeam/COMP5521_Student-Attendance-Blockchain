// 余额查询函数
async function queryBalance() {
    const user = getUserFromCookies();
    const userId = user ? user.userId : null;

    if (!userId) return;
    // 老师不能查询余额
    if (getUserRole(userId)=='teacher') {
        alert("You are not student!")
        return;
    }

    const studentId = userId;
    
    if (!studentId) {
        alert('学生ID未找到，请登录后重试！');
        return;
    }

    try {
        // 调用余额查询 API
        const response = await fetch(`http://localhost:3001/student/${studentId}/balance`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('余额查询成功:', result);

        // 更新余额表格内容
        updateBalanceTable(result.balance);
    } catch (error) {
        console.error('余额查询失败:', error);
        alert('余额查询失败，请稍后再试。');
    }
}

// 更新余额表格内容
function updateBalanceTable(balance) {
    const tableBody = document.getElementById('walletBody');

    // 清空之前的表格数据
    tableBody.innerHTML = '';

    // 创建新的表格行
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${balance}</td>
    `;

    // 将新行添加到表格主体
    tableBody.appendChild(newRow);
}
