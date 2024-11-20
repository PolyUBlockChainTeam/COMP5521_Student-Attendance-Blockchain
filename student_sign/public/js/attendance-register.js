// 签到操作函数
async function createAttendance() {
    const user = getUserFromCookies();
    const userId = user.userId;
    
    if (!userId) return;
    // 老师不能生成
    if (getUserRole(userId)=='teacher') {
        alert("You are not student!")
        return;
    }

    const studentID = userId

    // 获取表单中的值
    const studentPrivateKey = document.getElementById('studentPrivateKey').value;
    const eventID = document.getElementById('eventID').value;
    const walletPassword = document.getElementById('walletPassword').value;

    // 校验输入内容
    if (!studentPrivateKey || !eventID || !walletPassword) {
        alert('请填写所有必填项！');
        return;
    }

    try {
        // 调用后端 API 签到
        const response = await fetch(`http://localhost:3001/student/wallets/${studentID}/certificates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'password': walletPassword, // 从表单获取密码
            },
            body: JSON.stringify({
                eventid: eventID, // 课程 ID
                type: 'sign', // 签到类型
                secretKey: studentPrivateKey, // 钱包密钥
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('签到成功:', result);
        alert('签到成功！');

        // 可选择在前端更新签到表格内容
        // 更新签到表格的示例代码
        updateAttendanceTable(result);
    } catch (error) {
        console.error('签到失败:', error);
        alert('签到失败，请稍后再试。');
    }
}

// 更新签到表格的函数（根据返回的数据更新签到记录）
function updateAttendanceTable(data) {
    const tableBody = document.getElementById('attendance-registerBody');

    // 创建新的表格行
    const newRow = document.createElement('tr');

    // 将返回的数据填充到表格行中
    newRow.innerHTML = `
        <td>${data.id}</td>  <!-- 签到请求的唯一标识符 -->
        <td>${data.hash}</td>  <!-- 签到的哈希值 -->
        <td>${data.studentid}</td>  <!-- 学生 ID -->
        <td>${data.eventid}</td>  <!-- 课程 ID -->
        <td>${data.type}</td>  <!-- 签到类型 -->
        <td>${new Date(data.timestamp * 1000).toLocaleString()}</td> <!-- 转换时间戳为可读日期 -->
        <td>${data.signature}</td>  <!-- 签名 -->
    `;
    
    // 将新行添加到表格主体
    tableBody.appendChild(newRow);
}