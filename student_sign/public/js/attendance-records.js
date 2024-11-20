// 出勤记录查询函数
async function queryAttendance() {
    // 获取当前用户是否登录
    const user = getUserFromCookies();

    if (!user) {
        alert("请先登录！");
        return;
    }

    // 获取输入的学生ID和周次
    const studentId = document.getElementById('attendance-studentIdInput').value.trim();
    const weekNum = parseInt(document.getElementById('attendance-weekNumInput').value, 10);

    if (!studentId) {
        alert("请输入学生ID！");
        return;
    }

    if (isNaN(weekNum) || weekNum < 1 || weekNum > 13) {
        alert("请输入有效的周次 (1-13)！");
        return;
    }

    try {
        // 调用后端 API 查询出勤记录
        const response = await fetch(
            `http://localhost:3001/teacher/queryWeeks?studentid=${studentId}&weekNum=${weekNum}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`查询失败: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("查询结果:", result);

        // 更新出勤表格
        updateAttendanceRecordsTable(studentId, result);
    } catch (error) {
        console.error("查询失败:", error);
        alert("查询失败，请稍后再试。");
    }
}

// 更新出勤记录表格
function updateAttendanceRecordsTable(studentId, data) {
    const tableBody = document.getElementById('attendance-recordsBody');
    tableBody.innerHTML = ''; // 清空表格内容

    // 检查是否有记录
    if (data?.certifications?.length > 0) {
        data.certifications.forEach(cert => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${studentId}</td> <!-- 学生ID -->
                <td>${cert.eventid}</td> <!-- 课程 -->
                <td>${new Date(cert.timestamp * 1000).toLocaleString()}</td> <!-- 时间戳 -->
                <td>${cert.hash}</td> <!-- 哈希值 -->
                <td>${cert.id}</td> <!-- 证书ID -->
                <td>${cert.signature}</td> <!-- 签名 -->
            `;
            tableBody.appendChild(newRow);
        });
    } else {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">没有找到记录</td>`;
        tableBody.appendChild(emptyRow);
    }
}

// 出勤记录查询函数2
async function queryAttendance2() {
    // 获取输入框中的课程 ID（eventId）
    const eventId = document.getElementById('attendance-eventIdInput').value.trim();

    if (!eventId) {
        alert("请输入课程 ID！");
        return;
    }

    try {
        // 调用后端 API 查询课程出勤记录
        const response = await fetch(
            `http://localhost:3001/teacher/queryClass?classid=${eventId}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            }
        );

        if (!response.ok) {
            throw new Error(`查询失败: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("查询结果:", result);

        // 更新出勤表格
        updateAttendanceRecordsTable2(eventId, result);
    } catch (error) {
        console.error("查询失败:", error);
        alert("查询失败，请稍后再试。");
    }
}

// 更新出勤记录表格
function updateAttendanceRecordsTable2(eventId, data) {
    const tableBody = document.getElementById('attendance-recordsBody2');
    tableBody.innerHTML = ''; // 清空表格内容

    // 检查是否有记录
    if (data?.certificates?.length > 0) {
        data.certificates.forEach(cert => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${cert.studentid}</td> <!-- 学生ID -->
                <td>${eventId}</td> <!-- 课程 -->
                <td>${new Date(cert.timestamp * 1000).toLocaleString()}</td> <!-- 时间戳 -->
                <td>${cert.hash}</td> <!-- 哈希值 -->
                <td>${cert.id}</td> <!-- 证书ID -->
                <td>${cert.signature}</td> <!-- 签名 -->
            `;
            tableBody.appendChild(newRow);
        });
    } else {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">没有找到记录</td>`;
        tableBody.appendChild(emptyRow);
    }
}