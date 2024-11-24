// Function to perform mining operation
async function mining() {
    const user = getUserFromCookies();  // Get the current user
    const userId = user ? user.userId : null;

    if (!userId) return;
    // Teachers cannot mine
    if (getUserRole(userId) == 'teacher') {
        alert("You are not a student!");
        return;
    }

    const studentID = userId;

    try {
        // Call the backend API to start mining
        const response = await fetch('http://localhost:3001/miner/mine', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                rewardId: studentID,  // Pass the studentID for mining
            }),
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const result = await response.json();  // Get the mining result
        console.log('Mining successful:', result);
        alert('Mining successful!');

        // Update the wallet table
        updateWalletTable(result);
    } catch (error) {
        console.error('Mining failed:', error);
        alert('Mining failed. Please try again later.');
    }
}

// Function to update the wallet table with mining records
function updateWalletTable(data) {
    const tableBody = document.getElementById('walletBody');

    // Create a new table row
    const newRow = document.createElement('tr');

    // Fill the table row with the returned data
    newRow.innerHTML = `
        <td>${data.index}</td>  <!-- Index -->
        <td>${data.previousHash}</td>  <!-- Previous Hash -->
        <td>${new Date(data.timestamp * 1000).toLocaleString()}</td> <!-- Timestamp -->
        <td>${data.hash}</td>  <!-- Hash -->
        <td>${data.nonce}</td>  <!-- Nonce -->
    `;

    // Append the new row to the table body
    tableBody.appendChild(newRow);
}
