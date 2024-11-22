// Attendance operation function
async function createAttendance() {
    const user = getUserFromCookies();
    const userId = user.userId;
    
    if (!userId) return;
    // Teachers cannot generate attendance
    if (getUserRole(userId) == 'teacher') {
        alert("You are not a student!");
        return;
    }

    const studentID = userId;

    // Get values from the form
    const studentPrivateKey = document.getElementById('studentPrivateKey').value;
    const eventID = document.getElementById('eventID').value;
    const walletPassword = document.getElementById('walletPassword').value;

    // Validate input
    if (!studentPrivateKey || !eventID || !walletPassword) {
        alert('Please fill in all required fields!');
        return;
    }

    try {
        // Call the backend API to register attendance
        const response = await fetch(`http://localhost:3001/student/wallets/${studentID}/certificates`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'password': walletPassword, // Get password from the form
            },
            body: JSON.stringify({
                eventid: eventID, // Event ID
                type: 'sign', // Attendance type
                secretKey: studentPrivateKey, // Wallet private key
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();
        console.log('Attendance successful:', result);
        alert('Attendance recorded successfully!');

        // Optionally update the attendance table on the frontend
        // Example code for updating the attendance table
        updateAttendanceTable(result);
    } catch (error) {
        console.error('Attendance failed:', error);
        alert('Attendance failed, please try again later.');
    }
}

// Function to update the attendance table (updates attendance records based on returned data)
function updateAttendanceTable(data) {
    const tableBody = document.getElementById('attendance-registerBody');

    // Create a new table row
    const newRow = document.createElement('tr');

    // Populate the table row with returned data
    newRow.innerHTML = `
        <td>${data.id}</td>  <!-- Unique identifier for the attendance request -->
        <td>${data.hash}</td>  <!-- Hash value of the attendance -->
        <td>${data.studentid}</td>  <!-- Student ID -->
        <td>${data.eventid}</td>  <!-- Event ID -->
        <td>${data.type}</td>  <!-- Attendance type -->
        <td>${new Date(data.timestamp * 1000).toLocaleString()}</td> <!-- Convert timestamp to readable date -->
        <td>${data.signature}</td>  <!-- Signature -->
    `;
    
    // Add the new row to the table body
    tableBody.appendChild(newRow);
}
