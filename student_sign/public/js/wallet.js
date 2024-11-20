// 钱包functions
let wallets = []; // 用于存储多个钱包
const ServerPORT = 4000;
const user = getUserFromCookies();
const userId = user.userId;
fetchAndAddKeysToWallets(userId)


function fetchAndAddKeysToWallets(userId) {
    // 向node.js服务器发送 GET 请求以获取用户的所有密钥对
    fetch(`http://localhost:${ServerPORT}/users/${userId}/keys`)
        .then(response => response.json())
        .then(data => {
            console.log('Received data:', data);  // 打印接收到的数据
            if (data.error) {
                console.error('Error:', data.error);
            } else {
                const userKeys = data.keys;
                console.log('userKeys:', userKeys);  // 打印 userKeys
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
        // 1. 创建钱包
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

        // 2. 创建地址
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

        // 3. 获取密钥对
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

        // 返回钱包、地址和密钥对的结果
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

// 全局定义生成钱包的函数
async function generateWallet() {
    if (checkLoginStatus()) {
        const user = getUserFromCookies();
        const userId = user.userId;
        const username = user.username;
        if (!userId) return;
        // 老师不能生成
        if (getUserRole(userId) === 'teacher') {
            alert("You are not a student!");
            return;
        }

        // 从表单中获取钱包密码
        const walletPassword = document.getElementById('walletPassword').value;
        if (!walletPassword) {
            alert('Wallet Password is required!');
            return;
        }

        try {
            // 生成钱包和密钥对
            const keys = await generateKeys(userId, walletPassword);
            console.log("keys.keypair.addresses:",keys.keypair.addresses)
            if (keys && keys.keypair && keys.keypair.addresses) {
                // Get the last address in the array
                const lastAddress = keys.keypair.addresses[keys.keypair.addresses.length - 1];
            
                // Push only the last address to the wallets array
                wallets.push({
                    publicKey: lastAddress.publicKey,
                    privateKey: lastAddress.secretKey // Assuming secretKey is used as private key
                });

                // console.log("publicKey:",lastAddress.publicKey)
                // console.log("privateKey:",lastAddress.secretKey)
                // 向node.js服务器发送 POST 请求
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

// 删除钱包的函数
function deleteWallet(index) {
    if (index >= 0 && index < wallets.length) {
        wallets.splice(index, 1); // 删除指定索引的钱包
        updateWalletTable(); // 更新表格显示
    }
}

// 更新钱包表格显示
function updateWalletTable() {
    const walletBody = document.getElementById('walletBody');
    walletBody.innerHTML = ''; // 清空表格

    wallets.forEach((wallet, index) => {
        const row = document.createElement('tr');
        
        const publicKeyCell = document.createElement('td');
        publicKeyCell.textContent = wallet.publicKey;
        const privateKeyCell = document.createElement('td');
        privateKeyCell.textContent = wallet.privateKey;
        const actionCell = document.createElement('td');

        // 添加删除按钮
        const deleteButton = document.createElement('button');
        deleteButton.textContent = '删除';
        deleteButton.onclick = () => deleteWallet(index); // 为删除按钮绑定特定钱包的索引

        actionCell.appendChild(deleteButton);

        row.appendChild(publicKeyCell);
        row.appendChild(privateKeyCell);
        row.appendChild(actionCell);

        walletBody.appendChild(row);
    });
}