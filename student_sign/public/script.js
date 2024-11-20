document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded');  // 调试信息

    const wrapper = document.querySelector('.wrapper');
    const loginLink = document.querySelector('.login-link');
    const registerLink = document.querySelector('.register-link');
    const btnLoginPopup = document.querySelector('.btnLogin-popup');
    const iconClose = document.querySelector('.icon-close');

    // 登录状态标志
    let isLoggedIn = checkLoginStatus();
    console.log('isLoggedIn',isLoggedIn);  // 调试信息
    if (!isLoggedIn) {
        // 用户未登录时
        btnLoginPopup.textContent = 'Login';  // 修改按钮为“Login”
    } else {
        // 用户已登录时
        btnLoginPopup.textContent = 'Logout';  // 修改按钮为“Logout”
        console.log('end:');
    }

    // 注册链接点击事件
    registerLink.addEventListener('click', () => {
        wrapper.classList.add('active');  // 显示注册表单
    });

    // 登录链接点击事件
    loginLink.addEventListener('click', () => {
        wrapper.classList.remove('active');  // 隐藏注册表单
    });

    // 显示登录表单
    btnLoginPopup.addEventListener('click', () => {
        wrapper.classList.add('active-login');  // 显示登录表单

        if (!isLoggedIn) {
            // 用户未登录时，处理登录操作
            console.log('Login button clicked');  // 调试信息
            wrapper.classList.add('active-login');  // 显示登录表单
        } else {
            // 用户已登录时，处理退出操作
            console.log('Logout button clicked');  // 调试信息
            deleteCookie('userId')
            deleteCookie('username')
            isLoggedIn = false;  // 更新登录状态
            btnLoginPopup.textContent = 'Login';  // 修改按钮为“Login”
            console.log('User logged out successfully');
            // 刷新页面
            window.location.reload();
        }
    });

    // 关闭按钮，关闭所有表单
    iconClose.addEventListener('click', () => {
        console.log('Close button clicked');  // 调试信息
        wrapper.classList.remove('active-login');
    });

});

// 获取注册表单元素
const registerForm = document.querySelector('.register form');
const usernameInput = document.getElementById('register-username');
const registerIdInput = document.getElementById('register-id');
const registerPasswordInput = document.getElementById('register-password');
const checkbox = document.getElementById('register-terms');

// 监听注册表单提交
registerForm.addEventListener('submit', function (e) {
    e.preventDefault(); // 防止默认表单提交行为

    // 获取输入的数据
    const username = usernameInput.value.trim();
    const id = registerIdInput.value.trim();
    const password = registerPasswordInput.value.trim();
    const agreeTerms = checkbox.checked;

    // 验证用户输入
    if (!username || !id || !password || !agreeTerms) {
        alert("Please fill in all fields and agree to the terms.");
        return;
    }

    // 根据ID后缀判断角色
    let role = '';
    if (id.endsWith('g')) {
        role = 'student';
    } else if (id.endsWith('t')) {
        role = 'teacher';
    } else {
        alert('ID must end with "g" for student or "t" for teacher.');
        return;
    }

    // 创建用户请求数据
    const userData = {
        id,
        password,
        username,
    };

    // 使用 fetch 提交请求
    fetch('http://localhost:4000/users', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error); // 显示错误信息
        } else {
            alert('User created successfully!');
            // 可以根据需要重定向或清空表单
            registerForm.reset();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred while registering.');
    });
});

// 获取表单元素
const loginForm = document.getElementById('login-form');
const loginIdInput = document.getElementById('login-id');
const loginPasswordInput = document.getElementById('login-password');
const rememberCheckbox = document.getElementById('login-remember');

// 监听表单提交
loginForm.addEventListener('submit', function (e) {
    e.preventDefault(); // 防止默认表单提交行为

    // 获取输入的数据
    const id = loginIdInput.value.trim();
    const password = loginPasswordInput.value.trim();
    const rememberMe = rememberCheckbox.checked;

    // 验证用户输入
    if (!id || !password) {
        alert("Please enter both ID and password.");
        return;
    }

    // 创建登录请求数据
    const loginData = {
        id,
        password,
        rememberMe
    };

    // 使用 fetch 提交登录请求
    fetch('http://localhost:4000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(loginData),
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            alert(data.error); // 显示错误信息
        } else {
            console.log('data:', data);
            // 获取返回的 ID 和 username
            const userId = data.data.id || 'Unknown ID';
            const username = data.data.username || 'Unknown User';

            // 保存用户信息到 Cookies
            setUserCookies(userId, username);
            getUserFromCookies();

            // 显示欢迎信息
            alert(`Login successful! Welcome, ${username} (ID: ${userId})`);
            
            // 可以根据需要重定向或清空表单
            loginForm.reset();

            // 刷新页面
            window.location.reload();
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred during login.');
    });
});