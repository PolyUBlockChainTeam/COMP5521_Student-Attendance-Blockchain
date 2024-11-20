// 通过 API 生成公钥和私钥
async function generateKeys(userId, password) {
    try {
        const response = await fetch('http://localhost:3001/student/wallets', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/html',
            },
            body: JSON.stringify({
                id: userId,
                password: password,
            }),
        });
        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }
        const result = await response.json();
        console.log('Keys generated successfully:', result);
        return result;
    } catch (error) {
        console.error('Failed to generate keys:', error);
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
        if (getUserRole(userId)=='teacher') {
            alert("You are not student!")
            return;
        }
        try {
            const walletPassword = prompt('Enter your wallet password for generate keys:\n(Wallet Password must contain more than 4 words)');
            if (!walletPassword) {
                alert('Wallet Password is required!');
                return;
            }
            const keys = await generateKeys(userId, walletPassword);
            if (keys) {
                alert('Wallet generated successfully. Check the console for details.');
            }
        } catch (error) {
            console.error('Failed to generate wallet:', error);
        }
    }
}




// 钱包functions
let wallets = []; // 用于存储多个钱包

// 生成随机字符串的函数，用于生成公钥和私钥
function generateRandomKey(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// 生成钱包的函数
// function generateWallet() {
//     const publicKey = '0x' + generateRandomKey(40);  // 模拟生成公钥 (40字符的随机字符串，带 "0x" 前缀)
//     const privateKey = generateRandomKey(64);       // 模拟生成私钥 (64字符的随机字符串)

//     const newWallet = {
//         publicKey: publicKey,
//         privateKey: privateKey
//     };

//     wallets.push(newWallet); // 将新的钱包添加到数组

//     // 更新表格显示
//     updateWalletTable();
// }

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