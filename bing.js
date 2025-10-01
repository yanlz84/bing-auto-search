// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.326
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
var default_search_words = ["习近平深情瞻仰人民英雄纪念碑", "天安门广场国庆升旗仪式完整视频", "第一批堵车人堵成鸳鸯锅", "重要提醒：非正规小众秘境去不得", "此生无悔“种花家”", "一起祝新中国生日快乐", "9人轮流睡8张床？校方：已增设床位", "美国白宫正式宣布政府即将“关门”", "五星红旗与地球同框", "菲律宾地震已致26死147伤", "大学生熬夜看升旗：除了激动还是激动", "虎门大桥10月起封闭维修？假", "第三个10万亿大省要来了", "摆摊为男友还债的女孩要结婚了", "女子蓄发22年长达2米 有人出80万买", "2名环卫工清扫4人跟拍 官方回应", "1万只和平鸽被放飞", "两部门：“吹哨人”奖金可达百万", "特朗普称将动用军队整顿纽约等地", "国旗护卫队高唱《祖国不会忘记》", "高速堵车 外国美女被投喂火锅", "特朗普重提“让加拿大成为第51州”", "月收入6250元以下无需预扣税款", "实拍国庆全国多地绝美日出", "菲律宾发布海啸预警", "今晨12.1万人天安门广场看升国旗", "遭熊袭击孕妇发声：想尽全力保住孩子", "女子点咖啡找不到店 上门打翻咖啡", "北京房产中介协会倡议：不得PUA房主", "同看红旗绚烂 共贺祖国长安", "美防长下令军容管理：将军也不能肥胖", "安徽师范大学给学生发150元过节费", "新版中国药典今起实施", "美参议院否决共和党版本拨款法案", "姆巴佩帽子戏法当选全场最佳", "特朗普：哈马斯需在3至4天内回应", "非洲公象为护家怒袭英美游客", "青海湖首次拍到3只雪豹同框", "南非驻法国大使据信在巴黎坠楼身亡", "中国正式成为安第斯共同体观察员国", "山东卫视中秋晚会全阵容官宣", "朝鲜批以色列行径更胜希特勒", "紧张关系再度升级 委内瑞拉总统签令", "波兰会成欧洲安全的中坚还是牺牲品", "老君山国庆期间推出“一元午餐”", "以士兵在约旦拘留巴勒斯坦儿童", "逾15万美国联邦雇员9月底离职", "胡塞武装称使用巡航导弹袭击一货轮", "海底捞回应国庆承办50桌婚宴", "全球首台原位大尺寸变径盾构机下线", "王力宏成都演唱会恰逢出道30周年"]

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
