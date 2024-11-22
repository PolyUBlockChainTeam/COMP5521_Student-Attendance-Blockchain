// Wallet functions
let wallets = []; // Array to store multiple wallets
const ServerPORT = 4000;
const user = getUserFromCookies();
const userId = user.userId;
fetchAndAddKeysToWallets(userId);

function fetchAndAddKeysToWallets(userId) {
    // Send a GET request to the Node.js server to retrieve all key pairs for the user
    fetch(`http://localhost:${ServerPORT}/users/${userId}/keys`)
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data); // Log received data
            if (data.error) {
                console.error('Error:', data.error);
            } else {
                const userKeys = data.keys;
                console.log('userKeys:', userKeys); // Log user keys
                if (Array.isArray(userKeys)) {
                    userKeys.forEach(keyPair => {
                        wallets.push({
                            publicKey: keyPair.publicKey,
                            privateKey: keyPair.privateKey
                        });
                    });
                    updateWalletTable();
                    console.log('Wallets updated:', wallets);
                } else {
                    console.error('Error: userKeys is not an array');
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
}

async function generateKeys(userId, password) {
    try {
        // 1. Create a wallet
        const walletResponse = await fetch('http://localhost:3001/student/wallets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
            body: JSON.stringify({
                id: userId,
                password: password,
            }),
        });

        if (!walletResponse.ok) {
            throw new Error(`Error creating wallet: ${walletResponse.statusText}`);
        }
        const walletResult = await walletResponse.json();
        console.log('Wallet created successfully:', walletResult);

        // 2. Create an address
        const addressResponse = await fetch(`http://localhost:3001/student/wallets/${userId}/addresses`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'password': password,
            },
        });

        if (!addressResponse.ok) {
            throw new Error(`Error creating address: ${addressResponse.statusText}`);
        }
        const addressResult = await addressResponse.json();
        console.log('Address created successfully:', addressResult);

        // 3. Retrieve key pairs
        const keypairResponse = await fetch(`http://localhost:3001/student/wallets/keypairs/${userId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!keypairResponse.ok) {
            throw new Error(`Error getting keypairs: ${keypairResponse.statusText}`);
        }
        const keypairResult = await keypairResponse.json();
        console.log('Keypairs retrieved successfully:', keypairResult);

        // Return wallet, address, and keypair results
        return {
            wallet: walletResult,
            address: addressResult,
            keypair: keypairResult
        };

    } catch (error) {
        console.error('Error in key generation process:', error);
        return null;
    }
}

// Global function to generate a wallet
async function generateWallet() {
    if (checkLoginStatus()) {
        const user = getUserFromCookies();
        const userId = user.userId;
        const username = user.username;
        if (!userId) return;

        // Teachers cannot generate wallets
        if (getUserRole(userId) === 'teacher') {
            alert("You are not a student!");
            return;
        }

        // Get wallet password from form
        const walletPassword = document.getElementById('walletPassword').value;
        if (!walletPassword) {
            alert('Wallet Password is required!');
            return;
        }

        try {
            // Generate wallet and key pairs
            const keys = await generateKeys(userId, walletPassword);
            console.log("keys.keypair.addresses:", keys.keypair.addresses);
            if (keys && keys.keypair && keys.keypair.addresses) {
                // Get the last address in the array
                const lastAddress = keys.keypair.addresses[keys.keypair.addresses.length - 1];
            
                // Push only the last address to the wallets array
                wallets.push({
                    publicKey: lastAddress.publicKey,
                    privateKey: lastAddress.secretKey // Assuming secretKey is used as private key
                });

                // Send a POST request to the Node.js server
                fetch(`http://localhost:${ServerPORT}/users/${userId}/keys`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        publicKey: lastAddress.publicKey,
                        privateKey: lastAddress.secretKey
                    })
                })
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        console.error('Error:', data.error);
                    } else {
                        console.log('Success:', data.message);
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                });
            
                // Update the wallet table display
                updateWalletTable();
            
                // Notify the user
                alert('Wallet generated successfully. Check the table for details.');
            }
        } catch (error) {
            console.error('Failed to generate wallet:', error);
        }
    }
}

// Function to delete a wallet
function deleteWallet(index) {
    if (index >= 0 && index < wallets.length) {
        wallets.splice(index, 1); // Remove the wallet at the specified index
        updateWalletTable(); // Update the table display
    }
}

// Function to update the wallet table display
function updateWalletTable() {
    const walletBody = document.getElementById('walletBody');
    walletBody.innerHTML = ''; // Clear the table

    wallets.forEach((wallet, index) => {
        const row = document.createElement('tr');
        
        const publicKeyCell = document.createElement('td');
        publicKeyCell.textContent = wallet.publicKey;
        const privateKeyCell = document.createElement('td');
        privateKeyCell.textContent = wallet.privateKey;
        const actionCell = document.createElement('td');

        // Add a delete button
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Delete';
        deleteButton.onclick = () => deleteWallet(index); // Bind delete button to a specific wallet index

        actionCell.appendChild(deleteButton);

        row.appendChild(publicKeyCell);
        row.appendChild(privateKeyCell);
        row.appendChild(actionCell);

        walletBody.appendChild(row);
    });
}