// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.217
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
var default_search_words = ["大食物观里的人民情怀", "释永信被查 中国佛协：败坏佛教教风", "特朗普：英特尔CEO必须立即辞职", "今日立秋要做这些事", "38岁健美选手刘一阳去世", "农民工上厕所时被气枪击中身亡", "少林寺回应拒绝游客入内避雨", "防汛抗灾不容谣言添乱 网警严查", "男子被控强奸朋友女友 再审改判无罪", "微信：没有已读功能 以后也不会有", "成都世运会开幕", "尹锡悦拒捕过程：被连人带椅子抬起", "让家更自由的全新揽境", "河南农民：玉米叶子旱到一碰就碎", "老人骚扰11岁独行女孩被邻座喝止", "88年前复旦女毕业生的血泪家信", "小沈阳全家用“美美桑内”头像", "上海地铁一男子多种语言大骂：乡下人", "男子晒朋友圈露富 好友入室偷黄金", "#强制交社保后打工人会少拿多少钱#", "郑州强降雨致内涝 街道积水严重", "广岛原爆幸存者：日本反省还不够", "女厕排长队怎么解决？一地立法明确", "巴西醉汉穿人字拖乱入比赛赢得奖牌", "郑州突降暴雨：市民被积水冲走", "#直击河南郑州暴雨内涝现场#", "女子猫咖虐死4猫或将面临刑事处罚", "郑州：立即停产停业停课停运", "“超人”宣布帮助特朗普", "郑州一女子凌晨跳湖身亡", "傅首尔公开瘦身过程", "理发店回应员工洗头时被指控性骚扰", "俄总统助理：俄美正筹备两国元首会晤", "美国加州发现“阿凡达”野猪肉", "雁默：大陆不用急着向台湾“输血”", "男子近视600度 屏气搬重物险失明", "中国男篮大胜印度夺2连胜", "印国防部暂停P-8反潜机采购", "上海一女子携导盲犬坐地铁被骂", "姜武读抗战家书：士兵连写3封赴前线", "山东省检察院依法对张安民决定逮捕", "台湾桃园60米高压电缆上惊现男尸", "网红菌子餐厅疑多人中毒有人进ICU", "女孩2岁时基因突变双目失明", "男孩在沙滩埋沙玩被环卫大爷刮伤", "游客在汉服馆遭商家殴打？警方通报", "妈妈称女儿快剪店剪发时头发疑被偷", "郑州暴雨积水最深至腰部", "高校回应推出大学英数衔接课程", "内蒙古启动国家四级救灾应急响应", "湖南一彩民花6元买彩票中1256万元"]

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
