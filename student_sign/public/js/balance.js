// Function to query balance
async function queryBalance() {
    const user = getUserFromCookies();
    const userId = user ? user.userId : null;

    if (!userId) return;
    // Teachers cannot query balance
    if (getUserRole(userId) == 'teacher') {
        alert("You are not a student!");
        return;
    }

    const studentId = userId;

    if (!studentId) {
        alert('Student ID not found. Please log in and try again!');
        return;
    }

    try {
        // Call the API to query balance
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
        console.log('Balance query successful:', result);

        // Update the balance table content
        updateBalanceTable(result.balance);
    } catch (error) {
        console.error('Balance query failed:', error);
        alert('Balance query failed. Please try again later.');
    }
}

// Update the balance table content
function updateBalanceTable(balance) {
    const tableBody = document.getElementById('walletBody');

    // Clear the previous table data
    tableBody.innerHTML = '';

    // Create a new table row
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td>${balance}</td>
    `;

    // Add the new row to the table body
    tableBody.appendChild(newRow);
}
