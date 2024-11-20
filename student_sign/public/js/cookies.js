// 设置 Cookie
function setCookie(name, value, days) {
    console.log('name, value, days:', name, value, days);
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));  // 计算过期时间
    const expires = "expires=" + date.toGMTString();  // 格式化过期时间
    // document.cookie = `${name}=${value};${expires};path=/;SameSite=None;Secure;HttpOnly`;  // 设置 SameSite 和 Secure
    document.cookie = `${name}=${value};${expires};path=/`;
    console.log('document.cookie:', document.cookie);
}
// 登录成功后设置 Cookies
function setUserCookies(userId, username) {
    setCookie('userId', userId, 0.5);  // 存储 0.5 天
    setCookie('username', username, 0.5);  // 存储 0.5 天
}
// 获取指定的 Cookie
function getCookie(name) {
    const nameEq = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i].trim();
        if (c.indexOf(nameEq) === 0) {
            return c.substring(nameEq.length, c.length);  // 返回 cookie 值
        }
    }
    return null;  // 如果找不到指定的 cookie，返回 null
}
// 获取用户的 ID 和用户名
function getUserFromCookies() {
    const userId = getCookie('userId');
    const username = getCookie('username');
    
    if (userId && username) {
        console.log(`Logged in as: ${username} (ID: ${userId})`);
        return { userId, username };
    } else {
        console.log('No user is logged in.');
        return null;
    }
}
// 根据 ID 判断用户角色
function getUserRole(userId) {
    if (userId.endsWith('g')) {
        return 'student';
    } else if (userId.endsWith('t')) {
        return 'teacher';
    } else {
        throw new Error('Invalid ID format. Must end with "g" (student) or "t" (teacher).');
    }
}
// 删除指定的 Cookie
function deleteCookie(name) {
    document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname;
    console.log('document.cookie:', document.cookie);
    console.log('Cookie deleted');
}
// 检查 Cookies 中的用户信息，显示欢迎信息 并返回true/false
function checkLoginStatus() {
    const user = getUserFromCookies();
    
    if (user) {
        // 显示用户信息
        // alert(`Welcome back, ${user.username} (ID: ${user.userId})`);
        return true;
    } else {
        alert('Please log in.');
        return false;
    }
}