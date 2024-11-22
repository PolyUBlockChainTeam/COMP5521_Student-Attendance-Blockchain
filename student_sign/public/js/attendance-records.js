// Function to query attendance records
async function queryAttendance() {
    // Check if the current user is logged in
    const user = getUserFromCookies();

    if (!user) {
        alert("Please log in first!");
        return;
    }

    // Get the input student ID and week number
    const studentId = document.getElementById('attendance-studentIdInput').value.trim();
    const weekNum = parseInt(document.getElementById('attendance-weekNumInput').value, 10);

    if (!studentId) {
        alert("Please enter the student ID!");
        return;
    }

    if (isNaN(weekNum) || weekNum < 1 || weekNum > 13) {
        alert("Please enter a valid week number (1-13)!");
        return;
    }

    try {
        // Call the backend API to query attendance records
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
            throw new Error(`Query failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Query result:", result);

        // Update the attendance table
        updateAttendanceRecordsTable(studentId, result);
    } catch (error) {
        console.error("Query failed:", error);
        alert("Query failed, please try again later.");
    }
}

// Update the attendance records table
function updateAttendanceRecordsTable(studentId, data) {
    const tableBody = document.getElementById('attendance-recordsBody');
    tableBody.innerHTML = ''; // Clear the table content

    // Check if there are records
    if (data?.certifications?.length > 0) {
        data.certifications.forEach(cert => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${studentId}</td> <!-- Student ID -->
                <td>${cert.eventid}</td> <!-- Course -->
                <td>${new Date(cert.timestamp * 1000).toLocaleString()}</td> <!-- Timestamp -->
                <td>${cert.hash}</td> <!-- Hash value -->
                <td>${cert.id}</td> <!-- Certificate ID -->
                <td>${cert.signature}</td> <!-- Signature -->
            `;
            tableBody.appendChild(newRow);
        });
    } else {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">No records found</td>`;
        tableBody.appendChild(emptyRow);
    }
}

// Function to query attendance records by event ID
async function queryAttendance2() {
    // Get the course ID (eventId) from the input field
    const eventId = document.getElementById('attendance-eventIdInput').value.trim();

    if (!eventId) {
        alert("Please enter the course ID!");
        return;
    }

    try {
        // Call the backend API to query attendance records for the course
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
            throw new Error(`Query failed: ${response.statusText}`);
        }

        const result = await response.json();
        console.log("Query result:", result);

        // Update the attendance table
        updateAttendanceRecordsTable2(eventId, result);
    } catch (error) {
        console.error("Query failed:", error);
        alert("Query failed, please try again later.");
    }
}

// Update the attendance records table by event ID
function updateAttendanceRecordsTable2(eventId, data) {
    const tableBody = document.getElementById('attendance-recordsBody2');
    tableBody.innerHTML = ''; // Clear the table content

    // Check if there are records
    if (data?.certificates?.length > 0) {
        data.certificates.forEach(cert => {
            const newRow = document.createElement('tr');
            newRow.innerHTML = `
                <td>${cert.studentid}</td> <!-- Student ID -->
                <td>${eventId}</td> <!-- Course -->
                <td>${new Date(cert.timestamp * 1000).toLocaleString()}</td> <!-- Timestamp -->
                <td>${cert.hash}</td> <!-- Hash value -->
                <td>${cert.id}</td> <!-- Certificate ID -->
                <td>${cert.signature}</td> <!-- Signature -->
            `;
            tableBody.appendChild(newRow);
        });
    } else {
        const emptyRow = document.createElement('tr');
        emptyRow.innerHTML = `<td colspan="6" style="text-align: center;">No records found</td>`;
        tableBody.appendChild(emptyRow);
    }
}
