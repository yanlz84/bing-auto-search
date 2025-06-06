// ==UserScript==
// @name         Bing自动搜索脚本
// @version      V3.1.93
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
var default_search_words = ["共同呵护好孩子的眼睛", "多地家电国补暂停？回应来了", "俄轰炸乌军工企业 几乎覆盖全境", "今天 优质供给从何而来", "《西游记》演员叶以萌去世", "工位空无一人 电脑突然“发疯”", "#苏超的热度为什么超过了国足#", "警方通报武大一学生在食堂行凶致3伤", "《家有儿女》姥姥的含金量还在上升", "高考前一天 十要做和十不做", "点燃十万明灯祝学子金榜题名", "可高价买高考试题和答案？假", "恢复乌境内俄语人口权益是和平关键", "国足出局 最后一个主场球票停止退票", "高考后准考证别扔 扔了损失一个亿", "985舰开火送超硬核高考祝福", "韦神牙齿脱落家属称患牙周炎在治疗", "乱港分子黄之锋狱中再被捕", "23岁大学生结肠癌去世 遗体将捐母校", "巴黎世家出\"北京烤鸭\"包卖15500元", "傅园慧不语只是一味爆梗", "特朗普威胁终止对马斯克的政府补贴", "范志毅回怼讽刺国足的球迷", "央视摄像机器狗探秘哀牢山", "国足已连续6届无缘世界杯", "歌手第四期：双强补位 单依纯危了？", "范志毅称中国足球的机会在2034年", "气象局回应西安大量白点状飞行物", "电影《长安的荔枝》有不一样的刘德华", "范志毅：让我当国足教练？谁当谁被骂", "马斯克：特朗普在爱泼斯坦的档案里", "当高考考场是初中班级", "《酱园弄悬案》詹周氏就得章子怡演", "桂林多地听到砰砰巨响", "女童被虐致死 生父“求死”后上诉", "女子被毒蛇咬伤两年后仍有后遗症", "《临江仙》今日开播", "曹骏VOGUE盛典金发造型", "白鹿曾舜晞新剧上演三婚三离", "女子手指发麻就诊 术后5天去世", "日本气象厅：随时可能发生大规模地震", "宁艺卓国内首个红毯", "国足时隔68年客场再输印尼", "张韶涵成每年高考最忙的人", "高考考场静音结界已开启", "#闪闪发光的我们#", "刘涛送高考祝福评论区成许愿池", "江西落马副部洪礼和被开除党籍", "白银价格创13年来新高 未来如何走", "把高考前最后一次听力换成《起风了》", "网友自制王安宇刘浩存AI吻戏"]

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
