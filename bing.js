// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.291
// @description  自动搜索脚本
// @author       怀沙2049
// @match        https://*.bing.com/*
// @exclude      https://rewards.bing.com/*
// @license      GNU GPLv3
// @icon         https://www.bing.com/favicon.ico
// @downloadURL  https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @updateURL    https://raw.githubusercontent.com/yanlz84/bing-auto-search/refs/heads/master/bing.js?t=
// @run-at       document-end
// @grant        GM_registerMenuCommand
// @grant        GM_addStyle
// @grant        GM_openInTab
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_xmlhttpRequest
// ==/UserScript==

var max_rewards = 40; //重复执行的次数
//每执行4次搜索后插入暂停时间,解决账号被监控不增加积分的问题
var pause_time = 5000; // 暂停时长建议为16分钟,也就是960000(60000毫秒=1分钟)
var search_words = []; //搜索词


//默认搜索词，热门搜索词请求失败时使用
var default_search_words = ["胜利之师迈向世界一流", "大暴雨！10级以上雷暴大风将来袭", "“国民奶奶”陈奇去世 享年96岁", "抗美援朝烈士英灵永垂不朽", "微信公告：这种行为或永久限制登录", "哈工大学生给无人机装上机械臂", "女子表演与蟒蛇亲嘴 未张嘴就遭攻击", "孙菲菲告诫女生千万不要未婚先孕", "海底捞回应小便者被判赔220万", "这个省的人为什么爱撕餐巾纸", "实拍北京冰雹：像天空在倒冰块", "警方辟谣峨眉山猴子被击毙", "29岁男星确诊癌症晚期", "叶蒨文公开结婚29年未生育之谜", "火锅小便赔220万：家长没教法律会管", "泡泡玛特新品发售仅10人排队", "中方对美产相关模拟芯片发起调查", "00后女孩回应工地绑钢筋：不遗憾", "男子开车撞情人丈夫却撞错了人", "直击苏超：常州vs宿迁", "湖南一油罐车侧翻起火 现场2人死亡", "杨祐宁官宣3胎出生", "董璇理解了为什么办婚礼能分手", "预制菜国标草案过审 将公开征求意见", "存款去哪了？央行数据揭秘", "退伍回到家仅4小时 他救下整栋楼", "游客自驾撞到马群致6匹马死亡", "家长质疑1万元班费要用到什么时候", "汪峰带森林北韩国度假", "中方回应美对多家中国实体实施制裁", "山西一小区大门交房后变牛肉面馆", "胡塞武装：用高超音速导弹袭击以色列", "大叔菜场偷肉 被抓时肉还冒热气", "这种“厨房神器”或致命", "印度空军拟购买114架法国阵风战斗机", "云南一职校军训致17人缺氧？校方回应", "卢卡申科自曝：我对土豆非常着迷", "国乒男单仅王楚钦晋级澳门赛四强", "王曼昱4比0朱雨玲 晋级澳门赛四强", "月子会所回应男子深夜进产妇房", "男子8天2次醉驾 被查时狂扇自己耳光", "林诗栋无缘澳门赛四强", "有人在文物汉代石厕如厕？文旅局回应", "山东一女子把万元现金当垃圾扔了", "激光武器如何让无人机有来无回", "交警回应游客自驾撞死6匹马", "海底捞索赔2000万为何难获支持", "吴艳妮世锦赛首秀被分“死亡之组”", "美农民绝望喊话：中国不买了只能搅碎", "今年国庆中秋假期 连续8天高速免费", "特朗普想让哈佛建职校"]

// 直接使用默认搜索词
search_words = default_search_words;
exec();

// 定义菜单命令：开始
let menu1 = GM_registerMenuCommand('开始', function () {
    GM_setValue('Cnt', 0); // 将计数器重置为0
    location.href = "https://www.bing.com/?br_msg=Please-Wait"; // 跳转到Bing首页
}, 'o');

// 定义菜单命令：停止
let menu2 = GM_registerMenuCommand('停止', function () {
    GM_setValue('Cnt', max_rewards + 10); // 将计数器设置为超过最大搜索次数，以停止搜索
}, 'o');

// 自动将字符串中的字符进行替换
function AutoStrTrans(st) {
    let yStr = st; // 原字符串
    let rStr = ""; // 插入的混淆字符，可以自定义自己的混淆字符串
    let zStr = ""; // 结果字符串
    let prePo = 0;
    for (let i = 0; i < yStr.length;) {
        let step = parseInt(Math.random() * 5) + 1; // 随机生成步长
        if (i > 0) {
            zStr = zStr + yStr.substr(prePo, i - prePo) + rStr; // 将插入字符插入到相应位置
            prePo = i;
        }
        i = i + step;
    }
    if (prePo < yStr.length) {
        zStr = zStr + yStr.substr(prePo, yStr.length - prePo); // 将剩余部分添加到结果字符串中
    }
    return zStr;
}

// 生成指定长度的包含大写字母、小写字母和数字的随机字符串
function generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        // 从字符集中随机选择字符，并拼接到结果字符串中
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function exec() {
    // 生成随机延迟时间
    let randomDelay = Math.floor(Math.random() * 20000) + 5000; // 生成5秒到25秒之间的随机数
    let randomString = generateRandomString(4); //生成4个长度的随机字符串
    let randomCvid = generateRandomString(32); //生成32位长度的cvid
    'use strict';

    // 检查计数器的值，若为空则设置为超过最大搜索次数
    if (GM_getValue('Cnt') == null) {
        GM_setValue('Cnt', max_rewards + 10);
    }

    // 获取当前搜索次数
    let currentSearchCount = GM_getValue('Cnt');
    // 根据计数器的值选择搜索引擎
    if (currentSearchCount <= max_rewards / 2) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1
        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://www.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    } else if (currentSearchCount > max_rewards / 2 && currentSearchCount < max_rewards) {
        let tt = document.getElementsByTagName("title")[0];
        tt.innerHTML = "[" + currentSearchCount + " / " + max_rewards + "] " + tt.innerHTML; // 在标题中显示当前搜索次数
        smoothScrollToBottom(); // 添加执行滚动页面到底部的操作
        GM_setValue('Cnt', currentSearchCount + 1); // 将计数器加1

        setTimeout(function () {
            let nowtxt = search_words[currentSearchCount]; // 获取当前搜索词
            nowtxt = AutoStrTrans(nowtxt); // 对搜索词进行替换
            setTimeout(function () {
                location.href = "https://cn.bing.com/search?q=" + encodeURI(nowtxt) + "&form=" + randomString + "&cvid=" + randomCvid; // 在Bing搜索引擎中搜索
            }, pause_time);
        }, randomDelay);
    }
    // 实现平滑滚动到页面底部的函数
    function smoothScrollToBottom() {
         document.documentElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
        }
}
